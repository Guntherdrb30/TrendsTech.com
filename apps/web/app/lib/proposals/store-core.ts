import type { PrismaClient } from '@prisma/client';
import staticProposals from '../../components/proposals/proposal-data.json';
import { decodeProposal, encodeProposal, proposalDraftSchema, proposalId, publicProposalUrl, slugSchema, type ProposalDraft, type StoredProposal } from './document';

export function createProposalStore(prisma: Pick<PrismaClient, 'adminProposal' | '$transaction'>) {
function rejectReservedSlug(slug: string) {
  if (Object.prototype.hasOwnProperty.call(staticProposals, slug)) {
    throw new Error('This slug belongs to a separately maintained proposal.');
  }
}

function decodeRow(row: { summary: string | null } | null): StoredProposal | null {
  return row ? decodeProposal(row.summary) : null;
}

async function listProposalDocuments() {
  const rows = await prisma.adminProposal.findMany({
    where: { id: { startsWith: 'chatgpt-proposal-' } },
    select: { id: true, title: true, summary: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' }, take: 100,
  });
  return rows.flatMap(row => {
    const doc = decodeRow(row);
    return doc ? [{ slug: doc.slug, clientName: doc.clientName, title: doc.title, visibility: doc.visibility, revision: doc.revision, url: doc.visibility === 'published' ? publicProposalUrl(doc.slug) : null }] : [];
  });
}

async function getProposalDocument(slug: string, publicOnly = false) {
  if (!slugSchema.safeParse(slug).success) return null;
  const row = await prisma.adminProposal.findUnique({ where: { id: proposalId(slug) }, select: { summary: true } });
  const doc = decodeRow(row);
  if (!doc || doc.slug !== slug || (publicOnly && doc.visibility !== 'published')) return null;
  return doc;
}

async function createProposalDocument(input: ProposalDraft, actorUserId: string) {
  const draft = proposalDraftSchema.parse(input);
  rejectReservedSlug(draft.slug);
  const doc: StoredProposal = { ...draft, version: 1, revision: 1, visibility: 'draft' };
  await prisma.$transaction(async tx => {
    // Serialize same-client draft creation without changing existing CRM records.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`proposal-client:${draft.clientName.toLowerCase()}`}, 0))`;
    // Fail closed on ambiguous client names rather than linking to an unrelated account.
    const existing = await tx.adminClient.findMany({
      where: { name: { equals: draft.clientName, mode: 'insensitive' } }, take: 2,
      select: { id: true },
    });
    if (existing.length > 1) throw new Error('Ambiguous client; resolve in admin before creating a proposal.');
    const client = existing[0] ?? await tx.adminClient.create({
      data: { name: draft.clientName, industry: draft.industry, notes: 'Prospect created for a draft proposal through the authorized ChatGPT MCP workflow.' },
      select: { id: true },
    });
    await tx.adminProposal.create({
      data: { id: proposalId(doc.slug), clientId: client.id, title: doc.title, summary: encodeProposal(doc), status: 'DRAFT', amount: 0, probability: 0 },
    });
    await tx.adminActivityLog.create({ data: {
      actor: `MCP ROOT ${actorUserId}`, action: `Proposal draft created: ${doc.title}`,
      entity: 'AdminProposal', entityId: proposalId(doc.slug), clientId: client.id,
      metaJson: { source: 'trends172tech-control', slug: doc.slug, revision: 1, visibility: 'draft' },
    } });
  });
  return { slug: doc.slug, revision: 1, visibility: 'draft' as const, previewPath: `/es/admin/proposals/preview/${doc.slug}` };
}

async function updateProposalDraft(input: ProposalDraft, expectedRevision: number, actorUserId: string) {
  const draft = proposalDraftSchema.parse(input);
  const doc = await getProposalDocument(draft.slug);
  if (!doc) throw new Error('Proposal not found.');
  if (doc.visibility !== 'draft') throw new Error('Published proposals cannot be silently edited.');
  if (doc.revision !== expectedRevision) throw new Error('Revision conflict. Fetch the latest proposal.');
  if (doc.clientName !== draft.clientName) throw new Error('Client identity cannot be changed in this revision.');
  const next: StoredProposal = { ...draft, version: 1, revision: doc.revision + 1, visibility: 'draft' };
  await prisma.$transaction(async tx => {
    const row = await tx.adminProposal.findUnique({ where: { id: proposalId(draft.slug) }, select: { updatedAt: true } });
    if (!row) throw new Error('Proposal disappeared.');
    const update = await tx.adminProposal.updateMany({
      where: { id: proposalId(draft.slug), updatedAt: row.updatedAt, summary: encodeProposal(doc) },
      data: { title: next.title, summary: encodeProposal(next) },
    });
    if (update.count !== 1) throw new Error('Concurrent proposal update; retry.');
    await tx.adminActivityLog.create({ data: {
      actor: `MCP ROOT ${actorUserId}`, action: `Proposal draft revised: ${doc.slug}`,
      entity: 'AdminProposal', entityId: proposalId(doc.slug),
      metaJson: { source: 'trends172tech-control', slug: doc.slug, revision: next.revision },
    } });
  });
  return { slug: next.slug, revision: next.revision, visibility: next.visibility };
}

async function publishProposalDocument(slug: string, expectedRevision: number, actorUserId: string) {
  if (!slugSchema.safeParse(slug).success) throw new Error('Invalid slug.');
  const doc = await getProposalDocument(slug);
  if (!doc) throw new Error('Proposal not found.');
  if (doc.visibility !== 'draft') throw new Error('Proposal already published.');
  if (doc.revision !== expectedRevision) throw new Error('Proposal changed; review current revision.');
  const published: StoredProposal = {
    ...doc, revision: doc.revision + 1, visibility: 'published',
    lastApprovedBy: actorUserId, publishedAt: new Date().toISOString(),
  };
  await prisma.$transaction(async tx => {
    const update = await tx.adminProposal.updateMany({
      where: { id: proposalId(slug), summary: encodeProposal(doc) },
      data: { summary: encodeProposal(published) },
    });
    if (update.count !== 1) throw new Error('Concurrent proposal update; review latest revision.');
    await tx.adminActivityLog.create({ data: {
      actor: `MCP ROOT ${actorUserId}`, action: `Proposal published: ${slug}`,
      entity: 'AdminProposal', entityId: proposalId(slug),
      metaJson: { source: 'trends172tech-control', slug, revision: published.revision, url: publicProposalUrl(slug) },
    } });
  });
  return { slug, revision: published.revision, visibility: published.visibility, url: publicProposalUrl(slug) };
}

return { listProposalDocuments, getProposalDocument, createProposalDocument, updateProposalDraft, publishProposalDocument };
}
