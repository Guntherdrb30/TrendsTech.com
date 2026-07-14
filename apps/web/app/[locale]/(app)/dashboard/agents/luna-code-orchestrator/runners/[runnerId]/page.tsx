import { notFound } from "next/navigation";
import { prisma } from "@trends172tech/db";
import { requireRole } from "@/lib/auth/guards";
import { syncRunnerHealth } from "@/lib/luna-agent/runtime";
import { requireTenantId } from "@/lib/tenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type RouteParams = {
  locale: string;
  runnerId: string;
};

export default async function LunaRunnerDetailPage({
  params
}: {
  params: Promise<RouteParams>;
}) {
  const { locale, runnerId } = await params;
  const isEs = locale.startsWith("es");
  const tr = (es: string, en: string) => (isEs ? es : en);
  await requireRole("TENANT_OPERATOR");
  const tenantId = await requireTenantId();

  await syncRunnerHealth(tenantId);

  const runner = await prisma.devRunner.findFirst({
    where: {
      id: runnerId,
      tenantId
    },
    include: {
      queueItems: {
        orderBy: { createdAt: "desc" },
        take: 12,
        include: {
          task: {
            include: {
              project: true
            }
          }
        }
      },
      events: {
        orderBy: { createdAt: "desc" },
        take: 25,
        include: {
          task: {
            select: {
              id: true,
              title: true
            }
          }
        }
      },
      _count: {
        select: {
          queueItems: true,
          events: true
        }
      }
    }
  });

  if (!runner) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{runner.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{tr("Estado", "Status")}</div>
            <div className="mt-1 font-semibold text-slate-900 dark:text-white">{runner.status}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{tr("Modo", "Mode")}</div>
            <div className="mt-1 font-semibold text-slate-900 dark:text-white">{runner.mode}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Heartbeat</div>
            <div className="mt-1 font-semibold text-slate-900 dark:text-white">
              {runner.lastHeartbeatAt?.toISOString() ?? tr("sin señal", "no signal")}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Host / label</div>
            <div className="mt-1 font-semibold text-slate-900 dark:text-white">
              {runner.machineLabel ?? runner.host ?? tr("sin datos", "no data")}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{tr("Capacidades y carga", "Capabilities and load")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Slug</div>
              <div className="mt-1 font-semibold text-slate-900 dark:text-white">{runner.slug}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Queue items</div>
              <div className="mt-1 font-semibold text-slate-900 dark:text-white">{runner._count.queueItems}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{tr("Eventos", "Events")}</div>
              <div className="mt-1 font-semibold text-slate-900 dark:text-white">{runner._count.events}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Capabilities JSON</div>
              <pre className="mt-2 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs text-slate-100 dark:border-slate-800">
                <code>{JSON.stringify(runner.capabilitiesJson ?? {}, null, 2)}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tr("Cola atendida por este runner", "Queue handled by this runner")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {runner.queueItems.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">{tr("Este runner aún no reclama tareas.", "This runner has not claimed any tasks yet.")}</p>
            ) : (
              runner.queueItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{item.task.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {item.task.project.name} | {item.runtime} | {item.status}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {item.createdAt.toISOString()}
                    </span>
                  </div>
                  {item.lastError ? (
                    <div className="mt-2 rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
                      {item.lastError}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tr("Eventos recientes", "Recent events")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {runner.events.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">{tr("No hay eventos registrados.", "No events registered.")}</p>
          ) : (
            runner.events.map((event) => (
              <div key={event.id} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {event.type} {event.task ? `| ${event.task.title}` : ""}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {event.createdAt.toISOString()}
                  </span>
                </div>
                <p className="mt-2 text-slate-600 dark:text-slate-300">{event.message}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
