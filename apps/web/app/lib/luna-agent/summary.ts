import { prisma } from "@trends172tech/db";
import type { LunaPlanSnapshot } from "@/types/luna-agent";

export async function getLunaPlanSnapshot(tenantId: string): Promise<LunaPlanSnapshot> {
  const subscription = await prisma.subscription.findFirst({
    where: { tenantId, status: "ACTIVE" },
    orderBy: { startedAt: "desc" },
    include: { plan: true }
  });

  const limits = (subscription?.plan?.limitsJson ?? {}) as {
    lunaTaskLimit?: number;
    lunaProjectLimit?: number;
  };

  return {
    planKey: subscription?.plan?.key ?? "starter",
    taskLimitLabel:
      typeof limits.lunaTaskLimit === "number" ? String(limits.lunaTaskLimit) : "segun plan activo",
    projectLimitLabel:
      typeof limits.lunaProjectLimit === "number"
        ? String(limits.lunaProjectLimit)
        : "segun plan activo"
  };
}
