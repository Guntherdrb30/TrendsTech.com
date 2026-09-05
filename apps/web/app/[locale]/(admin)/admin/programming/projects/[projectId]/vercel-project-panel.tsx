import { getVercelIntegrationForProject } from '@/lib/engineering-studio/infrastructure-sync';
import { EXPECTED_VERCEL_TEAM_SLUG } from '@/lib/engineering-studio/vercel-discovery';
import { disconnectVercelProjectAction } from './actions';
import { DisconnectVercelButton } from './disconnect-vercel-button';

function date(value: Date | null) {
  return value ? new Intl.DateTimeFormat('es-VE', { dateStyle: 'medium', timeStyle: 'short' }).format(value) : '—';
}

export async function VercelProjectPanel({ locale, projectId }: { locale: string; projectId: string }) {
  const { integration, events } = await getVercelIntegrationForProject(projectId);
  if (!integration) return null;
  const fields = [
    ['ID', integration.externalProjectId],
    ['Framework', integration.framework || '—'],
    ['Git', `${integration.gitProvider || 'Proveedor no detectado'} · ${integration.repositoryFullName || 'sin repositorio'}`],
    ['Rama de producción', integration.productionBranch || integration.defaultBranch || '—'],
    ['Commit', integration.productionCommitSha ? `${integration.productionCommitSha.slice(0, 8)} · ${integration.productionCommitAuthor || 'autor no disponible'}` : '—'],
    ['Mensaje', integration.productionCommitMessage || '—'],
    ['Fecha commit', date(integration.productionCommitDate)],
    ['Deployment', integration.productionState || '—'],
    ['Entorno', integration.deploymentTarget === 'production' ? 'Production' : integration.deploymentTarget === 'preview' ? 'Preview' : '—'],
    ['Último deployment', date(integration.productionCreatedAt)],
    ['Última sync', date(integration.lastSyncedAt)],
    ['Creado en Studio', date(integration.createdAt)],
    ['Actualizado en Studio', date(integration.updatedAt)],
  ];
  return <section className="rounded-[26px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Integración Vercel</p><h4 className="mt-2 text-lg font-semibold">{integration.externalProjectName}</h4></div><span className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold">{integration.status}</span></div>
    <dl className="mt-5 space-y-3 text-xs">{fields.map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-900"><dt className="text-slate-400">{label}</dt><dd className="mt-1 break-words font-medium">{value}</dd></div>)}</dl>
    <div className="mt-4 grid gap-2"><a target="_blank" rel="noreferrer" href={`https://vercel.com/${EXPECTED_VERCEL_TEAM_SLUG}/${integration.externalProjectName}`} className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white dark:bg-white dark:text-slate-950">Abrir en Vercel ↗</a>{integration.productionDeploymentUrl && <a target="_blank" rel="noreferrer" href={integration.productionDeploymentUrl} className="rounded-full border border-slate-200 px-5 py-3 text-center text-sm font-semibold">Abrir deployment ↗</a>}</div>
    {integration.lastError && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{integration.lastError}</p>}
    {events.length > 0 && <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Historial reciente</p><div className="mt-3 space-y-3">{events.slice(0, 6).map((event) => <div key={event.id}><p className="text-xs font-medium">{event.message || event.type}</p><p className="mt-0.5 text-[11px] text-slate-400">{date(event.createdAt)}</p></div>)}</div></div>}
    {integration.status !== 'DISCONNECTED' && <div className="mt-5"><DisconnectVercelButton action={disconnectVercelProjectAction} locale={locale} projectId={projectId} projectName={integration.externalProjectName}/><p className="mt-2 text-center text-[11px] leading-4 text-slate-400">Solo desconecta Studio. No modifica el proyecto ni sus recursos en Vercel.</p></div>}
  </section>;
}
