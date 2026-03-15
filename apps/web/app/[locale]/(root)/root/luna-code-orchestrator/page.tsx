import Link from "next/link";
import { prisma } from "@trends172tech/db";
import { requireRole } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

function formatDate(value?: Date | null) {
  if (!value) {
    return "-";
  }

  return value.toISOString().split("T")[0];
}

export default async function RootLunaCodeOrchestratorPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireRole("ROOT");

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [tenants, metrics, projectCounts, runnerCounts, blockedEvents] = await Promise.all([
    prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        subscriptions: {
          where: { status: "ACTIVE" },
          orderBy: { startedAt: "desc" },
          take: 1,
          include: {
            plan: {
              select: {
                key: true,
                name_es: true
              }
            }
          }
        }
      }
    }),
    prisma.devUsageMetric.findMany({
      where: {
        periodMonth: month,
        periodYear: year
      }
    }),
    prisma.devProject.groupBy({
      by: ["tenantId"],
      where: { isActive: true },
      _count: { _all: true }
    }),
    prisma.devRunner.groupBy({
      by: ["tenantId", "status"],
      _count: { _all: true }
    }),
    prisma.auditLog.findMany({
      where: {
        createdAt: { gte: start, lt: end },
        action: { startsWith: "LUNA_LIMIT_BLOCKED" },
        tenantId: { not: null }
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        tenantId: true,
        action: true,
        createdAt: true,
        metaJson: true
      }
    })
  ]);

  const projectCountMap = new Map(projectCounts.map((entry) => [entry.tenantId, entry._count._all]));
  const runnerCountMap = new Map<string, number>();
  for (const entry of runnerCounts) {
    if (entry.status === "ONLINE" || entry.status === "BUSY") {
      runnerCountMap.set(entry.tenantId, (runnerCountMap.get(entry.tenantId) ?? 0) + entry._count._all);
    }
  }

  const metricMap = new Map<string, Record<string, number>>();
  for (const metric of metrics) {
    const current = metricMap.get(metric.tenantId) ?? {};
    current[metric.metricType] = metric.value;
    metricMap.set(metric.tenantId, current);
  }

  const blockedCountMap = new Map<string, number>();
  const blockedLatestMap = new Map<
    string,
    {
      action: string;
      createdAt: Date;
      metaJson: unknown;
    }
  >();

  for (const event of blockedEvents) {
    if (!event.tenantId) {
      continue;
    }
    blockedCountMap.set(event.tenantId, (blockedCountMap.get(event.tenantId) ?? 0) + 1);
    if (!blockedLatestMap.has(event.tenantId)) {
      blockedLatestMap.set(event.tenantId, {
        action: event.action,
        createdAt: event.createdAt,
        metaJson: event.metaJson
      });
    }
  }

  const rows = tenants
    .map((tenant) => {
      const usage = metricMap.get(tenant.id) ?? {};
      const activeProjects = projectCountMap.get(tenant.id) ?? 0;
      const activeRunners = runnerCountMap.get(tenant.id) ?? 0;
      const blockedCount = blockedCountMap.get(tenant.id) ?? 0;
      const latestBlocked = blockedLatestMap.get(tenant.id) ?? null;
      const activeSubscription = tenant.subscriptions[0] ?? null;

      return {
        tenantId: tenant.id,
        tenantName: tenant.name,
        tenantSlug: tenant.slug,
        tenantStatus: tenant.status,
        planKey: activeSubscription?.plan?.key ?? "basic",
        planName: activeSubscription?.plan?.name_es ?? "Basic fallback",
        subscriptionStatus: activeSubscription?.status ?? "NONE",
        tasksCreated: usage.TASKS_CREATED ?? 0,
        tasksExecuted: usage.TASKS_EXECUTED ?? 0,
        tasksFailed: usage.TASKS_FAILED ?? 0,
        remoteSessions: usage.REMOTE_SESSIONS ?? 0,
        activeProjects,
        activeRunners,
        blockedCount,
        latestBlocked
      };
    })
    .filter((row) => {
      return (
        row.tasksCreated > 0 ||
        row.tasksExecuted > 0 ||
        row.tasksFailed > 0 ||
        row.remoteSessions > 0 ||
        row.activeProjects > 0 ||
        row.activeRunners > 0 ||
        row.blockedCount > 0 ||
        row.subscriptionStatus === "ACTIVE"
      );
    })
    .sort((a, b) => {
      return (
        b.tasksCreated +
        b.activeProjects +
        b.activeRunners +
        b.blockedCount -
        (a.tasksCreated + a.activeProjects + a.activeRunners + a.blockedCount)
      );
    });

  const totals = rows.reduce(
    (acc, row) => {
      acc.tasksCreated += row.tasksCreated;
      acc.tasksExecuted += row.tasksExecuted;
      acc.activeRunners += row.activeRunners;
      acc.blocked += row.blockedCount;
      return acc;
    },
    { tasksCreated: 0, tasksExecuted: 0, activeRunners: 0, blocked: 0 }
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <div className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">
            Root | Luna Code Orchestrator
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Visibilidad comercial y operativa por tenant
          </h1>
          <p className="max-w-3xl text-sm text-slate-500 dark:text-slate-400">
            Monitorea adopcion, limites bloqueados, runners activos y carga mensual del agente en
            todos los tenants.
          </p>
        </div>
        <Link
          href={`/${locale}/root`}
          className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
        >
          Volver a root
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Tenants con uso</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{rows.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tareas creadas</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{totals.tasksCreated}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tareas ejecutadas</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{totals.tasksExecuted}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bloqueos del mes</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{totals.blocked}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Resumen por tenant</CardTitle>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Aun no hay adopcion comercial registrada de Luna Code Orchestrator.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Tareas</TableHead>
                    <TableHead>Proyectos</TableHead>
                    <TableHead>Runners</TableHead>
                    <TableHead>Bloqueos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.tenantId}>
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {row.tenantName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {row.tenantSlug} | {row.tenantStatus}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {row.planName}
                        </div>
                        <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                          {row.planKey} | {row.subscriptionStatus}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {row.tasksCreated}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          ok {row.tasksExecuted} | fail {row.tasksFailed}
                        </div>
                      </TableCell>
                      <TableCell>{row.activeProjects}</TableCell>
                      <TableCell>{row.activeRunners}</TableCell>
                      <TableCell>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {row.blockedCount}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {row.latestBlocked ? formatDate(row.latestBlocked.createdAt) : "-"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ultimos bloqueos comerciales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {blockedEvents.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No hay bloqueos por plan en el periodo actual.
              </p>
            ) : (
              blockedEvents.slice(0, 10).map((event) => {
                const tenant = rows.find((row) => row.tenantId === event.tenantId);
                return (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="font-semibold">{event.action}</span>
                      <span className="text-xs">{formatDate(event.createdAt)}</span>
                    </div>
                    <div className="mt-2 text-xs uppercase tracking-[0.14em]">
                      {tenant?.tenantName ?? "Tenant"}
                    </div>
                    <pre className="mt-2 whitespace-pre-wrap text-xs">
                      {JSON.stringify(event.metaJson ?? {}, null, 2)}
                    </pre>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
