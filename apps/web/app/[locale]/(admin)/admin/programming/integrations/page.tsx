import Link from 'next/link';
import { getVercelSyncSnapshot } from '@/lib/engineering-studio/infrastructure-sync';
import { EXPECTED_VERCEL_TEAM_ID, vercelProjectDashboardUrl } from '@/lib/engineering-studio/vercel-discovery';
import { syncVercelNowAction } from './actions';
import { SyncButton } from './sync-button';

function date(value: Date | null) {
  return value ? new Intl.DateTimeFormat('es-VE', { dateStyle: 'short', timeStyle: 'short' }).format(value) : '—';
}

const statusStyle: Record<string, string> = {
  ACTIVE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  ERROR: 'border-rose-200 bg-rose-50 text-rose-700',
  ACCESS_LOST: 'border-amber-200 bg-amber-50 text-amber-800',
  DISCONNECTED: 'border-slate-300 bg-slate-100 text-slate-600',
};
const statusLabel: Record<string, string> = { ACTIVE: 'Conectado', ERROR: 'Error', ACCESS_LOST: 'Acceso perdido', DISCONNECTED: 'Desconectado de Studio' };

export default async function StudioIntegrationsPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sync?: string }>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  let snapshot: Awaited<ReturnType<typeof getVercelSyncSnapshot>> = { integrations: [], runs: [] };
  let schemaReady = true;
  try { snapshot = await getVercelSyncSnapshot(); } catch { schemaReady = false; }
  const lastRun = snapshot.runs[0];
  const syncMessage = query.sync?.startsWith('error:') ? query.sync.slice(6) : query.sync === 'ok' ? 'Sincronización completada. El inventario ya está actualizado.' : null;
  const syncError = query.sync?.startsWith('error:');

  return <div className="space-y-6">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Infrastructure Sync</p>
      <h3 className="mt-2 text-2xl font-semibold">Proyectos e integraciones</h3>
      <p className="mt-2 max-w-3xl text-sm text-slate-500">Descubre y administra todos los proyectos accesibles del equipo de Vercel. La sincronización es de solo lectura en Vercel.</p>
    </div>

    {syncMessage && <div role="status" className={`rounded-2xl border p-4 text-sm ${syncError ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{syncMessage}</div>}

    <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2"><h4 className="text-lg font-semibold">Vercel Project Discovery</h4><span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold text-cyan-700">DIARIO</span></div>
          <p className="mt-2 text-sm text-slate-500">Equipo: <span className="font-mono text-xs">{EXPECTED_VERCEL_TEAM_ID}</span></p>
        </div>
        <form action={syncVercelNowAction}><input type="hidden" name="locale" value={locale}/><SyncButton disabled={!schemaReady}/></form>
      </div>
      {!schemaReady && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">La migración de Vercel Project Discovery todavía no está aplicada a esta base de datos.</div>}
      {lastRun && <>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{[
          ['Encontrados', lastRun.discoveredCount], ['Creados', lastRun.createdCount], ['Actualizados', lastRun.updatedCount],
          ['Omitidos', lastRun.skippedCount], ['No visibles', lastRun.missingCount], ['Errores', lastRun.errorCount],
        ].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800"><p className="text-[11px] uppercase text-slate-400">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>)}</div>
        <p className="mt-4 text-xs text-slate-400">Última sincronización: {date(lastRun.finishedAt)} · {lastRun.status}.</p>
        {(lastRun.technicalMessage || lastRun.errorSummary) && <p className={`mt-2 text-sm ${lastRun.errorSummary ? 'text-rose-700' : 'text-slate-500'}`}>{lastRun.errorSummary || lastRun.technicalMessage}</p>}
      </>}
    </section>

    <section>
      <div className="flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Inventario Vercel</p><h4 className="mt-2 text-lg font-semibold">Proyectos sincronizados</h4></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold dark:bg-slate-800">{snapshot.integrations.length}</span></div>
      {snapshot.integrations.length === 0 ? <div className="mt-5 rounded-[26px] border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-950"><h5 className="font-semibold">No hay proyectos sincronizados</h5><p className="mt-2 text-sm text-slate-500">Ejecuta “Sincronizar ahora”. Si el equipo es accesible y está vacío, Studio lo indicará explícitamente.</p></div>
        : <div className="mt-5 grid gap-4 xl:grid-cols-2">{snapshot.integrations.map((item) => <article key={item.id} className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-cyan-800">
          <div className="flex items-start justify-between gap-4"><div className="min-w-0"><h5 className="truncate font-semibold text-slate-950 dark:text-white">{item.externalProjectName}</h5><p className="mt-1 truncate font-mono text-[11px] text-slate-400">{item.externalProjectId}</p></div><span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyle[item.status] || statusStyle.ERROR}`}>{statusLabel[item.status] || item.status}</span></div>
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-xs sm:grid-cols-3">
            <div><dt className="text-slate-400">Framework</dt><dd className="mt-1 font-medium">{item.framework || 'No detectado'}</dd></div>
            <div><dt className="text-slate-400">Repositorio</dt><dd className="mt-1 truncate font-medium">{item.repositoryFullName || 'No conectado'}</dd></div>
            <div><dt className="text-slate-400">Rama</dt><dd className="mt-1 truncate font-medium">{item.productionBranch || item.defaultBranch || '—'}</dd></div>
            <div><dt className="text-slate-400">Commit</dt><dd className="mt-1 font-mono font-medium">{item.productionCommitSha?.slice(0, 8) || '—'}</dd></div>
            <div><dt className="text-slate-400">Deployment</dt><dd className="mt-1 font-medium">{item.productionDeploymentId ? `${item.productionDeploymentId.slice(0, 9)} · ${item.productionState || 'UNKNOWN'}` : 'Sin deployment'}</dd></div>
            <div><dt className="text-slate-400">Entorno</dt><dd className="mt-1 font-medium">{item.deploymentTarget === 'production' ? 'Production' : item.deploymentTarget === 'preview' ? 'Preview' : '—'}</dd></div>
          </dl>
          {item.lastError && <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{item.lastError}</p>}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
            <span className="text-slate-400">Sync {date(item.lastSyncedAt)}</span>
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/${locale}/admin/programming/projects/${item.projectId}`} className="rounded-full border border-slate-200 px-3 py-2 font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-200">Ver en Studio</Link>
              <a href={vercelProjectDashboardUrl(item.externalProjectName)} target="_blank" rel="noreferrer" className="rounded-full bg-slate-950 px-3 py-2 font-semibold text-white transition hover:bg-cyan-700 dark:bg-white dark:text-slate-950">Abrir en Vercel ↗</a>
            </div>
          </div>
        </article>)}</div>}
    </section>
  </div>;
}
