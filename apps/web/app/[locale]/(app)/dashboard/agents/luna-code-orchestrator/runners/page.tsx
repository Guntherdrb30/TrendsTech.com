import { prisma } from "@trends172tech/db";
import { requireRole } from "@/lib/auth/guards";
import { syncRunnerHealth } from "@/lib/luna-agent/runtime";
import { requireTenantId } from "@/lib/tenant";
import { RunnersClient } from "./runners-client";

export const dynamic = "force-dynamic";

export default async function LunaRunnersPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole("TENANT_OPERATOR");
  const tenantId = await requireTenantId();

  await syncRunnerHealth(tenantId);

  const [runners, recentEvents, pendingQueue, processingQueue, failedQueue] = await Promise.all([
    prisma.devRunner.findMany({
      where: { tenantId },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: {
            queueItems: true,
            events: true
          }
        }
      }
    }),
    prisma.devRunnerEvent.findMany({
      where: { runner: { tenantId } },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: {
        runner: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        task: {
          select: {
            id: true,
            title: true
          }
        }
      }
    }),
    prisma.devExecutionQueue.count({
      where: { task: { tenantId }, status: "PENDING" }
    }),
    prisma.devExecutionQueue.count({
      where: { task: { tenantId }, status: { in: ["CLAIMED", "PROCESSING"] } }
    }),
    prisma.devExecutionQueue.count({
      where: { task: { tenantId }, status: "FAILED" }
    })
  ]);

  return (
    <RunnersClient
      locale={locale}
      canManage={user.role === "ROOT" || user.role === "TENANT_ADMIN"}
      originHint={process.env.NEXT_PUBLIC_URL ?? "https://tu-dominio.com"}
      runners={runners}
      recentEvents={recentEvents}
      queueSummary={{
        pending: pendingQueue,
        processing: processingQueue,
        failed: failedQueue
      }}
    />
  );
}
