import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { requireTenantId } from "@/lib/tenant";
import { getLunaBillingSnapshot } from "@/lib/luna-agent/billing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function LunaBillingPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireRole("TENANT_OPERATOR");
  const tenantId = await requireTenantId();
  const snapshot = await getLunaBillingSnapshot(tenantId);

  const taskLabel =
    snapshot.policy.taskLimit === null
      ? `${snapshot.usage.tasksCreated} / ilimitado`
      : `${snapshot.usage.tasksCreated} / ${snapshot.policy.taskLimit}`;

  const projectLabel =
    snapshot.policy.projectLimit === null
      ? `${snapshot.usage.activeProjects} / ilimitado`
      : `${snapshot.usage.activeProjects} / ${snapshot.policy.projectLimit}`;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Plan fuente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-semibold">{snapshot.policy.sourcePlanKey}</div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{snapshot.policy.planKey}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tareas del mes</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{taskLabel}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Proyectos activos</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{projectLabel}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Estado comercial</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{snapshot.policy.subscriptionStatus}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Funciones habilitadas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {[
              { label: "Control remoto QR", enabled: snapshot.policy.supportsRemote },
              { label: "Multiples proveedores IA", enabled: snapshot.policy.supportsMultiProvider },
              { label: "Runners y ejecucion real", enabled: snapshot.policy.supportsRunnerExecution },
              { label: "Runtime avanzado (Codex CLI)", enabled: snapshot.policy.supportsAdvancedRuntime }
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border px-4 py-4 text-sm ${
                  item.enabled
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                    : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                }`}
              >
                <div className="font-semibold">{item.label}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em]">
                  {item.enabled ? "Habilitado" : "Bloqueado por plan"}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upgrade path</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="rounded-2xl border border-slate-200 px-4 py-4 dark:border-slate-800">
              <div className="font-semibold text-slate-900 dark:text-white">Basic</div>
              <p className="mt-1">50 tareas/mes, 1 proyecto, QR y API propia.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 px-4 py-4 dark:border-slate-800">
              <div className="font-semibold text-slate-900 dark:text-white">Pro</div>
              <p className="mt-1">300 tareas, 5 proyectos, multiples IA y runners basicos.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 px-4 py-4 dark:border-slate-800">
              <div className="font-semibold text-slate-900 dark:text-white">Enterprise</div>
              <p className="mt-1">Escala avanzada, Codex CLI y operacion multi-equipo.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/pricing`}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
              >
                Ver pricing
              </Link>
              <Link
                href={`/${locale}/systems/luna`}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                Ver producto
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
