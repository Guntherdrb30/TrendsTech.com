import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { main } from '../bin/luna-ai-installer.mjs';

test('scan writes findings without exposing source lines', async () => {
  const root = await mkdtemp(join(tmpdir(), 'luna-scan-'));
  try {
    await mkdir(join(root, 'src'));
    await writeFile(join(root, 'src', 'ai.ts'), "import OpenAI from 'openai';\nconst secret='do-not-report';\n");
    const out = join(root, 'report.json');
    assert.equal(await main(['scan','--project',root,'--output',out]), 0);
    const { readFile } = await import('node:fs/promises');
    const json = await readFile(out, 'utf8');
    assert.match(json, /"provider": "openai"/);
    assert.doesNotMatch(json, /do-not-report/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
