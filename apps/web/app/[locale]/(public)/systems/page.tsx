import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { AGENT_PRODUCTS } from "../agents/agent-products";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display"
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body"
});

export default async function SystemsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = `/${locale}`;
  const t = await getTranslations("systemsPage");
  const a = await getTranslations("agents");

  const focusAreas = [
    t("focus.f1"),
    t("focus.f2"),
    t("focus.f3"),
    t("focus.f4")
  ];

  const lunaHighlights = [
    t("lunaHighlights.h1"),
    t("lunaHighlights.h2"),
    t("lunaHighlights.h3"),
    t("lunaHighlights.h4")
  ];

  return (
    <div className={`${display.variable} ${body.variable} space-y-16 font-[var(--font-body)]`}>
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 px-6 py-10 shadow-[0_40px_120px_-80px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 sm:px-10 sm:py-14">
        <div className="grid-lines absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(14,116,144,0.35),_transparent_70%)] blur-2xl" aria-hidden="true" />
        <div className="absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(217,119,6,0.28),_transparent_70%)] blur-2xl" aria-hidden="true" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.6)]" />
              {t("eyebrow")}
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-[var(--font-display)] font-semibold leading-tight text-slate-900 dark:text-white sm:text-5xl">
                {t("title")}
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
                {t("subtitle")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`${base}/systems/luna`}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(15,23,42,0.6)] transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                {t("ctaPrimary")}
              </Link>
              <Link
                href={`${base}/agents`}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 backdrop-blur transition hover:-translate-y-0.5 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
              >
                {t("ctaSecondary")}
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.6)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {t("focusTitle")}
              </div>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {focusAreas.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-500" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                {t("focusNote")}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white">
            {t("catalogTitle")}
          </h2>
          <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
            {t("catalogBody")}
          </p>
        </div>
        <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-950/70">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                {t("catalogBadge")}
              </div>
              <div className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                {t("catalogTag")}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white">
                LUNA
              </h3>
              <p className="max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {t("lunaBody")}
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {lunaHighlights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`${base}/systems/luna`}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                {t("catalogPrimary")}
              </Link>
              <Link
                href={`${base}/projects`}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
              >
                {t("catalogSecondary")}
              </Link>
            </div>
          </div>
        </article>
      </section>

      <section className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white">
            {t("agentsTitle")}
          </h2>
          <p className="max-w-3xl text-base text-slate-600 dark:text-slate-300">
            {t("agentsBody")}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {AGENT_PRODUCTS.map((agent) => (
            <Link
              key={agent.key}
              href={`${base}/agents/${agent.key}`}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-5 text-sm shadow-sm transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-950/60"
            >
              <div className="text-lg font-semibold text-slate-900 dark:text-white">
                {a(`${agent.key}.name`)}
              </div>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                {a(`${agent.key}.tagline`)}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
