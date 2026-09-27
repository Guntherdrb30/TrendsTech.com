import type { Prisma } from '@trends172tech/db';
import { publishedProposals, publishedProposalSummary } from './published-proposals';
import { withPresentationLink } from './proposal-presentation';

export async function registerPublishedProposals(tx: Prisma.TransactionClient) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(17220260927::bigint)`;
  const result: string[] = [];
  for (const entry of publishedProposals) {
    const clients = await tx.adminClient.findMany({ where: { OR: entry.aliases.map(name => ({ name: { equals: name, mode: 'insensitive' as const } })) } });
    if (clients.length > 1) throw new Error(`Ambiguous client match: ${entry.key}`);
    const client = clients[0] ?? await tx.adminClient.create({ data: {
      id: `published-client-${entry.key}`, name: entry.clientName, country: 'Venezuela', industry: entry.industry,
      notes: 'Prospecto registrado para organizar su propuesta de servicio. Contactos y condiciones por confirmar.',
    } });
    const url = `https://www.trends172tech.com/es/propuestas/${entry.key}`;
    const matches = await tx.adminProposal.findMany({ where: { clientId: client.id, OR: [
      { id: `published-proposal-${entry.key}` }, { title: { equals: entry.title, mode: 'insensitive' } },
      { summary: { contains: `/propuestas/${entry.key}` } },
    ] } });
    if (matches.length > 1) throw new Error(`Ambiguous proposal match: ${entry.key}`);
    let proposal = matches[0];
    if (!proposal) {
      proposal = await tx.adminProposal.create({ data: {
        id: `published-proposal-${entry.key}`, clientId: client.id, title: entry.title,
        summary: publishedProposalSummary(entry.key), status: 'DRAFT', amount: 0, probability: 0,
      } });
    } else if (!proposal.summary?.includes(`Presentación: ${url}`)) {
      proposal = await tx.adminProposal.update({ where: { id: proposal.id }, data: {
        summary: withPresentationLink(proposal.summary || publishedProposalSummary(entry.key), url),
      } });
    }
    const auditId = `published-proposal-registration-${entry.key}`;
    await tx.adminActivityLog.upsert({ where: { id: auditId }, update: {}, create: {
      id: auditId, actor: 'Registro de propuestas autorizado por Gunther', action: `Propuesta publicada vinculada: ${entry.title}`,
      entity: 'AdminProposal', entityId: proposal.id, clientId: client.id, metaJson: { source: 'published-proposal-catalog', url },
    } });
    if (!proposal.summary?.includes(url)) throw new Error(`Missing proposal URL: ${entry.key}`);
    result.push(`${entry.key}: client=${client.id}; proposal=${proposal.id}`);
  }
  return result;
}
