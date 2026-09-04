'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { createStudioProjectAction } from '../../[locale]/(admin)/admin/programming/projects/new/actions';

type Origin = 'idea' | 'prd' | 'chatgpt' | 'repository' | 'recovery';
type Props = { locale: string };

const originOptions: Array<{ id: Origin; title: string; detail: string }> = [
  { id: 'idea', title: 'Idea', detail: 'Comienza desde un problema, oportunidad o nueva función.' },
  { id: 'prd', title: 'PRD', detail: 'Parte de requisitos ya estructurados y decisiones previas.' },
  { id: 'chatgpt', title: 'ChatGPT / Work', detail: 'Usa un resumen, decisiones o entregables preparados en ChatGPT.' },
  { id: 'repository', title: 'Repositorio existente', detail: 'Continúa un producto desde GitHub y su estado técnico actual.' },
  { id: 'recovery', title: 'Recuperar proyecto', detail: 'Audita un software incompleto y propone el camino mínimo a MVP.' }
];
const profiles = [
  { id: 'ECONOMY', title: 'Económico', detail: 'Mejoras pequeñas y bajo riesgo.' },
  { id: 'STANDARD', title: 'Estándar', detail: 'Features medianas y coordinación normal.' },
  { id: 'ASTRA', title: 'Astra', detail: 'Proyectos grandes o alta complejidad.' }
] as const;

export function EngineeringStudioNewProject({ locale }: Props) {
  const [origin, setOrigin] = useState<Origin>('idea');
  const [margin, setMargin] = useState('45');
  const [budget, setBudget] = useState('2500');
  const [profile, setProfile] = useState<'ECONOMY' | 'STANDARD' | 'ASTRA'>('STANDARD');
  const preview = useMemo(() => { const marginValue=Number(margin||0); const budgetValue=Number(budget||0); return { marginValue,budgetValue,estimatedInternal:budgetValue>0?budgetValue*(1-marginValue/100):0 }; }, [margin,budget]);

  return <form action={createStudioProjectAction} className="grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
    <input type="hidden" name="locale" value={locale}/><input type="hidden" name="origin" value={origin}/><input type="hidden" name="orchestrationProfile" value={profile}/>
    <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Nuevo proyecto real</p><h3 className="mt-2 text-2xl font-semibold">Preparar Project Blueprint</h3></div><span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">Persistencia activa</span></div>
      <div className="mt-7"><p className="text-sm font-semibold">1. Origen</p><div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{originOptions.map((o)=>{const selected=o.id===origin;return <button key={o.id} type="button" onClick={()=>setOrigin(o.id)} className={`rounded-2xl border p-4 text-left transition ${selected?'border-cyan-400 bg-cyan-50 ring-2 ring-cyan-100 dark:bg-cyan-950/20 dark:ring-cyan-950':'border-slate-200 hover:border-cyan-300 dark:border-slate-800'}`}><span className="font-semibold">{o.title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{o.detail}</span></button>})}</div></div>
      <div className="mt-8 grid gap-5 md:grid-cols-2"><label className="text-sm font-semibold">2. Nombre del proyecto<input required minLength={3} name="name" placeholder="Nombre del proyecto" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-cyan-400 dark:border-slate-800 dark:bg-slate-900"/></label><label className="text-sm font-semibold">Empresa / cliente<input name="clientName" placeholder="Opcional" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-cyan-400 dark:border-slate-800 dark:bg-slate-900"/></label></div>
      <label className="mt-5 block text-sm font-semibold">3. Contexto y objetivo MVP<textarea required minLength={20} name="summary" rows={6} placeholder="Describe qué debe resolver el MVP, para quién y cuál sería el resultado verificable." className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal leading-6 outline-none focus:border-cyan-400 dark:border-slate-800 dark:bg-slate-900"/></label>
      {origin==='prd'&&<div className="mt-4 rounded-2xl border border-dashed border-cyan-300 bg-cyan-50/50 p-4 text-sm text-cyan-800">El texto del PRD puede resumirse por ahora en el objetivo. Adjuntos versionados se conectarán después.</div>}{origin==='chatgpt'&&<div className="mt-4 rounded-2xl border border-dashed border-cyan-300 bg-cyan-50/50 p-4 text-sm text-cyan-800">Este origen quedará marcado para sincronización posterior con Trends MCP / ChatGPT.</div>}{(origin==='repository'||origin==='recovery')&&<label className="mt-4 block text-sm font-semibold">Repositorio GitHub<input required name="repositoryUrl" placeholder="Guntherdrb30/nombre-repo o URL" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none focus:border-cyan-400 dark:border-slate-800 dark:bg-slate-900"/></label>}
      <div className="mt-8"><p className="text-sm font-semibold">4. Perfil de orquestación</p><div className="mt-3 grid gap-3 md:grid-cols-3">{profiles.map((p)=>{const selected=p.id===profile;return <button key={p.id} type="button" onClick={()=>setProfile(p.id)} className={`rounded-2xl border p-4 text-left ${selected?'border-cyan-400 bg-cyan-50 dark:bg-cyan-950/20':'border-slate-200 dark:border-slate-800'}`}><span className="font-semibold">{p.title}</span><span className="mt-1 block text-xs text-slate-500">{p.detail}</span></button>})}</div><p className="mt-2 text-xs text-slate-500">Astra no se activará por sí solo. Una escalada futura deberá mostrar impacto y pedir aprobación.</p></div>
      <div className="mt-8 grid gap-5 md:grid-cols-2"><label className="text-sm font-semibold">5. Margen objetivo (%)<input required name="marginPercent" value={margin} onChange={(e)=>setMargin(e.target.value)} inputMode="decimal" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal dark:border-slate-800 dark:bg-slate-900"/></label><label className="text-sm font-semibold">Presupuesto comercial referencia (USD)<input required name="commercialBudget" value={budget} onChange={(e)=>setBudget(e.target.value)} inputMode="decimal" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal dark:border-slate-800 dark:bg-slate-900"/></label></div>
      <label className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><input name="localAiRequired" type="checkbox" className="mt-1"/><span><span className="block text-sm font-semibold">Evaluar IA local / NVIDIA</span><span className="mt-1 block text-xs leading-5 text-slate-500">Incluye al NVIDIA Local AI Architect en el Blueprint preliminar.</span></span></label>
      <div className="mt-7 flex flex-wrap gap-3"><button type="submit" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-600 dark:bg-white dark:text-slate-950">Crear proyecto y Blueprint</button><Link href={`/${locale}/admin/programming/projects`} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold">Cancelar</Link></div>
    </section>
    <aside className="space-y-5"><section className="rounded-[26px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Estrategia seleccionada</p><p className="mt-3 text-2xl font-semibold">{profiles.find((p)=>p.id===profile)?.title}</p><p className="mt-2 text-sm text-slate-400">Override por proyecto. No cambia la política global.</p><div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">Presupuesto referencia</p><p className="mt-2 text-2xl font-semibold">${preview.budgetValue.toLocaleString('en-US')}</p></div><div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">Costo interno orientativo</p><p className="mt-2 text-2xl font-semibold">${preview.estimatedInternal.toLocaleString('en-US',{maximumFractionDigits:2})}</p></div></section><section className="rounded-[26px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Control</p><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">El perfil queda persistido con el proyecto. Los futuros Agent Runs deberán respetarlo y solicitar un Approval Gate antes de usar Astra si no estaba autorizado.</p></section></aside>
  </form>;
}
