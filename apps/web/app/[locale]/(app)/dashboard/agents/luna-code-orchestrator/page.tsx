import Link from "next/link";
import { prisma } from "@trends172tech/db";
import { requireRole } from "@/lib/auth/guards";
import { requireTenantId } from "@/lib/tenant";
import { getLunaPlanSnapshot } from "@/lib/luna-agent/summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function LunaCodeOrchestratorPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEs = locale.startsWith("es");
  const copy = isEs
    ? {
        projects: "Proyectos activos", tasks: "Tareas activas", queue: "Cola pendiente",
        runners: "Runners y QR", online: "runner(s) en línea u ocupados", sessions: "sesiones QR activas",
        recent: "Tareas recientes", empty: "Aún no hay tareas. Crea la primera desde el panel.",
        queueLabel: "Cola", none: "ninguna", unassigned: "sin asignar", detail: "Ver detalle",
        plan: "Plan y capacidad", currentPlan: "Plan actual", taskLimit: "Límite orientativo de tareas",
        projectLimit: "Límite orientativo de proyectos", providers: "Proveedores IA activos",
        quick: "Acciones rápidas", manage: "Gestionar proyectos", create: "Crear tarea nueva",
        pair: "Emparejar runners", configure: "Configurar IA y QR",
      }
    : {
        projects: "Active projects", tasks: "Active tasks", queue: "Pending queue",
        runners: "Runners and QR", online: "runner(s) online or busy", sessions: "active QR sessions",
        recent: "Recent tasks", empty: "There are no tasks yet. Create the first one from the dashboard.",
        queueLabel: "Queue", none: "none", unassigned: "unassigned", detail: "View details",
        plan: "Plan and capacity", currentPlan: "Current plan", taskLimit: "Indicative task limit",
        projectLimit: "Indicative project limit", providers: "Active AI providers",
        quick: "Quick actions", manage: "Manage projects", create: "Create new task",
        pair: "Pair runners", configure: "Configure AI and QR",
      };
  const user = await requireRole("TENANT_OPERATOR");
  const tenantId = await requireTenantId();

  const [projectCount, activeTasks, queuedTasks, runnerCount, busyRunners, recentTasks, remoteSessions, providers, plan] =
    await Promise.all([
      prisma.devProject.count({ where: { tenantId, isActive: true } }),
      prisma.devTask.count({ where: { tenantId, status: { in: ["RUNNING", "REVIEW"] } } }),
      prisma.devExecutionQueue.count({ where: { task: { tenantId }, status: "PENDING" } }),
      prisma.devRunner.count({ where: { tenantId } }),
      prisma.devRunner.count({ where: { tenantId, status: { in: ["ONLINE", "BUSY"] } } }),
      prisma.devTask.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          project: { select: { name: true } },
          queue: {
            include: {
              runner: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      }),
      prisma.remoteSession.count({
        where: { tenantId, status: "ACTIVE", expiresAt: { gt: new Date() } }
      }),
      prisma.devAIProvider.count({
        where: { userId: user.id, isActive: true }
      }),
      getLunaPlanSnapshot(tenantId)
    ]);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>{copy.projects}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{projectCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{copy.tasks}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{activeTasks}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{copy.queue}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{queuedTasks}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{copy.runners}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-semibold">{runnerCount}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {busyRunners} {copy.online} · {remoteSessions} {copy.sessions}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>{copy.recent}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTasks.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {copy.empty}
              </p>
            ) : (
              recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-slate-200 px-4 py-4 text-sm dark:border-slate-800"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{task.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {task.project.name} · {task.priority} · {task.executionMode}
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {task.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{copy.queueLabel}: {task.queue?.status ?? copy.none}</span>
                    <span>Runtime: {task.queue?.runtime ?? "dry-run"}</span>
                    <span>Runner: {task.queue?.runner?.name ?? copy.unassigned}</span>
                    <Link
                      href={`/${locale}/dashboard/agents/luna-code-orchestrator/tasks/${task.id}`}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      {copy.detail}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{copy.plan}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>
                {copy.currentPlan}: <span className="font-semibold text-slate-900 dark:text-white">{plan.planKey}</span>
              </p>
              <p>{copy.taskLimit}: {plan.taskLimitLabel}</p>
              <p>{copy.projectLimit}: {plan.projectLimitLabel}</p>
              <p>{copy.providers}: {providers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{copy.quick}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Link
                href={`/${locale}/dashboard/agents/luna-code-orchestrator/projects`}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200"
              >
                {copy.manage}
              </Link>
              <Link
                href={`/${locale}/dashboard/agents/luna-code-orchestrator/tasks/new`}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200"
              >
                {copy.create}
              </Link>
              <Link
                href={`/${locale}/dashboard/agents/luna-code-orchestrator/runners`}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200"
              >
                {copy.pair}
              </Link>
              <Link
                href={`/${locale}/dashboard/agents/luna-code-orchestrator/settings`}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200"
              >
                {copy.configure}
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
