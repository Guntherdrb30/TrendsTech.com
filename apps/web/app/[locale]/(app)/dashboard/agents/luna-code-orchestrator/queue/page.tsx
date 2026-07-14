import Link from "next/link";
import { prisma } from "@trends172tech/db";
import { requireRole } from "@/lib/auth/guards";
import { requireTenantId } from "@/lib/tenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function LunaQueuePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEs = locale.startsWith("es");
  const tr = (es: string, en: string) => (isEs ? es : en);
  await requireRole("TENANT_OPERATOR");
  const tenantId = await requireTenantId();
  const queueItems = await prisma.devExecutionQueue.findMany({
    where: { task: { tenantId } },
    orderBy: { createdAt: "desc" },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true
        }
      },
      runner: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tr("Cola de ejecución", "Execution queue")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {queueItems.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{tr("La cola está vacía.", "The queue is empty.")}</p>
        ) : (
          queueItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 px-4 py-4 text-sm dark:border-slate-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{item.task.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {item.task.priority} · task {item.task.status} · runtime {item.runtime}
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {item.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>{tr("Creada", "Created")}: {item.createdAt.toISOString()}</span>
                <span>{tr("Intentos", "Attempts")}: {item.attemptCount}</span>
                <span>
                  Runner:{" "}
                  {item.runner ? (
                    <Link
                      href={`/${locale}/dashboard/agents/luna-code-orchestrator/runners/${item.runner.id}`}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      {item.runner.name}
                    </Link>
                  ) : (
                    tr("sin asignar", "unassigned")
                  )}
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
  );
}
