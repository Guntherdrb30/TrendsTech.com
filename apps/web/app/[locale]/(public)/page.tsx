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

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const home = await getTranslations("home");
  const agents = await getTranslations("agents");
  const projects = await getTranslations("projectsPage");
  const { locale } = await params;
  const base = `/${locale}`;
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
    heroAssets.length > 0
      ? heroAssets.map((asset) => ({
          eyebrow: asset.eyebrow ?? asset.badge ?? "",
          title: asset.title,
          body: asset.body,
          image: asset.imageUrl,
          href: asset.ctaHref ?? `${base}/systems/luna`,
          cta: asset.ctaLabel ?? home("carouselSecondaryCta")
        }))
      : fallbackCarouselItems;

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
    <div className={`${display.variable} ${body.variable} bg-[linear-gradient(180deg,#f8f7f2_0%,#f5efe7_38%,#ffffff_100%)] font-[var(--font-body)] text-slate-900 dark:bg-slate-950`}>
      <MarketingHeroCarousel
        items={carouselItems}
        metrics={metrics}
        secondaryHref={`${base}/systems/luna`}
        secondaryCta={home("carouselSecondaryCta")}
      />

      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-20 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="space-y-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex rounded-full border border-[#d7c7b4] bg-white/85 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a6b52] shadow-sm">
                {home("subheroSection.eyebrow")}
              </div>
              <div className="space-y-4">
                <h2 className="max-w-3xl text-3xl font-[var(--font-display)] font-semibold leading-tight text-slate-900 sm:text-4xl">
                  {home("subheroSection.title")}
                </h2>
                <p className="max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  {home("subheroSection.body")}
                </p>
              </div>
            </div>
            <div className="grid max-w-md gap-3">
              {premiumPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-2xl border border-[#e4d8ca] bg-white/80 px-4 py-4 text-sm text-slate-700 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.4)]"
                >
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {showcaseCards.map((card) => (
              <article
                key={card.title}
                className="group overflow-hidden rounded-[30px] border border-[#e4d8ca] bg-white/88 shadow-[0_30px_90px_-65px_rgba(15,23,42,0.3)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_45px_110px_-65px_rgba(15,23,42,0.38)]"
              >
                <div className="relative aspect-[5/4] overflow-hidden bg-[#efe8de]">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(min-width: 1280px) 28vw, (min-width: 768px) 50vw, 100vw"
                  />
                </div>
                <div className="space-y-4 p-6">
                  <div className="inline-flex rounded-full border border-[#e7d8c8] bg-[#fff9f4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a6b52]">
                    {card.label}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-[var(--font-display)] font-semibold text-slate-900">
                      {card.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600">{card.body}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {card.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#d97706]" aria-hidden="true" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={card.href}
                    className="inline-flex items-center justify-center rounded-full border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-900 hover:text-white"
                  >
                    {card.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-6 rounded-[32px] border border-[#e4d8ca] bg-[linear-gradient(180deg,#fffdfb_0%,#f5ede4_100%)] p-8 shadow-[0_35px_90px_-70px_rgba(15,23,42,0.35)]">
            <div className="inline-flex rounded-full border border-[#eadbca] bg-white/85 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a6b52]">
              {home("advisorySection.eyebrow")}
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900 sm:text-4xl">
                {home("advisorySection.title")}
              </h2>
              <p className="text-base leading-relaxed text-slate-600">
                {home("advisorySection.body")}
              </p>
            </div>
            <div className="grid gap-3">
              <div className="rounded-2xl border border-[#eadbca] bg-white/90 px-4 py-4 text-sm text-slate-700">
                {home("advisorySection.cards.c1")}
              </div>
              <div className="rounded-2xl border border-[#eadbca] bg-white/90 px-4 py-4 text-sm text-slate-700">
                {home("advisorySection.cards.c2")}
              </div>
              <div className="rounded-2xl border border-[#eadbca] bg-white/90 px-4 py-4 text-sm text-slate-700">
                {home("advisorySection.cards.c3")}
              </div>
            </div>
          </div>

          <PublicConciergeChat copy={intakeCopy} />
        </section>

        <section className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6b52]">
                {home("salesStrategy.eyebrow")}
              </div>
              <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900 sm:text-4xl">
                {home("salesStrategy.title")}
              </h2>
              <p className="max-w-2xl text-base text-slate-600">{home("salesStrategy.body")}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {processSteps.map((step) => (
                <div
                  key={step.step}
                  className="rounded-2xl border border-[#e7ddd1] bg-white/88 px-5 py-5 text-sm text-slate-600 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.3)]"
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6b52]">
                    {step.step}
                  </div>
                  <div className="mt-3 text-base font-semibold text-slate-900">{step.title}</div>
                  <p className="mt-2 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 rounded-[32px] border border-[#e4d8ca] bg-white/88 p-8 shadow-[0_35px_90px_-70px_rgba(15,23,42,0.3)]">
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6b52]">
                {home("salesPlaybook.eyebrow")}
              </div>
              <h3 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900">
                {home("salesPlaybook.title")}
              </h3>
              <p className="text-base text-slate-600">
                {home("salesPlaybook.body")}
              </p>
            </div>
            <div className="grid gap-4">
              <div className="rounded-2xl border border-[#eadbca] bg-[#fff9f4] px-4 py-4 text-sm text-slate-700">
                {home("salesPlaybook.cards.c1")}
              </div>
              <div className="rounded-2xl border border-[#eadbca] bg-[#fff9f4] px-4 py-4 text-sm text-slate-700">
                {home("salesPlaybook.cards.c2")}
              </div>
              <div className="rounded-2xl border border-[#eadbca] bg-[#fff9f4] px-4 py-4 text-sm text-slate-700">
                {home("salesPlaybook.cards.c3")}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6b52]">
                {home("newsroomEyebrow")}
              </div>
              <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900 sm:text-4xl">
                {home("newsroomTitle")}
              </h2>
              <p className="max-w-3xl text-base text-slate-600">{home("newsroomBody")}</p>
            </div>
            <Link
              href={`${base}/news`}
              className="inline-flex items-center justify-center rounded-full border border-slate-900 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-900 hover:text-white"
            >
              {home("newsroomCta")}
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {newsroomItems.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-[#e7ddd1] bg-white/88 px-5 py-5 text-sm text-slate-600 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.3)]"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a6b52]">
                  {item.category}
                  {item.date ? ` - ${item.date}` : ""}
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">{item.title}</div>
                <p className="mt-2 leading-relaxed">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[36px] border border-[#d9c7b2] bg-[linear-gradient(135deg,#fffaf5_0%,#f3eadf_60%,#e8ddd0_100%)] px-8 py-10 shadow-[0_45px_120px_-85px_rgba(15,23,42,0.35)] sm:px-10 sm:py-12">
          <div className="absolute inset-0 opacity-70" aria-hidden="true">
            <div className="absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(249,115,22,0.14),_transparent_70%)] blur-2xl" />
            <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,_rgba(14,165,233,0.14),_transparent_70%)] blur-2xl" />
          </div>
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900 sm:text-4xl">
                {home("ctaTitle")}
              </h2>
              <p className="max-w-3xl text-base text-slate-600">{home("ctaBody")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`${base}/systems/luna`}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                {home("ctaPrimary")}
              </Link>
              <Link
                href={`${base}/agents`}
                className="inline-flex items-center justify-center rounded-full border border-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-900 hover:text-white"
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
