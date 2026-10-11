/**
 * LUNA AI Control Center: pure installation lifecycle rules.
 * Deliberately independent from Prisma, Next.js and CarpiHogar.
 * Persist state transitions in an authenticated service transaction with audit.
 */
export type InstallationState =
  | "REQUESTED" | "APPROVED" | "REJECTED" | "ACTIVE" | "SUSPENDED" | "REVOKED";

export type InstallationAction =
  | "approve" | "reject" | "activate" | "suspend" | "resume" | "revoke";

export type InstallationRole = "ROOT" | "TENANT_ADMIN" | "TENANT_OPERATOR";

export type InstallationTransition = {
  previous: InstallationState;
  next: InstallationState;
  action: InstallationAction;
  actorId: string;
  actorRole: InstallationRole;
  at: string;
  reason?: string;
};

const allowed: Record<InstallationAction, readonly InstallationState[]> = {
  approve: ["REQUESTED"],
  reject: ["REQUESTED"],
  activate: ["APPROVED"],
  suspend: ["ACTIVE"],
  resume: ["SUSPENDED"],
  revoke: ["APPROVED", "ACTIVE", "SUSPENDED"],
};

const nextState: Record<InstallationAction, InstallationState> = {
  approve: "APPROVED",
  reject: "REJECTED",
  activate: "ACTIVE",
  suspend: "SUSPENDED",
  resume: "ACTIVE",
  revoke: "REVOKED",
};

export function transitionInstallation(
  current: InstallationState,
  action: InstallationAction,
  actor: { id: string; role: InstallationRole },
  reason?: string,
  now: Date = new Date(),
): InstallationTransition {
  if (!actor.id.trim()) throw new Error("ACTOR_REQUIRED");
  if (actor.role !== "ROOT") throw new Error("ROOT_APPROVAL_REQUIRED");
  if (!allowed[action].includes(current)) throw new Error("INVALID_INSTALLATION_TRANSITION");
  if (["reject", "suspend", "revoke"].includes(action) && !reason?.trim()) {
    throw new Error("REASON_REQUIRED");
  }
  return {
    previous: current,
    next: nextState[action],
    action,
    actorId: actor.id,
    actorRole: actor.role,
    at: now.toISOString(),
    ...(reason?.trim() ? { reason: reason.trim() } : {}),
  };
}

/** Installation authorization is independent from whether the client's own AI works. */
export function mayIngestUsage(state: InstallationState, licenseValid: boolean): boolean {
  return state === "ACTIVE" && licenseValid;
}
