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

  return <div className="space-y-7">
    <section className="relative overflow-hidden rounded-[32px] border border-black/[.05] bg-white px-6 py-8 shadow-[0_28px_90px_-65px_rgba(0,90,95,.5)] sm:px-9 sm:py-10">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] opacity-70 lg:block" style={{backgroundImage:'radial-gradient(circle at 70% 45%, rgba(0,199,202,.16), transparent 12%), radial-gradient(circle at 70% 45%, transparent 24%, rgba(0,199,202,.10) 24.5%, transparent 25%), radial-gradient(circle at 70% 45%, transparent 40%, rgba(0,199,202,.08) 40.5%, transparent 41%)'}} />
      <div className="relative max-w-3xl">
        <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#00aeb3]">Centro de inteligencia B2B</p>
        <h2 className="mt-3 font-[var(--font-display)] text-4xl font-semibold tracking-[-.055em] sm:text-5xl">Bienvenido, {user.name || partner.companyName}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#68717b]">Gestiona oportunidades empresariales, consolida información estratégica y coordina cada proyecto con una memoria independiente y trazable.</p>
        <div className="mt-7 flex flex-wrap gap-3"><Button asChild className="hover:bg-[#009fa4]"><Link href={`/${locale}/partner/projects`}>Crear nueva oportunidad →</Link></Button><Button asChild variant="outline" className="hover:border-[#92dfe1] hover:text-[#009fa4]"><Link href={`/${locale}/partner/director`}>Abrir Director B2B</Link></Button></div>
      </div>
    </section>
    <section>
      <div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#00aeb3]">Visión general</p><h3 className="mt-1 text-xl font-semibold tracking-[-.03em]">Estado del portafolio</h3></div><span className="hidden text-xs text-[#899199] sm:block">Información actualizada del workspace</span></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card,index)=><Card key={card.title} className="border-black/[.06] bg-white shadow-[0_20px_60px_-52px_rgba(15,23,42,.5)]"><CardHeader className="border-0 pb-0"><div className="flex items-center justify-between"><CardTitle className="text-sm font-medium text-[#68717b]">{card.title}</CardTitle><span className="grid h-7 w-7 place-items-center rounded-full border border-[#bcebed] bg-[#effbfa] text-[9px] font-semibold text-[#00aeb3]">0{index+1}</span></div></CardHeader><CardContent><p className="font-[var(--font-display)] text-4xl font-semibold tracking-[-.05em]">{card.value}</p><p className="mt-2 text-xs leading-5 text-[#7b858d]">{card.note}</p></CardContent></Card>)}</div>
    </section>
    <section className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]"><Card className="border-black/[.06]"><CardHeader><CardTitle>Continuar una oportunidad</CardTitle></CardHeader><CardContent>{recent.length?<div className="space-y-3">{recent.map(project=><Link key={project.id} href={`/${locale}/partner/projects/${project.id}`} className="flex items-center justify-between rounded-2xl border border-black/[.06] bg-[#fbfcfb] p-4 text-sm transition hover:border-[#92dfe1] hover:bg-[#f5fbfa]"><span><strong className="block">{project.name}</strong><span className="mt-1 block text-xs text-slate-500">{project.targetCompany} · {project.stage}</span></span><span className="rounded-full bg-[#eaf9f8] px-3 py-1.5 font-semibold text-[#009fa4]">{project.readinessScore}%</span></Link>)}</div>:<div className="rounded-2xl border border-dashed border-[#b9e5e5] bg-[#f5fbfa] px-6 py-9 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-white text-lg text-[#00aeb3] shadow-sm">+</span><p className="mt-3 text-sm font-semibold">Inicia tu primera oportunidad</p><p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#7b858d]">Crea el expediente de una empresa para comenzar el levantamiento guiado.</p><Button asChild size="sm" className="mt-4 hover:bg-[#009fa4]"><Link href={`/${locale}/partner/projects`}>Crear oportunidad</Link></Button></div>}</CardContent></Card><Card className="border-black/[.06] bg-[linear-gradient(145deg,#ffffff,#f0faf9)]"><CardHeader><CardTitle>Preparación empresarial</CardTitle></CardHeader><CardContent><p className="text-sm leading-7 text-[#68717b]">El indicador mide si existe información suficiente para avanzar. Separa hechos confirmados, supuestos, preguntas abiertas, riesgos y próximas acciones.</p><div className="mt-5 grid grid-cols-2 gap-2">{['Hechos','Supuestos','Riesgos','Acciones'].map(item=><div key={item} className="rounded-xl border border-black/[.05] bg-white/80 px-3 py-2.5 text-xs font-medium">{item}</div>)}</div><Button asChild variant="outline" className="mt-5 hover:border-[#92dfe1] hover:text-[#009fa4]"><Link href={`/${locale}/partner/discovery`}>Continuar levantamientos EFICI →</Link></Button></CardContent></Card></section>
  </div>;
}
