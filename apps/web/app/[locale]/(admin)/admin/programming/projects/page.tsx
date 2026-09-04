import Link from 'next/link';

export default async function StudioProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Nuevo proyecto</p>
        <h3 className="mt-2 text-2xl font-semibold">¿Desde dónde comenzamos?</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">En el MVP, elegir el origen prepara el Blueprint. No inicia programación automáticamente.</p>
        <div className="mt-6 space-y-3">
          {[
            ['Idea', 'Describe el problema y el resultado esperado.'],
            ['PRD', 'Importa requisitos ya estructurados.'],
            ['ChatGPT / Work', 'Sincroniza un resumen o decisiones de una sesión.'],
            ['Repositorio existente', 'Continúa un software con evidencia del código.'],
            ['Recuperar proyecto', 'Audita un desarrollo incompleto o abandonado.']
          ].map(([title, detail]) => (
            <button key={title} type="button" className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50/50 dark:border-slate-800 dark:hover:border-cyan-900 dark:hover:bg-cyan-950/20">
              <span className="font-semibold text-slate-950 dark:text-white">{title}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{detail}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Portfolio aislado</p><h3 className="mt-2 text-2xl font-semibold">Proyectos de Engineering Studio</h3></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-900">0 registrados</span></div>
        <div className="mt-8 grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center dark:border-slate-700 dark:bg-slate-900/30">
          <div className="max-w-md"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-xl font-semibold text-white dark:bg-white dark:text-slate-950">+</div><h4 className="mt-5 text-lg font-semibold">Aún no hay proyectos en este módulo</h4><p className="mt-2 text-sm leading-6 text-slate-500">No mezclaremos automáticamente los proyectos administrativos actuales con los workspaces de Engineering Studio. Cada uno tendrá su propia constitución, presupuesto, agentes, ramas y auditoría.</p><Link href={`/${locale}/admin/programming`} className="mt-5 inline-flex text-sm font-semibold text-cyan-700 dark:text-cyan-300">Volver al Overview</Link></div>
        </div>
      </section>
    </div>
  );
}
