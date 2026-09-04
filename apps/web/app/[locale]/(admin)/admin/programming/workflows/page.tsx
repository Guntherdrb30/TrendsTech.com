import { revalidatePath } from 'next/cache';
import { getWorkflowControlSnapshot, setWatcherStatus, setWorkflowStatus } from '../../../../../lib/engineering-studio/workflow-control';

function n(value: bigint | number | undefined) { return Number(value || 0); }
function date(value: Date | null) { return value ? new Intl.DateTimeFormat('es-VE',{ dateStyle:'short', timeStyle:'short' }).format(value) : '—'; }
function badge(status: string | null) {
  const s = status || 'UNKNOWN';
  const tone = s === 'ACTIVE' || s === 'COMPLETED' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : s.includes('FAILED') || s === 'CRITICAL' ? 'border-rose-200 bg-rose-50 text-rose-700' : s.includes('WAITING') || s === 'RUNNING' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-600';
  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone}`}>{s}</span>;
}

export default async function WorkflowControlPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const snapshot = await getWorkflowControlSnapshot();
  const totals = snapshot.totals;

  async function toggleWorkflow(formData: FormData) {
    'use server';
    const id = String(formData.get('id') || '');
    const current = String(formData.get('current') || 'PAUSED');
    if (id) await setWorkflowStatus(id, current === 'ACTIVE' ? 'PAUSED' : 'ACTIVE');
    revalidatePath(`/${locale}/admin/programming/workflows`);
  }
  async function toggleWatcher(formData: FormData) {
    'use server';
    const id = String(formData.get('id') || '');
    const current = String(formData.get('current') || 'PAUSED');
    if (id) await setWatcherStatus(id, current === 'ACTIVE' ? 'PAUSED' : 'ACTIVE');
    revalidatePath(`/${locale}/admin/programming/workflows`);
  }

  return <div className="space-y-6">
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-600">Workflow Control Center</p>
      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight text-slate-950">Control total de automatizaciones</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Supervisa qué workflow está activo, qué lo disparó, qué acción ejecutó, qué agente intervino, dónde se detuvo y qué requiere aprobación.</p></div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">Producción automática bloqueada por diseño</div>
      </div>
    </section>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {[
        ['Workflows activos',n(totals?.activeWorkflows)],['Runs en proceso',n(totals?.runningRuns)],['Esperando aprobación',n(totals?.waitingApprovals)],['Fallos · 24 h',n(totals?.failedRuns24h)],['Watchers activos',n(totals?.activeWatchers)]
      ].map(([label,value]) => <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p></div>)}
    </section>

    <section className="rounded-[24px] border border-slate-200 bg-white p-5">
      <div className="mb-4"><h2 className="text-lg font-semibold text-slate-950">Workflows</h2><p className="text-sm text-slate-500">Puedes pausar cualquier automatización sin eliminar su historial.</p></div>
      <div className="space-y-3">{snapshot.workflows.length === 0 ? <p className="text-sm text-slate-500">Aún no hay workflows creados. Se crean al despachar el primer evento de cada proyecto.</p> : snapshot.workflows.map(w => <article key={w.id} className="rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-950">{w.name}</h3>{badge(w.status)}{w.lastRunStatus && badge(w.lastRunStatus)}</div><p className="mt-1 text-xs text-slate-500">{w.projectName || 'Global'} · {n(w.triggerCount)} trigger · {n(w.actionCount)} acciones · {n(w.runCount)} runs · último {date(w.lastRunAt)}</p></div><div className="flex items-center gap-3"><span className="text-xs text-slate-500">{n(w.failedRunCount)} fallos · {n(w.waitingRunCount)} pendientes</span><form action={toggleWorkflow}><input type="hidden" name="id" value={w.id}/><input type="hidden" name="current" value={w.status}/><button className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50">{w.status === 'ACTIVE' ? 'Pausar' : 'Activar'}</button></form></div></div>
      </article>)}</div>
    </section>

    <section className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
      <div className="rounded-[24px] border border-slate-200 bg-white p-5"><h2 className="text-lg font-semibold">Runs recientes</h2><div className="mt-4 space-y-3">{snapshot.runs.slice(0,30).map(r => <div key={r.id} className="rounded-2xl border border-slate-200 p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-900">{r.workflowName}</p><p className="mt-1 text-xs text-slate-500">{r.projectName || 'Global'} · {r.triggerType} · {date(r.createdAt)}</p>{r.errorSummary && <p className="mt-2 text-xs text-rose-600">{r.errorSummary}</p>}</div>{badge(r.status)}</div></div>)}</div></div>
      <div className="rounded-[24px] border border-slate-200 bg-white p-5"><h2 className="text-lg font-semibold">Watchers</h2><div className="mt-4 space-y-3">{snapshot.watchers.map(w => <div key={w.id} className="rounded-2xl border border-slate-200 p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">{w.name}</p><p className="mt-1 text-xs text-slate-500">{w.projectName || 'Global'} · {w.kind} · cooldown {w.cooldownMinutes}m</p><p className="mt-1 text-xs text-slate-400">Último check {date(w.lastCheckedAt)} · trigger {date(w.lastTriggeredAt)}</p></div>{badge(w.severity)}</div><form action={toggleWatcher} className="mt-3"><input type="hidden" name="id" value={w.id}/><input type="hidden" name="current" value={w.status}/><button className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold">{w.status === 'ACTIVE' ? 'Pausar watcher' : 'Activar watcher'}</button></form></div>)}</div></div>
    </section>

    <section className="rounded-[24px] border border-slate-200 bg-white p-5"><h2 className="text-lg font-semibold">Trazabilidad de acciones</h2><p className="mt-1 text-sm text-slate-500">Últimas acciones ejecutadas dentro de los workflows.</p><div className="mt-4 overflow-x-auto"><table className="min-w-full text-left text-xs"><thead className="text-slate-500"><tr><th className="pb-3 pr-5">Workflow</th><th className="pb-3 pr-5">Paso</th><th className="pb-3 pr-5">Acción</th><th className="pb-3 pr-5">Agente</th><th className="pb-3 pr-5">Estado</th><th className="pb-3">Inicio</th></tr></thead><tbody>{snapshot.actionRuns.map(a => <tr key={a.id} className="border-t border-slate-100"><td className="py-3 pr-5 font-medium">{a.workflowName}</td><td className="py-3 pr-5">{a.actionPosition}</td><td className="py-3 pr-5">{a.actionType}</td><td className="py-3 pr-5">{a.agentKey || 'Sistema'}</td><td className="py-3 pr-5">{badge(a.status)}</td><td className="py-3">{date(a.startedAt)}</td></tr>)}</tbody></table></div></section>
  </div>;
}
