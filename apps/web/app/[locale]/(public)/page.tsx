import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { PublicConciergeChat } from "./public-concierge-chat";
import { MarketingHeroCarousel } from "./marketing-hero-carousel";
import { AGENT_PRODUCTS } from "./agents/agent-products";
import { formatNewsDate, getPublishedNewsPosts } from "@/lib/news";

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
  const home = await getTranslations("home");
  const agents = await getTranslations("agents");
  const { locale } = await params;
  const base = `/${locale}`;
  const publishedNews = await getPublishedNewsPosts(locale, 3);

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

  const carouselItems = [
    {
      eyebrow: home("carousel.slides.s1Eyebrow"),
      title: home("carousel.slides.s1Title"),
      body: home("carousel.slides.s1Body"),
      image: "/marketing/home/luna-command-center.svg",
      href: `${base}/systems/luna`,
      cta: home("carousel.slides.s1Cta")
    },
    {
      eyebrow: home("carousel.slides.s2Eyebrow"),
      title: home("carousel.slides.s2Title"),
      body: home("carousel.slides.s2Body"),
      image: "/marketing/home/agent-sales-velocity.svg",
      href: `${base}/agents/sales`,
      cta: home("carousel.slides.s2Cta")
    },
    {
      eyebrow: home("carousel.slides.s3Eyebrow"),
      title: home("carousel.slides.s3Title"),
      body: home("carousel.slides.s3Body"),
      image: "/marketing/home/agent-support-voice.svg",
      href: `${base}/agents/support`,
      cta: home("carousel.slides.s3Cta")
    },
    {
      eyebrow: home("carousel.slides.s4Eyebrow"),
      title: home("carousel.slides.s4Title"),
      body: home("carousel.slides.s4Body"),
      image: "/marketing/home/case-carpihogar-pwa.svg",
      href: `${base}/systems/luna`,
      cta: home("carousel.slides.s4Cta")
    },
    {
      eyebrow: home("carousel.slides.s5Eyebrow"),
      title: home("carousel.slides.s5Title"),
      body: home("carousel.slides.s5Body"),
      image: "/marketing/home/case-executive-reporting.svg",
      href: `${base}/systems/luna`,
      cta: home("carousel.slides.s5Cta")
    },
    {
      eyebrow: home("carousel.slides.s6Eyebrow"),
      title: home("carousel.slides.s6Title"),
      body: home("carousel.slides.s6Body"),
      image: "/marketing/home/case-operations-flow.svg",
      href: `${base}/projects`,
      cta: home("carousel.slides.s6Cta")
    }
  ];

  const intakeCopy = {
    locale,
    intakeBadge: home("intakeBadge"),
    intakeTitle: home("intakeTitle"),
    intakeSubtitle: home("intakeSubtitle"),
    intakeNote: home("intakeNote"),
    chatPlaceholder: home("chatPlaceholder"),
    chatClearLabel: home("chatClearLabel"),
    chatSuggestionsTitle: home("chatSuggestionsTitle"),
    chatSuggestions: [
      {
        label: home("chatSuggestions.s1Label"),
        prompt: home("chatSuggestions.s1Prompt")
      },
      {
        label: home("chatSuggestions.s2Label"),
        prompt: home("chatSuggestions.s2Prompt")
      }
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
        { label: home("sidebarNavPayments"), href: `${base}/recharge` },
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

  const solutionLines = [
    {
      title: home("solutionLines.cards.agents.title"),
      body: home("solutionLines.cards.agents.body"),
      cta: home("solutionLines.cards.agents.cta"),
      href: `${base}/agents`,
      highlights: [
        home("solutionLines.cards.agents.highlights.h1"),
        home("solutionLines.cards.agents.highlights.h2"),
        home("solutionLines.cards.agents.highlights.h3")
      ]
    },
    {
      title: home("solutionLines.cards.systems.title"),
      body: home("solutionLines.cards.systems.body"),
      cta: home("solutionLines.cards.systems.cta"),
      href: `${base}/systems/luna`,
      highlights: [
        home("solutionLines.cards.systems.highlights.h1"),
        home("solutionLines.cards.systems.highlights.h2"),
        home("solutionLines.cards.systems.highlights.h3")
      ]
    }
  ];

  const featuredAgents = AGENT_PRODUCTS.map((agent) => ({
    key: agent.key,
    name: agents(`${agent.key}.name`),
    tagline: agents(`${agent.key}.tagline`)
  }));

  const newsroomItems =
    publishedNews.length > 0
      ? publishedNews.map((post) => ({
          title: post.title,
          body: post.summary,
          category: post.category,
          date: formatNewsDate(post.publishedAt, locale)
        }))
      : [
          {
            title: home("newsroom.cards.n1Title"),
            body: home("newsroom.cards.n1Body"),
            category: home("newsroom.fallbackCategory"),
            date: null
          },
          {
            title: home("newsroom.cards.n2Title"),
            body: home("newsroom.cards.n2Body"),
            category: home("newsroom.fallbackCategory"),
            date: null
          },
          {
            title: home("newsroom.cards.n3Title"),
            body: home("newsroom.cards.n3Body"),
            category: home("newsroom.fallbackCategory"),
            date: null
          }
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
                  href={`${base}/recharge`}
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
            <MarketingHeroCarousel
              items={carouselItems}
              metrics={metrics}
              secondaryHref={`${base}/systems/luna`}
              secondaryCta={home("carouselSecondaryCta")}
            />

            <PublicConciergeChat copy={intakeCopy} />

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
                <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
                  {home("processBody")}
                </p>
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

            <section className="space-y-6">
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {home("solutionLinesEyebrow")}
                </div>
                <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white">
                  {home("solutionLinesTitle")}
                </h2>
                <p className="max-w-3xl text-base text-slate-600 dark:text-slate-300">
                  {home("solutionLinesBody")}
                </p>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                {solutionLines.map((line) => (
                  <article
                    key={line.title}
                    className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <div className="space-y-4">
                      <h3 className="text-2xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white">
                        {line.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {line.body}
                      </p>
                      <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        {line.highlights.map((highlight) => (
                          <li key={highlight} className="flex items-start gap-2">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-500" aria-hidden="true" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={line.href}
                        className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
                      >
                        {line.cta}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="space-y-3">
                  <h3 className="text-2xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white">
                    {home("agentLineupTitle")}
                  </h3>
                  <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300">
                    {home("agentLineupBody")}
                  </p>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {featuredAgents.map((agent) => (
                    <Link
                      key={agent.key}
                      href={`${base}/agents/${agent.key}`}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm shadow-sm transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/70"
                    >
                      <div className="font-semibold text-slate-900 dark:text-white">{agent.name}</div>
                      <p className="mt-2 text-slate-600 dark:text-slate-300">{agent.tagline}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {home("newsroomEyebrow")}
                  </div>
                  <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white">
                    {home("newsroomTitle")}
                  </h2>
                  <p className="max-w-3xl text-base text-slate-600 dark:text-slate-300">
                    {home("newsroomBody")}
                  </p>
                </div>
                <Link
                  href={`${base}/news`}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
                >
                  {home("newsroomCta")}
                </Link>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {newsroomItems.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {item.category}
                      {item.date ? ` - ${item.date}` : ""}
                    </div>
                    <div className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </div>
                    <p className="mt-2 leading-relaxed">{item.body}</p>
                  </article>
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
                  <h2 className="text-3xl font-[var(--font-display)] font-semibold">
                    {home("ctaTitle")}
                  </h2>
                  <p className="max-w-2xl text-base text-slate-200">{home("ctaBody")}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`${base}/systems/luna`}
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_20px_40px_-20px_rgba(15,23,42,0.6)] transition hover:-translate-y-0.5 hover:bg-slate-100"
                  >
                    {home("ctaPrimary")}
                  </Link>
                  <Link
                    href={`${base}/agents`}
                    className="inline-flex items-center justify-center rounded-full border border-slate-500 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:border-slate-300"
                  >
                    {home("ctaSecondary")}
                  </Link>
                </div>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 px-6 py-10 shadow-[0_35px_90px_-70px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950/60 sm:px-10 sm:py-12">
              <div className="space-y-3">
                <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white">
                  {home("clientsTitle")}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {home("clientsNote")}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
