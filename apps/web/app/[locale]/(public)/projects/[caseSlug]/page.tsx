import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IBM_Plex_Sans, Space_Grotesk } from 'next/font/google';
import { JsonLd } from '@/components/json-ld';
import { buildProductionCaseStructuredData } from '@/lib/product-structured-data';
import { buildLocalizedMetadata } from '@/lib/seo';
import {
  CASE_STUDY_SLUGS,
  getCaseStudy,
  localizeCaseStudy,
  type CaseStudySlug,
} from '../case-study-data';

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

type PageParams = {
  locale: string;
  caseSlug: CaseStudySlug;
};

export function generateStaticParams() {
  return CASE_STUDY_SLUGS.map((caseSlug) => ({ caseSlug }));
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }) {
  const { locale, caseSlug } = await params;
  const caseStudy = getCaseStudy(caseSlug);

  if (!caseStudy) {
    notFound();
  }

  return buildLocalizedMetadata({
    locale,
    pathname: `projects/${caseSlug}`,
    title: {
      es: `${caseStudy.name} | Caso productivo`,
      en: `${caseStudy.name} | Production case study`,
    },
    description: caseStudy.summary,
  });
}

export default async function ProductionCasePage({ params }: { params: Promise<PageParams> }) {
  const { locale, caseSlug } = await params;
  const definition = getCaseStudy(caseSlug);

  if (!definition) {
    notFound();
  }

  const caseStudy = localizeCaseStudy(definition, locale);
  const isEs = locale.startsWith('es');
  const base = `/${locale}`;
  const accent = caseStudy.accent === 'orange' ? 'bg-orange-500' : 'bg-teal-500';
  const accentText = caseStudy.accent === 'orange' ? 'text-orange-600' : 'text-teal-600';
  const copy = isEs
    ? {
        back: 'Volver a casos',
        live: 'Producto activo',
        visit: 'Visitar producto en producción',
        ecosystem: 'Conocer LUNA',
        challenge: 'El desafío',
        solution: 'La solución aplicada',
        capabilitiesEyebrow: 'ALCANCE OPERATIVO',
        capabilitiesTitle: 'Funciones conectadas alrededor de una operación real',
        evidenceEyebrow: 'EVIDENCIA PÚBLICA',
        evidenceTitle: 'Qué puede comprobar un visitante',
        evidenceNote:
          'Las capacidades se presentan sin revelar datos personales, cifras financieras, valores de inventario ni controles internos sensibles.',
        workflowEyebrow: 'TRAZABILIDAD',
        workflowTitle: 'Cómo fluye la operación',
        galleryEyebrow: 'PRODUCTO',
        galleryTitle: 'Vistas representativas de la plataforma',
        galleryNote:
          'Las imágenes muestran módulos y flujos de producto. Los registros y valores operativos reales permanecen protegidos.',
        outcomes: 'Valor operativo',
        safeguards: 'Seguridad y estabilidad',
        technology: 'Base tecnológica',
        metricsTitle: 'Métricas responsables',
        metricsBody:
          'La plataforma está preparada para medir adopción, actividad, inventario, pagos y eficiencia. Las cifras se publicarán únicamente cuando estén consolidadas y autorizadas.',
        ctaEyebrow: 'DE LA OPERACIÓN AL PRODUCTO',
        ctaTitle: '¿Necesitas una plataforma adaptada a tu organización?',
        ctaBody:
          'Trends172Tech convierte procesos reales en sistemas conectados, trazables y preparados para crecer.',
        ctaPrimary: 'Explorar soluciones',
        ctaSecondary: 'Ver planes',
      }
    : {
        back: 'Back to case studies',
        live: 'Active product',
        visit: 'Visit the production product',
        ecosystem: 'Explore LUNA',
        challenge: 'The challenge',
        solution: 'The applied solution',
        capabilitiesEyebrow: 'OPERATIONAL SCOPE',
        capabilitiesTitle: 'Connected capabilities around a real operation',
        evidenceEyebrow: 'PUBLIC EVIDENCE',
        evidenceTitle: 'What a visitor can verify',
        evidenceNote:
          'Capabilities are presented without revealing personal data, financial figures, inventory values, or sensitive internal controls.',
        workflowEyebrow: 'TRACEABILITY',
        workflowTitle: 'How the operation flows',
        galleryEyebrow: 'PRODUCT',
        galleryTitle: 'Representative platform views',
        galleryNote:
          'Images show product modules and workflows. Real operational records and values remain protected.',
        outcomes: 'Operational value',
        safeguards: 'Security and stability',
        technology: 'Technology foundation',
        metricsTitle: 'Responsible metrics',
        metricsBody:
          'The platform is ready to measure adoption, activity, inventory, payments, and efficiency. Figures will only be published once consolidated and authorized.',
        ctaEyebrow: 'FROM OPERATIONS TO PRODUCT',
        ctaTitle: 'Do you need a platform adapted to your organization?',
        ctaBody:
          'Trends172Tech turns real processes into connected, traceable systems prepared to grow.',
        ctaPrimary: 'Explore solutions',
        ctaSecondary: 'View plans',
      };

  const structuredData = buildProductionCaseStructuredData(locale, caseSlug);

  return (
    <div className={`${display.variable} ${body.variable} font-[var(--font-body)] text-slate-900 dark:text-white`}>
      <JsonLd data={structuredData} />

      <section className="premium-spotlight relative overflow-hidden border-y border-black/8 bg-[linear-gradient(180deg,#f4f7fb_0%,#ffffff_26%,#f6f9fc_100%)] px-6 py-12 dark:border-white/10 dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_60%,#020617_100%)] sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="premium-grid absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-[1760px] gap-10 xl:grid-cols-[0.9fr_1.1fr] xl:items-center">
          <div className="space-y-6">
            <Link
              href={`${base}/projects`}
              className="interactive-chip inline-flex rounded-full border border-black/8 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
            >
              ← {copy.back}
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                <span className={`h-2 w-2 rounded-full ${accent}`} aria-hidden="true" />
                {copy.live}
              </span>
              <span className="rounded-full border border-black/8 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                {caseStudy.product}
              </span>
            </div>

            <div className="space-y-4">
              <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${accentText}`}>{caseStudy.name}</p>
              <h1 className="max-w-4xl text-4xl font-[var(--font-display)] font-semibold leading-[1.02] tracking-[-0.055em] text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                {caseStudy.title}
              </h1>
              <p className="max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
                {caseStudy.summary}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={caseStudy.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(15,23,42,0.6)] transition hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                {copy.visit} →
              </Link>
              <Link
                href={`${base}/systems/luna`}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
              >
                {copy.ecosystem}
              </Link>
            </div>
          </div>

          <div className="interactive-panel relative overflow-hidden rounded-[38px] border border-black/8 bg-white/82 p-3 shadow-[0_48px_120px_-70px_rgba(15,23,42,0.5)] dark:border-white/10 dark:bg-white/5 sm:p-5">
            <Image
              src={caseStudy.heroImage}
              alt={`${caseStudy.name} — ${caseStudy.title}`}
              width={1200}
              height={800}
              priority
              className="h-auto w-full rounded-[28px] border border-black/6 bg-slate-100 dark:border-white/10"
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto grid max-w-[1760px] gap-6 lg:grid-cols-2">
          {[
            { label: copy.challenge, body: caseStudy.challenge },
            { label: copy.solution, body: caseStudy.solution },
          ].map((item, index) => (
            <article
              key={item.label}
              className={`interactive-panel rounded-[30px] border border-black/8 p-6 shadow-[0_30px_80px_-64px_rgba(15,23,42,0.35)] dark:border-white/10 sm:p-8 ${
                index === 0 ? 'bg-white/92 dark:bg-slate-950/70' : 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${accent}`} aria-hidden="true" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">{item.label}</h2>
              </div>
              <p className={`mt-5 text-base leading-relaxed ${index === 0 ? 'text-slate-600 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600'}`}>
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-black/8 bg-white/75 px-6 py-16 dark:border-white/10 dark:bg-slate-950/60 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px] space-y-8">
          <div className="max-w-3xl space-y-3">
            <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${accentText}`}>{copy.capabilitiesEyebrow}</p>
            <h2 className="text-3xl font-[var(--font-display)] font-semibold tracking-[-0.04em] sm:text-4xl">
              {copy.capabilitiesTitle}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {caseStudy.capabilities.map((capability, index) => (
              <article
                key={capability}
                className="interactive-panel rounded-[26px] border border-black/8 bg-white/90 p-5 shadow-[0_24px_64px_-54px_rgba(15,23,42,0.3)] dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs font-semibold text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${accent}`} aria-hidden="true" />
                </div>
                <p className="mt-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{capability}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto grid max-w-[1760px] overflow-hidden rounded-[36px] bg-slate-950 text-white shadow-[0_40px_110px_-70px_rgba(15,23,42,0.65)] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4 p-7 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">{copy.evidenceEyebrow}</p>
            <h2 className="text-3xl font-[var(--font-display)] font-semibold tracking-[-0.04em]">{copy.evidenceTitle}</h2>
            <p className="text-sm leading-relaxed text-slate-400">{copy.evidenceNote}</p>
            <Link
              href={caseStudy.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              {copy.visit} →
            </Link>
          </div>
          <ul className="grid gap-px bg-white/10 sm:grid-cols-2">
            {caseStudy.evidence.map((item, index) => (
              <li key={item} className="bg-slate-950 p-6 sm:p-7">
                <span className={`font-mono text-xs font-semibold ${index % 2 === 0 ? 'text-teal-300' : 'text-orange-300'}`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="mt-4 text-sm leading-relaxed text-slate-200">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-black/8 bg-slate-50/80 px-6 py-16 dark:border-white/10 dark:bg-slate-900/50 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px] space-y-8">
          <div className="max-w-3xl space-y-3">
            <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${accentText}`}>{copy.workflowEyebrow}</p>
            <h2 className="text-3xl font-[var(--font-display)] font-semibold tracking-[-0.04em] sm:text-4xl">{copy.workflowTitle}</h2>
          </div>
          <ol className="grid gap-4 lg:grid-cols-4">
            {caseStudy.workflow.map((step, index) => (
              <li key={step} className="relative rounded-[26px] border border-black/8 bg-white p-5 dark:border-white/10 dark:bg-slate-950/70">
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white ${accent}`}>
                  {index + 1}
                </span>
                <p className="mt-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px] space-y-8">
          <div className="max-w-3xl space-y-3">
            <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${accentText}`}>{copy.galleryEyebrow}</p>
            <h2 className="text-3xl font-[var(--font-display)] font-semibold tracking-[-0.04em] sm:text-4xl">{copy.galleryTitle}</h2>
            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{copy.galleryNote}</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {caseStudy.gallery.map((item) => (
              <figure key={item.src} className="interactive-panel overflow-hidden rounded-[28px] border border-black/8 bg-white shadow-[0_28px_74px_-58px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/70">
                <Image src={item.src} alt={item.alt} width={920} height={720} className="aspect-[23/18] h-auto w-full object-cover" />
                <figcaption className="border-t border-black/8 px-5 py-4 text-sm leading-relaxed text-slate-600 dark:border-white/10 dark:text-slate-300">
                  {item.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto grid max-w-[1760px] gap-5 lg:grid-cols-3">
          {[
            { title: copy.outcomes, items: caseStudy.outcomes },
            { title: copy.safeguards, items: caseStudy.safeguards },
          ].map((group) => (
            <article key={group.title} className="rounded-[28px] border border-black/8 bg-white/90 p-6 dark:border-white/10 dark:bg-slate-950/70">
              <h2 className="text-lg font-[var(--font-display)] font-semibold">{group.title}</h2>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${accent}`} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}

          <article className="rounded-[28px] border border-black/8 bg-white/90 p-6 dark:border-white/10 dark:bg-slate-950/70">
            <h2 className="text-lg font-[var(--font-display)] font-semibold">{copy.technology}</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {caseStudy.stack.map((technology) => (
                <span key={technology} className="rounded-full border border-black/8 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  {technology}
                </span>
              ))}
            </div>
            <div className="mt-6 rounded-[20px] border border-dashed border-slate-300 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-white/5">
              <h3 className="text-sm font-semibold">{copy.metricsTitle}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{copy.metricsBody}</p>
            </div>
          </article>
        </div>
      </section>

      <section className="border-t border-black/8 bg-slate-950 px-6 py-16 text-white dark:border-white/10 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto flex max-w-[1760px] flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">{copy.ctaEyebrow}</p>
            <h2 className="text-3xl font-[var(--font-display)] font-semibold tracking-[-0.04em] sm:text-4xl">{copy.ctaTitle}</h2>
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">{copy.ctaBody}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`${base}/systems`} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-200">
              {copy.ctaPrimary}
            </Link>
            <Link href={`${base}/pricing`} className="rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15">
              {copy.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
