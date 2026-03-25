import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { PublicConciergeChat } from "./public-concierge-chat";
import { MarketingHeroCarousel } from "./marketing-hero-carousel";
import { AGENT_PRODUCTS } from "./agents/agent-products";
import { formatNewsDate, getPublishedNewsPosts } from "@/lib/news";
import { getPublicSiteAssets } from "@/lib/site-assets";
import { SiteAssetSection } from "@trends172tech/db";

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

const LUNA_HERO_VISUALS = [
  "/marketing/luna/luna-hero-dark.png",
  "/marketing/luna/luna-hero-light.png",
  "/marketing/home/luna-operations-core.svg",
  "/marketing/home/luna-role-panels.svg",
  "/marketing/home/luna-executive-intelligence.svg"
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const home = await getTranslations("home");
  const agents = await getTranslations("agents");
  const projects = await getTranslations("projectsPage");
  const { locale } = await params;
  const base = `/${locale}`;
  const uiCopy = locale.startsWith("es")
    ? {
        showcaseMeta: [
          { status: "Stack activo", detail: "Modulo de sistema", accent: "bg-emerald-500" },
          { status: "Modo de entrega", detail: "Caso de implementacion", accent: "bg-amber-600" },
          { status: "Feed de inteligencia", detail: "Flujo ejecutivo", accent: "bg-slate-900" }
        ],
        advisorySignals: [
          "Intake IA activo",
          "Ruteo de leads listo",
          "Guia empresarial",
          "Escalamiento humano consciente"
        ],
        productModule: "Modulo de producto",
        active: "Activo",
        highlights: "Puntos clave",
        surface: "Superficie",
        premiumControlPanel: "Panel premium de control",
        operationalNotes: "Notas operativas",
        ready: "Listo",
        systemBlock: "Bloque del sistema",
        consoleOnline: "Consola en linea",
        sequence: "Secuencia",
        executiveNewsSignal: "Senal ejecutiva",
        advisoryBlock: "Bloque de consultoria",
        salesReadiness: "Preparacion comercial",
        deploymentLogic: "Logica de despliegue",
        brief: "Resumen"
      }
    : {
        showcaseMeta: [
          { status: "Live stack", detail: "System module", accent: "bg-emerald-500" },
          { status: "Delivery mode", detail: "Implementation case", accent: "bg-amber-600" },
          { status: "Intel feed", detail: "Executive stream", accent: "bg-slate-900" }
        ],
        advisorySignals: [
          "AI intake live",
          "Lead routing ready",
          "Enterprise guidance",
          "Human handoff aware"
        ],
        productModule: "Product module",
        active: "Active",
        highlights: "Highlights",
        surface: "Surface",
        premiumControlPanel: "Premium control panel",
        operationalNotes: "Operational notes",
        ready: "Ready",
        systemBlock: "System block",
        consoleOnline: "Console online",
        sequence: "Sequence",
        executiveNewsSignal: "Executive news signal",
        advisoryBlock: "Advisory block",
        salesReadiness: "Sales readiness",
        deploymentLogic: "Deployment logic",
        brief: "Brief"
      };
  const publishedNews = await getPublishedNewsPosts(locale, 3);
  const [heroAssets, showcaseAssets] = await Promise.all([
    getPublicSiteAssets(SiteAssetSection.HOME_HERO, locale),
    getPublicSiteAssets(SiteAssetSection.HOME_SHOWCASE, locale)
  ]);

  const metrics = [
    { value: home("metrics.m1Value"), label: home("metrics.m1Label") },
    { value: home("metrics.m2Value"), label: home("metrics.m2Label") },
    { value: home("metrics.m3Value"), label: home("metrics.m3Label") }
  ];

  const fallbackCarouselItems = [
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
      image: "/marketing/home/luna-pwa-commerce.svg",
      href: `${base}/systems/luna`,
      cta: home("carousel.slides.s2Cta")
    },
    {
      eyebrow: home("carousel.slides.s3Eyebrow"),
      title: home("carousel.slides.s3Title"),
      body: home("carousel.slides.s3Body"),
      image: "/marketing/home/luna-operations-core.svg",
      href: `${base}/systems/luna`,
      cta: home("carousel.slides.s3Cta")
    },
    {
      eyebrow: home("carousel.slides.s4Eyebrow"),
      title: home("carousel.slides.s4Title"),
      body: home("carousel.slides.s4Body"),
      image: "/marketing/home/luna-role-panels.svg",
      href: `${base}/systems/luna`,
      cta: home("carousel.slides.s4Cta")
    },
    {
      eyebrow: home("carousel.slides.s5Eyebrow"),
      title: home("carousel.slides.s5Title"),
      body: home("carousel.slides.s5Body"),
      image: "/marketing/home/luna-executive-intelligence.svg",
      href: `${base}/systems/luna`,
      cta: home("carousel.slides.s5Cta")
    }
  ];

  const carouselItems =
    (heroAssets.length > 0
      ? heroAssets.map((asset) => ({
          eyebrow: asset.eyebrow ?? asset.badge ?? "",
          title: asset.title,
          body: asset.body,
          image: asset.imageUrl,
          href: asset.ctaHref ?? `${base}/systems/luna`,
          cta: asset.ctaLabel ?? home("carouselSecondaryCta")
        }))
      : fallbackCarouselItems
    ).map((item, index) => ({
      ...item,
      image: LUNA_HERO_VISUALS[index] ?? item.image
    }));

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

  const featuredAgents = AGENT_PRODUCTS.map((agent) => ({
    key: agent.key,
    name: agents(`${agent.key}.name`),
    tagline: agents(`${agent.key}.tagline`)
  }));

  const fallbackShowcaseCards = [
    {
      label: home("solutionLines.cards.agents.title"),
      title: home("agentLineupTitle"),
      body: home("solutionLines.cards.agents.body"),
      image: "/marketing/home/agent-sales-velocity.svg",
      href: `${base}/agents`,
      cta: home("solutionLines.cards.agents.cta"),
      highlights: featuredAgents.slice(0, 3).map((agent) => agent.name)
    },
    {
      label: projects("projectBadge"),
      title: projects("projects.carpihogar.title"),
      body: projects("projects.carpihogar.body"),
      image: "/marketing/home/case-carpihogar-pwa.svg",
      href: `${base}/projects`,
      cta: projects("projectCta"),
      highlights: [
        projects("projects.carpihogar.tagline1"),
        projects("projects.carpihogar.tagline2"),
        home("solutionLines.cards.systems.highlights.h3")
      ]
    },
    {
      label: home("newsroomEyebrow"),
      title: home("newsroomTitle"),
      body: home("newsroomBody"),
      image: "/marketing/home/case-executive-reporting.svg",
      href: `${base}/news`,
      cta: home("newsroomCta"),
      highlights: [
        home("newsroom.cards.n1Title"),
        home("newsroom.cards.n2Title"),
        home("newsroom.cards.n3Title")
      ]
    }
  ];

  const showcaseCards =
    showcaseAssets.length > 0
      ? showcaseAssets.map((asset) => ({
          label: asset.badge ?? asset.eyebrow ?? home("subheroSection.eyebrow"),
          title: asset.title,
          body: asset.body,
          image: asset.imageUrl,
          href: asset.ctaHref ?? `${base}/systems/luna`,
          cta: asset.ctaLabel ?? home("ctaPrimary"),
          highlights: asset.highlights
        }))
      : fallbackShowcaseCards;

  const premiumPoints = [
    home("capabilities.c1Title"),
    home("capabilities.c2Title"),
    home("capabilities.c3Title"),
    home("capabilities.c4Title")
  ];
  const processSteps = [
    { step: "01", title: home("processSteps.p1Title"), body: home("processSteps.p1Body") },
    { step: "02", title: home("processSteps.p2Title"), body: home("processSteps.p2Body") },
    { step: "03", title: home("processSteps.p3Title"), body: home("processSteps.p3Body") },
    { step: "04", title: home("processSteps.p4Title"), body: home("processSteps.p4Body") }
  ];

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
    <div className={`${display.variable} ${body.variable} bg-[linear-gradient(180deg,#f6f8fb_0%,#ffffff_18%,#f8fafc_100%)] font-[var(--font-body)] text-slate-900 dark:bg-slate-950`}>
      <MarketingHeroCarousel
        items={carouselItems}
        metrics={metrics}
        locale={locale}
        secondaryHref={`${base}/systems/luna`}
        secondaryCta={home("carouselSecondaryCta")}
      />

      <div className="flex w-full flex-col gap-[4.5rem] py-10 lg:gap-24 lg:py-14">
        <section className="w-full">
          <div className="mx-auto flex w-full max-w-[1760px] flex-col gap-8 px-6 sm:px-8 lg:gap-10 lg:px-12 xl:px-16 2xl:px-20">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="reveal space-y-4">
                <div className="inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.25)]">
                  {home("subheroSection.eyebrow")}
                </div>
                <div className="space-y-4">
                  <h2 className="max-w-4xl text-3xl font-[var(--font-display)] font-semibold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                    {home("subheroSection.title")}
                  </h2>
                  <p className="max-w-4xl text-base leading-relaxed text-slate-600 sm:text-lg">
                    {home("subheroSection.body")}
                  </p>
                </div>
              </div>
              <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
                {premiumPoints.map((point, index) => (
                  <div
                    key={point}
                    className={`interactive-panel reveal rounded-[24px] border border-black/8 bg-white/88 px-4 py-4 text-sm text-slate-700 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.35)] backdrop-blur ${
                      index === 0 ? "reveal-delay-1" : index === 1 ? "reveal-delay-2" : "reveal-delay-3"
                    }`}
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              {showcaseCards.map((card, index) => (
                <article
                  key={card.title}
                  className="group interactive-panel premium-spotlight overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.96)_100%)] shadow-[0_36px_100px_-64px_rgba(15,23,42,0.34)] backdrop-blur transition hover:shadow-[0_48px_120px_-68px_rgba(15,23,42,0.4)]"
                >
                  <div className="flex items-center justify-between border-b border-black/6 px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        {card.label}
                      </div>
                      <div className="text-sm font-semibold text-slate-900">{uiCopy.showcaseMeta[index]?.detail ?? uiCopy.productModule}</div>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/86 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      <span className={`h-2 w-2 rounded-full ${uiCopy.showcaseMeta[index]?.accent ?? "bg-slate-900"}`} />
                      <span>{uiCopy.showcaseMeta[index]?.status ?? uiCopy.active}</span>
                    </div>
                  </div>
                  <div className="grid gap-5 p-6">
                    <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-[2rem] font-[var(--font-display)] font-semibold leading-[1] tracking-[-0.04em] text-slate-900">
                            {card.title}
                          </h3>
                          <p className="text-sm leading-relaxed text-slate-600">{card.body}</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="interactive-panel rounded-[22px] border border-black/8 bg-white/86 px-4 py-4">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                              {uiCopy.highlights}
                            </div>
                            <div className="mt-2 text-2xl font-[var(--font-display)] font-semibold tracking-[-0.04em] text-slate-950">
                              {String(card.highlights.length).padStart(2, "0")}
                            </div>
                          </div>
                          <div className="interactive-panel rounded-[22px] border border-black/8 bg-white/86 px-4 py-4">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                              {uiCopy.surface}
                            </div>
                            <div className="mt-2 text-sm font-semibold text-slate-900">
                              {uiCopy.premiumControlPanel}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="premium-metal interactive-panel relative min-h-[240px] overflow-hidden rounded-[28px] border border-black/8 bg-slate-100 p-3 shadow-[0_28px_80px_-60px_rgba(15,23,42,0.35)]">
                        <div className="absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.94)_50%,transparent_100%)]" aria-hidden="true" />
                        <div className="relative h-full overflow-hidden rounded-[22px] border border-white/65 bg-white/40">
                          <Image
                            src={card.image}
                            alt={card.title}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-[1.03]"
                            sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 24vw, (min-width: 768px) 50vw, 100vw"
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.18)_0%,transparent_28%,rgba(255,255,255,0.16)_56%,transparent_72%,rgba(15,23,42,0.12)_100%)]" aria-hidden="true" />
                        </div>
                      </div>
                    </div>
                    <div className="interactive-panel rounded-[26px] border border-black/8 bg-white/84 px-5 py-5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                          {uiCopy.operationalNotes}
                        </div>
                        <div className="rounded-full border border-black/8 bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                          {uiCopy.ready}
                        </div>
                      </div>
                      <ul className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                        {card.highlights.map((highlight) => (
                          <li
                            key={highlight}
                            className="flex items-start gap-3 rounded-[18px] border border-black/6 bg-slate-50/80 px-3 py-3"
                          >
                            <span className="mt-1.5 h-2 w-2 rounded-full bg-[#8b5e34]" aria-hidden="true" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {uiCopy.showcaseMeta[index]?.detail ?? uiCopy.systemBlock}
                      </div>
                      <Link
                        href={card.href}
                        className="interactive-chip inline-flex items-center justify-center rounded-full border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
                      >
                        {card.cta}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="premium-noise relative w-full overflow-hidden border-y border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] py-12 shadow-[0_35px_90px_-70px_rgba(15,23,42,0.18)]">
          <div className="premium-grid absolute inset-0 opacity-60" aria-hidden="true" />
          <div className="relative mx-auto grid w-full max-w-[1760px] gap-8 px-6 sm:px-8 lg:px-12 xl:grid-cols-[0.82fr_1.18fr] xl:px-16 2xl:px-20">
            <div className="interactive-panel premium-spotlight relative overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f7fafc_100%)] p-7 shadow-[0_35px_90px_-70px_rgba(15,23,42,0.35)] sm:p-8 lg:p-9">
              <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.96)_50%,transparent_100%)]" aria-hidden="true" />
              <div className="relative space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {home("advisorySection.eyebrow")}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-slate-950 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>{uiCopy.consoleOnline}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="max-w-3xl text-3xl font-[var(--font-display)] font-semibold tracking-[-0.04em] text-slate-900 sm:text-4xl lg:text-5xl">
                    {home("advisorySection.title")}
                  </h2>
                  <p className="max-w-2xl text-base leading-relaxed text-slate-600">
                    {home("advisorySection.body")}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {uiCopy.advisorySignals.map((signal) => (
                    <div
                      key={signal}
                      className="interactive-panel rounded-[22px] border border-black/8 bg-white/88 px-4 py-4 text-sm font-medium text-slate-700 shadow-[0_18px_45px_-36px_rgba(15,23,42,0.24)]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span>{signal}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid gap-4">
                  <div className="interactive-panel rounded-[24px] border border-black/8 bg-white/92 px-5 py-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {uiCopy.advisoryBlock}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-700">
                      {home("advisorySection.cards.c1")}
                    </p>
                  </div>
                  <div className="interactive-panel rounded-[24px] border border-black/8 bg-white/92 px-5 py-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {uiCopy.salesReadiness}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-700">
                      {home("advisorySection.cards.c2")}
                    </p>
                  </div>
                  <div className="interactive-panel rounded-[24px] border border-black/8 bg-white/92 px-5 py-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {uiCopy.deploymentLogic}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-700">
                      {home("advisorySection.cards.c3")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <PublicConciergeChat copy={intakeCopy} />
          </div>
        </section>

        <section className="w-full">
          <div className="mx-auto grid w-full max-w-[1760px] gap-8 px-6 sm:px-8 lg:px-12 xl:grid-cols-[0.95fr_1.05fr] xl:px-16 2xl:px-20">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {home("salesStrategy.eyebrow")}
                </div>
                <h2 className="max-w-4xl text-3xl font-[var(--font-display)] font-semibold text-slate-900 sm:text-4xl lg:text-5xl">
                  {home("salesStrategy.title")}
                </h2>
                <p className="max-w-3xl text-base text-slate-600">{home("salesStrategy.body")}</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {processSteps.map((step) => (
                  <div
                    key={step.step}
                    className="interactive-panel premium-spotlight rounded-[26px] border border-black/8 bg-white/92 px-5 py-5 text-sm text-slate-600 shadow-[0_24px_64px_-52px_rgba(15,23,42,0.3)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        {step.step}
                      </div>
                      <div className="rounded-full border border-black/8 bg-white/84 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {uiCopy.sequence}
                      </div>
                    </div>
                    <div className="mt-4 text-base font-semibold text-slate-900">{step.title}</div>
                    <p className="mt-2 leading-relaxed">{step.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="interactive-panel space-y-6 rounded-[32px] border border-black/8 bg-white/92 p-7 shadow-[0_35px_90px_-70px_rgba(15,23,42,0.3)] sm:p-8 lg:p-9">
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {home("salesPlaybook.eyebrow")}
                </div>
                <h3 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900 lg:text-4xl">
                  {home("salesPlaybook.title")}
                </h3>
                <p className="max-w-2xl text-base text-slate-600">
                  {home("salesPlaybook.body")}
                </p>
              </div>
              <div className="grid gap-4">
                <div className="interactive-panel rounded-[24px] border border-black/8 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                  {home("salesPlaybook.cards.c1")}
                </div>
                <div className="interactive-panel rounded-[24px] border border-black/8 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                  {home("salesPlaybook.cards.c2")}
                </div>
                <div className="interactive-panel rounded-[24px] border border-black/8 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                  {home("salesPlaybook.cards.c3")}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative w-full overflow-hidden border-y border-black/8 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_40%,#f8fafc_100%)] py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(15,23,42,0.08),_transparent_22%),radial-gradient(circle_at_left,_rgba(120,53,15,0.08),_transparent_18%)]" aria-hidden="true" />
          <div className="relative mx-auto w-full max-w-[1760px] space-y-6 px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {home("newsroomEyebrow")}
                </div>
                <h2 className="max-w-4xl text-3xl font-[var(--font-display)] font-semibold text-slate-900 sm:text-4xl lg:text-5xl">
                  {home("newsroomTitle")}
                </h2>
                <p className="max-w-4xl text-base text-slate-600">{home("newsroomBody")}</p>
              </div>
              <Link
                href={`${base}/news`}
                className="interactive-chip inline-flex items-center justify-center rounded-full border border-slate-900 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
              >
                {home("newsroomCta")}
              </Link>
            </div>
            <div className="grid gap-4 xl:grid-cols-3">
              {newsroomItems.map((item) => (
                <article
                  key={item.title}
                  className="interactive-panel premium-spotlight rounded-[26px] border border-black/8 bg-white/92 px-5 py-5 text-sm text-slate-600 shadow-[0_24px_64px_-52px_rgba(15,23,42,0.3)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {item.category}
                    </div>
                    <div className="rounded-full border border-black/8 bg-white/86 px-3 py-1 text-[11px] font-semibold text-slate-500">
                      {item.date ?? uiCopy.brief}
                    </div>
                  </div>
                  <div className="mt-4 text-base font-semibold text-slate-900">{item.title}</div>
                  <p className="mt-2 leading-relaxed">{item.body}</p>
                  <div className="mt-4 h-px w-full bg-[linear-gradient(90deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.02)_100%)]" />
                  <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {uiCopy.executiveNewsSignal}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative w-full overflow-hidden border-y border-black/8 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_55%,#eef2f7_100%)] py-12 shadow-[0_45px_120px_-85px_rgba(15,23,42,0.18)]">
          <div className="absolute inset-0 opacity-70" aria-hidden="true">
            <div className="absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(120,53,15,0.12),_transparent_70%)] blur-2xl" />
            <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.12),_transparent_70%)] blur-2xl" />
          </div>
          <div className="relative z-10 mx-auto flex w-full max-w-[1760px] flex-col gap-6 px-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12 xl:px-16 2xl:px-20">
            <div className="space-y-3">
              <h2 className="max-w-4xl text-3xl font-[var(--font-display)] font-semibold text-slate-900 sm:text-4xl lg:text-5xl">
                {home("ctaTitle")}
              </h2>
              <p className="max-w-4xl text-base text-slate-600">{home("ctaBody")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`${base}/systems/luna`}
                className="interactive-chip inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
              >
                {home("ctaPrimary")}
              </Link>
              <Link
                href={`${base}/agents`}
                className="interactive-chip inline-flex items-center justify-center rounded-full border border-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
              >
                {home("ctaSecondary")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
