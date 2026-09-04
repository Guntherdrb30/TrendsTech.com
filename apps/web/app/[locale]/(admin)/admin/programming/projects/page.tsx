import Link from 'next/link';
import { listStudioProjects } from '@/lib/engineering-studio/store';

function money(value: { toString(): string } | null) {
  if (!value) return '—';
  return `$${Number(value.toString()).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

export default async function StudioProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const projects = await listStudioProjects();
  return (
    <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Nuevo proyecto</p><h3 className="mt-2 text-2xl font-semibold">¿Desde dónde comenzamos?</h3><p className="mt-2 text-sm leading-6 text-slate-500">El origen prepara y persiste un Blueprint preliminar. No inicia programación automáticamente.</p>
        <div className="mt-6 space-y-3">{[['Idea','Describe el problema y el resultado esperado.'],['PRD','Importa requisitos ya estructurados.'],['ChatGPT / Work','Registra un proyecto nacido de una sesión.'],['Repositorio existente','Continúa un software con evidencia del código.'],['Recuperar proyecto','Audita un desarrollo incompleto o abandonado.']].map(([title, detail]) => <Link href={`/${locale}/admin/programming/projects/new`} key={title} className="block w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50/50 dark:border-slate-800 dark:hover:border-cyan-900 dark:hover:bg-cyan-950/20"><span className="font-semibold text-slate-950 dark:text-white">{title}</span><span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{detail}</span></Link>)}</div>
        <Link href={`/${locale}/admin/programming/projects/new`} className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">Abrir Nuevo Proyecto</Link>
      </section>

      <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Portfolio aislado</p><h3 className="mt-2 text-2xl font-semibold">Proyectos de Engineering Studio</h3></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">{projects.length} persistidos</span></div>
        {projects.length === 0 ? <div className="mt-8 grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center dark:border-slate-700 dark:bg-slate-900/30"><div className="max-w-md"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-xl font-semibold text-white dark:bg-white dark:text-slate-950">+</div><h4 className="mt-5 text-lg font-semibold">Todavía no hay proyectos reales</h4><p className="mt-2 text-sm leading-6 text-slate-500">El primer proyecto creado desde el formulario aparecerá aquí y quedará almacenado en Neon.</p><Link href={`/${locale}/admin/programming/projects/new`} className="mt-5 inline-flex text-sm font-semibold text-cyan-700 dark:text-cyan-300">Crear primer proyecto →</Link></div></div> : <div className="mt-6 space-y-3">{projects.map((project) => <Link key={project.id} href={`/${locale}/admin/programming/projects/${project.id}`} className="grid gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-cyan-300 hover:bg-cyan-50/30 dark:border-slate-800 dark:hover:border-cyan-900 dark:hover:bg-cyan-950/10 lg:grid-cols-[1fr_130px_150px_110px]"><div><p className="font-semibold text-slate-950 dark:text-white">{project.name}</p><p className="mt-1 text-xs text-slate-500">{project.clientName || 'Proyecto interno'} · {project.mode} · {project.stage}</p></div><div><p className="text-[11px] uppercase tracking-wide text-slate-400">Forecast</p><p className="mt-1 text-sm font-semibold">{money(project.forecastCost)}</p></div><div><p className="text-[11px] uppercase tracking-wide text-slate-400">Valor referencia</p><p className="mt-1 text-sm font-semibold">{money(project.contractedValue)}</p></div><div><p className="text-[11px] uppercase tracking-wide text-slate-400">Blueprint</p><p className="mt-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300">{project.blueprintStatus || '—'}</p></div></Link>)}</div>}
      </section>
    </div>
  );
}
