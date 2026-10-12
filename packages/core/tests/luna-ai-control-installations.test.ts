import assert from "node:assert/strict";
import test from "node:test";
import { mayIngestUsage, transitionInstallation } from "../src/luna-ai-control/installations";

const root = { id: "root-user", role: "ROOT" as const };
const tenant = { id: "tenant-user", role: "TENANT_ADMIN" as const };

test("ROOT approves and activates a requested installation", () => {
  const approved = transitionInstallation("REQUESTED", "approve", root);
  assert.equal(approved.next, "APPROVED");
  const active = transitionInstallation(approved.next, "activate", root);
  assert.equal(active.next, "ACTIVE");
  assert.equal(mayIngestUsage(active.next, true), true);
});

test("tenant admin cannot approve installations", () => {
  assert.throws(() => transitionInstallation("REQUESTED", "approve", tenant), /ROOT_APPROVAL_REQUIRED/);
});

test("invalid transitions are rejected", () => {
  assert.throws(() => transitionInstallation("REQUESTED", "activate", root), /INVALID_INSTALLATION_TRANSITION/);
  assert.throws(() => transitionInstallation("REVOKED", "resume", root), /INVALID_INSTALLATION_TRANSITION/);
});

test("suspension and revocation require a reason", () => {
  assert.throws(() => transitionInstallation("ACTIVE", "suspend", root), /REASON_REQUIRED/);
  const suspended = transitionInstallation("ACTIVE", "suspend", root, "License expired");
  assert.equal(suspended.next, "SUSPENDED");
  assert.equal(mayIngestUsage(suspended.next, true), false);
});

test("expired license blocks ingestion even when installation is active", () => {
  assert.equal(mayIngestUsage("ACTIVE", false), false);
});
