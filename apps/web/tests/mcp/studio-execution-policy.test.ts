import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertStudioWorkBranch,
  isVisibleStudioRepoPath,
  normalizeStudioRepoPath
} from '../../app/lib/engineering-studio/execution-policy';

test('Engineering Studio only permits isolated studio branches', () => {
  assert.equal(assertStudioWorkBranch('studio/demo/fix-card-1234'), 'studio/demo/fix-card-1234');
  assert.throws(() => assertStudioWorkBranch('main'));
  assert.throws(() => assertStudioWorkBranch('feature/direct-write'));
  assert.throws(() => assertStudioWorkBranch('studio/../main'));
});

test('Engineering Studio blocks secret and protected repository paths', () => {
  const blocked = [
    '.env',
    'apps/web/.env.local',
    'apps/web/.env.production',
    'secrets/credentials.json',
    'certificates/server.key',
    '.github/workflows/security-quality.yml',
    '.vercel/project.json',
    'node_modules/pkg/index.js'
  ];

  for (const path of blocked) {
    assert.throws(() => normalizeStudioRepoPath(path), path);
    assert.equal(isVisibleStudioRepoPath(path), false, path);
  }
});

test('Engineering Studio permits normal source files and env templates', () => {
  const allowed = [
    'apps/web/app/page.tsx',
    'apps/web/app/lib/engineering-studio/mcp-server.ts',
    '.env.example',
    'apps/web/.env.example',
    'docs/engineering-studio/TRENDS-MCP.md'
  ];

  for (const path of allowed) {
    assert.equal(normalizeStudioRepoPath(path), path);
    assert.equal(isVisibleStudioRepoPath(path), true, path);
  }
});
