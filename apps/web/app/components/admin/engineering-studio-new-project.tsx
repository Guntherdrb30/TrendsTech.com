'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type Origin = 'idea' | 'prd' | 'chatgpt' | 'repository' | 'recovery';

type Props = { locale: string };

const originOptions: Array<{ id: Origin; title: string; detail: string }> = [
  { id: 'idea', title: 'Idea', detail: 'Comienza desde un problema, oportunidad o nueva función.' },
  { id: 'prd', title: 'PRD', detail: 'Parte de requisitos ya estructurados y decisiones previas.' },
  { id: 'chatgpt', title: 'ChatGPT / Work', detail: 'Usa un resumen, decisiones o entregables preparados en ChatGPT.' },
  { id: 'repository', title: 'Repositorio existente', detail: 'Continúa un producto desde GitHub y su estado técnico actual.' },
  { id: 'recovery', title: 'Recuperar proyecto', detail: 'Audita un software incompleto y propone el camino mínimo a MVP.' }
];

export function EngineeringStudioNewProject({ locale }: Props) {
  const [origin, setOrigin] = useState<Origin>('idea');
  const [name, setName] = useState('Sistema de Licitaciones Inteligente');
  const [client, setClient] = useState('Cliente de prueba');
  const [summary, setSummary] = useState('Crear un MVP que permita registrar procesos de licitación, cargar pliegos, organizar requisitos y preparar análisis asistido por IA.');
  const [margin, setMargin] = useState('45');
  const [budget, setBudget] = useState('2500');
  const [localAi, setLocalAi] = useState(false);

  const preview = useMemo(() => {
    const marginValue = Number(margin || 0);
    const budgetValue = Number(budget || 0);
    const estimatedInternal = budgetValue > 0 ? Math.round(budgetValue * (1 - marginValue / 100)) : 0;
    return { marginValue, budgetValue, estimatedInternal };
  }, [margin, budget]);

  return (
    <div className="grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Nuevo proyecto</p>
            <h3 className="mt-2 text-2xl font-semibold">Preparar Project Blueprint</h3>
          </div>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">No ejecuta código</span>
        </div>

        <div className="mt-7">
          <p className="text-sm font-semibold">1. Origen</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {originOptions.map((option) => {
              const selected = option.id === origin;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setOrigin(option.id)}
                  className={`rounded-2xl border p-4 text-left transition ${selected ? 'border-cyan-400 bg-cyan-50 ring-2 ring-cyan-100 dark:bg-cyan-950/20 dark:ring-cyan-950' : 'border-slate-200 hover:border-cyan-300 dark:border-slate-800'}`}
                >
                  <span className="font-semibold text-slate-950 dark:text-white">{option.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{option.detail}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <label className="text-sm font-semibold">2. Nombre del proyecto<input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-cyan-400 dark:border-slate-800 dark:bg-slate-900" /></label>
          <label className="text-sm font-semibold">Empresa / cliente<input value={client} onChange={(e) => setClient(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-cyan-400 dark:border-slate-800 dark:bg-slate-900" /></label>
        </div>

        <label className="mt-5 block text-sm font-semibold">3. Contexto y objetivo MVP<textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={6} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal leading-6 outline-none focus:border-cyan-400 dark:border-slate-800 dark:bg-slate-900" /></label>

        {origin === 'prd' && <div className="mt-4 rounded-2xl border border-dashed border-cyan-300 bg-cyan-50/50 p-4 text-sm text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950/20 dark:text-cyan-300">Área prevista para adjuntar PRD y documentos. En esta maqueta todavía no sube archivos.</div>}
        {origin === 'chatgpt' && <div className="mt-4 rounded-2xl border border-dashed border-cyan-300 bg-cyan-50/50 p-4 text-sm text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950/20 dark:text-cyan-300">Aquí recibiremos resúmenes y decisiones desde ChatGPT / Trends MCP cuando conectemos el gateway.</div>}
        {(origin === 'repository' || origin === 'recovery') && <label className="mt-4 block text-sm font-semibold">Repositorio GitHub<input placeholder="Guntherdrb30/nombre-repo" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-cyan-400 dark:border-slate-800 dark:bg-slate-900" /></label>}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <label className="text-sm font-semibold">4. Margen objetivo (%)<input value={margin} onChange={(e) => setMargin(e.target.value)} inputMode="decimal" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-cyan-400 dark:border-slate-800 dark:bg-slate-900" /></label>
          <label className="text-sm font-semibold">Presupuesto comercial de referencia (USD)<input value={budget} onChange={(e) => setBudget(e.target.value)} inputMode="decimal" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-cyan-400 dark:border-slate-800 dark:bg-slate-900" /></label>
        </div>

        <label className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <input type="checkbox" checked={localAi} onChange={(e) => setLocalAi(e.target.checked)} className="mt-1" />
          <span><span className="block text-sm font-semibold">Evaluar IA local / NVIDIA</span><span className="mt-1 block text-xs leading-5 text-slate-500">Incluye dimensionamiento de hardware, energía, amortización y comparador Local/API/Híbrido en el Blueprint.</span></span>
        </label>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href={`/${locale}/admin/programming/projects/demo-licitaciones`} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 dark:bg-white dark:text-slate-950">Generar Blueprint de prueba</Link>
          <Link href={`/${locale}/admin/programming/projects`} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">Cancelar</Link>
        </div>
      </section>

      <aside className="space-y-5">
        <section className="rounded-[26px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm dark:border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Resumen económico preliminar</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3 2xl:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">Presupuesto referencia</p><p className="mt-2 text-2xl font-semibold">${preview.budgetValue.toLocaleString('en-US')}</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">Margen objetivo</p><p className="mt-2 text-2xl font-semibold">{preview.marginValue}%</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">Costo interno máximo orientativo</p><p className="mt-2 text-2xl font-semibold">${preview.estimatedInternal.toLocaleString('en-US')}</p></div>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-400">Este cálculo es solo una referencia visual. El Cost Engine definitivo calculará costos reales por IA, infraestructura, electricidad, hardware, tiempo humano, overhead y contingencia.</p>
        </section>

        <section className="rounded-[26px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Qué hará el Blueprint</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {['Entender alcance y fuera de alcance', 'Proponer arquitectura y modelo de datos', 'Seleccionar agentes y modelos', 'Calcular costo y forecast', 'Detectar riesgos y dependencias', 'Preparar Approval Gate antes de programar'].map((item, index) => <div key={item} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan-50 text-xs font-bold text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">{index + 1}</span><span>{item}</span></div>)}
          </div>
        </section>
      </aside>
    </div>
  );
}
