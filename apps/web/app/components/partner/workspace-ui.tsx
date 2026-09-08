import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export type ProjectOption = { id: string; name: string; targetCompany: string };
export type WorkspaceEntry = { id: string; opportunityId: string; projectName: string; targetCompany: string; category: string; content: string; sourceLabel: string | null; confidence: string; createdAt: Date };

export function WorkspaceHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="border-b border-black/[.06] pb-7"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#00aeb3]">{eyebrow}</p><h2 className="mt-2 font-[var(--font-display)] text-4xl font-semibold tracking-[-.05em] text-[#111418]">{title}</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-[#68717b]">{description}</p></div>;
}

export function EntryForm({ locale, projects, action, category, title, fields = 'standard' }: { locale: string; projects: ProjectOption[]; action: (data: FormData) => void | Promise<void>; category: string; title: string; fields?: 'standard' | 'dated' | 'linked' }) {
  return <Card className="border-black/[.06] shadow-[0_24px_70px_-55px_rgba(15,23,42,.45)]"><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent>
    {projects.length === 0 ? <p className="text-sm text-slate-500">Primero crea una oportunidad para mantener la información separada por proyecto.</p> : <form action={action} className="space-y-4">
      <input type="hidden" name="locale" value={locale}/><input type="hidden" name="category" value={category}/>
      <div className="space-y-2"><Label htmlFor={`${category}-project`}>Proyecto</Label><select id={`${category}-project`} name="opportunityId" required className="w-full rounded-xl border border-black/[.08] bg-[#fbfcfb] px-3 py-2.5 text-sm outline-none focus:border-[#7ddadd]">{projects.map(p=><option key={p.id} value={p.id}>{p.name} · {p.targetCompany}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor={`${category}-title`}>Título</Label><input id={`${category}-title`} name="title" required className="w-full rounded-xl border border-black/[.08] bg-[#fbfcfb] px-3 py-2.5 text-sm outline-none focus:border-[#7ddadd]"/></div>
      {fields === 'dated' ? <div className="space-y-2"><Label htmlFor={`${category}-date`}>Fecha o compromiso</Label><input id={`${category}-date`} name="dueAt" type="datetime-local" className="w-full rounded-md border px-3 py-2 text-sm"/></div> : null}
      {fields === 'linked' ? <div className="space-y-2"><Label htmlFor={`${category}-url`}>Enlace al archivo o fuente</Label><input id={`${category}-url`} name="url" type="url" placeholder="https://…" className="w-full rounded-md border px-3 py-2 text-sm"/></div> : null}
      <div className="space-y-2"><Label htmlFor={`${category}-source`}>Fuente</Label><input id={`${category}-source`} name="sourceLabel" placeholder="Reunión, cliente, documento o investigación" className="w-full rounded-md border px-3 py-2 text-sm"/></div>
      <div className="space-y-2"><Label htmlFor={`${category}-content`}>Detalle</Label><textarea id={`${category}-content`} name="content" required maxLength={8000} rows={6} className="w-full rounded-xl border px-4 py-3 text-sm"/></div>
      <input type="hidden" name="confidence" value={category === 'RESEARCH' ? 'RESEARCHED' : category === 'ASSUMPTION' ? 'WORKING_ASSUMPTION' : 'CONFIRMED'}/>
      <Button type="submit" className="w-full hover:bg-[#009fa4]">Guardar en la memoria del proyecto →</Button>
    </form>}
  </CardContent></Card>;
}

export function EntryList({ locale, entries, empty = 'Todavía no hay registros.' }: { locale: string; entries: WorkspaceEntry[]; empty?: string }) {
  return <Card className="border-black/[.06]"><CardHeader><CardTitle>Registros por proyecto</CardTitle></CardHeader><CardContent>{entries.length === 0 ? <div className="rounded-2xl border border-dashed border-[#b9e5e5] bg-[#f5fbfa] px-6 py-10 text-center"><span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-white text-[#00aeb3] shadow-sm">+</span><p className="mt-3 text-sm text-[#68717b]">{empty}</p></div> : <div className="space-y-3">{entries.map(e=><article key={e.id} className="rounded-2xl border border-black/[.06] bg-[#fbfcfb] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><Link href={`/${locale}/partner/projects/${e.opportunityId}`} className="font-semibold hover:text-[#00aeb3]">{e.projectName}</Link><span className="rounded-full bg-[#eaf9f8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#009fa4]">{e.category.replaceAll('_',' ')}</span></div><p className="mt-1 text-xs text-slate-500">{e.targetCompany} · {e.confidence} · {e.createdAt.toLocaleDateString('es-VE')}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6">{e.content}</p>{e.sourceLabel ? <p className="mt-2 text-xs text-slate-400">Fuente: {e.sourceLabel}</p> : null}</article>)}</div>}</CardContent></Card>;
}
