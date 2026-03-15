import { prisma } from "@trends172tech/db";
import { requireRole } from "@/lib/auth/guards";
import { requireTenantId } from "@/lib/tenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function LunaQueuePage() {
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
      }
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cola de ejecucion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {queueItems.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">La cola esta vacia.</p>
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
                    {item.task.priority} · task {item.task.status}
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {item.status}
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Creada: {item.createdAt.toISOString()}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
