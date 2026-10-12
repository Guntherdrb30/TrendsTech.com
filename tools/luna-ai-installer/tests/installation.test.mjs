import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { planInstallation, installPlan, verifyInstallation } from '../lib/installation.mjs';
import { createLunaControl } from '../lib/gateway-client.mjs';

test('reviewed plan installs once, is disabled and verifies file integrity', async () => {
 const root = await mkdtemp(join(tmpdir(), 'luna-install-'));
 try {
  await writeFile(join(root, 'server.ts'), "import OpenAI from 'openai';");
  const plan = await planInstallation(root);
  await assert.rejects(installPlan(root, plan, 'wrong'), /authorization/);
  const installed = await installPlan(root, plan, plan.planId);
  assert.equal(installed.enabled, false);
  assert.equal((await verifyInstallation(root)).verified, true);
  await assert.rejects(installPlan(root, plan, plan.planId), /EEXIST/);
  const content = await readFile(join(root, '.luna-ai/index.mjs'), 'utf8');
  assert.match(content, /LUNA_INSTALLATION_TOKEN/);
  await writeFile(join(root, '.luna-ai/index.mjs'), content + '\n// tampered');
  await assert.rejects(verifyInstallation(root), /changed/);
 } finally { await rm(root, { recursive: true, force: true }); }
});

test('changed source, forged plans and symlink destination cannot install', async () => {
 const root = await mkdtemp(join(tmpdir(), 'luna-plan-'));
 try {
  const p = await planInstallation(root);
  await assert.rejects(installPlan(root, { ...p, projectRoot: '/tmp/other' }, p.planId), /tampered/);
  await writeFile(join(root, 'new.ts'), 'export const x = 1;');
  await assert.rejects(installPlan(root, p, p.planId), /changed/);
  const current = await planInstallation(root);
  await symlink(tmpdir(), join(root, '.luna-ai'));
  await assert.rejects(installPlan(root, current, current.planId), /EEXIST/);
 } finally { await rm(root, { recursive: true, force: true }); }
});

test('disabled SDK preserves operation without network or credentials', async () => {
 let network = 0;
 const sdk = createLunaControl({ enabled: false, fetchImpl: async () => network++ });
 assert.equal(await sdk.run({}, async () => 42), 42); assert.equal(network, 0);
});

test('gateway rejection prevents provider call; telemetry failure preserves result', async () => {
 const config = { enabled: true, endpoint: 'https://control.example', token: `luna_live_${'a'.repeat(43)}` };
 let calls = 0;
 const denied = createLunaControl({ ...config, gatewayEnabled: true, fetchImpl: async () => ({ ok: false, status: 403 }) });
 await assert.rejects(denied.run({ agent: 'assistant' }, async () => { calls++; }), /403/);
 assert.equal(calls, 0);
 const observed = [];
 const sdk = createLunaControl({ ...config, gatewayEnabled: true, fetchImpl: async (url, options) => {
   observed.push({ url: String(url), body: JSON.parse(options.body) });
   if (String(url).endsWith('/reserve')) return { ok: true, json: async () => ({ leaseId: 'lease' }) };
   if (String(url).endsWith('/usage')) throw new Error('offline');
   return { ok: true, json: async () => ({ released: true }) };
 }});
 assert.equal(await sdk.run({ agent: 'assistant', platform: 'test', module: 'api_call', action: 'generate', provider: 'openai', environment: 'test', secret: 'never-send' }, async () => 99), 99);
 assert.equal(observed.length, 3); assert.doesNotMatch(JSON.stringify(observed), /never-send/);
});
