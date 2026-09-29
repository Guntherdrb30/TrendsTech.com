import { getVercelSyncSnapshot } from '@/lib/engineering-studio/infrastructure-sync';
import { syncVercelNowAction } from './actions';

function date(value: Date | null) { return value ? new Intl.DateTimeFormat('es-VE',{dateStyle:'short',timeStyle:'short'}).format(value) : '—'; }
function stateTone(state: string | null) { return state === 'READY' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : state === 'ERROR' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-slate-50 text-slate-600'; }

export default async function StudioIntegrationsPage({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;
  let snapshot:Awaited<ReturnType<typeof getVercelSyncSnapshot>>={integrations:[],runs:[]};
  let schemaReady=true;
  try { snapshot=await getVercelSyncSnapshot(); } catch { schemaReady=false; }
  const lastRun=snapshot.runs[0];
  return <div className="space-y-6">
    <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Infrastructure Sync</p><h3 className="mt-2 text-2xl font-semibold">Proyectos e integraciones</h3><p className="mt-2 max-w-3xl text-sm text-slate-500">Engineering Studio descubre los proyectos del proveedor, los enlaza con su repositorio y mantiene el estado de producción sincronizado. Ninguna sincronización despliega ni modifica producción.</p></div>

    <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex items-center gap-2"><h4 className="text-lg font-semibold">Vercel Project Discovery</h4><span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold text-cyan-700">DIARIO</span></div><p className="mt-2 text-sm text-slate-500">Descubre proyectos nuevos, vincula GitHub y registra deployment, rama y commit de producción.</p></div><form action={syncVercelNowAction}><input type="hidden" name="locale" value={locale}/><button disabled={!schemaReady} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">Sincronizar ahora</button></form></div>
      {!schemaReady && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">La interfaz está preparada, pero la migración Infrastructure Sync todavía no está aplicada a la base de datos. No se ejecutará ninguna importación hasta autorizar esa migración.</div>}
      {lastRun && <div className="mt-5 grid gap-3 sm:grid-cols-5">{[['Descubiertos',lastRun.discoveredCount],['Creados',lastRun.createdCount],['Actualizados',lastRun.updatedCount],['No vistos',lastRun.missingCount],['Errores',lastRun.errorCount]].map(([label,value])=><div key={String(label)} className="rounded-2xl border border-slate-200 p-3"><p className="text-[11px] uppercase text-slate-400">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>)}</div>}
      <p className="mt-4 text-xs text-slate-400">Última sincronización: {lastRun?`${date(lastRun.finishedAt)} · ${lastRun.status}`:'todavía no ejecutada'}.</p>
    </section>

    <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"><div className="flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Inventario Vercel</p><h4 className="mt-2 text-lg font-semibold">Proyectos detectados</h4></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{snapshot.integrations.length}</span></div>
      {snapshot.integrations.length===0?<p className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">El inventario aparecerá aquí después de la primera sincronización autorizada.</p>:<div className="mt-5 overflow-x-auto"><table className="min-w-full text-left text-xs"><thead className="text-slate-500"><tr><th className="pb-3 pr-5">Proyecto</th><th className="pb-3 pr-5">Repositorio</th><th className="pb-3 pr-5">Producción</th><th className="pb-3 pr-5">Commit</th><th className="pb-3">Sync</th></tr></thead><tbody>{snapshot.integrations.map(item=><tr key={item.id} className="border-t border-slate-100"><td className="py-3 pr-5"><p className="font-semibold">{item.projectName}</p><p className="text-slate-400">{item.framework||'framework —'}</p></td><td className="py-3 pr-5">{item.repositoryFullName||'No identificado'}</td><td className="py-3 pr-5"><span className={`rounded-full border px-2.5 py-1 font-semibold ${stateTone(item.productionState)}`}>{item.productionState||'UNKNOWN'}</span></td><td className="py-3 pr-5 font-mono">{item.productionCommitSha?.slice(0,8)||'—'}<span className="ml-2 font-sans text-slate-400">{item.productionBranch||''}</span></td><td className="py-3">{date(item.lastSyncedAt)}</td></tr>)}</tbody></table></div>}
    </section>

    <section className="grid gap-4 md:grid-cols-2">{[
      ['GitHub','Vinculación automática','El repositorio se toma de la integración Git de Vercel o del metadata del deployment. El análisis profundo del código se ejecutará como paso separado y auditable.'],
      ['ChatGPT / Trends MCP','Arquitectura definida','ChatGPT podrá consultar este inventario y trabajar sobre un proyecto concreto sin asumir acceso automático al historial privado.'],
      ['Servidores propios','Siguiente proveedor','El modelo de integración usa provider + externalProjectId para añadir on-prem/NVIDIA sin mezclar datos entre proyectos.'],
      ['Production Safety','Bloqueado por diseño','Descubrir y sincronizar es lectura + persistencia interna. Deploy, merge, migraciones y cambios de producción conservan Approval Gates.']
    ].map(([name,status,detail])=><article key={name} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"><div className="flex items-start justify-between gap-4"><h4 className="text-lg font-semibold">{name}</h4><span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600">{status}</span></div><p className="mt-3 text-sm leading-6 text-slate-500">{detail}</p></article>)}</section>
  </div>;
}
