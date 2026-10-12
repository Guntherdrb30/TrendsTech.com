import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, lstat, realpath, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scan } from '../bin/luna-ai-installer.mjs';
const library = fileURLToPath(new URL('.', import.meta.url));
const sha = value => createHash('sha256').update(value).digest('hex');
const template = `import { createLunaControl } from './gateway-client.mjs';
export const luna = createLunaControl({
 endpoint: process.env.LUNA_CONTROL_ENDPOINT,
 token: process.env.LUNA_INSTALLATION_TOKEN,
 enabled: process.env.LUNA_TELEMETRY_ENABLED === 'true',
 gatewayEnabled: process.env.LUNA_GATEWAY_ENABLED === 'true',
});
// Use luna.run({ agent, platform, module, action, provider, environment }, () => yourExistingAiCall());
// No existing call is changed automatically. Review scanner findings and connect at the server boundary.
`;
async function artifacts() {
  return { 'index.mjs': template, 'gateway-client.mjs': await readFile(join(library, 'gateway-client.mjs'), 'utf8'),
    'usage-reporter.mjs': await readFile(join(library, 'usage-reporter.mjs'), 'utf8') };
}
export async function planInstallation(root, report = undefined) {
  const projectRoot = await realpath(resolve(root));
  const findings = report ?? await scan(projectRoot);
  const files = Object.entries(await artifacts()).map(([path, content]) => ({ path: `.luna-ai/${path}`, sha256: sha(content) }));
  const plan = { schemaVersion: 1, projectRoot, sourceHash: findings.sourceHash, files,
    findings: findings.findings, strategy: 'server-wrapper-opt-in', requiresRootActivation: true };
  return { ...plan, planId: sha(JSON.stringify(plan)) };
}
export async function installPlan(root, plan, authorization) {
  const current = await planInstallation(root);
  if (typeof authorization !== 'string' || authorization !== current.planId || JSON.stringify(plan) !== JSON.stringify(current)) {
    throw new Error('Plan changed, was tampered with, or authorization does not match. Generate and review a new plan.');
  }
  const target = join(current.projectRoot, '.luna-ai');
  // Exclusive directory creation prevents overwrite and symlink traversal. No arbitrary plan paths are used.
  await mkdir(target, { mode: 0o700 });
  try {
    for (const [path, content] of Object.entries(await artifacts())) await writeFile(join(target, path), content, { flag: 'wx', mode: 0o600 });
    await writeFile(join(target, 'manifest.json'), JSON.stringify({ planId: current.planId, files: current.files, installedAt: new Date().toISOString() }, null, 2), { flag: 'wx', mode: 0o600 });
  } catch (error) { await rm(target, { recursive: true }); throw error; }
  return { installed: true, planId: current.planId, enabled: false, findingsRequiringIntegration: current.findings.length };
}
export async function verifyInstallation(root, { online = false, fetchImpl = fetch, env = process.env } = {}) {
  const target = join(await realpath(root), '.luna-ai');
  if (!(await lstat(target)).isDirectory() || (await lstat(target)).isSymbolicLink()) throw new Error('Unsafe installation directory');
  const manifest = JSON.parse(await readFile(join(target, 'manifest.json'), 'utf8'));
  const expected = Object.entries(await artifacts()).map(([path, content]) => ({ path: `.luna-ai/${path}`, sha256: sha(content) }));
  if (JSON.stringify(manifest.files) !== JSON.stringify(expected)) throw new Error('Unsupported or altered manifest');
  for (const file of expected) {
    const path = join(target, file.path.slice('.luna-ai/'.length));
    if ((await lstat(path)).isSymbolicLink() || sha(await readFile(path, 'utf8')) !== file.sha256) throw new Error('Installed file changed');
  }
  if (!online) return { verified: true, online: false, active: false, note: 'Local files verified; connect server call sites and verify ROOT authorization before enabling.' };
  if (!env.LUNA_CONTROL_ENDPOINT || !/^luna_live_[A-Za-z0-9_-]{43}$/.test(env.LUNA_INSTALLATION_TOKEN ?? '')) throw new Error('Private endpoint and installation token required');
  const url = new URL('/api/luna-ai-control/connection', env.LUNA_CONTROL_ENDPOINT);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Online verification requires HTTPS without URL credentials');
  const response = await fetchImpl(url, { headers: { authorization: `Bearer ${env.LUNA_INSTALLATION_TOKEN}` }, redirect: 'error', signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Connection rejected (HTTP ${response.status})`);
  const connection = await response.json();
  if (connection.status !== 'ACTIVE') throw new Error('Installation not active');
  return { verified: true, online: true, installationId: connection.installationId, active: true, gatewayEnabled: connection.gatewayEnabled, allowedAgents: connection.allowedAgents };
}
