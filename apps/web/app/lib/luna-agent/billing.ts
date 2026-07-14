import {
  DevExecutionRuntime,
  DevUsageMetricType,
  Prisma,
  SubscriptionStatus,
  prisma
} from "@trends172tech/db";

type LunaPlanKey = "basic" | "pro" | "enterprise";

export type LunaCommercialPolicy = {
  planKey: LunaPlanKey;
  sourcePlanKey: string;
  subscriptionStatus: SubscriptionStatus | "NONE";
  supportsRemote: boolean;
  supportsMultiProvider: boolean;
  supportsRunnerExecution: boolean;
  supportsAdvancedRuntime: boolean;
  taskLimit: number | null;
  projectLimit: number | null;
};

export type LunaUsageSnapshot = {
  month: number;
  year: number;
  tasksCreated: number;
  tasksExecuted: number;
  tasksFailed: number;
  activeProjects: number;
  activeProviders: number;
  activeRunners: number;
  remoteSessions: number;
};

export type LunaBillingSnapshot = {
  policy: LunaCommercialPolicy;
  usage: LunaUsageSnapshot;
};

function monthWindow(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);

  return {
    start,
    end,
    month: date.getMonth() + 1,
    year: date.getFullYear()
  };
}

function mapPlanKey(planKey?: string | null): LunaPlanKey {
  const normalized = planKey?.toLowerCase() ?? "";
  if (normalized.includes("enterprise")) {
    return "enterprise";
  }
  if (normalized.includes("pro")) {
    return "pro";
  }

  return "basic";
}

function derivePolicyFromPlan(
  planKey?: string | null,
  subscriptionStatus?: SubscriptionStatus | "NONE" | null,
  limitsJson?: Prisma.JsonValue
) {
  const derivedKey = mapPlanKey(planKey);
  const limits = ((limitsJson ?? {}) as Record<string, unknown>) ?? {};

  const defaults: Record<LunaPlanKey, Omit<LunaCommercialPolicy, "sourcePlanKey" | "subscriptionStatus">> = {
    basic: {
      planKey: "basic",
      supportsRemote: true,
      supportsMultiProvider: false,
      supportsRunnerExecution: false,
      supportsAdvancedRuntime: false,
      taskLimit: 50,
      projectLimit: 1
    },
    pro: {
      planKey: "pro",
      supportsRemote: true,
      supportsMultiProvider: true,
      supportsRunnerExecution: true,
      supportsAdvancedRuntime: false,
      taskLimit: 300,
      projectLimit: 5
    },
    enterprise: {
      planKey: "enterprise",
      supportsRemote: true,
      supportsMultiProvider: true,
      supportsRunnerExecution: true,
      supportsAdvancedRuntime: true,
      taskLimit: null,
      projectLimit: null
    }
  };

  const base = defaults[derivedKey];
  return {
    ...base,
    sourcePlanKey: planKey ?? base.planKey,
    subscriptionStatus: subscriptionStatus ?? "NONE",
    supportsRemote:
      typeof limits.lunaSupportsRemote === "boolean" ? limits.lunaSupportsRemote : base.supportsRemote,
    supportsMultiProvider:
      typeof limits.lunaSupportsMultiProvider === "boolean"
        ? limits.lunaSupportsMultiProvider
        : base.supportsMultiProvider,
    supportsRunnerExecution:
      typeof limits.lunaSupportsRunnerExecution === "boolean"
        ? limits.lunaSupportsRunnerExecution
        : base.supportsRunnerExecution,
    supportsAdvancedRuntime:
      typeof limits.lunaSupportsAdvancedRuntime === "boolean"
        ? limits.lunaSupportsAdvancedRuntime
        : base.supportsAdvancedRuntime,
    taskLimit: typeof limits.lunaTaskLimit === "number" ? limits.lunaTaskLimit : base.taskLimit,
    projectLimit: typeof limits.lunaProjectLimit === "number" ? limits.lunaProjectLimit : base.projectLimit
  } satisfies LunaCommercialPolicy;
}

export async function getLunaCommercialPolicy(tenantId: string): Promise<LunaCommercialPolicy> {
  const subscription = await prisma.subscription.findFirst({
    where: { tenantId, status: "ACTIVE" },
    orderBy: { startedAt: "desc" },
    include: { plan: true }
  });

  return derivePolicyFromPlan(
    subscription?.plan?.key,
    subscription?.status ?? "NONE",
    subscription?.plan?.limitsJson ?? undefined
  );
}

export async function getLunaBillingSnapshot(tenantId: string): Promise<LunaBillingSnapshot> {
  const policy = await getLunaCommercialPolicy(tenantId);
  const { start, end, month, year } = monthWindow();

  const [tasksCreated, tasksExecuted, tasksFailed, activeProjects, activeProviders, activeRunners, remoteSessions] =
    await Promise.all([
      prisma.devTask.count({
        where: { tenantId, createdAt: { gte: start, lt: end } }
      }),
      prisma.devTask.count({
        where: { tenantId, completedAt: { gte: start, lt: end }, status: "DONE" }
      }),
      prisma.devTask.count({
        where: { tenantId, completedAt: { gte: start, lt: end }, status: "FAILED" }
      }),
      prisma.devProject.count({
        where: { tenantId, isActive: true }
      }),
      prisma.devAIProvider.count({
        where: { user: { tenantId }, isActive: true }
      }),
      prisma.devRunner.count({
        where: { tenantId, status: { in: ["ONLINE", "BUSY"] } }
      }),
      prisma.remoteSession.count({
        where: { tenantId, createdAt: { gte: start, lt: end } }
      })
    ]);

  return {
    policy,
    usage: {
      month,
      year,
      tasksCreated,
      tasksExecuted,
      tasksFailed,
      activeProjects,
      activeProviders,
      activeRunners,
      remoteSessions
    }
  };
}

