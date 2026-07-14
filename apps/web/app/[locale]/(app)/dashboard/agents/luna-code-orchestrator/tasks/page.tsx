import Link from "next/link";
import { prisma } from "@trends172tech/db";
import { requireRole } from "@/lib/auth/guards";
import { requireTenantId } from "@/lib/tenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function LunaTasksPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEs = locale.startsWith("es");
  const tr = (es: string, en: string) => (isEs ? es : en);
  await requireRole("TENANT_OPERATOR");
  const tenantId = await requireTenantId();
  const tasks = await prisma.devTask.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { name: true } },
      queue: true
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tr("Tareas del agente", "Agent tasks")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{tr("Sin tareas registradas.", "No tasks registered.")}</p>
        ) : (
          tasks.map((task) => (
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
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {task.status}
                  </span>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                    Queue {task.queue?.status ?? "none"}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>{tr("Creada", "Created")}: {task.createdAt.toISOString().split("T")[0]}</span>
                <span>{tr("Proveedor", "Provider")}: {task.aiProvider ?? "manual"}</span>
                <Link
                  href={`/${locale}/dashboard/agents/luna-code-orchestrator/tasks/${task.id}`}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  {tr("Ver detalle", "View details")}
                </Link>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
