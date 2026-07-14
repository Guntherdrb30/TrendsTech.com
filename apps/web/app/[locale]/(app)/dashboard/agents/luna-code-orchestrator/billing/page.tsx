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
  const isEs = locale.startsWith("es");
  const tr = (es: string, en: string) => (isEs ? es : en);
  await requireRole("TENANT_OPERATOR");
  const tenantId = await requireTenantId();
  const snapshot = await getLunaBillingSnapshot(tenantId);

  const taskLabel =
    snapshot.policy.taskLimit === null
      ? `${snapshot.usage.tasksCreated} / ${tr("ilimitado", "unlimited")}`
      : `${snapshot.usage.tasksCreated} / ${snapshot.policy.taskLimit}`;

  const projectLabel =
    snapshot.policy.projectLimit === null
      ? `${snapshot.usage.activeProjects} / ${tr("ilimitado", "unlimited")}`
      : `${snapshot.usage.activeProjects} / ${snapshot.policy.projectLimit}`;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>{tr("Plan fuente", "Source plan")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-semibold">{snapshot.policy.sourcePlanKey}</div>
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{snapshot.policy.planKey}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{tr("Tareas del mes", "Tasks this month")}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{taskLabel}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{tr("Proyectos activos", "Active projects")}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{projectLabel}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{tr("Estado comercial", "Commercial status")}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{snapshot.policy.subscriptionStatus}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>{tr("Funciones habilitadas", "Enabled features")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {[
              { label: tr("Control remoto QR", "QR remote control"), enabled: snapshot.policy.supportsRemote },
              { label: tr("Múltiples proveedores IA", "Multiple AI providers"), enabled: snapshot.policy.supportsMultiProvider },
              { label: tr("Runners y ejecución real", "Runners and live execution"), enabled: snapshot.policy.supportsRunnerExecution },
              { label: tr("Runtime avanzado (Codex CLI)", "Advanced runtime (Codex CLI)"), enabled: snapshot.policy.supportsAdvancedRuntime }
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
                  {item.enabled ? tr("Habilitado", "Enabled") : tr("Bloqueado por plan", "Locked by plan")}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tr("Ruta de mejora", "Upgrade path")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="rounded-2xl border border-slate-200 px-4 py-4 dark:border-slate-800">
              <div className="font-semibold text-slate-900 dark:text-white">Basic</div>
              <p className="mt-1">{tr("50 tareas/mes, 1 proyecto, QR y API propia.", "50 tasks/month, 1 project, QR, and a dedicated API.")}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 px-4 py-4 dark:border-slate-800">
              <div className="font-semibold text-slate-900 dark:text-white">Pro</div>
              <p className="mt-1">{tr("300 tareas, 5 proyectos, múltiples IA y runners básicos.", "300 tasks, 5 projects, multiple AI providers, and basic runners.")}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 px-4 py-4 dark:border-slate-800">
              <div className="font-semibold text-slate-900 dark:text-white">Enterprise</div>
              <p className="mt-1">{tr("Escala avanzada, Codex CLI y operación multi-equipo.", "Advanced scale, Codex CLI, and multi-team operations.")}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/pricing`}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
              >
                {tr("Ver precios", "View pricing")}
              </Link>
              <Link
                href={`/${locale}/systems/luna`}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                {tr("Ver producto", "View product")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
