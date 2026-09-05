import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createVercelRequest,
  disconnectVercelFromStudio,
  EXPECTED_VERCEL_TEAM_ID,
  listAllVercelProjects,
  resolveVercelConfig,
  synchronizeVercelInventory,
  vercelProjectDashboardUrl,
  VercelDiscoveryError,
  type SyncProjectResult,
  type VercelProject,
} from '../../app/lib/engineering-studio/vercel-discovery';

test('construye un acceso seguro al proyecto en el dashboard de Vercel', () => {
  assert.equal(
    vercelProjectDashboardUrl('proyecto con espacios'),
    'https://vercel.com/guntherdelrosario-5780s-projects/proyecto%20con%20espacios',
  );
});

test('lista varios proyectos y recorre todos los cursores de Vercel', async () => {
  const cursors: Array<string | undefined> = [];
  const projects = await listAllVercelProjects(async (_path, query) => {
    cursors.push(query?.from as string | undefined);
    if (!query?.from) return { projects: [{ id: 'prj_1', name: 'Uno' }], pagination: { next: 123 } };
    return { projects: [{ id: 'prj_2', name: 'Dos' }], pagination: { next: null } };
  });
  assert.deepEqual(projects.map((project) => project.id), ['prj_1', 'prj_2']);
  assert.deepEqual(cursors, [undefined, '123']);
});

test('rechaza un token sin acceso al equipo con un error específico y sin filtrar secretos', async () => {
  const secret = 'token-super-secreto';
  const request = createVercelRequest(secret, EXPECTED_VERCEL_TEAM_ID, async () => new Response(JSON.stringify({ error: { code: 'forbidden', message: 'Not authorized' } }), { status: 403, headers: { 'content-type': 'application/json' } }));
  await assert.rejects(() => request('/v2/teams/test'), (error: unknown) => {
    assert.ok(error instanceof VercelDiscoveryError);
    assert.equal(error.code, 'TEAM_ACCESS_DENIED');
    assert.equal(error.message.includes(secret), false);
    return true;
  });
});

test('distingue un token inválido de un token sin acceso al equipo', async () => {
  const request = createVercelRequest('invalid', EXPECTED_VERCEL_TEAM_ID, async () => new Response('{}', { status: 401 }));
  await assert.rejects(() => request('/v10/projects'), (error: unknown) => error instanceof VercelDiscoveryError && error.code === 'TOKEN_INVALID');
});

test('no sustituye silenciosamente un teamId incorrecto', () => {
  assert.throws(() => resolveVercelConfig({ VERCEL_STUDIO_TOKEN: 'x', VERCEL_STUDIO_TEAM_ID: 'team_otro' } as NodeJS.ProcessEnv), (error: unknown) => error instanceof VercelDiscoveryError && error.code === 'TEAM_MISMATCH');
});

test('sincroniza de forma idempotente, crea, actualiza, omite y marca no visibles', async () => {
  const records = new Map<string, string>([['prj_updated', 'old'], ['prj_same', 'same'], ['prj_missing', 'old']]);
  const projects: VercelProject[] = [
    { id: 'prj_new', name: 'Nuevo' }, { id: 'prj_updated', name: 'Actualizado' }, { id: 'prj_same', name: 'Igual' },
  ];
  const run = async () => synchronizeVercelInventory({
    discoverProjects: async () => projects,
    readProject: async (project) => ({ project, deployment: null, repository: { provider: null, fullName: null, url: null, branch: null, sha: null, author: null, message: null, commitDate: null } }),
    syncProject: async ({ project }): Promise<SyncProjectResult> => {
      if (!records.has(project.id)) { records.set(project.id, 'same'); return 'created'; }
      if (records.get(project.id) === 'old') { records.set(project.id, 'same'); return 'updated'; }
      return 'skipped';
    },
    markMissing: async (visible) => {
      let count = 0;
      for (const id of [...records.keys()]) if (!visible.includes(id) && id === 'prj_missing') { records.delete(id); count += 1; }
      return count;
    },
  });
  assert.deepEqual(await run(), { discoveredCount: 3, createdCount: 1, updatedCount: 1, skippedCount: 1, missingCount: 1, errorCount: 0, errors: [] });
  const second = await run();
  assert.equal(second.createdCount, 0);
  assert.equal(second.updatedCount, 0);
  assert.equal(second.skippedCount, 3);
  assert.equal(records.size, 3);
});

test('la desconexión individual solo usa el puerto interno y audita que no hubo operación destructiva', async () => {
  const calls: string[] = [];
  const result = await disconnectVercelFromStudio({ projectId: 'studio_1', projectName: 'Seguro' }, {
    disconnect: async () => { calls.push('studio-disconnect'); },
    audit: async (entry) => { calls.push(`audit:${entry.destructiveVercelOperation}`); },
  });
  assert.deepEqual(calls, ['studio-disconnect', 'audit:false']);
  assert.equal(result.destructiveVercelOperation, false);
});
