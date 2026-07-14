import Link from "next/link";
import { prisma } from "@trends172tech/db";
import { requireRole } from "@/lib/auth/guards";
import { getLunaPlanSnapshot } from "@/lib/luna-agent/summary";
import { requireTenantId } from "@/lib/tenant";
import { CreateTaskForm } from "./create-task-form";

export const dynamic = "force-dynamic";

export default async function LunaNewTaskPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEs = locale.startsWith("es");
  const tr = (es: string, en: string) => (isEs ? es : en);
  const user = await requireRole("TENANT_OPERATOR");
  const tenantId = await requireTenantId();
  const [projects, providers, plan] = await Promise.all([
    prisma.devProject.findMany({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.devAIProvider.findMany({
      where: { userId: user.id, isActive: true },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        label: true,
        provider: true,
        isDefault: true
      }
    }),
    getLunaPlanSnapshot(tenantId)
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
        <div className="font-semibold text-slate-900 dark:text-white">
          {tr("Plan activo", "Active plan")}: {plan.planKey}
        </div>
        <div className="mt-1">
          {tr("Tareas disponibles", "Available tasks")}: {plan.taskLimitLabel}. {tr("Proyectos", "Projects")}: {plan.projectLimitLabel}.
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em]">
          <span>{plan.supportsRunnerExecution ? tr("Runner habilitado", "Runner enabled") : tr("Solo modo de prueba", "Dry run only")}</span>
          <span>{plan.supportsAdvancedRuntime ? tr("Codex CLI habilitado", "Codex CLI enabled") : tr("Codex CLI bloqueado", "Codex CLI locked")}</span>
        </div>
      </div>
      {projects.length === 0 ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          {tr("Necesitas crear al menos un proyecto antes de registrar tareas.", "You need to create at least one project before registering tasks.")}{" "}
          <Link href={`/${locale}/dashboard/agents/luna-code-orchestrator/projects`} className="font-semibold underline">
            {tr("Ir a proyectos", "Go to projects")}
          </Link>
        </div>
      ) : null}
      <CreateTaskForm locale={locale} projects={projects} providers={providers} plan={plan} />
    </div>
  );
}
