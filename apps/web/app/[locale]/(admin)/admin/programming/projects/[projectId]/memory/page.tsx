import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth/guards';
import { getStudioProjectDetail } from '@/lib/engineering-studio/store';
import { getProjectMemoryConsent } from '@/lib/engineering-studio/memory-consent';
import { listVaultEntries } from '@/lib/engineering-studio/vault';
import { saveMobileMemoryAction, setMobileMemoryConsentAction } from './actions';

export default async function StudioMobileMemoryPage({params}:{params:Promise<{locale:string;projectId:string}>}) {
  await requireRole('ROOT');
  const {locale,projectId}=await params;
  const project=await getStudioProjectDetail(projectId);
  if(!project) notFound();
  const [consent, entries]=await Promise.all([getProjectMemoryConsent(projectId),listVaultEntries(projectId)]);
  const summary=entries.find(e=>e.type==='CONVERSATION_SUMMARY') || entries.find(e=>e.type==='DECISION');
  return <main className="mx-auto max-w-3xl space-y-5 pb-16">
    <Link className="text-sm text-cyan-700 underline" href={`/${locale}/admin/programming/projects/${projectId}`}>Volver al proyecto</Link>
    <header className="rounded-3xl bg-slate-950 p-5 text-white">
      <p className="text-xs uppercase tracking-widest text-cyan-300">Project Vault · Memoria movil</p>
      <h1 className="mt-2 text-2xl font-semibold">{project.name}</h1>
      <p className="mt-2 text-sm text-slate-300">Estado: {project.stage} · {project.status}</p>
      <p className="mt-1 break-all text-xs text-slate-400">{project.repositoryUrl || 'Repositorio no asociado'}</p>
    </header>
    <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <h2 className="font-semibold">Consentimiento de memoria</h2>
      <p className="mt-1 text-sm text-slate-500">Guardado {consent.enabled?'autorizado':'desactivado'} para este proyecto. Revocar impide nuevas entradas, sin borrar registros previos.</p>
      <form action={setMobileMemoryConsentAction} className="mt-4 space-y-3">
        <input type="hidden" name="projectId" value={projectId}/><input type="hidden" name="locale" value={locale}/>
        <input type="hidden" name="enabled" value={consent.enabled?'false':'true'}/>
        {!consent.enabled&&<label className="flex items-start gap-2 text-sm"><input type="checkbox" name="confirm" value="yes" required className="mt-1"/>Autorizo guardar memoria de este proyecto en Trends172Tech.</label>}
        <button type="submit" className="w-full rounded-xl bg-slate-950 p-3 text-sm font-semibold text-white">{consent.enabled?'Revocar autorización':'Autorizar este proyecto'}</button>
      </form>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <h2 className="font-semibold">Reanudar rapidamente</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{summary?.content || 'Todavia no existe un resumen guardado de la ultima sesion.'}</p>
      <p className="mt-2 text-xs text-slate-400">{summary? `Fuente: ${summary.source} · ${summary.createdAt.toISOString().slice(0,16)} UTC` : 'Sin memoria registrada'}</p>
    </section>
    {consent.enabled&&<section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <h2 className="font-semibold">Guardar resumen o decision</h2>
      <p className="mt-1 text-xs text-slate-500">Captura manual desde Android. No importa automaticamente conversaciones privadas de ChatGPT.</p>
      <form action={saveMobileMemoryAction} className="mt-4 space-y-3">
        <input type="hidden" name="projectId" value={projectId}/><input type="hidden" name="locale" value={locale}/>
        <select name="type" className="w-full rounded-xl border p-3 text-sm text-slate-900" defaultValue="CONVERSATION_SUMMARY"><option value="CONVERSATION_SUMMARY">Resumen de sesion</option><option value="DECISION">Decision</option><option value="NOTE">Nota</option></select>
        <input name="title" required maxLength={160} minLength={3} placeholder="Titulo" className="w-full rounded-xl border p-3 text-sm text-slate-900"/>
        <textarea name="content" required minLength={10} maxLength={12000} rows={6} placeholder="Ultimo avance, decisiones, bloqueos y siguiente paso" className="w-full rounded-xl border p-3 text-sm text-slate-900"/>
        <button type="submit" className="w-full rounded-xl bg-cyan-700 p-3 text-sm font-semibold text-white">Guardar en Project Vault</button>
      </form>
    </section>}
    <section className="space-y-2"><h2 className="font-semibold">Historial reciente</h2>{entries.slice(0,20).map(e=><article key={e.id} className="rounded-xl border bg-white p-4 dark:bg-slate-950"><p className="text-xs text-cyan-700">{e.type} · {e.source} · v{e.version}</p><h3 className="mt-1 font-semibold">{e.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm text-slate-500">{e.content.slice(0,2500)}</p></article>)}</section>
  </main>;
}
