import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { formatNewsDate, getPublishedNewsPosts, splitNewsBody } from "@/lib/news";
import { buildLocalizedMetadata } from "@/lib/seo";

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

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    pathname: "news",
    title: {
      es: "Noticias, mejoras y avances de producto",
      en: "News, improvements and product updates"
    },
    description: {
      es: "Actualizaciones sobre productos, implementaciones, decisiones técnicas y evolución de las soluciones de Trends172Tech.",
      en: "Updates on Trends172Tech products, implementations, technical decisions and solution development."
    }
  });
}

export default async function NewsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = `/${locale}`;
  const t = await getTranslations("newsPage");
  const posts = await getPublishedNewsPosts(locale);

  const streams = [
    { title: t("streams.s1Title"), body: t("streams.s1Body") },
    { title: t("streams.s2Title"), body: t("streams.s2Body") },
    { title: t("streams.s3Title"), body: t("streams.s3Body") }
  ];

  const updates = [
    {
      badge: t("updates.u1Badge"),
      title: t("updates.u1Title"),
      body: t("updates.u1Body")
    },
    {
      badge: t("updates.u2Badge"),
      title: t("updates.u2Title"),
      body: t("updates.u2Body")
    },
    {
      badge: t("updates.u3Badge"),
      title: t("updates.u3Title"),
      body: t("updates.u3Body")
    },
    {
      badge: t("updates.u4Badge"),
      title: t("updates.u4Title"),
      body: t("updates.u4Body")
    }
  ];

  const promises = [
    t("promises.p1"),
    t("promises.p2"),
    t("promises.p3"),
    t("promises.p4")
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
              <p className="max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
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
                href={`${base}/que-ofrecemos`}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 backdrop-blur transition hover:-translate-y-0.5 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
              >
                {t("ctaSecondary")}
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.6)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {t("streamsTitle")}
              </div>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {streams.map((item) => (
                  <li key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <div className="font-semibold text-slate-900 dark:text-white">{item.title}</div>
                    <p className="mt-2 leading-relaxed">{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white">
            {t("updatesTitle")}
          </h2>
          <p className="max-w-3xl text-base text-slate-600 dark:text-slate-300">
            {t("updatesBody")}
          </p>
        </div>
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-950/70"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    <span className="inline-flex rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                      {post.category}
                    </span>
                    {post.featured ? (
                      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                        {t("featuredLabel")}
                      </span>
                    ) : null}
                    <span>{formatNewsDate(post.publishedAt, locale)}</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white">
                      {post.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {post.summary}
                    </p>
                  </div>
                  <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {splitNewsBody(post.body).map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {updates.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-950/70"
              >
                <div className="space-y-3">
                  <div className="inline-flex rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                    {item.badge}
                  </div>
                  <h3 className="text-2xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-950 px-6 py-10 text-white shadow-[0_40px_120px_-80px_rgba(15,23,42,0.6)] dark:border-slate-800 sm:px-10 sm:py-12">
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {t("promiseTitle")}
          </div>
          <h2 className="text-3xl font-[var(--font-display)] font-semibold">{t("promiseHeadline")}</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {promises.map((item) => (
              <li key={item} className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-sm text-slate-200">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
