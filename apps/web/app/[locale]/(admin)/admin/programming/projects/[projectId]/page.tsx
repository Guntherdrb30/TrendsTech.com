import Link from 'next/link';

const architecture = [
  ['Web App', 'Next.js App Router · Admin privado'],
  ['Dominio', 'Project Service + Blueprint + Cost Engine'],
  ['Datos', 'Neon/Postgres · esquema aislado por proyecto'],
  ['IA', 'Astra director + especialistas bajo demanda'],
  ['Integraciones', 'GitHub · Vercel · OpenAI · Trends MCP'],
  ['Seguridad', 'ROOT · Approval Gates · Secrets Broker · Audit Log']
];

const backlog = [
  ['P0', 'Modelo de procesos y requisitos', 'Product Analyst + Architect'],
  ['P0', 'Esquema inicial de datos', 'Database Engineer'],
  ['P0', 'Dashboard y registro de licitaciones', 'UX/UI + Frontend'],
  ['P1', 'Carga y clasificación de pliegos', 'Backend + AI Engineer'],
  ['P1', 'Análisis asistido por IA', 'AI Engineer + Security'],
  ['P1', 'QA, revisión y preview', 'QA + Code Reviewer + DevOps']
];

export default async function ProjectBlueprintPage({ params }: { params: Promise<{ locale: string; projectId: string }> }) {
  const { locale, projectId } = await params;
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Project Blueprint · Mock</p><h3 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Sistema de Licitaciones Inteligente</h3><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">MVP para registrar procesos, organizar pliegos y requisitos, controlar hitos y preparar análisis asistido por IA. Este Blueprint es una demostración visual; aún no ha sido generado por Astra ni persistido en base de datos.</p></div>
          <div className="flex flex-wrap gap-2"><span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">BLUEPRINT_READY</span><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">{projectId}</span></div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <section className="rounded-[26px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Arquitectura propuesta</p><div className="mt-5 grid gap-3 md:grid-cols-2">{architecture.map(([title, detail]) => <div key={title} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><p className="font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p></div>)}</div></section>

          <section className="rounded-[26px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Backlog inicial</p><h4 className="mt-2 text-xl font-semibold">6 bloques propuestos</h4></div><span className="text-xs text-slate-500">Antes de ejecución</span></div><div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">{backlog.map(([priority, task, owner]) => <div key={task} className="grid gap-2 border-b border-slate-100 px-4 py-4 last:border-0 dark:border-slate-900 md:grid-cols-[60px_1fr_220px]"><span className="text-xs font-bold text-cyan-700 dark:text-cyan-300">{priority}</span><span className="text-sm font-semibold">{task}</span><span className="text-xs text-slate-500">{owner}</span></div>)}</div></section>

          <section className="rounded-[26px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Riesgos y supuestos</p><div className="mt-4 grid gap-3 md:grid-cols-2"><div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-950/20"><p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Supuesto</p><p className="mt-1 text-xs leading-5 text-amber-700/80 dark:text-amber-300/80">El MVP utiliza datos ficticios hasta definir requisitos regulatorios y datos reales del cliente.</p></div><div className="rounded-2xl bg-rose-50 p-4 dark:bg-rose-950/20"><p className="text-sm font-semibold text-rose-800 dark:text-rose-300">Riesgo</p><p className="mt-1 text-xs leading-5 text-rose-700/80 dark:text-rose-300/80">La automatización documental puede ampliar consumo de IA y almacenamiento. Debe quedar dentro del presupuesto vivo.</p></div></div></section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[26px] border border-slate-200 bg-slate-950 p-6 text-white dark:border-slate-800"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Forecast preliminar · Mock</p><div className="mt-5 space-y-3">{[['Referencia comercial', '$2,500'], ['Costo interno orientativo', '$1,375'], ['Margen objetivo', '45%'], ['Contingencia', 'Pendiente Cost Engine']].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"><span className="text-xs text-slate-400">{label}</span><span className="text-sm font-semibold">{value}</span></div>)}</div><p className="mt-4 text-xs leading-5 text-slate-400">No es una cotización. Los valores sirven únicamente para probar la jerarquía visual del Blueprint.</p></section>

          <section className="rounded-[26px] border border-cyan-200 bg-cyan-50 p-6 dark:border-cyan-900 dark:bg-cyan-950/20"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">Approval Gate A</p><h4 className="mt-2 text-xl font-semibold">Aprobar antes de programar</h4><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">La aprobación congelará el Baseline v1 y autorizará únicamente el alcance descrito. Cualquier función adicional deberá pasar por Change Request.</p><div className="mt-5 space-y-2"><button type="button" disabled className="w-full cursor-not-allowed rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white opacity-60 dark:bg-white dark:text-slate-950">Aprobar Blueprint · Próxima fase</button><button type="button" disabled className="w-full cursor-not-allowed rounded-full border border-cyan-300 px-5 py-3 text-sm font-semibold text-cyan-800 opacity-60 dark:border-cyan-800 dark:text-cyan-300">Solicitar cambios</button></div><p className="mt-3 text-center text-[11px] text-slate-500">Botones bloqueados hasta implementar persistencia y auditoría.</p></section>

          <Link href={`/${locale}/admin/programming/projects/new`} className="block rounded-full border border-slate-200 px-5 py-3 text-center text-sm font-semibold dark:border-slate-800">Volver a Nuevo Proyecto</Link>
        </aside>
      </div>
    </div>
  );
}
