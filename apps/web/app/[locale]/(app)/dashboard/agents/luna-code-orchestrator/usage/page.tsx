import { prisma } from "@trends172tech/db";
import { requireRole } from "@/lib/auth/guards";
import { requireTenantId } from "@/lib/tenant";
import { getLunaBillingSnapshot } from "@/lib/luna-agent/billing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function LunaUsagePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isEs = locale.startsWith("es");
  const tr = (es: string, en: string) => (isEs ? es : en);
  await requireRole("TENANT_OPERATOR");
  const tenantId = await requireTenantId();
  const snapshot = await getLunaBillingSnapshot(tenantId);
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [metrics, blockedEvents, recentDone, recentFailed] = await Promise.all([
    prisma.devUsageMetric.findMany({
      where: { tenantId, periodMonth: month, periodYear: year },
      orderBy: { metricType: "asc" }
    }),
    prisma.auditLog.findMany({
      where: {
        tenantId,
        action: { startsWith: "LUNA_LIMIT_BLOCKED" }
      },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    prisma.devTask.findMany({
      where: { tenantId, status: "DONE" },
      orderBy: { completedAt: "desc" },
      take: 8,
      select: {
        id: true,
        title: true,
        completedAt: true,
        queue: {
          select: {
            runtime: true,
            runner: {
              select: {
                name: true
              }
            }
          }
        }
      }
    }),
    prisma.devTask.findMany({
      where: { tenantId, status: "FAILED" },
      orderBy: { completedAt: "desc" },
      take: 8,
      select: {
        id: true,
        title: true,
        completedAt: true,
        queue: {
          select: {
            lastError: true,
            runtime: true
          }
        }
      }
    })
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>{tr("Tareas creadas", "Tasks created")}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{snapshot.usage.tasksCreated}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{tr("Tareas ejecutadas", "Tasks executed")}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{snapshot.usage.tasksExecuted}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{tr("Tareas fallidas", "Failed tasks")}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{snapshot.usage.tasksFailed}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{tr("Runners activos", "Active runners")}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{snapshot.usage.activeRunners}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>{tr("Métricas del mes", "Monthly metrics")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{tr("Aún no hay métricas agregadas este mes.", "No metrics have been recorded this month yet.")}</p>
            ) : (
              metrics.map((metric) => (
                <div key={metric.id} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-900 dark:text-white">{metric.metricType}</span>
                    <span className="text-slate-600 dark:text-slate-300">{metric.value}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tr("Bloqueos por plan", "Plan limits")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {blockedEvents.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{tr("No hay bloqueos recientes.", "There are no recent plan limits.")}</p>
            ) : (
              blockedEvents.map((item) => (
                <div key={item.id} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-semibold">{item.action}</span>
                    <span className="text-xs">{item.createdAt.toISOString()}</span>
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap text-xs">{JSON.stringify(item.metaJson ?? {}, null, 2)}</pre>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{tr("Entregas recientes", "Recent deliveries")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentDone.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{tr("No hay tareas completadas recientes.", "There are no recently completed tasks.")}</p>
            ) : (
              recentDone.map((task) => (
                <div key={task.id} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
                  <div className="font-semibold text-slate-900 dark:text-white">{task.title}</div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>Runtime: {task.queue?.runtime ?? "dry-run"}</span>
                    <span>Runner: {task.queue?.runner?.name ?? tr("sin runner", "no runner")}</span>
                    <span>{tr("Fecha", "Date")}: {task.completedAt?.toISOString() ?? "-"}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tr("Fallos recientes", "Recent failures")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentFailed.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{tr("No hay fallos recientes.", "There are no recent failures.")}</p>
            ) : (
              recentFailed.map((task) => (
                <div key={task.id} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                  <div className="font-semibold">{task.title}</div>
                  <div className="mt-2 text-xs">Runtime: {task.queue?.runtime ?? "dry-run"}</div>
                  <div className="mt-1 text-xs">{tr("Fecha", "Date")}: {task.completedAt?.toISOString() ?? "-"}</div>
                  {task.queue?.lastError ? <p className="mt-2 text-xs">{task.queue.lastError}</p> : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
