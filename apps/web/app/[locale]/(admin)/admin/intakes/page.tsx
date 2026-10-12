import Link from 'next/link';
import { prisma } from '@trends172tech/db';

export const dynamic = 'force-dynamic';

export default async function IntakesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const es = locale.startsWith('es');
  const intakes = await prisma.adminProjectIntake.findMany({
    where: { status: 'SUBMITTED' },
    orderBy: { submittedAt: 'desc' },
    take: 100,
    include: { lead: { select: { id: true, status: true } } }
  });
  return <section className="space-y-6">
    <div><p className="text-xs font-semibold uppercase tracking-widest text-teal-700">CRM · Trends172Tech</p>
      <h2 className="mt-2 text-3xl font-semibold">{es ? 'Oportunidades IA' : 'Project opportunities'}</h2>
      <p className="mt-2 text-sm text-slate-500">{es ? 'Últimas 100 solicitudes recibidas mediante el asesor público. Solo para administración ROOT.' : 'Latest 100 submitted discovery requests. ROOT-only access.'}</p></div>
    <div className="space-y-4">{intakes.length === 0 && <p className="rounded-xl bg-white p-6 text-slate-500">{es ? 'Aún no hay solicitudes registradas.' : 'No requests received yet.'}</p>}
      {intakes.map(item => {
        const details = item.details && typeof item.details === 'object' && !Array.isArray(item.details) ? item.details as Record<string, unknown> : {};
        const description = typeof details.description === 'string' ? details.description : '';
        return <article key={item.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-semibold">{item.projectTitle || item.reference}</h3><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">{item.lead?.status || 'NEW'}</span></div>
          <p className="text-xs font-semibold text-slate-500">{item.reference} · {item.submittedAt?.toLocaleDateString(locale) || ''}</p>
          <p className="whitespace-pre-wrap text-sm text-slate-700">{description.slice(0, 600)}</p>
          <p className="text-sm font-medium">{item.contactName} · {item.company || ''}</p>
          <p className="break-all text-sm text-slate-600">{item.contactEmail} · {item.contactPhone} · {item.country}</p>
          <p className="text-xs text-slate-500">{es ? 'Correo al cliente' : 'Client email'}: {item.clientEmailStatus} · {es ? 'Aviso interno' : 'Internal alert'}: {item.internalEmailStatus}</p>
          <details className="rounded-xl bg-slate-50 p-4"><summary className="cursor-pointer text-sm font-semibold">{es ? 'Ver entrevista y requerimientos' : 'View interview and requirements'}</summary>
            <pre className="mt-3 whitespace-pre-wrap break-words text-sm">{JSON.stringify({ details: item.details, transcript: item.transcript }, null, 2)}</pre>
          </details>
          <Link href={'/' + locale + '/admin/clients'} className="inline-block text-sm font-semibold text-teal-700 underline">{es ? 'Abrir CRM de clientes' : 'Open client CRM'}</Link>
        </article>;
      })}</div>
  </section>;
}
