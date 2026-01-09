import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { PublicConciergeChat } from "./public-concierge-chat";

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

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const t = await getTranslations("pages");
  const home = await getTranslations("home");
  const { locale } = await params;

  const metrics = [
    { value: home("metrics.m1Value"), label: home("metrics.m1Label") },
    { value: home("metrics.m2Value"), label: home("metrics.m2Label") },
    { value: home("metrics.m3Value"), label: home("metrics.m3Label") }
  ];

  const capabilities = [
    { title: home("capabilities.c1Title"), body: home("capabilities.c1Body") },
    { title: home("capabilities.c2Title"), body: home("capabilities.c2Body") },
    { title: home("capabilities.c3Title"), body: home("capabilities.c3Body") },
    { title: home("capabilities.c4Title"), body: home("capabilities.c4Body") }
  ];

  const stackItems = [
    home("stackItems.s1"),
    home("stackItems.s2"),
    home("stackItems.s3"),
    home("stackItems.s4")
  ];

  const processSteps = [
    { step: "01", title: home("processSteps.p1Title"), body: home("processSteps.p1Body") },
    { step: "02", title: home("processSteps.p2Title"), body: home("processSteps.p2Body") },
    { step: "03", title: home("processSteps.p3Title"), body: home("processSteps.p3Body") },
    { step: "04", title: home("processSteps.p4Title"), body: home("processSteps.p4Body") }
  ];

  const heroItems = [
    { title: home("heroCardItems.i1Title"), body: home("heroCardItems.i1Body") },
    { title: home("heroCardItems.i2Title"), body: home("heroCardItems.i2Body") },
    { title: home("heroCardItems.i3Title"), body: home("heroCardItems.i3Body") },
    { title: home("heroCardItems.i4Title"), body: home("heroCardItems.i4Body") }
  ];

  const intakeCopy = {
    locale,
    intakeBadge: home("intakeBadge"),
    intakeTitle: home("intakeTitle"),
    intakeSubtitle: home("intakeSubtitle"),
    intakeUrlLabel: home("intakeUrlLabel"),
    intakeUrlPlaceholder: home("intakeUrlPlaceholder"),
    intakeFileLabel: home("intakeFileLabel"),
    intakeDescriptionLabel: home("intakeDescriptionLabel"),
    intakeDescriptionPlaceholder: home("intakeDescriptionPlaceholder"),
    intakeCtaPrimary: home("intakeCtaPrimary"),
    intakeCtaSecondary: home("intakeCtaSecondary"),
    intakeNote: home("intakeNote"),
    intakeExamplesTitle: home("intakeExamplesTitle"),
    intakeExamples: [
      { label: home("intakeExamples.e1Label"), value: home("intakeExamples.e1Value") },
      { label: home("intakeExamples.e2Label"), value: home("intakeExamples.e2Value") },
      { label: home("intakeExamples.e3Label"), value: home("intakeExamples.e3Value") }
    ],
    intakePromiseTitle: home("intakePromiseTitle"),
    intakePromiseBody: home("intakePromiseBody"),
    chatTitle: home("chatTitle"),
    chatSubtitle: home("chatSubtitle"),
    chatActivate: home("chatActivate"),
    chatDeactivate: home("chatDeactivate"),
    chatPlaceholder: home("chatPlaceholder"),
    chatSend: home("chatSend"),
    chatVoiceInput: home("chatVoiceInput"),
    chatVoiceOutput: home("chatVoiceOutput"),
    chatListening: home("chatListening"),
    chatMemory: home("chatMemory"),
    chatReset: home("chatReset"),
    chatError: home("chatError")
  };

  return (
    <div className={`${display.variable} ${body.variable} space-y-16 font-[var(--font-body)]`}>
      <PublicConciergeChat copy={intakeCopy} />
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 px-6 py-10 shadow-[0_40px_120px_-80px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 sm:px-10 sm:py-14">
        <div className="grid-lines absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="absolute -right-28 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(14,116,144,0.35),_transparent_70%)] blur-2xl" aria-hidden="true" />
        <div className="absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(217,119,6,0.28),_transparent_70%)] blur-2xl" aria-hidden="true" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.6)]" />
              {home("eyebrow")}
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-[var(--font-display)] font-semibold leading-tight text-slate-900 dark:text-white sm:text-5xl">
                <span className="block">{t("homeTitle")}</span>
                <span className="block text-teal-700 dark:text-teal-300">{home("heroHeadline")}</span>
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
                {t("homeSubtitle")} {home("heroSubhead")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="agents"
                className="reveal inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(15,23,42,0.6)] transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                {home("heroCtaPrimary")}
              </Link>
              <Link
                href="pricing"
                className="reveal reveal-delay-1 inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 backdrop-blur transition hover:-translate-y-0.5 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
              >
                {home("heroCtaSecondary")}
              </Link>
            </div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{home("heroNote")}</p>

            <div className="grid gap-4 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="reveal reveal-delay-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 text-sm text-slate-600 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
                >
                  <div className="text-2xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white">
                    {metric.value}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal reveal-delay-3 relative">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.6)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                <span>{home("heroCardTitle")}</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-600 dark:text-emerald-300">
                  Live
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{home("heroCardSubtitle")}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {heroItems.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
                  >
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</div>
                    <div className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {item.body}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                Streamable HTTP · Node runtime · No cache
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white">
              {home("capabilitiesTitle")}
            </h2>
            <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
              {home("capabilitiesBody")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {capabilities.map((capability) => (
              <div
                key={capability.title}
                className="reveal rounded-2xl border border-slate-200 bg-white px-5 py-5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
              >
                <div className="text-base font-semibold text-slate-900 dark:text-white">
                  {capability.title}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {capability.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="reveal reveal-delay-2 relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 shadow-[0_30px_80px_-70px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <div className="absolute inset-0 opacity-70" aria-hidden="true">
            <div className="absolute -right-24 -top-16 h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.25),_transparent_70%)] blur-2xl" />
          </div>
          <div className="relative space-y-4">
            <h3 className="text-xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white">
              {home("stackTitle")}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{home("stackBody")}</p>
            <div className="flex flex-wrap gap-2">
              {stackItems.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
              SLAs, compliance, and governance ready.
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white">
            {home("processTitle")}
          </h2>
          <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">{home("processBody")}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          {processSteps.map((step) => (
            <div
              key={step.step}
              className="reveal rounded-2xl border border-slate-200 bg-white px-5 py-5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {step.step}
              </div>
              <div className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
                {step.title}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {step.body}
              </p>
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
            <h2 className="text-3xl font-[var(--font-display)] font-semibold">{home("ctaTitle")}</h2>
            <p className="max-w-2xl text-base text-slate-200">{home("ctaBody")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="pricing"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_20px_40px_-20px_rgba(15,23,42,0.6)] transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              {home("ctaPrimary")}
            </Link>
            <Link
              href="login"
              className="inline-flex items-center justify-center rounded-full border border-slate-500 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              {home("ctaSecondary")}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
