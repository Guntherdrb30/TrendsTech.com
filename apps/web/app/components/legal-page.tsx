import Link from 'next/link';
import type { LegalPageContent } from '@/lib/legal-content';

export function LegalPage({ content, locale }: { content: LegalPageContent; locale: string }) {
  const isEs = locale.startsWith('es');

  return (
    <div className="pb-16 font-[var(--font-body)]">
      <section className="premium-spotlight relative overflow-hidden border-y border-black/8 bg-[linear-gradient(180deg,#eefbfb_0%,#ffffff_72%)] px-6 py-14 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="premium-grid absolute inset-0 opacity-45" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-5xl">
          <div className="inline-flex rounded-full border border-cyan-500/20 bg-white/88 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
            {content.eyebrow}
          </div>
          <h1 className="mt-5 text-4xl font-[var(--font-display)] font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
            {content.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {content.summary}
          </p>
          <div className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {content.updatedLabel}: {content.updatedDate}
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-5xl gap-5 px-6 pt-10 sm:px-8">
        {content.sections.map((section) => (
          <section
            key={section.title}
            className="rounded-[28px] border border-black/8 bg-white/92 p-6 shadow-[0_28px_80px_-64px_rgba(15,23,42,0.35)] sm:p-8"
          >
            <h2 className="text-xl font-[var(--font-display)] font-semibold tracking-[-0.025em] text-slate-950 sm:text-2xl">
              {section.title}
            </h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                {paragraph}
              </p>
            ))}
            {section.items ? (
              <ul className="mt-4 grid gap-3 text-sm leading-7 text-slate-600 sm:text-base">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <aside className="mt-2 rounded-[28px] border border-cyan-500/20 bg-cyan-50/70 p-6 text-sm leading-relaxed text-slate-700 sm:p-8">
          <p>
            {isEs
              ? 'Este documento forma parte del Centro de confianza de Trends172Tech LLC.'
              : 'This document is part of the Trends172Tech LLC Trust Center.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link className="font-semibold text-cyan-800 underline decoration-cyan-300 underline-offset-4" href={`/${locale}/privacy`}>
              {isEs ? 'Privacidad' : 'Privacy'}
            </Link>
            <Link className="font-semibold text-cyan-800 underline decoration-cyan-300 underline-offset-4" href={`/${locale}/terms`}>
              {isEs ? 'Términos' : 'Terms'}
            </Link>
            <Link className="font-semibold text-cyan-800 underline decoration-cyan-300 underline-offset-4" href={`/${locale}/security`}>
              {isEs ? 'Seguridad' : 'Security'}
            </Link>
            <Link className="font-semibold text-cyan-800 underline decoration-cyan-300 underline-offset-4" href={`/${locale}/contact`}>
              {isEs ? 'Contacto' : 'Contact'}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
