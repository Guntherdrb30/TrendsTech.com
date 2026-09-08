import Link from 'next/link';
import { prisma } from '@trends172tech/db';
import { requirePartner } from '@/lib/partners/access';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

type CountRow = { count: bigint };

export default async function PartnerDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { user, partner } = await requirePartner(locale);
  const [row] = await prisma.$queryRaw<CountRow[]>`SELECT COUNT(*)::bigint AS "count" FROM "PartnerOpportunity" WHERE "partnerId" = ${partner.id} AND "status" = 'ACTIVE'`;
  const activeProjects = Number(row?.count ?? 0n);

  const cards = [
    { title: 'Proyectos activos', value: String(activeProjects), note: 'Oportunidades activas con agente y memoria independiente.' },
    { title: 'Pendientes', value: '0', note: 'Acciones y compromisos próximos.' },
    { title: 'Documentos', value: '0', note: 'Expedientes y archivos generados por proyecto.' },
    { title: 'Propuestas', value: '0', note: 'Borradores, revisiones y propuestas aprobadas.' }
  ];

  return <div className="space-y-6">
    <section className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">Centro B2B</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">Hola, {user.name || partner.companyName}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Desde aquí puedes abrir oportunidades, mantener la memoria de cada proyecto y trabajar con el Director B2B de Trends172Tech.</p>
      <div className="mt-5 flex flex-wrap gap-3"><Button asChild><Link href={`/${locale}/partner/projects`}>Nueva oportunidad</Link></Button><Button asChild variant="outline"><Link href={`/${locale}/partner/director`}>Hablar con Director B2B</Link></Button></div>
    </section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card)=><Card key={card.title}><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">{card.title}</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{card.value}</p><p className="mt-2 text-xs leading-5 text-slate-500">{card.note}</p></CardContent></Card>)}</section>
    <section className="grid gap-4 xl:grid-cols-2"><Card><CardHeader><CardTitle>Continuar una oportunidad</CardTitle></CardHeader><CardContent><p className="text-sm leading-6 text-slate-600 dark:text-slate-300">Abre Proyectos y oportunidades para continuar el expediente vivo de cada proyecto.</p></CardContent></Card><Card><CardHeader><CardTitle>Preparación de oportunidades</CardTitle></CardHeader><CardContent><p className="text-sm leading-6 text-slate-600 dark:text-slate-300">El readiness distingue hechos confirmados, información faltante, riesgos y supuestos antes de recomendar una propuesta definitiva.</p></CardContent></Card></section>
  </div>;
}
