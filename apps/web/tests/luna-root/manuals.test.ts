import test from 'node:test';
import assert from 'node:assert/strict';
import { LUNA_ROOT_MANUALS, LUNA_ROOT_TOOL_NAMES, searchLunaRootManuals } from '@trends172tech/openai';

test('LUNA ROOT exposes only read-only tools in phase one', () => {
  const mutationPrefixes = ['create_', 'update_', 'delete_', 'send_', 'pay_', 'approve_'];
  assert.equal(LUNA_ROOT_TOOL_NAMES.length, 4);
  assert.equal(
    LUNA_ROOT_TOOL_NAMES.some((name) => mutationPrefixes.some((prefix) => name.startsWith(prefix))),
    false
  );
});

test('manual search ignores accents and letter case', () => {
  const result = searchLunaRootManuals('GESTIÓN DE PROYECTOS');
  assert.equal(result.some((manual) => manual.area === 'proyectos'), true);
});

test('empty manual search returns the complete guide', () => {
  assert.equal(searchLunaRootManuals().length, LUNA_ROOT_MANUALS.length);
});
