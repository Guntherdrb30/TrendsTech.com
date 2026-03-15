import test from "node:test";
import assert from "node:assert/strict";
import { DevExecutionMode, DevExecutionRuntime } from "@trends172tech/db";
import {
  createDevTaskSchema,
  createRemoteSessionSchema,
  createRunnerSchema
} from "../../app/lib/validators/luna-agent";

test("remote session validator rejects excessive expiration", () => {
  const parsed = createRemoteSessionSchema.safeParse({ expiresInMinutes: 999 });
  assert.equal(parsed.success, false);
});

test("runner validator rejects invalid slug characters", () => {
  const parsed = createRunnerSchema.safeParse({
    name: "Runner Local",
    slug: "runner local",
    mode: "LOCAL"
  });

  assert.equal(parsed.success, false);
});

test("task validator defaults runtime to dry run", () => {
  const parsed = createDevTaskSchema.safeParse({
    projectId: "proj_1",
    title: "Crear rama",
    executionMode: DevExecutionMode.LOCAL
  });

  assert.equal(parsed.success, true);
  if (!parsed.success) {
    return;
  }

  assert.equal(parsed.data.runtime, DevExecutionRuntime.DRY_RUN);
});
