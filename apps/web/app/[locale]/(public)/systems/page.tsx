import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { IBM_Plex_Sans, Space_Grotesk } from 'next/font/google';
import { buildLocalizedMetadata } from '@/lib/seo';
import { AGENT_PRODUCTS } from '../agents/agent-products';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display'
});

const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body'
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    pathname: 'systems',
    title: {
      es: 'Sistemas empresariales para operar con control',
      en: 'Business systems built for operational control',
    },
    description: {
      es: 'Plataformas empresariales de Trends172Tech para integrar operaciones, comercio, automatización y trazabilidad en entornos reales.',
      en: 'Trends172Tech business platforms integrate operations, commerce, automation and traceability in real-world environments.',
    },
  });
}

export default async function SystemsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const base = `/${locale}`;
  const t = await getTranslations('systemsPage');
  const a = await getTranslations('agents');
  const uiCopy = locale.startsWith('es')
    ? {
        operationalObjective: 'Objetivo operativo',
        systemModule: 'Modulo del sistema',
        systemModuleBody: 'Comercio, operaciones, reportes y ejecucion por rol en un entorno alineado.',
        deliveryMode: 'Modo de entrega',
        deliveryModeBody: 'Despliegue operativo premium con logica de producto, disciplina de interfaz y trazabilidad.'
      }
    : {
        operationalObjective: 'Operational objective',
        systemModule: 'System module',
        systemModuleBody: 'Commerce, operations, reporting, and role-based execution in one aligned environment.',
        deliveryMode: 'Delivery mode',
        deliveryModeBody: 'Premium operational rollout with product logic, interface discipline, and traceability.'
      };

  const focusAreas = [t('focus.f1'), t('focus.f2'), t('focus.f3'), t('focus.f4')];
  const lunaHighlights = [t('lunaHighlights.h1'), t('lunaHighlights.h2'), t('lunaHighlights.h3'), t('lunaHighlights.h4')];

  return (
    <div className={`${display.variable} ${body.variable} space-y-14 font-[var(--font-body)]`}>
      <section className="premium-spotlight relative overflow-hidden border-y border-black/8 bg-[linear-gradient(180deg,#f4f7fb_0%,#ffffff_24%,#f6f9fc_100%)] px-6 py-12 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="premium-grid absolute inset-0 opacity-55" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-[1760px] gap-8 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/88 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t('eyebrow')}
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-[var(--font-display)] font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
                {t('title')}
              </h1>
              <p className="max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">{t('subtitle')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`${base}/systems/luna`}
                className="interactive-chip inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_20px_45px_-24px_rgba(15,23,42,0.45)] transition hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
              >
                {t('ctaPrimary')}
              </Link>
              <Link
                href={`${base}/agents`}
                className="interactive-chip inline-flex items-center justify-center rounded-full border border-black/8 bg-white/86 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
              >
                {t('ctaSecondary')}
              </Link>
            </div>
          </div>

          <div className="interactive-panel premium-metal relative overflow-hidden rounded-[34px] border border-black/8 bg-white/78 p-5 shadow-[0_38px_100px_-70px_rgba(15,23,42,0.4)]">
            <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.96)_50%,transparent_100%)]" aria-hidden="true" />
            <div className="grid gap-4">
              <div className="rounded-[28px] border border-white/60 bg-white/78 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{t('focusTitle')}</div>
                <ul className="mt-4 grid gap-3 text-sm text-slate-600">
                  {focusAreas.map((item) => (
                    <li key={item} className="flex items-start gap-3 rounded-[18px] border border-black/6 bg-slate-50/80 px-3 py-3">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[28px] border border-black/8 bg-slate-950 px-5 py-5 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.5)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{uiCopy.operationalObjective}</div>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{t('focusNote')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px] space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900">{t('catalogTitle')}</h2>
            <p className="max-w-3xl text-base text-slate-600">{t('catalogBody')}</p>
          </div>

          <article className="group interactive-panel premium-spotlight overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.96)_100%)] shadow-[0_36px_100px_-64px_rgba(15,23,42,0.34)]">
            <div className="flex items-center justify-between border-b border-black/6 px-6 py-4">
              <div className="space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{t('catalogBadge')}</div>
                <div className="text-sm font-semibold text-slate-900">LUNA</div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/86 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>{t('catalogTag')}</span>
              </div>
            </div>

            <div className="grid gap-5 p-6 xl:grid-cols-[1.02fr_0.98fr]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-[2.2rem] font-[var(--font-display)] font-semibold tracking-[-0.05em] text-slate-900">LUNA</h3>
                  <p className="max-w-3xl text-sm leading-relaxed text-slate-600">{t('lunaBody')}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {lunaHighlights.map((item) => (
                    <div key={item} className="interactive-panel rounded-[22px] border border-black/8 bg-white/86 px-4 py-4 text-sm text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`${base}/systems/luna`}
                    className="interactive-chip inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
                  >
                    {t('catalogPrimary')}
                  </Link>
                  <Link
                    href={`${base}/projects`}
                    className="interactive-chip inline-flex items-center justify-center rounded-full border border-black/8 bg-white/86 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
                  >
                    {t('catalogSecondary')}
                  </Link>
                </div>
              </div>

              <div className="interactive-panel premium-metal relative min-h-[300px] overflow-hidden rounded-[30px] border border-black/8 bg-white/78 p-4 shadow-[0_28px_80px_-60px_rgba(15,23,42,0.35)]">
                <div className="absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.94)_50%,transparent_100%)]" aria-hidden="true" />
                <div className="grid h-full gap-4">
                  <div className="rounded-[24px] border border-white/60 bg-white/72 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{uiCopy.systemModule}</div>
                    <div className="mt-2 text-2xl font-[var(--font-display)] font-semibold tracking-[-0.04em] text-slate-950">01</div>
                    <p className="mt-2 text-sm text-slate-600">{uiCopy.systemModuleBody}</p>
                  </div>
                  <div className="rounded-[24px] border border-black/8 bg-slate-950 px-4 py-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{uiCopy.deliveryMode}</div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">{uiCopy.deliveryModeBody}</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="w-full px-6 pb-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px] space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900">{t('agentsTitle')}</h2>
            <p className="max-w-3xl text-base text-slate-600">{t('agentsBody')}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {AGENT_PRODUCTS.map((agent, index) => (
              <Link
                key={agent.key}
                href={`${base}/agents/${agent.key}`}
                className="interactive-panel premium-spotlight rounded-[26px] border border-black/8 bg-white/92 px-5 py-5 text-sm shadow-[0_24px_64px_-52px_rgba(15,23,42,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg font-semibold text-slate-900">{a(`${agent.key}.name`)}</div>
                  <span className={`h-2.5 w-2.5 rounded-full ${index % 2 === 0 ? 'bg-emerald-500' : 'bg-[#8b5e34]'}`} />
                </div>
                <p className="mt-3 text-slate-600">{a(`${agent.key}.tagline`)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
