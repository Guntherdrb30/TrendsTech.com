import assert from 'node:assert/strict';
import test from 'node:test';

import { getToolDefinitions } from '@trends172tech/openai';

const expectedReadOnly = new Set(['get_pricing_info', 'get_token_pricing']);

test('every MCP business tool declares complete safety annotations', () => {
  const definitions = getToolDefinitions();
  assert.ok(definitions.length > 0);

  for (const definition of definitions) {
    assert.equal(typeof definition.annotations.readOnlyHint, 'boolean');
    assert.equal(typeof definition.annotations.destructiveHint, 'boolean');
    assert.equal(typeof definition.annotations.openWorldHint, 'boolean');
    assert.equal(
      definition.annotations.readOnlyHint,
      expectedReadOnly.has(definition.name),
      `${definition.name} has an unexpected readOnlyHint`,
    );
  }
});

test('an explicit MCP allowlist exposes only approved tools', () => {
  const definitions = getToolDefinitions(['get_pricing_info']);
  assert.deepEqual(definitions.map((definition) => definition.name), ['get_pricing_info']);
});
