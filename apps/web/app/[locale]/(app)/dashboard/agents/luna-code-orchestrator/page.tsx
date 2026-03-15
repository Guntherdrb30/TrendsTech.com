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
  const user = await requireRole("TENANT_OPERATOR");
  const tenantId = await requireTenantId();

  const [projectCount, activeTasks, queuedTasks, recentTasks, remoteSessions, providers, plan] =
    await Promise.all([
      prisma.devProject.count({ where: { tenantId, isActive: true } }),
      prisma.devTask.count({ where: { tenantId, status: { in: ["RUNNING", "REVIEW"] } } }),
      prisma.devExecutionQueue.count({ where: { task: { tenantId }, status: "PENDING" } }),
      prisma.devTask.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          project: { select: { name: true } },
          queue: true
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
            <CardTitle>Proyectos activos</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{projectCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tareas activas</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{activeTasks}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cola pendiente</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{queuedTasks}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sesiones QR activas</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{remoteSessions}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Tareas recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTasks.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Aun no hay tareas. Crea la primera desde el panel.
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
                    <span>Queue: {task.queue?.status ?? "none"}</span>
                    <Link
                      href={`/${locale}/dashboard/agents/luna-code-orchestrator/tasks/${task.id}`}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Ver detalle
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
              <CardTitle>Plan y capacidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>
                Plan actual: <span className="font-semibold text-slate-900 dark:text-white">{plan.planKey}</span>
              </p>
              <p>Límite orientativo de tareas: {plan.taskLimitLabel}</p>
              <p>Límite orientativo de proyectos: {plan.projectLimitLabel}</p>
              <p>Proveedores IA activos: {providers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Link
                href={`/${locale}/dashboard/agents/luna-code-orchestrator/projects`}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200"
              >
                Gestionar proyectos
              </Link>
              <Link
                href={`/${locale}/dashboard/agents/luna-code-orchestrator/tasks/new`}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200"
              >
                Crear tarea nueva
              </Link>
              <Link
                href={`/${locale}/dashboard/agents/luna-code-orchestrator/settings`}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200"
              >
                Configurar IA y QR
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
