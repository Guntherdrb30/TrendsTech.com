import test from "node:test";
import assert from "node:assert/strict";
import { DevRunnerStatus } from "@trends172tech/db";
import { decryptSecret, encryptSecret, hashRemoteToken } from "../../app/lib/luna-agent/security";
import { getEffectiveRunnerStatus } from "../../app/lib/luna-agent/runtime";

test("security roundtrip keeps Luna provider secrets decryptable", () => {
  process.env.LUNA_AGENT_ENCRYPTION_KEY = "phase4-test-key";
  const encrypted = encryptSecret("sk-test-123456");
  const decrypted = decryptSecret(encrypted);

  assert.notEqual(encrypted, "sk-test-123456");
  assert.equal(decrypted, "sk-test-123456");
});

test("remote token hash is deterministic", () => {
  assert.equal(hashRemoteToken("same-token"), hashRemoteToken("same-token"));
  assert.notEqual(hashRemoteToken("same-token"), hashRemoteToken("other-token"));
});

test("runner becomes offline when heartbeat is stale", () => {
  const staleHeartbeat = new Date(Date.now() - 10 * 60 * 1000);
  const freshHeartbeat = new Date(Date.now() - 30 * 1000);

  assert.equal(
    getEffectiveRunnerStatus({
      status: DevRunnerStatus.ONLINE,
      lastHeartbeatAt: staleHeartbeat,
      now: new Date()
    }),
    DevRunnerStatus.OFFLINE
  );

  assert.equal(
    getEffectiveRunnerStatus({
      status: DevRunnerStatus.BUSY,
      lastHeartbeatAt: freshHeartbeat,
      now: new Date()
    }),
    DevRunnerStatus.BUSY
  );
});
