import Link from 'next/link';

const example = [
  { title: 'Trigger', detail: 'AGENT_RUN_COMPLETED', type: 'EVENT' },
  { title: 'QA', detail: 'Revisar código, pruebas y criterios de aceptación', type: 'AGENT' },
  { title: 'Condición', detail: '¿QA aprobado?', type: 'CONDITION' },
  { title: 'Security', detail: 'Auditoría de seguridad', type: 'AGENT' },
  { title: 'Preview', detail: 'Preparar despliegue de prueba', type: 'ACTION' },
  { title: 'Approval Gate', detail: 'Esperar aprobación humana', type: 'APPROVAL' }
];

export default async function WorkflowBuilderPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <div className="space-y-6">
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-600">Natural-Language Workflow Builder</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Describe el workflow. Studio construye el mapa.</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Diseña automatizaciones reutilizables en lenguaje natural. El sistema genera un borrador visual; puedes revisar cada nodo antes de guardar o activar.</p></div>
        <Link href={`/${locale}/admin/programming/workflows`} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold">Volver al Control Center</Link>
      </div>
    </section>

    <section className="grid gap-5 xl:grid-cols-[0.9fr_1.5fr]">
      <div className="rounded-[24px] border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-950">Habla con el Builder</h2>
        <p className="mt-1 text-sm text-slate-500">V1 prepara el contrato y la vista previa sin ejecutar IA ni consumir modelos.</p>
        <textarea className="mt-4 min-h-56 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-cyan-400" defaultValue="Cuando Frontend termine, pásalo a QA. Si QA falla, devuélvelo a Frontend con los errores. Si aprueba, pásalo a Security. Después prepara un Preview y avísame. Nunca publiques a producción sin mi aprobación." />
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-600">Destino<select className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option>Plantilla reutilizable</option><option>Proyecto específico</option></select></label><label className="text-xs font-semibold text-slate-600">Modo inicial<select className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option>Borrador / pausado</option><option>Solo simulación</option></select></label></div>
        <button type="button" className="mt-4 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Interpretar y generar borrador</button>
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">Nada se ejecuta desde este editor. Guardar, activar, consumir modelos, migrar o desplegar siguen sujetos a sus controles correspondientes.</div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between"><div><h2 className="font-semibold text-slate-950">Vista visual</h2><p className="mt-1 text-sm text-slate-500">Cada nodo será inspeccionable y editable.</p></div><span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">DRAFT</span></div>
        <div className="mt-6 overflow-x-auto pb-3"><div className="flex min-w-max items-center gap-2">{example.map((node,index) => <div key={node.title} className="flex items-center gap-2"><button type="button" className="w-44 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50/40"><span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-600">{node.type}</span><p className="mt-2 text-sm font-semibold text-slate-950">{node.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{node.detail}</p></button>{index < example.length-1 && <span className="text-xl text-slate-300">→</span>}</div>)}</div></div>
        <div className="mt-5 grid gap-3 md:grid-cols-3"><div className="rounded-2xl border border-slate-200 p-4"><p className="text-xs text-slate-500">Nodos</p><p className="mt-1 text-2xl font-semibold">6</p></div><div className="rounded-2xl border border-slate-200 p-4"><p className="text-xs text-slate-500">Approval Gates</p><p className="mt-1 text-2xl font-semibold">1</p></div><div className="rounded-2xl border border-slate-200 p-4"><p className="text-xs text-slate-500">Producción</p><p className="mt-1 text-sm font-semibold text-emerald-700">Bloqueada</p></div></div>
        <div className="mt-5 rounded-2xl border border-slate-200 p-4"><p className="text-sm font-semibold text-slate-900">Inspector del nodo</p><p className="mt-1 text-xs text-slate-500">Al seleccionar un nodo mostraremos agente, modelo/perfil, entradas, salidas, condiciones, timeout, reintentos, costo, logs, Approval Gate y conexiones.</p></div>
      </div>
    </section>
  </div>;
}
