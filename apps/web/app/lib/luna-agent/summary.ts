import { getLunaBillingSnapshot } from "@/lib/luna-agent/billing";
import type { LunaPlanSnapshot } from "@/types/luna-agent";

export async function getLunaPlanSnapshot(tenantId: string): Promise<LunaPlanSnapshot> {
  const snapshot = await getLunaBillingSnapshot(tenantId);

  return {
    planKey: snapshot.policy.sourcePlanKey,
    planTier: snapshot.policy.planKey,
    supportsRemote: snapshot.policy.supportsRemote,
    supportsMultiProvider: snapshot.policy.supportsMultiProvider,
    supportsRunnerExecution: snapshot.policy.supportsRunnerExecution,
    supportsAdvancedRuntime: snapshot.policy.supportsAdvancedRuntime,
    taskLimitLabel:
      snapshot.policy.taskLimit === null ? "ilimitado o segun acuerdo" : String(snapshot.policy.taskLimit),
    projectLimitLabel:
      snapshot.policy.projectLimit === null
        ? "ilimitado o segun acuerdo"
        : String(snapshot.policy.projectLimit)
  };
}
