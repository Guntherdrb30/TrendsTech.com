import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { IBM_Plex_Sans, Space_Grotesk } from 'next/font/google';
import { buildLocalizedMetadata } from '@/lib/seo';

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
    pathname: 'pricing',
    title: {
      es: 'Precios y modelos de activación',
      en: 'Pricing and activation models',
    },
    description: {
      es: 'Consulta las modalidades de activación para agentes, plataformas empresariales e implementaciones adaptadas al alcance de cada operación.',
      en: 'Review activation options for agents, business platforms and implementations tailored to each operation.',
    },
  });
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const base = `/${locale}`;
  const pages = await getTranslations('pages');
  const pricing = await getTranslations('pricingPage');

  const cards = [
    { title: pricing('cards.c1Title'), body: pricing('cards.c1Body') },
    { title: pricing('cards.c2Title'), body: pricing('cards.c2Body') },
    { title: pricing('cards.c3Title'), body: pricing('cards.c3Body') }
  ];

  return (
    <div className={`${display.variable} ${body.variable} space-y-12 font-[var(--font-body)]`}>
      <section className="premium-spotlight relative overflow-hidden border-y border-black/8 bg-[linear-gradient(180deg,#f4f7fb_0%,#ffffff_28%,#f7fafc_100%)] px-6 py-12 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="premium-grid absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-[1760px] gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-black/8 bg-white/88 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              {pricing('eyebrow')}
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-[var(--font-display)] font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
                {pricing('title')}
              </h1>
              <p className="max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
                {pricing('subtitle')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="https://wa.me/584122640371"
                target="_blank"
                rel="noreferrer"
                className="interactive-chip inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_20px_45px_-24px_rgba(15,23,42,0.45)] transition hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
              >
                {pricing('ctaPrimary')}
              </Link>
              <Link
                href={`${base}/systems`}
                className="interactive-chip inline-flex items-center justify-center rounded-full border border-black/8 bg-white/86 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
              >
                {pricing('ctaSecondary')}
              </Link>
            </div>
          </div>

          <div className="interactive-panel premium-metal relative overflow-hidden rounded-[34px] border border-black/8 bg-white/78 p-5 shadow-[0_38px_100px_-70px_rgba(15,23,42,0.4)]">
            <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.96)_50%,transparent_100%)]" aria-hidden="true" />
            <div className="grid gap-4">
              <div className="rounded-[28px] border border-white/60 bg-white/76 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {pricing('statusTitle')}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{pricing('statusBody')}</p>
              </div>
              <div className="rounded-[28px] border border-black/8 bg-slate-950 px-5 py-5 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.5)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {pages('pricingTitle')}
                </div>
                <div className="mt-3 text-3xl font-[var(--font-display)] font-semibold tracking-[-0.05em] text-white">
                  {`01 / 03`}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{pricing('plansBody')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto grid w-full max-w-[1760px] gap-6 xl:grid-cols-3">
          {cards.map((card, index) => (
            <article
              key={card.title}
              className="interactive-panel premium-spotlight overflow-hidden rounded-[32px] border border-black/8 bg-white/92 p-6 shadow-[0_30px_90px_-62px_rgba(15,23,42,0.3)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {card.title}
                </div>
                <div className="rounded-full border border-black/8 bg-white/84 px-3 py-1 text-[11px] font-semibold text-slate-600">
                  {`0${index + 1}`}
                </div>
              </div>
              <div className="mt-6 text-2xl font-[var(--font-display)] font-semibold tracking-[-0.04em] text-slate-950">
                {card.title}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{card.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
