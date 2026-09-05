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

const providerIds = ['overview', 'vercel', 'github', 'chatgpt', 'mcp'] as const;
type ProviderId = typeof providerIds[number];

function providerId(value: string | undefined): ProviderId {
  return providerIds.includes(value as ProviderId) ? value as ProviderId : 'overview';
}

export default async function StudioIntegrationsPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sync?: string; provider?: string }>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  let snapshot: Awaited<ReturnType<typeof getVercelSyncSnapshot>> = { integrations: [], runs: [] };
  let schemaReady = true;
  try { snapshot = await getVercelSyncSnapshot(); } catch { schemaReady = false; }
  const lastRun = snapshot.runs[0];
  const syncMessage = query.sync?.startsWith('error:') ? query.sync.slice(6) : query.sync === 'ok' ? 'Sincronización completada. El inventario ya está actualizado.' : null;
  const syncError = query.sync?.startsWith('error:');
  const selectedProvider = providerId(query.provider);
  const githubProjects = snapshot.integrations.filter((item) => item.gitProvider === 'github' || item.repositoryUrl?.includes('github.com'));
  const chatgptConfigured = Boolean(process.env.OPENAI_API_KEY);
  const configuredWorkflows = [process.env.CHATKIT_WORKFLOW_ID, process.env.CHATKIT_WORKFLOW_MARKETING,
    process.env.CHATKIT_WORKFLOW_SALES, process.env.CHATKIT_WORKFLOW_APPOINTMENTS, process.env.CHATKIT_WORKFLOW_SUPPORT].filter(Boolean).length;
  const mcpConfigured = Boolean(process.env.TRENDS_MCP_TOKEN || process.env.MCP_API_SECRET);
  const githubConfigured = Boolean(process.env.GITHUB_STUDIO_TOKEN);
  const providers: Array<{ id: ProviderId; name: string; detail: string; status: string; count?: number }> = [
    { id: 'overview', name: 'Todas', detail: 'Centro de integraciones', status: 'Disponible' },
    { id: 'vercel', name: 'Vercel', detail: 'Proyectos y deployments', status: snapshot.integrations.length ? 'Conectado' : 'Pendiente', count: snapshot.integrations.length },
    { id: 'github', name: 'GitHub', detail: 'Repositorios, ramas y commits', status: githubConfigured ? 'Token conectado' : 'Metadatos vía Vercel', count: githubProjects.length },
    { id: 'chatgpt', name: 'ChatGPT / OpenAI', detail: 'Modelos y workflows', status: chatgptConfigured ? 'Conectado' : 'Pendiente', count: configuredWorkflows },
    { id: 'mcp', name: 'Trends MCP', detail: 'Herramientas y contexto', status: mcpConfigured ? 'Conectado' : 'Pendiente' },
  ];

  return <div className="space-y-6">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Infrastructure Sync</p>
      <h3 className="mt-2 text-2xl font-semibold">Proyectos e integraciones</h3>
      <p className="mt-2 max-w-3xl text-sm text-slate-500">Administra Vercel, GitHub, ChatGPT/OpenAI y Trends MCP desde un único centro operativo.</p>
    </div>

    {syncMessage && <div role="status" className={`rounded-2xl border p-4 text-sm ${syncError ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{syncMessage}</div>}

    <nav aria-label="Proveedores de integración" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {providers.map((provider) => <Link key={provider.id} href={`/${locale}/admin/programming/integrations?provider=${provider.id}`} aria-current={selectedProvider === provider.id ? 'page' : undefined} className={`rounded-2xl border p-4 transition ${selectedProvider === provider.id ? 'border-cyan-400 bg-cyan-50 shadow-sm dark:border-cyan-700 dark:bg-cyan-950/30' : 'border-slate-200 bg-white hover:border-cyan-300 dark:border-slate-800 dark:bg-slate-950'}`}>
        <div className="flex items-start justify-between gap-2"><h4 className="font-semibold text-slate-950 dark:text-white">{provider.name}</h4>{provider.count !== undefined && <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold dark:bg-slate-800">{provider.count}</span>}</div>
        <p className="mt-1 text-xs text-slate-500">{provider.detail}</p><p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">{provider.status}</p>
      </Link>)}
    </nav>

    {selectedProvider === 'overview' && <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Mapa de integraciones</p><h4 className="mt-2 text-xl font-semibold">Selecciona un proveedor</h4><p className="mt-2 text-sm text-slate-500">Cada módulo conserva su propio inventario, estado y accesos directos. Vercel y GitHub comparten la relación por proyecto; ChatGPT y MCP muestran la configuración operativa disponible.</p></section>}

    {selectedProvider === 'vercel' && <>

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
          {item.projectDescription && <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">{item.projectDescription}</p>}
          {item.repositoryUrl && <a href={item.repositoryUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs font-semibold text-slate-700 hover:text-cyan-700 dark:text-slate-200 dark:hover:text-cyan-300">Abrir repositorio GitHub ↗</a>}
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
    </>}

    {selectedProvider === 'github' && <section>
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">GitHub Project Discovery</p><h4 className="mt-2 text-lg font-semibold">Repositorios conectados</h4></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${githubConfigured ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>{githubConfigured ? 'GITHUB_STUDIO_TOKEN conectado' : 'Lectura mediante metadatos de Vercel'}</span></div>
      {!githubConfigured && <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Los repositorios, ramas y commits ya se detectan desde Vercel. Para consultar repositorios privados directamente y habilitar operaciones supervisadas, configura GITHUB_STUDIO_TOKEN con permisos mínimos.</p>}
      {githubProjects.length === 0 ? <div className="mt-5 rounded-[26px] border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-950"><h5 className="font-semibold">No hay repositorios GitHub detectados</h5><p className="mt-2 text-sm text-slate-500">Sincroniza Vercel o conecta un repositorio al proyecto.</p></div> : <div className="mt-5 grid gap-4 xl:grid-cols-2">{githubProjects.map((item) => <article key={item.id} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h5 className="truncate font-semibold">{item.repositoryFullName || item.externalProjectName}</h5><p className="mt-1 text-xs text-slate-400">Proyecto Studio: {item.projectName}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold dark:bg-slate-800">{item.productionBranch || item.defaultBranch || 'sin rama'}</span></div>
        {item.projectDescription && <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">{item.projectDescription}</p>}
        <dl className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><dt className="text-slate-400">Último commit</dt><dd className="mt-1 font-mono font-medium">{item.productionCommitSha?.slice(0, 8) || '—'}</dd></div><div><dt className="text-slate-400">Autor</dt><dd className="mt-1 truncate font-medium">{item.productionCommitAuthor || '—'}</dd></div></dl>
        {item.productionCommitMessage && <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">{item.productionCommitMessage}</p>}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800"><Link href={`/${locale}/admin/programming/projects/${item.projectId}`} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-slate-700">Ver proyecto</Link>{item.repositoryUrl && <a href={item.repositoryUrl} target="_blank" rel="noreferrer" className="rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">Abrir en GitHub ↗</a>}</div>
      </article>)}</div>}
    </section>}

    {selectedProvider === 'chatgpt' && <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">ChatGPT / OpenAI</p><div className="mt-2 flex flex-wrap items-center justify-between gap-3"><h4 className="text-xl font-semibold">Modelos y workflows</h4><span className={`rounded-full px-3 py-1 text-xs font-semibold ${chatgptConfigured ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{chatgptConfigured ? 'API conectada' : 'API pendiente'}</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900"><p className="text-xs text-slate-400">OpenAI API</p><p className="mt-1 font-semibold">{chatgptConfigured ? 'Credencial disponible' : 'OPENAI_API_KEY no configurada'}</p></div><div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900"><p className="text-xs text-slate-400">Workflows ChatKit</p><p className="mt-1 font-semibold">{configuredWorkflows} configurados</p></div></div><p className="mt-5 text-sm leading-6 text-slate-500">Este módulo representa la conexión de inteligencia y workflows. No expone claves ni conversaciones privadas.</p></section>}

    {selectedProvider === 'mcp' && <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Trends MCP</p><div className="mt-2 flex flex-wrap items-center justify-between gap-3"><h4 className="text-xl font-semibold">Herramientas y contexto de Studio</h4><span className={`rounded-full px-3 py-1 text-xs font-semibold ${mcpConfigured ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{mcpConfigured ? 'Servidor protegido' : 'Configuración pendiente'}</span></div><div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900"><p className="text-xs text-slate-400">Endpoint interno</p><p className="mt-1 font-mono text-sm font-semibold">/api/studio-mcp</p></div><p className="mt-5 text-sm leading-6 text-slate-500">Centraliza herramientas de Engineering Studio y el intercambio controlado de contexto con clientes MCP autorizados.</p></section>}
  </div>;
}
