import test from "node:test";
import assert from "node:assert/strict";
import { tokenizeCommand } from "../src/executors/shell";

test("shell tokenizer keeps quoted segments together", () => {
  const tokens = tokenizeCommand('git commit -m "mensaje con espacios"');
  assert.deepEqual(tokens, ["git", "commit", "-m", "mensaje con espacios"]);
});

test("shell tokenizer rejects unclosed quotes", () => {
  assert.throws(() => tokenizeCommand('git commit -m "mensaje'));
});