export async function incrementLunaMetric(
  tenantId: string,
  metricType: DevUsageMetricType,
  amount = 1,
  tx: typeof prisma = prisma
) {
  const { month, year } = monthWindow();

  return tx.devUsageMetric.upsert({
    where: {
      tenantId_metricType_periodMonth_periodYear: {
        tenantId,
        metricType,
        periodMonth: month,
        periodYear: year
      }
    },
    update: {
      value: { increment: amount }
    },
    create: {
      tenantId,
      metricType,
      periodMonth: month,
      periodYear: year,
      value: amount
    }
  });
}

async function auditLunaLimitBlocked(params: {
  actorUserId: string;
  tenantId: string;
  action: string;
  reason: string;
  planKey: string;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: params.actorUserId,
      tenantId: params.tenantId,
      action: params.action,
      entity: "LunaCodeOrchestrator",
      entityId: params.tenantId,
      metaJson: {
        reason: params.reason,
        planKey: params.planKey
      }
    }
  });
}

export async function enforceLunaProjectCreation(tenantId: string, actorUserId: string) {
  const snapshot = await getLunaBillingSnapshot(tenantId);
  if (snapshot.policy.projectLimit !== null && snapshot.usage.activeProjects >= snapshot.policy.projectLimit) {
    await auditLunaLimitBlocked({
      actorUserId,
      tenantId,
      action: "LUNA_LIMIT_BLOCKED_PROJECT",
      reason: "Project limit reached.",
      planKey: snapshot.policy.sourcePlanKey
    });
    throw new Error("Tu plan actual ya alcanzo el limite de proyectos de Luna.");
  }

  return snapshot;
}

export async function enforceLunaTaskCreation(
  tenantId: string,
  actorUserId: string,
  runtime: DevExecutionRuntime
) {
  const snapshot = await getLunaBillingSnapshot(tenantId);
  if (snapshot.policy.taskLimit !== null && snapshot.usage.tasksCreated >= snapshot.policy.taskLimit) {
    await auditLunaLimitBlocked({
      actorUserId,
      tenantId,
      action: "LUNA_LIMIT_BLOCKED_TASK",
      reason: "Task limit reached.",
      planKey: snapshot.policy.sourcePlanKey
    });
    throw new Error("Tu plan actual ya alcanzo el limite mensual de tareas para Luna.");
  }

  if (runtime !== DevExecutionRuntime.DRY_RUN && !snapshot.policy.supportsRunnerExecution) {
    await auditLunaLimitBlocked({
      actorUserId,
      tenantId,
      action: "LUNA_LIMIT_BLOCKED_RUNTIME",
      reason: `Runtime ${runtime} not allowed by current plan.`,
      planKey: snapshot.policy.sourcePlanKey
    });
    throw new Error("Tu plan actual no habilita ejecucion real con runners.");
  }

  if (runtime === DevExecutionRuntime.CODEX_CLI && !snapshot.policy.supportsAdvancedRuntime) {
    await auditLunaLimitBlocked({
      actorUserId,
      tenantId,
      action: "LUNA_LIMIT_BLOCKED_ADVANCED_RUNTIME",
      reason: "Codex CLI runtime requires advanced runtime support.",
      planKey: snapshot.policy.sourcePlanKey
    });
    throw new Error("Codex CLI solo esta disponible en planes avanzados de Luna.");
  }

  return snapshot;
}

export async function enforceLunaProviderCreation(tenantId: string, actorUserId: string, userId: string) {
  const snapshot = await getLunaBillingSnapshot(tenantId);
  const currentProviders = await prisma.devAIProvider.count({
    where: { userId, isActive: true }
  });

  if (!snapshot.policy.supportsMultiProvider && currentProviders >= 1) {
    await auditLunaLimitBlocked({
      actorUserId,
      tenantId,
      action: "LUNA_LIMIT_BLOCKED_PROVIDER",
      reason: "Multi-provider is not enabled for current plan.",
      planKey: snapshot.policy.sourcePlanKey
    });
    throw new Error("Tu plan actual solo permite un proveedor IA activo.");
  }

  return snapshot;
}

export async function enforceLunaRemoteSession(tenantId: string, actorUserId: string) {
  const snapshot = await getLunaBillingSnapshot(tenantId);
  if (!snapshot.policy.supportsRemote) {
    await auditLunaLimitBlocked({
      actorUserId,
      tenantId,
      action: "LUNA_LIMIT_BLOCKED_REMOTE",
      reason: "Remote session feature disabled for plan.",
      planKey: snapshot.policy.sourcePlanKey
    });
    throw new Error("Tu plan actual no habilita control remoto QR.");
  }

  return snapshot;
}

export async function enforceLunaRunnerCreation(tenantId: string, actorUserId: string) {
  const snapshot = await getLunaBillingSnapshot(tenantId);
  if (!snapshot.policy.supportsRunnerExecution) {
    await auditLunaLimitBlocked({
      actorUserId,
      tenantId,
      action: "LUNA_LIMIT_BLOCKED_RUNNER",
      reason: "Runner execution not enabled for plan.",
      planKey: snapshot.policy.sourcePlanKey
    });
    throw new Error("Tu plan actual no habilita registro de runners.");
  }

  return snapshot;
}
