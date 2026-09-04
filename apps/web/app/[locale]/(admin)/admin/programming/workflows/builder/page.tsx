import Link from 'next/link';
import WorkflowBuilderClient from './WorkflowBuilderClient';

export default async function WorkflowBuilderPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <div className="space-y-6">
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-600">Natural-Language Workflow Builder</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Describe el workflow. Studio construye el mapa.</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Diseña y modifica automatizaciones reutilizables conversando. Revisa el diagrama y sus Approval Gates antes de guardarlo.</p></div>
        <Link href={`/${locale}/admin/programming/workflows`} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold">Volver al Control Center</Link>
      </div>
    </section>
    <WorkflowBuilderClient locale={locale}/>
  </div>;
}
