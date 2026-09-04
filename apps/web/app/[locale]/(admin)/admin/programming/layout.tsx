import Link from 'next/link';
import type { ReactNode } from 'react';

const items = [
  ['Overview', ''],
  ['Proyectos', '/projects'],
  ['Agentes', '/agents'],
  ['Workflows', '/workflows'],
  ['Costos', '/costs'],
  ['Hardware IA', '/hardware'],
  ['Runs', '/runs'],
  ['Integraciones', '/integrations'],
  ['Configuración', '/settings']
] as const;

export default async function ProgrammingLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = `/${locale}/admin/programming`;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),linear-gradient(135deg,#ffffff_0%,#f8fafc_100%)] px-6 py-7 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:px-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-600">Trends172Tech · Internal Engineering</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">Engineering Studio</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Centro privado para diseñar, presupuestar, construir y auditar proyectos con agentes especializados, ChatGPT, Codex e infraestructura IA local.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">Modo seguro</span>
            <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-300">ROOT only</span>
          </div>
        </div>
      </section>

      <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950">
        {items.map(([label, suffix]) => (
          <Link
            key={label}
            href={`${base}${suffix}`}
            className="whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-950 hover:text-white dark:text-slate-300 dark:hover:bg-white dark:hover:text-slate-950"
          >
            {label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
