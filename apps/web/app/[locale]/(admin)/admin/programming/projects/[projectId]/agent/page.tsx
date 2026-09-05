import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectAgentWorkspace } from '@/lib/engineering-studio/project-workspace';
import { vercelProjectDashboardUrl } from '@/lib/engineering-studio/vercel-discovery';
import { submitProjectInstructionAction } from './actions';

function date(value: Date) {
  return new Intl.DateTimeFormat('es-VE', { dateStyle: 'short', timeStyle: 'short' }).format(value);
}

function textFromMeta(meta: Record<string, unknown> | null, key: string) {
  return typeof meta?.[key] === 'string' ? meta[key] as string : null;
}

export default async function ProjectAgentWorkspacePage({ params, searchParams }: {
  params: Promise<{ locale: string; projectId: string }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const [{ locale, projectId }, query] = await Promise.all([params, searchParams]);
  const workspace = await getProjectAgentWorkspace(projectId);
  if (!workspace.project) notFound();
  const { project, integrations, memory, runs, routingProfile } = workspace;
  const tasks = memory.filter((entry) => entry.type === 'TASK' || entry.type === 'CONVERSATION_SUMMARY').slice(0, 8);
  const contextEntries = memory.filter((entry) => entry.type !== 'TASK').slice(0, 12);
  const resultError = query.result?.startsWith('error:');
  const resultMessage = resultError
    ? query.result?.slice(6)
    : query.result
      ? `Ejecución preparada en modo seguro. Contexto estimado: ${query.result.split(':')[1] || '—'} tokens.`
      : null;

  return <div className="space-y-6">
    <section className="rounded-[28px] border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-white p-6 shadow-sm dark:border-cyan-900 dark:from-cyan-950/30 dark:via-slate-950 dark:to-slate-950 sm:p-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Agente de programación · Proyecto seleccionado</p><h3 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{project.name}</h3><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{project.summary || project.understanding || 'Proyecto sin descripción.'}</p><p className="mt-3 text-xs text-slate-500">El agente recibirá únicamente el contexto persistido de este proyecto, su continuidad y sus integraciones.</p></div>
        <div className="flex flex-wrap gap-2"><span className="rounded-full bg-cyan-100 px-3 py-2 text-xs font-semibold text-cyan-800">Perfil {routingProfile}</span><span className={`rounded-full px-3 py-2 text-xs font-semibold ${project.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{project.approvalStatus === 'APPROVED' ? 'Blueprint aprobado' : 'Approval Gate pendiente'}</span></div>
      </div>
    </section>

    {resultMessage && <div role="status" className={`rounded-2xl border p-4 text-sm ${resultError ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{resultMessage}</div>}

    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Chat de instrucciones</p><h4 className="mt-2 text-xl font-semibold">¿Qué quieres mejorar o programar?</h4><p className="mt-2 text-sm leading-6 text-slate-500">La instrucción quedará en la memoria del proyecto y se generará un Context Pack reutilizable. Preparar la tarea no ejecuta un modelo, no fusiona ramas y no despliega a producción.</p>
          {project.approvalStatus === 'APPROVED' ? <form action={submitProjectInstructionAction} className="mt-5"><input type="hidden" name="projectId" value={projectId}/><input type="hidden" name="locale" value={locale}/><textarea name="task" required minLength={20} rows={7} autoFocus placeholder={`Escribe la siguiente tarea para ${project.name}…`} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 outline-none transition focus:border-cyan-500 dark:border-slate-800 dark:bg-slate-900"/><button type="submit" className="mt-3 w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 dark:bg-white dark:text-slate-950">Guardar contexto y preparar programación</button></form> : <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Primero aprueba el Blueprint del proyecto. <Link href={`/${locale}/admin/programming/projects/${projectId}`} className="font-semibold underline">Ir al Approval Gate</Link>.</div>}
        </section>

        <section className="rounded-[26px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Continuidad</p><h4 className="mt-2 text-lg font-semibold">Último punto de trabajo</h4></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold dark:bg-slate-800">{runs.length} runs</span></div>{runs.length ? <div className="mt-4 space-y-3">{runs.slice(0, 5).map((run) => <div key={run.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold">{run.status}</span><span className="text-xs text-slate-400">{date(run.createdAt)}</span></div><p className="mt-2 text-xs text-slate-500">{run.repositoryBranch || 'Rama pendiente'} · {run.model || 'Modelo no ejecutado'}</p><p className="mt-2 line-clamp-3 text-sm">{typeof run.resultJson?.task === 'string' ? run.resultJson.task : 'Ejecución preparada sin resumen de tarea.'}</p></div>)}</div> : <p className="mt-4 text-sm text-slate-500">Aún no hay ejecuciones. La primera instrucción iniciará la continuidad del proyecto.</p>}</section>

        <section className="rounded-[26px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Historial de instrucciones</p>{tasks.length ? <div className="mt-4 space-y-3">{tasks.map((entry) => <div key={entry.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"><p className="text-xs text-slate-400">{date(entry.createdAt)} · {entry.source}</p><p className="mt-2 text-sm leading-6">{entry.content}</p></div>)}</div> : <p className="mt-4 text-sm text-slate-500">No hay instrucciones guardadas todavía.</p>}</section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-[26px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Integraciones cargadas</p><div className="mt-4 space-y-3">{integrations.map((integration) => <div key={integration.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex items-center justify-between"><span className="font-semibold">{integration.provider}</span><span className="text-xs text-emerald-700">{integration.status}</span></div><p className="mt-2 truncate text-xs text-slate-500">{integration.repositoryFullName || integration.externalProjectName}</p>{integration.provider === 'GITHUB' && textFromMeta(integration.metaJson, 'description') && <p className="mt-2 text-xs leading-5 text-slate-500">{textFromMeta(integration.metaJson, 'description')}</p>}<div className="mt-3 flex flex-wrap gap-2">{integration.repositoryUrl && <a href={integration.repositoryUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-cyan-700">Abrir GitHub ↗</a>}{integration.provider === 'VERCEL' && <a href={vercelProjectDashboardUrl(integration.externalProjectName)} target="_blank" rel="noreferrer" className="text-xs font-semibold text-cyan-700">Abrir Vercel ↗</a>}</div></div>)}</div>{!integrations.length && <p className="mt-4 text-sm text-slate-500">No hay integraciones sincronizadas.</p>}</section>

        <section className="rounded-[26px] border border-slate-200 bg-slate-950 p-6 text-white"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Memoria activa</p><h4 className="mt-2 text-lg font-semibold">Project Vault</h4><p className="mt-2 text-xs leading-5 text-slate-400">{memory.length} entradas actuales se filtran por rol del agente para reducir tokens.</p><div className="mt-4 space-y-2">{contextEntries.map((entry) => <div key={entry.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3"><p className="text-[10px] uppercase tracking-wide text-cyan-300">{entry.type}</p><p className="mt-1 truncate text-xs font-semibold">{entry.title}</p></div>)}</div></section>

        <section className="rounded-[26px] border border-slate-200 bg-white p-6 text-sm dark:border-slate-800 dark:bg-slate-950"><p className="font-semibold">Permisos del agente</p><ul className="mt-3 space-y-2 text-xs text-slate-500"><li>✓ Leer contexto y repositorio conectado</li><li>✓ Preparar una rama supervisada</li><li>✓ Trabajar en Preview tras autorización</li><li>× Sin escritura en producción</li><li>× Sin merge automático a main</li><li>× Sin deployment automático</li></ul></section>
        <div className="flex gap-2"><Link href={`/${locale}/admin/programming/projects/${projectId}`} className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-center text-sm font-semibold">Blueprint</Link><Link href={`/${locale}/admin/programming/integrations`} className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-center text-sm font-semibold">Integraciones</Link></div>
      </aside>
    </div>
  </div>;
}
