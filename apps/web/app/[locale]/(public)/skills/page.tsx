import Link from 'next/link';
import { prisma } from '@trends172tech/db';
import { IBM_Plex_Sans, Space_Grotesk } from 'next/font/google';
import { buildLocalizedMetadata } from '@/lib/seo';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
});

const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
});

type PageParams = { locale: string };

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    pathname: 'skills',
    title: {
      es: 'Habilidades especializadas para agentes inteligentes',
      en: 'Specialized skills for intelligent agents',
    },
    description: {
      es: 'Selecciona capacidades especializadas para adaptar cada agente al conocimiento, procesos y objetivos de tu industria.',
      en: 'Select specialized capabilities to adapt each agent to your industry knowledge, processes and goals.',
    },
  });
}

export default async function SkillsPage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  const isEs = locale.startsWith('es');
  const base = `/${locale}`;

  const skills = await prisma.skill.findMany({
    where: { isActive: true },
    orderBy: [{ industry: 'asc' }, { sortOrder: 'asc' }],
    select: {
      id: true,
      key: true,
      name: true,
      nameEn: true,
      industry: true,
      industryEn: true,
      icon: true,
      description: true,
      descriptionEn: true,
      priceMonthly: true,
      isFeatured: true,
    },
  });

  // Agrupar por industria preservando el orden de aparición
  const groupMap = new Map<string, { industryEn: string; skills: typeof skills }>();
  for (const skill of skills) {
    if (!groupMap.has(skill.industry)) {
      groupMap.set(skill.industry, { industryEn: skill.industryEn, skills: [] });
    }
    groupMap.get(skill.industry)!.skills.push(skill);
  }

  const copy = {
    eyebrow: isEs ? 'HABILIDADES DISPONIBLES' : 'AVAILABLE SKILLS',
    title: isEs ? 'El agente que se adapta a tu negocio' : 'The agent that adapts to your business',
    subtitle: isEs
      ? 'Elige las habilidades especializadas que necesita tu equipo. Cada skill entrena a tu agente con el conocimiento profundo de tu industria.'
      : 'Choose the specialized skills your team needs. Each skill trains your agent with deep knowledge of your industry.',
    ctaPrimary: isEs ? 'Crear mi agente' : 'Create my agent',
    ctaSecondary: isEs ? 'Ver precios' : 'View pricing',
    perMonth: isEs ? '/mes' : '/mo',
    featured: isEs ? 'Destacado' : 'Featured',
    ctaFinalTitle: isEs ? '¿Listo para crear tu agente?' : 'Ready to create your agent?',
    ctaFinalBody: isEs
      ? 'Configura tu agente en minutos, elige las skills que necesitas y obtén tu snippet de instalación.'
      : 'Configure your agent in minutes, choose the skills you need, and get your installation snippet.',
  };

  return (
    <div className={`${display.variable} ${body.variable} space-y-16 font-[var(--font-body)]`}>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="premium-spotlight relative overflow-hidden border-y border-black/8 bg-[linear-gradient(180deg,#f4f7fb_0%,#ffffff_28%,#f7fafc_100%)] px-6 py-14 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="premium-grid absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1760px] space-y-6">
          <div className="inline-flex rounded-full border border-black/8 bg-white/88 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            {copy.eyebrow}
          </div>
          <h1 className="max-w-3xl text-4xl font-[var(--font-display)] font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
            {copy.title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">{copy.subtitle}</p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`${base}/dashboard/agents/create`}
              className="interactive-chip inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_20px_45px_-24px_rgba(15,23,42,0.45)] transition hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
            >
              {copy.ctaPrimary}
            </Link>
            <Link
              href={`${base}/pricing`}
              className="interactive-chip inline-flex items-center justify-center rounded-full border border-black/8 bg-white/86 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
            >
              {copy.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Skills por industria ──────────────────────────────────── */}
      <section className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px] space-y-14">
          {Array.from(groupMap.entries()).map(([industry, { industryEn, skills: groupSkills }]) => (
            <div key={industry} className="space-y-6">
              <div className="inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                {isEs ? industry : industryEn}
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {groupSkills.map((skill) => (
                  <article
                    key={skill.id}
                    className="interactive-panel overflow-hidden rounded-[28px] border border-black/8 bg-white/92 p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.2)] transition hover:shadow-[0_28px_70px_-42px_rgba(15,23,42,0.28)]"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-3xl">{skill.icon}</span>
                      {skill.isFeatured && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
                          {copy.featured}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-base font-semibold tracking-[-0.02em] text-slate-950">
                      {isEs ? skill.name : skill.nameEn}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      {isEs ? skill.description : skill.descriptionEn}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-semibold tracking-[-0.02em] text-slate-950">
                        ${skill.priceMonthly}
                        <span className="text-xs font-normal text-slate-400">{copy.perMonth}</span>
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────────── */}
      <section className="px-6 pb-16 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px]">
          <div className="interactive-panel overflow-hidden rounded-[34px] border border-black/8 bg-slate-950 px-8 py-10 text-center shadow-[0_40px_100px_-70px_rgba(15,23,42,0.6)]">
            <h2 className="text-2xl font-[var(--font-display)] font-semibold tracking-[-0.04em] text-white sm:text-3xl">
              {copy.ctaFinalTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              {copy.ctaFinalBody}
            </p>
            <Link
              href={`${base}/dashboard/agents/create`}
              className="interactive-chip mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {copy.ctaPrimary} →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
