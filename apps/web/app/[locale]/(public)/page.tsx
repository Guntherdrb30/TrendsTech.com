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
  const base = `/${locale}`;

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
    intakeTitle: home("intakeTitle"),
    intakeSubtitle: home("intakeSubtitle"),
    intakeNote: home("intakeNote"),
    chatPlaceholder: home("chatPlaceholder"),
    chatClearLabel: home("chatClearLabel"),
    chatSuggestionsTitle: home("chatSuggestionsTitle"),
    chatSuggestions: [
      home("chatSuggestions.s1"),
      home("chatSuggestions.s2"),
      home("chatSuggestions.s3"),
      home("chatSuggestions.s4")
    ]
  };

  const sidebarSections = [
    {
      title: home("sidebarSectionCore"),
      items: [
        { label: home("sidebarNavDashboard"), href: `${base}/dashboard` },
        { label: home("sidebarNavAgents"), href: `${base}/dashboard/agents` },
        { label: home("sidebarNavInstalls"), href: `${base}/dashboard/installs` }
      ]
    },
    {
      title: home("sidebarSectionTeam"),
      items: [
        { label: home("sidebarNavUsers"), href: `${base}/dashboard/users` },
        { label: home("sidebarNavProfile"), href: `${base}/dashboard/profile` }
      ]
    },
    {
      title: home("sidebarSectionOps"),
      items: [
        { label: home("sidebarNavPricing"), href: `${base}/pricing` },
        { label: home("sidebarNavSupport"), href: `${base}/login` }
      ]
    }
  ];

  const sidebarFeatures = [
    home("sidebarFeatures.f1"),
    home("sidebarFeatures.f2"),
    home("sidebarFeatures.f3"),
    home("sidebarFeatures.f4"),
    home("sidebarFeatures.f5"),
    home("sidebarFeatures.f6")
  ];

  return (
    <div className={`${display.variable} ${body.variable} font-[var(--font-body)]`}>
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen px-4 lg:px-0">
        <div className="grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
        <aside className="relative overflow-hidden rounded-3xl border border-slate-900 bg-slate-950 text-white shadow-[0_40px_120px_-80px_rgba(15,23,42,0.8)] lg:sticky lg:top-6">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,208,199,0.18),_transparent_60%)]"
            aria-hidden="true"
          />
          <div className="relative space-y-6 px-5 py-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                {home("sidebarTitle")}
              </p>
              <p className="text-sm text-slate-300">{home("sidebarSubtitle")}</p>
            </div>

            <nav className="space-y-5 text-sm">
              {sidebarSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    {section.title}
                  </p>
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-2 text-slate-200 transition hover:text-white"
                      >
                        <span className="h-2 w-2 rounded-full bg-[#25d0c7]/70" aria-hidden="true" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4">
              <div className="text-sm font-semibold">{home("sidebarPaymentsTitle")}</div>
              <p className="mt-2 text-xs text-slate-300">{home("sidebarPaymentsBody")}</p>
              <Link
                href={`${base}/pricing`}
                className="mt-4 inline-flex items-center justify-center rounded-full border border-[#25d0c7] px-4 py-1.5 text-xs font-semibold text-[#25d0c7] transition hover:bg-[#25d0c7] hover:text-slate-950"
              >
                {home("sidebarPaymentsCta")}
              </Link>
              <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                {home("sidebarPaymentsNote")}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                {home("sidebarFeaturesTitle")}
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                {sidebarFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#25d0c7]" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <div className="space-y-16">
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
      </div>
      </div>
    </div>
  );
}
