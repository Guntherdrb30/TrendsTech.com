import 'server-only';

import { DevRunnerMode, DevRunnerStatus, prisma } from '@trends172tech/db';
import { createRunnerToken, hashRunnerToken } from '@/lib/luna-agent/security';
import { getEffectiveRunnerStatus, syncRunnerHealth } from '@/lib/luna-agent/runtime';
import { ensureInternalExecutionTenant } from './orchestrator-bridge';

export const STUDIO_RUNNER_SLUG = 'trends-engineering-runner';

export async function getStudioRunnerSnapshot() {
  const tenant = await ensureInternalExecutionTenant();
  await syncRunnerHealth(tenant.id);

  const runner = await prisma.devRunner.findUnique({
    where: {
      tenantId_slug: {
        tenantId: tenant.id,
        slug: STUDIO_RUNNER_SLUG
      }
    },
    include: {
      _count: {
        select: {
          queueItems: true,
          events: true
        }
      }
    }
  });

  if (!runner) {
    return {
      configured: false as const,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      runner: null
    };
  }

  return {
    configured: true as const,
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
    runner: {
      id: runner.id,
      name: runner.name,
      slug: runner.slug,
      mode: runner.mode,
      status: getEffectiveRunnerStatus({
        status: runner.status,
        lastHeartbeatAt: runner.lastHeartbeatAt
      }),
      storedStatus: runner.status,
      host: runner.host,
      machineLabel: runner.machineLabel,
      lastHeartbeatAt: runner.lastHeartbeatAt,
      capabilities: runner.capabilitiesJson,
      queueItems: runner._count.queueItems,
      events: runner._count.events,
      createdAt: runner.createdAt,
      updatedAt: runner.updatedAt
    }
  };
}

export async function provisionStudioRunner(actorUserId: string, rotate = false) {
  const tenant = await ensureInternalExecutionTenant();
  const existing = await prisma.devRunner.findUnique({
    where: {
      tenantId_slug: {
        tenantId: tenant.id,
        slug: STUDIO_RUNNER_SLUG
      }
    }
  });

  if (existing && !rotate) {
    throw new Error('El Trends Engineering Runner ya existe. Usa rotar credencial si necesitas un token nuevo.');
  }

  const token = createRunnerToken();
  const tokenHash = hashRunnerToken(token);
  const now = new Date();

  const runner = existing
    ? await prisma.devRunner.update({
        where: { id: existing.id },
        data: {
          authTokenHash: tokenHash,
          status: DevRunnerStatus.OFFLINE,
          lastHeartbeatAt: null,
          mode: DevRunnerMode.LOCAL,
          machineLabel: existing.machineLabel ?? 'Trends Engineering Runner',
          updatedAt: now
        }
      })
    : await prisma.devRunner.create({
        data: {
          tenantId: tenant.id,
          createdByUserId: actorUserId,
          name: 'Trends Engineering Runner',
          slug: STUDIO_RUNNER_SLUG,
          mode: DevRunnerMode.LOCAL,
          status: DevRunnerStatus.OFFLINE,
          machineLabel: 'Trends Engineering Runner',
          authTokenHash: tokenHash
        }
      });

  await prisma.auditLog.create({
    data: {
      actorUserId,
      tenantId: tenant.id,
      action: existing ? 'STUDIO_RUNNER_TOKEN_ROTATED' : 'STUDIO_RUNNER_PROVISIONED',
      entity: 'DevRunner',
      entityId: runner.id,
      metaJson: {
        slug: runner.slug,
        mode: runner.mode,
        source: 'ENGINEERING_STUDIO'
      }
    }
  });

  return {
    runner: {
      id: runner.id,
      name: runner.name,
      slug: runner.slug,
      mode: runner.mode
    },
    token,
    rotated: Boolean(existing)
  };
}
