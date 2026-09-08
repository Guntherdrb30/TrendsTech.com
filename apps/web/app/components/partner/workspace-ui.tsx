import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export type ProjectOption = { id: string; name: string; targetCompany: string };
export type WorkspaceEntry = { id: string; opportunityId: string; projectName: string; targetCompany: string; category: string; content: string; sourceLabel: string | null; confidence: string; createdAt: Date };

export function WorkspaceHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">{eyebrow}</p><h2 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p></div>;
}

export function EntryForm({ locale, projects, action, category, title, fields = 'standard' }: { locale: string; projects: ProjectOption[]; action: (data: FormData) => void | Promise<void>; category: string; title: string; fields?: 'standard' | 'dated' | 'linked' }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent>
    {projects.length === 0 ? <p className="text-sm text-slate-500">Primero crea una oportunidad para mantener la información separada por proyecto.</p> : <form action={action} className="space-y-4">
      <input type="hidden" name="locale" value={locale}/><input type="hidden" name="category" value={category}/>
      <div className="space-y-2"><Label htmlFor={`${category}-project`}>Proyecto</Label><select id={`${category}-project`} name="opportunityId" required className="w-full rounded-md border bg-white px-3 py-2 text-sm">{projects.map(p=><option key={p.id} value={p.id}>{p.name} · {p.targetCompany}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor={`${category}-title`}>Título</Label><input id={`${category}-title`} name="title" required className="w-full rounded-md border px-3 py-2 text-sm"/></div>
      {fields === 'dated' ? <div className="space-y-2"><Label htmlFor={`${category}-date`}>Fecha o compromiso</Label><input id={`${category}-date`} name="dueAt" type="datetime-local" className="w-full rounded-md border px-3 py-2 text-sm"/></div> : null}
      {fields === 'linked' ? <div className="space-y-2"><Label htmlFor={`${category}-url`}>Enlace al archivo o fuente</Label><input id={`${category}-url`} name="url" type="url" placeholder="https://…" className="w-full rounded-md border px-3 py-2 text-sm"/></div> : null}
      <div className="space-y-2"><Label htmlFor={`${category}-source`}>Fuente</Label><input id={`${category}-source`} name="sourceLabel" placeholder="Reunión, cliente, documento o investigación" className="w-full rounded-md border px-3 py-2 text-sm"/></div>
      <div className="space-y-2"><Label htmlFor={`${category}-content`}>Detalle</Label><textarea id={`${category}-content`} name="content" required maxLength={8000} rows={6} className="w-full rounded-xl border px-4 py-3 text-sm"/></div>
      <input type="hidden" name="confidence" value={category === 'RESEARCH' ? 'RESEARCHED' : category === 'ASSUMPTION' ? 'WORKING_ASSUMPTION' : 'CONFIRMED'}/>
      <Button type="submit" className="w-full">Guardar en la memoria del proyecto</Button>
    </form>}
  </CardContent></Card>;
}

export function EntryList({ locale, entries, empty = 'Todavía no hay registros.' }: { locale: string; entries: WorkspaceEntry[]; empty?: string }) {
  return <Card><CardHeader><CardTitle>Registros por proyecto</CardTitle></CardHeader><CardContent>{entries.length === 0 ? <p className="text-sm text-slate-500">{empty}</p> : <div className="space-y-3">{entries.map(e=><article key={e.id} className="rounded-xl border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><Link href={`/${locale}/partner/projects/${e.opportunityId}`} className="font-semibold hover:text-red-600">{e.projectName}</Link><span className="text-xs font-semibold uppercase text-red-600">{e.category.replaceAll('_',' ')}</span></div><p className="mt-1 text-xs text-slate-500">{e.targetCompany} · {e.confidence} · {e.createdAt.toLocaleDateString('es-VE')}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6">{e.content}</p>{e.sourceLabel ? <p className="mt-2 text-xs text-slate-400">Fuente: {e.sourceLabel}</p> : null}</article>)}</div>}</CardContent></Card>;
}
