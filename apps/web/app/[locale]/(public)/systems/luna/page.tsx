import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { Button } from "@/components/ui/button";
import { AGENT_PRODUCTS } from "../../agents/agent-products";

const WHATSAPP_BUY_NUMBER = "584122640371";

function buildWhatsAppLink() {
  const text = encodeURIComponent("Quiero una demo de LUNA para mi empresa");
  return `https://wa.me/${WHATSAPP_BUY_NUMBER}?text=${text}`;
}

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

export default async function LunaPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = `/${locale}`;
  const t = await getTranslations("lunaPage");
  const a = await getTranslations("agents");

  const valueProps = [
    t("valueProps.v1"),
    t("valueProps.v2"),
    t("valueProps.v3"),
    t("valueProps.v4"),
    t("valueProps.v5"),
    t("valueProps.v6"),
    t("valueProps.v7"),
    t("valueProps.v8")
  ];

  const outcomes = [
    { title: t("outcomes.o1Title"), body: t("outcomes.o1Body") },
    { title: t("outcomes.o2Title"), body: t("outcomes.o2Body") },
    { title: t("outcomes.o3Title"), body: t("outcomes.o3Body") },
    { title: t("outcomes.o4Title"), body: t("outcomes.o4Body") },
    { title: t("outcomes.o5Title"), body: t("outcomes.o5Body") },
    { title: t("outcomes.o6Title"), body: t("outcomes.o6Body") }
  ];

  const modules = [
    { title: t("modules.m1Title"), body: t("modules.m1Body") },
    { title: t("modules.m2Title"), body: t("modules.m2Body") },
    { title: t("modules.m3Title"), body: t("modules.m3Body") },
    { title: t("modules.m4Title"), body: t("modules.m4Body") },
    { title: t("modules.m5Title"), body: t("modules.m5Body") },
    { title: t("modules.m6Title"), body: t("modules.m6Body") },
    { title: t("modules.m7Title"), body: t("modules.m7Body") },
    { title: t("modules.m8Title"), body: t("modules.m8Body") }
  ];

  const reasons = [
    t("reasons.r1"),
    t("reasons.r2"),
    t("reasons.r3"),
    t("reasons.r4"),
    t("reasons.r5")
  ];

  return (
    <div className={`${display.variable} ${body.variable} space-y-16 font-[var(--font-body)]`}>
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 px-6 py-10 shadow-[0_40px_120px_-80px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 sm:px-10 sm:py-14">
        <div className="grid-lines absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(14,116,144,0.35),_transparent_70%)] blur-2xl" aria-hidden="true" />
        <div className="absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(217,119,6,0.28),_transparent_70%)] blur-2xl" aria-hidden="true" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <Link
              href={`${base}/systems`}
              className="inline-flex text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {t("back")}
            </Link>
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
              <p className="max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {t("subcopy")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href={buildWhatsAppLink()} target="_blank" rel="noreferrer">
                  {t("ctaPrimary")}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={buildWhatsAppLink()} target="_blank" rel="noreferrer">
                  {t("ctaSecondary")}
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.6)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {t("valueTitle")}
              </div>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {valueProps.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-500" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-950/70">
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("problemTitle")}
            </div>
            <h2 className="text-2xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white">
              {t("problemHeadline")}
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {t("problemBody")}
            </p>
          </div>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_30px_90px_-70px_rgba(15,23,42,0.6)] dark:border-slate-800">
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {t("solutionTitle")}
            </div>
            <h2 className="text-2xl font-[var(--font-display)] font-semibold">
              {t("solutionHeadline")}
            </h2>
            <p className="text-sm leading-relaxed text-slate-200">
              {t("solutionBody")}
            </p>
          </div>
        </article>
      </section>

      <section className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white">
            {t("outcomesTitle")}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {outcomes.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
            >
              <div className="text-lg font-semibold text-slate-900 dark:text-white">{item.title}</div>
              <p className="mt-2 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white">
            {t("modulesTitle")}
          </h2>
          <p className="max-w-3xl text-base text-slate-600 dark:text-slate-300">
            {t("modulesBody")}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
            >
              <div className="text-base font-semibold text-slate-900 dark:text-white">{item.title}</div>
              <p className="mt-2 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-50/80 px-6 py-10 dark:border-slate-800 dark:bg-slate-950/60 sm:px-10">
        <div className="space-y-3">
          <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white">
            {t("agentsTitle")}
          </h2>
          <p className="max-w-3xl text-base text-slate-600 dark:text-slate-300">
            {t("agentsBody")}
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {AGENT_PRODUCTS.map((agent) => (
            <Link
              key={agent.key}
              href={`${base}/agents/${agent.key}`}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-5 text-sm shadow-sm transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/70"
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

      <section className="rounded-3xl border border-slate-200 bg-white/90 px-6 py-10 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-950/70 sm:px-10">
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {t("proofTitle")}
          </div>
          <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white">
            {t("proofHeadline")}
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {t("proofBody")}
          </p>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {t("proofNote")}
          </p>
          <Button asChild variant="outline">
            <Link href={`${base}/projects`}>{t("proofCta")}</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white">
            {t("reasonsTitle")}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reasons.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 px-6 py-10 text-white shadow-[0_40px_120px_-80px_rgba(15,23,42,0.6)] dark:border-slate-800 sm:px-10 sm:py-12">
        <div className="absolute inset-0 opacity-70" aria-hidden="true">
          <div className="absolute -left-32 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(45,212,191,0.35),_transparent_70%)] blur-2xl" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.3),_transparent_70%)] blur-2xl" />
        </div>
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <h2 className="text-3xl font-[var(--font-display)] font-semibold">{t("finalTitle")}</h2>
            <p className="max-w-3xl text-base text-slate-200">{t("finalBody")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="secondary">
              <Link href={buildWhatsAppLink()} target="_blank" rel="noreferrer">
                {t("finalPrimary")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={buildWhatsAppLink()} target="_blank" rel="noreferrer">
                {t("finalSecondary")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
