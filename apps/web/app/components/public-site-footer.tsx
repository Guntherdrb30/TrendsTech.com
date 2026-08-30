import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function PublicSiteFooter({ locale }: { locale: string }) {
  const nav = await getTranslations('nav');
  const footer = await getTranslations('footer');
  const base = `/${locale}`;

  return (
    <footer className="relative overflow-hidden border-t border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f5f8fb_100%)]">
      <div className="premium-grid absolute inset-0 opacity-50" aria-hidden="true" />
      <div
        className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_60%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex w-full max-w-[1760px] flex-col gap-10 px-6 py-12 sm:px-8 lg:gap-12 lg:px-12 lg:py-14 xl:px-16 2xl:px-20">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="reveal space-y-4">
            <div className="inline-flex rounded-full border border-black/8 bg-white/88 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.2)]">
              {footer('eyebrow')}
            </div>
            <div className="space-y-3">
              <h2 className="max-w-3xl text-3xl font-[var(--font-display)] font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                {footer('title')}
              </h2>
              <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                {footer('body')}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="interactive-panel reveal reveal-delay-1 rounded-[28px] border border-black/8 bg-white/88 p-5 shadow-[0_24px_60px_-46px_rgba(15,23,42,0.24)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {footer('navTitle')}
              </div>
              <div className="mt-4 grid gap-2 text-sm font-medium text-slate-700">
                <Link
                  href={base}
                  className="interactive-chip rounded-2xl px-3 py-2 transition hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
                >
                  {nav('home')}
                </Link>
                <Link
                  href={`${base}/que-ofrecemos`}
                  className="interactive-chip rounded-2xl px-3 py-2 transition hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
                >
                  {locale.startsWith('es') ? 'Qué ofrecemos' : 'What we offer'}
                </Link>
                <Link
                  href={`${base}/systems`}
                  className="interactive-chip rounded-2xl px-3 py-2 transition hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
                >
                  {nav('systems')}
                </Link>
                <Link
                  href={`${base}/security`}
                  className="interactive-chip rounded-2xl px-3 py-2 transition hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
                >
                  {footer('trustCenter')}
                </Link>
              </div>
            </div>

            <div className="interactive-panel reveal reveal-delay-2 rounded-[28px] border border-black/8 bg-slate-950 p-5 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.5)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {footer('contactTitle')}
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                <p>{footer('contactBody')}</p>
                <Link
                  href="https://wa.me/584122640371"
                  target="_blank"
                  rel="noreferrer"
                  className="interactive-chip inline-flex rounded-full border border-white/12 bg-white/10 px-4 py-2 font-semibold text-white transition hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  WhatsApp
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-black/6 pt-6 text-xs text-slate-500 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-x-5 gap-y-2 font-medium">
            <Link className="transition hover:text-slate-950" href={`${base}/privacy`}>{footer('privacy')}</Link>
            <Link className="transition hover:text-slate-950" href={`${base}/terms`}>{footer('terms')}</Link>
            <Link className="transition hover:text-slate-950" href={`${base}/security`}>{footer('security')}</Link>
            <Link className="transition hover:text-slate-950" href={`${base}/contact`}>{footer('contact')}</Link>
          </div>
          <div className="flex flex-col gap-1 uppercase tracking-[0.16em] sm:flex-row sm:gap-4">
            <span>{footer('legal')}</span>
            <span>{footer('tagline')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
