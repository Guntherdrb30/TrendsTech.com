import { z } from 'zod';

const item = z.object({
  title: z.string().trim().min(3).max(110),
  text: z.string().trim().min(15).max(1000),
}).strict();

export const slugSchema = z.string().min(3).max(70).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const proposalDraftSchema = z.object({
  slug: slugSchema,
  clientName: z.string().trim().min(3).max(120),
  industry: z.string().trim().min(3).max(120),
  title: z.string().trim().min(8).max(160),
  headline: z.string().trim().min(8).max(170),
  introduction: z.string().trim().min(40).max(1500),
  opportunity: z.string().trim().min(40).max(1800),
  capabilities: z.array(item).min(2).max(10),
  phases: z.array(item).min(2).max(10),
  scenarios: z.array(z.object({
    title: z.string().trim().min(3).max(110),
    question: z.string().trim().min(10).max(400),
    answer: z.string().trim().min(20).max(1100),
    flow: z.string().trim().min(3).max(240),
  }).strict()).min(1).max(5),
  scopeNotes: z.array(z.string().trim().min(8).max(300)).min(2).max(8),
}).strict();

const storedSchema = proposalDraftSchema.extend({
  version: z.literal(1),
  revision: z.number().int().positive(),
  visibility: z.enum(['draft', 'published']),
  lastApprovedBy: z.string().optional(),
  publishedAt: z.string().datetime().optional(),
}).strict();

export type ProposalDraft = z.infer<typeof proposalDraftSchema>;
export type StoredProposal = z.infer<typeof storedSchema>;

const marker = '__TRENDS_PROPOSAL_JSON_V1__=';
export const proposalId = (slug: string) => `chatgpt-proposal-${slug}`;
export const publicProposalUrl = (slug: string) => `https://www.trends172tech.com/es/propuestas/${slug}`;

export function encodeProposal(document: StoredProposal): string {
  const doc = storedSchema.parse(document);
  if (JSON.stringify(doc).includes(marker)) throw new Error('Reserved document marker in content');
  const summary = [
    `Presentaci\u00f3n: ${publicProposalUrl(doc.slug)}`,
    '', doc.introduction, '',
    'CAPACIDADES PROPUESTAS', ...doc.capabilities.map(c => `${c.title}: ${c.text}`), '',
    'RUTA DE IMPLEMENTACION', ...doc.phases.map((p, i) => `${i+1}. ${p.title}: ${p.text}`), '',
    'CONDICIONES: inversion, cronograma y alcance contractual por definir; no es una oferta vinculante.',
    `${marker}${Buffer.from(JSON.stringify(doc), 'utf8').toString('base64url')}`,
  ].join('\n');
  if (summary.length > 60000) throw new Error('Document too long for proposal summary');
  return summary;
}

export function decodeProposal(summary: string | null | undefined): StoredProposal | null {
  const lines = (summary ?? '').split('\n').filter(l => l.startsWith(marker));
  if (lines.length !== 1) return null;
  const line = lines[0];
  try {
    const parsed = JSON.parse(Buffer.from(line.slice(marker.length), 'base64url').toString('utf8'));
    const checked = storedSchema.safeParse(parsed);
    return checked.success ? checked.data : null;
  } catch { return null; }
}

export function publicSummary(summary: string | null | undefined) {
  return (summary ?? '').split('\n').filter(l => !l.startsWith(marker)).join('\n');
}

/** Draft links must never be offered as public sharing actions by the CRM. */
export function proposalPresentation(summary: string | null | undefined) {
  const doc = decodeProposal(summary);
  return doc ? {
    presentationUrl: doc.visibility === 'published' ? publicProposalUrl(doc.slug) : null,
    previewPath: `/es/admin/proposals/preview/${doc.slug}`,
    visibility: doc.visibility,
    revision: doc.revision,
  } : null;
}
