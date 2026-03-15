import { notFound } from "next/navigation";
import { prisma } from "@trends172tech/db";
import { requireRole } from "@/lib/auth/guards";
import { requireTenantId } from "@/lib/tenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type RouteParams = {
  taskId: string;
};

export default async function LunaTaskDetailPage({
  params
}: {
  params: Promise<RouteParams>;
}) {
  const { taskId } = await params;
  await requireRole("TENANT_OPERATOR");
  const tenantId = await requireTenantId();

  const task = await prisma.devTask.findFirst({
    where: { id: taskId, tenantId },
    include: {
      project: true,
      queue: true,
      logs: { orderBy: { createdAt: "desc" }, take: 20 },
      files: { orderBy: { createdAt: "desc" }, take: 20 }
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
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 text-sm text-slate-600 dark:text-slate-300">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Proyecto</div>
            <div className="mt-1 font-semibold text-slate-900 dark:text-white">{task.project.name}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Estado</div>
            <div className="mt-1 font-semibold text-slate-900 dark:text-white">{task.status}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Cola</div>
            <div className="mt-1 font-semibold text-slate-900 dark:text-white">{task.queue?.status ?? "none"}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Proveedor</div>
            <div className="mt-1 font-semibold text-slate-900 dark:text-white">{task.aiProvider ?? "manual"}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Brief de ejecucion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Descripcion</div>
              <p className="mt-2 whitespace-pre-wrap">{task.description ?? "Sin descripcion."}</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Prompt</div>
              <p className="mt-2 whitespace-pre-wrap">{task.prompt ?? "Sin prompt."}</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Resultado</div>
              <p className="mt-2 whitespace-pre-wrap">{task.resultSummary ?? "Pendiente."}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Archivos modificados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {task.files.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">Aun no hay archivos reportados.</p>
            ) : (
              task.files.map((file) => (
                <div key={file.id} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                  <div className="font-medium text-slate-900 dark:text-white">{file.filePath}</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {file.changeType} · {file.summary ?? "Sin resumen"}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs recientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {task.logs.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">Aun no hay logs.</p>
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
    </div>
  );
}
