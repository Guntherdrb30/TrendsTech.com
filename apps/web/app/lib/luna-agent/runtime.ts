import { DevRunnerStatus, prisma } from "@trends172tech/db";

const DEFAULT_RUNNER_STALE_MINUTES = 3;

export function getRunnerStaleThresholdMs() {
  const minutes = Number(process.env.LUNA_RUNNER_STALE_MINUTES ?? DEFAULT_RUNNER_STALE_MINUTES);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return DEFAULT_RUNNER_STALE_MINUTES * 60 * 1000;
  }

  return minutes * 60 * 1000;
}

export function getEffectiveRunnerStatus(params: {
  status: DevRunnerStatus;
  lastHeartbeatAt?: Date | null;
  now?: Date;
}) {
  if (params.status === DevRunnerStatus.DISABLED || params.status === DevRunnerStatus.OFFLINE) {
    return params.status;
  }

  const now = params.now ?? new Date();
  const lastHeartbeatAt = params.lastHeartbeatAt;
  if (!lastHeartbeatAt) {
    return DevRunnerStatus.OFFLINE;
  }

  const isStale = now.getTime() - lastHeartbeatAt.getTime() > getRunnerStaleThresholdMs();
  return isStale ? DevRunnerStatus.OFFLINE : params.status;
}

export async function syncRunnerHealth(tenantId?: string) {
  const staleBefore = new Date(Date.now() - getRunnerStaleThresholdMs());

  return prisma.devRunner.updateMany({
    where: {
      ...(tenantId ? { tenantId } : {}),
      status: { in: [DevRunnerStatus.ONLINE, DevRunnerStatus.BUSY] },
      OR: [{ lastHeartbeatAt: null }, { lastHeartbeatAt: { lt: staleBefore } }]
    },
    data: {
      status: DevRunnerStatus.OFFLINE
    }
  });
}

export async function expireRemoteSessions() {
  return prisma.remoteSession.updateMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lte: new Date() }
    },
    data: {
      status: "EXPIRED"
    }
  });
}
