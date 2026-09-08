import Link from 'next/link';
import { prisma } from '@trends172tech/db';
import { requirePartner } from '@/lib/partners/access';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

type CountRow = { count: bigint };
type DashboardCounts = { tasks: bigint; documents: bigint; proposals: bigint };
type RecentProject = { id: string; name: string; targetCompany: string; stage: string; readinessScore: number };

export default async function PartnerDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { user, partner } = await requirePartner(locale);
  const [[row], [counts], recent] = await Promise.all([
    prisma.$queryRaw<CountRow[]>`SELECT COUNT(*)::bigint AS "count" FROM "PartnerOpportunity" WHERE "partnerId" = ${partner.id} AND "status" = 'ACTIVE'`,
    prisma.$queryRaw<DashboardCounts[]>`SELECT COUNT(*) FILTER (WHERE e."category" IN ('NEXT_ACTION','OPEN_QUESTION','RISK'))::bigint AS "tasks", COUNT(*) FILTER (WHERE e."category"='DOCUMENT')::bigint AS "documents", COUNT(*) FILTER (WHERE e."category"='PROPOSAL')::bigint AS "proposals" FROM "ProjectMemoryEntry" e JOIN "PartnerOpportunity" o ON o."id"=e."opportunityId" WHERE o."partnerId"=${partner.id} AND e."isCurrent"=true`,
    prisma.$queryRaw<RecentProject[]>`SELECT o."id",o."name",o."targetCompany",o."stage",COALESCE(m."readinessScore",0) AS "readinessScore" FROM "PartnerOpportunity" o LEFT JOIN "ProjectMemory" m ON m."opportunityId"=o."id" WHERE o."partnerId"=${partner.id} AND o."status"='ACTIVE' ORDER BY o."updatedAt" DESC LIMIT 5`
  ]);
  const activeProjects = Number(row?.count ?? 0n);

  const cards = [
    { title: 'Proyectos activos', value: String(activeProjects), note: 'Oportunidades activas con agente y memoria independiente.' },
    { title: 'Pendientes', value: String(Number(counts?.tasks ?? 0n)), note: 'Acciones, preguntas y riesgos abiertos.' },
    { title: 'Documentos', value: String(Number(counts?.documents ?? 0n)), note: 'Evidencias catalogadas por proyecto.' },
    { title: 'Propuestas', value: String(Number(counts?.proposals ?? 0n)), note: 'Borradores y revisiones registradas.' }
  ];

  return <div className="space-y-6">
    <section className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">Centro B2B</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">Hola, {user.name || partner.companyName}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Desde aquí puedes abrir oportunidades, mantener la memoria de cada proyecto y trabajar con el Director B2B de Trends172Tech.</p>
      <div className="mt-5 flex flex-wrap gap-3"><Button asChild><Link href={`/${locale}/partner/projects`}>Nueva oportunidad</Link></Button><Button asChild variant="outline"><Link href={`/${locale}/partner/director`}>Hablar con Director B2B</Link></Button></div>
    </section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card)=><Card key={card.title}><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">{card.title}</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{card.value}</p><p className="mt-2 text-xs leading-5 text-slate-500">{card.note}</p></CardContent></Card>)}</section>
    <section className="grid gap-4 xl:grid-cols-2"><Card><CardHeader><CardTitle>Continuar una oportunidad</CardTitle></CardHeader><CardContent>{recent.length?<div className="space-y-3">{recent.map(project=><Link key={project.id} href={`/${locale}/partner/projects/${project.id}`} className="flex items-center justify-between rounded-xl border p-3 text-sm transition hover:border-red-300"><span><strong className="block">{project.name}</strong><span className="text-xs text-slate-500">{project.targetCompany} · {project.stage}</span></span><span className="font-semibold text-red-600">{project.readinessScore}%</span></Link>)}</div>:<p className="text-sm text-slate-500">Todavía no hay oportunidades. Crea la primera para iniciar el levantamiento guiado.</p>}</CardContent></Card><Card><CardHeader><CardTitle>Preparación de oportunidades</CardTitle></CardHeader><CardContent><p className="text-sm leading-6 text-slate-600 dark:text-slate-300">El indicador de preparación mide si hay información suficiente para avanzar a la siguiente fase. Distingue hechos confirmados, supuestos, preguntas abiertas, riesgos y próximas acciones; no representa probabilidad de cierre.</p><Button asChild variant="outline" className="mt-4"><Link href={`/${locale}/partner/discovery`}>Continuar levantamientos EFICI</Link></Button></CardContent></Card></section>
  </div>;
}
