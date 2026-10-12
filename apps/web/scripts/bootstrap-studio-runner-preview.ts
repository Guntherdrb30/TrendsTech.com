/**
 * One-time Preview bootstrap for PR #38.
 * Creates the internal Engineering Studio runner on this feature branch only.
 * The plaintext credential is intentionally discarded; ROOT rotates it from the UI when a host is ready.
 */
import {
  DevRunnerMode,
  DevRunnerStatus,
  TenantMode,
  TenantStatus,
  UserRole,
  prisma
} from '@trends172tech/db';

const TARGET_BRANCH = 'feature/engineering-studio-orchestrator-bridge';
const TENANT_SLUG = 'trends-engineering-studio';
const RUNNER_SLUG = 'trends-engineering-runner';
const BOOTSTRAP_TOKEN_HASH = '24e8d29aca61daf4954fb8f70c6f13acad93d01bda1008422bd21549033d8493';

async function main() {
  if (process.env.VERCEL_ENV !== 'preview' || process.env.VERCEL_GIT_COMMIT_REF !== TARGET_BRANCH) {
    console.log('[studio-runner-bootstrap] Skipped: not the approved PR #38 preview.');
    return;
  }

  const root = await prisma.user.findFirst({
    where: { role: UserRole.ROOT },
    orderBy: { createdAt: 'asc' },
    select: { id: true }
  });

  if (!root) {
    throw new Error('No ROOT user exists; cannot provision Trends Engineering Runner.');
  }

  const tenant = await prisma.tenant.upsert({
    where: { slug: TENANT_SLUG },
    update: {
      name: 'Trends172Tech Engineering Studio',
      mode: TenantMode.SINGLE,
      status: TenantStatus.ACTIVE
    },
    create: {
      name: 'Trends172Tech Engineering Studio',
      slug: TENANT_SLUG,
      mode: TenantMode.SINGLE,
      status: TenantStatus.ACTIVE
    }
  });

  const existing = await prisma.devRunner.findUnique({
    where: {
      tenantId_slug: {
        tenantId: tenant.id,
        slug: RUNNER_SLUG
      }
    },
    select: { id: true }
  });

  const runner = existing
    ? await prisma.devRunner.findUniqueOrThrow({ where: { id: existing.id } })
    : await prisma.devRunner.create({
        data: {
          tenantId: tenant.id,
          createdByUserId: root.id,
          name: 'Trends Engineering Runner',
          slug: RUNNER_SLUG,
          mode: DevRunnerMode.LOCAL,
          status: DevRunnerStatus.OFFLINE,
          machineLabel: 'Trends Engineering Runner',
          authTokenHash: BOOTSTRAP_TOKEN_HASH
        }
      });

  if (!existing) {
    await prisma.auditLog.create({
      data: {
        actorUserId: root.id,
        tenantId: tenant.id,
        action: 'STUDIO_RUNNER_PREVIEW_BOOTSTRAPPED',
        entity: 'DevRunner',
        entityId: runner.id,
        metaJson: {
          slug: RUNNER_SLUG,
          source: 'PR_38_PREVIEW_BOOTSTRAP'
        }
      }
    });
  }

  console.log(
    '[studio-runner-bootstrap] Ready:',
    JSON.stringify({ runnerId: runner.id, tenantId: tenant.id, created: !existing })
  );
}

main()
  .catch((error) => {
    console.error('[studio-runner-bootstrap]', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
