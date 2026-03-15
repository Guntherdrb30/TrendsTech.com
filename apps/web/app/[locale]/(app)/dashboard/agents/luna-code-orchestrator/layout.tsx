import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { resolveTenantFromUser } from "@/lib/tenant";

export default async function LunaCodeOrchestratorLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole("TENANT_OPERATOR");
  const tenant = await resolveTenantFromUser(user);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">
          Luna Code Orchestrator
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
              Orquestacion de desarrollo multi-IA
            </h1>
            <p className="max-w-3xl text-sm text-slate-500 dark:text-slate-400">
              Gestiona proyectos, tareas, sesiones QR y configuracion de proveedores IA dentro de{" "}
              {tenant?.name ?? "tu tenant"}.
            </p>
          </div>
          <Link
            href={`/${locale}/dashboard/agents`}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
          >
            Volver a agentes
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
        {[
          { href: `/${locale}/dashboard/agents/luna-code-orchestrator`, label: "Overview" },
          { href: `/${locale}/dashboard/agents/luna-code-orchestrator/projects`, label: "Proyectos" },
          { href: `/${locale}/dashboard/agents/luna-code-orchestrator/tasks`, label: "Tareas" },
          { href: `/${locale}/dashboard/agents/luna-code-orchestrator/tasks/new`, label: "Nueva tarea" },
          { href: `/${locale}/dashboard/agents/luna-code-orchestrator/queue`, label: "Cola" },
          { href: `/${locale}/dashboard/agents/luna-code-orchestrator/runners`, label: "Runners" },
          { href: `/${locale}/dashboard/agents/luna-code-orchestrator/settings`, label: "Settings" }
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:border-white dark:hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}
