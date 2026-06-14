import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { PublicConciergeChat } from "./public-concierge-chat";
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
  const { locale } = await params;
  const base = `/${locale}`;
  const isEs = locale.startsWith("es");

  const publishedNews = await getPublishedNewsPosts(locale, 3);

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
      { label: home("chatSuggestions.s1Label"), prompt: home("chatSuggestions.s1Prompt") },
      { label: home("chatSuggestions.s2Label"), prompt: home("chatSuggestions.s2Prompt") }
    ]
  };

  const metrics = [
    { value: home("metrics.m1Value"), label: home("metrics.m1Label") },
    { value: home("metrics.m2Value"), label: home("metrics.m2Label") },
    { value: home("metrics.m3Value"), label: home("metrics.m3Label") }
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
          { title: home("newsroom.cards.n1Title"), body: home("newsroom.cards.n1Body"), category: home("newsroom.fallbackCategory"), date: null },
          { title: home("newsroom.cards.n2Title"), body: home("newsroom.cards.n2Body"), category: home("newsroom.fallbackCategory"), date: null },
          { title: home("newsroom.cards.n3Title"), body: home("newsroom.cards.n3Body"), category: home("newsroom.fallbackCategory"), date: null }
        ];

  return (
    <div className={`${display.variable} ${body.variable} bg-[linear-gradient(180deg,#f6f8fb_0%,#ffffff_18%,#f8fafc_100%)] font-[var(--font-body)] text-slate-900`}>

      {/* ── HERO: compact brand header ── */}
      <section className="relative overflow-hidden border-b border-black/6 bg-[linear-gradient(180deg,#f3f6fa_0%,#ffffff_100%)] px-6 pb-10 pt-12 sm:px-8 lg:px-14 xl:px-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,191,165,0.08)_0%,transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(15,23,42,0.06)_0%,transparent_50%)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1760px]">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/92 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-[#00bfa5]" />
                  Trends172 Tech
                </div>
                <div className="rounded-full border border-black/8 bg-white/72 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
                  {isEs ? "Tecnología empresarial" : "Enterprise technology"}
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-[var(--font-display)] font-semibold leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-[3.4rem]">
                  {isEs
                    ? <>El sistema que <span className="text-[#00bfa5]">impulsa</span> tu empresa.</>
                    : <>The system that <span className="text-[#00bfa5]">drives</span> your business.</>}
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  {isEs
                    ? "Centraliza tu operación con Luna ERP o despliega agentes IA para atender, vender y crecer. Cuéntale al asesor sobre tu empresa y te orientamos."
                    : "Centralize your operations with Luna ERP or deploy AI agents to serve, sell and grow. Tell the advisor about your business and we'll guide you."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`${base}/systems/luna`}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_35px_-18px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  🌙 {isEs ? "Ver Luna ERP" : "See Luna ERP"}
                </Link>
                <Link
                  href={`${base}/crear-agente`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#00bfa5] bg-white px-5 py-2.5 text-sm font-semibold text-[#00897b] transition hover:-translate-y-0.5 hover:bg-[#f0fdf9]"
                >
                  🤖 {isEs ? "Crear mi agente" : "Create my agent"}
                </Link>
              </div>
            </div>

            {/* metrics */}
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-2">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-[22px] border border-black/8 bg-white/88 px-4 py-3 text-center shadow-sm lg:text-left"
                >
                  <div className="text-xl font-[var(--font-display)] font-semibold tracking-[-0.04em] text-slate-950 lg:text-2xl">
                    {m.value}
                  </div>
                  <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AGENT CHAT — main hero element ── */}
      <section className="relative overflow-hidden border-b border-black/6 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-10 sm:px-8 lg:px-14 lg:py-14 xl:px-20">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(0,191,165,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(15,23,42,0.06) 0%, transparent 50%)"
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1400px]">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#00897b]">
                {isEs ? "Asesor de IA · En línea" : "AI Advisor · Online"}
              </div>
              <h2 className="mt-1 text-2xl font-[var(--font-display)] font-semibold tracking-[-0.03em] text-slate-900 sm:text-3xl">
                {isEs ? "Habla con nuestro asesor ahora" : "Talk to our advisor now"}
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-500">
              {isEs
                ? "Comparte tu URL, describe tu empresa o sube un archivo. El asesor te dirá qué necesitas."
                : "Share your URL, describe your business or upload a file. The advisor will tell you what you need."}
            </p>
          </div>
          <PublicConciergeChat copy={intakeCopy} />
        </div>
      </section>

      {/* ── TWO PRODUCTS — informational strip ── */}
      <section className="border-b border-black/6 px-6 py-12 sm:px-8 lg:px-14 lg:py-16 xl:px-20">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-8 text-center">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
              {isEs ? "Nuestros productos" : "Our products"}
            </div>
            <h2 className="text-3xl font-[var(--font-display)] font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              {isEs ? "Dos formas de tecnificar tu empresa" : "Two ways to upgrade your business"}
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Luna ERP card */}
            <article className="group overflow-hidden rounded-[32px] border border-black/8 bg-white shadow-[0_24px_64px_-48px_rgba(15,23,42,0.28)] transition hover:shadow-[0_36px_90px_-52px_rgba(15,23,42,0.35)]">
              <div className="border-b border-black/6 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] px-7 py-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                    🌙
                  </div>
                  <div>
                    <h3 className="text-xl font-[var(--font-display)] font-semibold text-white">Luna ERP</h3>
                    <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
                      {isEs ? "ERP inteligente" : "Intelligent ERP"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-7 py-6">
                <p className="text-sm leading-relaxed text-slate-600">
                  {isEs
                    ? "Administración, finanzas, tienda online e inteligencia artificial en una sola plataforma. Modular, adaptable, hecho para crecer."
                    : "Administration, finance, online store and artificial intelligence on one platform. Modular, adaptable, built to grow."}
                </p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {(isEs
                    ? ["Gestión de ventas y órdenes", "Control de inventario", "Tienda online PWA", "Facturación electrónica", "Nómina y empleados", "Reportes ejecutivos con IA"]
                    : ["Sales and order management", "Inventory control", "PWA online store", "Electronic invoicing", "Payroll management", "AI executive reports"]
                  ).map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-[13px] text-slate-700">
                      <span className="text-[#00bfa5]">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center gap-3">
                  <Link
                    href={`${base}/systems/luna`}
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    {isEs ? "Ver Luna ERP" : "See Luna ERP"}
                  </Link>
                  <Link
                    href={`${base}/pricing`}
                    className="inline-flex items-center justify-center rounded-full border border-black/8 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                  >
                    {isEs ? "Ver planes" : "See plans"}
                  </Link>
                </div>
              </div>
            </article>

            {/* Agent Creator card */}
            <article className="group overflow-hidden rounded-[32px] border border-[#00bfa5]/25 bg-white shadow-[0_24px_64px_-48px_rgba(0,191,165,0.2)] transition hover:shadow-[0_36px_90px_-52px_rgba(0,191,165,0.28)]">
              <div className="border-b border-[#00bfa5]/20 bg-[linear-gradient(135deg,#00bfa5_0%,#00897b_100%)] px-7 py-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                    🤖
                  </div>
                  <div>
                    <h3 className="text-xl font-[var(--font-display)] font-semibold text-white">
                      {isEs ? "Agentes IA con Skills" : "AI Agents with Skills"}
                    </h3>
                    <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-[rgba(255,255,255,0.7)]">
                      {isEs ? "Para tu sitio web o negocio" : "For your website or business"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-7 py-6">
                <p className="text-sm leading-relaxed text-slate-600">
                  {isEs
                    ? "Crea un agente de atención al cliente especializado con skills de tu industria. Se integra en cualquier sitio web con un snippet de código."
                    : "Create a specialized customer service agent with industry-specific skills. Integrates into any website with a code snippet."}
                </p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {(isEs
                    ? ["Atención al cliente 24/7", "Skills por industria", "Captura de leads", "Integración con WhatsApp", "Análisis de URL de empresa", "Descarga de sesiones"]
                    : ["24/7 customer support", "Industry-specific skills", "Lead capture", "WhatsApp integration", "Business URL analysis", "Session downloads"]
                  ).map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-[13px] text-slate-700">
                      <span className="text-[#00bfa5]">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link
                    href={`${base}/crear-agente`}
                    className="inline-flex items-center justify-center rounded-full bg-[#00bfa5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00897b]"
                  >
                    {isEs ? "Crear mi agente con skills" : "Create my agent with skills"}
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ── NEWSROOM ── */}
      <section className="border-b border-black/6 px-6 py-12 sm:px-8 lg:px-14 lg:py-14 xl:px-20">
        <div className="mx-auto max-w-[1400px] space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                {home("newsroomEyebrow")}
              </div>
              <h2 className="text-2xl font-[var(--font-display)] font-semibold tracking-[-0.03em] text-slate-900 sm:text-3xl">
                {home("newsroomTitle")}
              </h2>
            </div>
            <Link
              href={`${base}/news`}
              className="inline-flex items-center justify-center rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              {home("newsroomCta")}
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {newsroomItems.map((item) => (
              <article
                key={item.title}
                className="rounded-[24px] border border-black/8 bg-white px-5 py-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.22)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {item.category}
                  </div>
                  {item.date && (
                    <div className="rounded-full border border-black/8 bg-slate-50 px-2.5 py-0.5 text-[10px] text-slate-500">
                      {item.date}
                    </div>
                  )}
                </div>
                <div className="mt-3 text-base font-semibold text-slate-900">{item.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section className="px-6 py-14 sm:px-8 lg:px-14 xl:px-20">
        <div className="mx-auto max-w-[1400px]">
          <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_70%,#134e4a_100%)] px-8 py-10 shadow-[0_40px_100px_-64px_rgba(15,23,42,0.6)] sm:px-12 sm:py-12">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,191,165,0.25),transparent_70%)] blur-2xl" aria-hidden="true" />
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <h2 className="max-w-xl text-2xl font-[var(--font-display)] font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                  {home("ctaTitle")}
                </h2>
                <p className="max-w-lg text-sm leading-relaxed text-slate-400">
                  {home("ctaBody")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`${base}/systems/luna`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#00bfa5] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_35px_-16px_rgba(0,191,165,0.55)] transition hover:bg-[#00897b]"
                >
                  🌙 {home("ctaPrimary")}
                </Link>
                <Link
                  href={`${base}/crear-agente`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/8 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/14"
                >
                  🤖 {home("ctaSecondary")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
