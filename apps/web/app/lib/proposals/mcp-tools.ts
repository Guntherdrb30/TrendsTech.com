import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import staticProposals from '../../components/proposals/proposal-data.json';
import { proposalDraftSchema, slugSchema } from './document';
import type { createProposalStore } from './store-core';
type ProposalStore = ReturnType<typeof createProposalStore>;
const loadStore = () => import('./store');

function result(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data) }], structuredContent: data as Record<string, unknown> };
}

/** Register only ROOT-scoped tools. Auth + token verification occurs in /mcp. */
export function registerProposalTools(server: McpServer, actorUserId: string, scopes: readonly string[], getStore: () => Promise<ProposalStore> = loadStore) {
  const allowed = new Set(scopes);
  if (!allowed.has('mcp:read')) return;

  server.registerTool('proposals_list', {
    title: 'Listar propuestas de Trends172Tech',
    description: 'List saved proposal drafts and published proposals for authorized ROOT users.',
    inputSchema: {}, annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async () => result({ proposals: await (await getStore()).listProposalDocuments() }));

  server.registerTool('proposals_get', {
    title: 'Consultar borrador o propuesta publicada',
    description: 'Get a complete stored proposal and its revision so it can be reviewed before publication.',
    inputSchema: { slug: slugSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async ({ slug }) => {
    const proposal = await (await getStore()).getProposalDocument(slug);
    return result(proposal ? { proposal } : { error: 'not_found' });
  });

  server.registerTool('proposals_templates', {
    title: 'Consultar plantillas comerciales',
    description: 'Read verified scopes of existing presentation templates (City Center, Big Home and Fits Tools). These are references, not newly completed features.',
    inputSchema: {}, annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  }, async () => result({ templates: staticProposals }));

  if (allowed.has('mcp:proposals:write')) {
    server.registerTool('proposals_create_draft', {
      title: 'Crear borrador de propuesta',
      description: 'Create a saved unpublished proposal from validated, client-specific content. No payment, external sending or publication is performed.',
      inputSchema: proposalDraftSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false, idempotentHint: false },
    }, async data => result(await (await getStore()).createProposalDocument(data, actorUserId)));

    server.registerTool('proposals_update_draft', {
      title: 'Actualizar borrador de propuesta',
      description: 'Update an existing unpublished draft with optimistic revision checks. Cannot rewrite an already published page.',
      inputSchema: { ...proposalDraftSchema.shape, expectedRevision: z.number().int().positive() },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false, idempotentHint: false },
    }, async ({ expectedRevision, ...data }) => result(await (await getStore()).updateProposalDraft(data, expectedRevision, actorUserId)));
  }

  if (allowed.has('mcp:proposals:publish')) {
    server.registerTool('proposals_publish', {
      title: 'Publicar propuesta comercial',
      description: 'EXTERNAL PUBLICATION. Use ONLY following explicit human approval of this exact slug and revision; verify the client and content before executing. An OAuth publish scope is required.',
      inputSchema: { slug: slugSchema, expectedRevision: z.number().int().positive(), confirmation: z.literal('PUBLICAR') },
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true, idempotentHint: false },
    }, async ({ slug, expectedRevision }) => result(await (await getStore()).publishProposalDocument(slug, expectedRevision, actorUserId)));
  }
}
