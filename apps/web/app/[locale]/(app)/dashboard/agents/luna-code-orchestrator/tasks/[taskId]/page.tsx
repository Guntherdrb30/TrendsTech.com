import { notFound } from "next/navigation";
import { prisma } from "@trends172tech/db";
import { requireRole } from "@/lib/auth/guards";
import { requireTenantId } from "@/lib/tenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type RouteParams = {
  locale: string;
  taskId: string;
};

export default async function LunaTaskDetailPage({
  params
}: {
  params: Promise<RouteParams>;
}) {
  const { locale, taskId } = await params;
  const isEs = locale.startsWith("es");
  const tr = (es: string, en: string) => (isEs ? es : en);
  await requireRole("TENANT_OPERATOR");
  const tenantId = await requireTenantId();

  const task = await prisma.devTask.findFirst({
    where: { id: taskId, tenantId },
    include: {
      project: true,
      queue: {
        include: {
          runner: true
        }
      },
      logs: { orderBy: { createdAt: "desc" }, take: 20 },
      files: { orderBy: { createdAt: "desc" }, take: 20 },
      runnerEvents: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          runner: true
        }
      }
    }
  });

  if (!task) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{task.title}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{tr("Proyecto", "Project")}</div>
            <div className="mt-1 font-semibold text-slate-900 dark:text-white">{task.project.name}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{tr("Estado", "Status")}</div>
            <div className="mt-1 font-semibold text-slate-900 dark:text-white">{task.status}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{tr("Cola", "Queue")}</div>
            <div className="mt-1 font-semibold text-slate-900 dark:text-white">
              {task.queue?.status ?? "none"} {task.queue ? `· ${task.queue.runtime}` : ""}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{tr("Proveedor", "Provider")}</div>
            <div className="mt-1 font-semibold text-slate-900 dark:text-white">{task.aiProvider ?? "manual"}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{tr("Brief de ejecución", "Execution brief")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{tr("Descripción", "Description")}</div>
              <p className="mt-2 whitespace-pre-wrap">{task.description ?? tr("Sin descripción.", "No description.")}</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Prompt</div>
              <p className="mt-2 whitespace-pre-wrap">{task.prompt ?? tr("Sin prompt.", "No prompt.")}</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{tr("Resultado", "Result")}</div>
              <p className="mt-2 whitespace-pre-wrap">{task.resultSummary ?? tr("Pendiente.", "Pending.")}</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{tr("Runner asignado", "Assigned runner")}</div>
              <p className="mt-2">{task.queue?.runner?.name ?? tr("Sin runner asignado.", "No runner assigned.")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tr("Archivos modificados", "Modified files")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {task.files.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">{tr("Aún no hay archivos reportados.", "No files have been reported yet.")}</p>
            ) : (
              task.files.map((file) => (
                <div key={file.id} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                  <div className="font-medium text-slate-900 dark:text-white">{file.filePath}</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {file.changeType} · {file.summary ?? tr("Sin resumen", "No summary")}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tr("Logs recientes", "Recent logs")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {task.logs.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">{tr("Aún no hay logs.", "There are no logs yet.")}</p>
          ) : (
            task.logs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white">{log.level}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {log.createdAt.toISOString()}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-slate-600 dark:text-slate-300">{log.message}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tr("Eventos del runner", "Runner events")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {task.runnerEvents.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">{tr("Aún no hay eventos del runner.", "There are no runner events yet.")}</p>
          ) : (
            task.runnerEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {event.type} · {event.runner.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {event.createdAt.toISOString()}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-slate-600 dark:text-slate-300">{event.message}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
