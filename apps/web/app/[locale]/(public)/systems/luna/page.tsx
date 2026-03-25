import Link from "next/link";
import Image from "next/image";
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

const LUNA_DARK_VISUAL = "/marketing/luna/luna-hero-dark.png";
const LUNA_LIGHT_VISUAL = "/marketing/luna/luna-hero-light.png";

export default async function LunaPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = `/${locale}`;
  const t = await getTranslations("lunaPage");
  const a = await getTranslations("agents");
  const uiCopy = locale.startsWith("es")
    ? {
        platformState: "Estado de plataforma",
        enterpriseCore: "Nucleo empresarial",
        platformBody: "Visibilidad comercial, administrativa, logistica y ejecutiva alineada dentro de un mismo sistema.",
        visualPreview: "Vista del sistema",
        visualCaption: "Interfaz enterprise, operaciones por rol y experiencia PWA dentro de una sola superficie.",
        heroAlt: "Vista premium de LUNA en desktop y mobile"
      }
    : {
        platformState: "Platform state",
        enterpriseCore: "Enterprise core",
        platformBody: "Commercial, administrative, logistics, and executive visibility aligned in one system.",
        visualPreview: "System preview",
        visualCaption: "Enterprise interface, role-based operations, and PWA experience in a single surface.",
        heroAlt: "Premium LUNA preview across desktop and mobile"
      };

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

  const galleryItems = [
    {
      image: LUNA_DARK_VISUAL,
      title: locale.startsWith("es") ? "Vista comercial principal" : "Primary commercial view",
      body:
        locale.startsWith("es")
          ? "Composicion hero para ventas, inventario y operacion con lenguaje visual de plataforma enterprise."
          : "Hero composition for sales, inventory, and operations with a true enterprise platform visual language."
    },
    {
      image: LUNA_LIGHT_VISUAL,
      title: locale.startsWith("es") ? "Vista premium del sistema" : "Premium system view",
      body:
        locale.startsWith("es")
          ? "Lectura clara de dashboard, cobros, inventario, despachos y uso instalable en mobile."
          : "Clear dashboard view across collections, inventory, dispatches, and installable mobile use."
    },
    {
      image: "/cases/carpihogar/carpihogar-pwa-home.svg",
      title: t("gallery.g1Title"),
      body: t("gallery.g1Body")
    },
    {
      image: "/cases/carpihogar/carpihogar-catalog-grid.svg",
      title: t("gallery.g2Title"),
      body: t("gallery.g2Body")
    },
    {
      image: "/cases/carpihogar/carpihogar-product-detail.svg",
      title: t("gallery.g3Title"),
      body: t("gallery.g3Body")
    },
    {
      image: "/cases/carpihogar/carpihogar-news.svg",
      title: t("gallery.g4Title"),
      body: t("gallery.g4Body")
    },
    {
      image: "/cases/carpihogar/carpihogar-admin-dashboard.svg",
      title: t("gallery.g5Title"),
      body: t("gallery.g5Body")
    },
    {
      image: "/cases/carpihogar/carpihogar-sales-form.svg",
      title: t("gallery.g6Title"),
      body: t("gallery.g6Body")
    },
    {
      image: "/cases/carpihogar/carpihogar-ai-modules.svg",
      title: t("gallery.g7Title"),
      body: t("gallery.g7Body")
    },
    {
      image: "/cases/carpihogar/carpihogar-exec-reports.svg",
      title: t("gallery.g8Title"),
      body: t("gallery.g8Body")
    }
  ];

  return (
    <div className={`${display.variable} ${body.variable} space-y-14 font-[var(--font-body)]`}>
      <section className="premium-spotlight relative overflow-hidden border-y border-black/8 bg-[linear-gradient(180deg,#f4f7fb_0%,#ffffff_22%,#f6f9fc_100%)] px-6 py-12 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="premium-grid absolute inset-0 opacity-55" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-[1760px] gap-8 xl:grid-cols-[1.03fr_0.97fr]">
          <div className="space-y-6">
            <Link
              href={`${base}/systems`}
              className="interactive-chip inline-flex rounded-full border border-black/8 bg-white/86 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
            >
              {t("back")}
            </Link>

            <div className="interactive-panel inline-flex rounded-[28px] border border-black/8 bg-white/92 p-3 shadow-[0_22px_55px_-35px_rgba(15,23,42,0.28)] backdrop-blur">
              <Image
                src="/branding/luna-logo.svg"
                alt="LUNA by trends172tech"
                width={320}
                height={90}
                className="h-auto w-[220px] sm:w-[280px]"
                priority
              />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/88 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t("eyebrow")}
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-[var(--font-display)] font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
                {t("title")}
              </h1>
              <p className="max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
                {t("subtitle")}
              </p>
              <p className="max-w-3xl text-base leading-relaxed text-slate-600">{t("subcopy")}</p>
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

          <div className="interactive-panel premium-metal relative overflow-hidden rounded-[36px] border border-black/8 bg-white/78 p-5 shadow-[0_40px_110px_-74px_rgba(15,23,42,0.42)]">
            <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.96)_50%,transparent_100%)]" aria-hidden="true" />
            <div className="grid gap-4">
              <div className="rounded-[28px] border border-white/60 bg-white/78 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                <div className="mb-3 flex items-center justify-between gap-3 px-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {uiCopy.visualPreview}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/88 px-3 py-1 text-[11px] font-semibold text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{uiCopy.enterpriseCore}</span>
                  </div>
                </div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] border border-black/8 bg-slate-100 shadow-[0_30px_80px_-58px_rgba(15,23,42,0.28)]">
                  <Image
                    src={LUNA_LIGHT_VISUAL}
                    alt={uiCopy.heroAlt}
                    fill
                    priority
                    className="object-cover"
                    sizes="(min-width: 1280px) 42vw, (min-width: 768px) 50vw, 100vw"
                  />
                </div>
                <p className="mt-4 px-2 text-sm leading-relaxed text-slate-600">{uiCopy.visualCaption}</p>
              </div>
              <div className="rounded-[28px] border border-black/8 bg-slate-950 px-5 py-5 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.5)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {uiCopy.platformState}
                </div>
                <div className="mt-3 text-3xl font-[var(--font-display)] font-semibold tracking-[-0.05em] text-white">
                  {uiCopy.enterpriseCore}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {uiCopy.platformBody}
                </p>
                <ul className="mt-4 grid gap-3 text-sm text-slate-200">
                  {valueProps.slice(0, 4).map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 rounded-[18px] border border-white/10 bg-white/6 px-3 py-3"
                    >
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto grid w-full max-w-[1760px] gap-6 lg:grid-cols-2">
          <article className="interactive-panel premium-spotlight rounded-[34px] border border-black/8 bg-white/92 p-6 shadow-[0_30px_90px_-62px_rgba(15,23,42,0.3)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{t("problemTitle")}</div>
            <h2 className="mt-4 text-3xl font-[var(--font-display)] font-semibold tracking-[-0.04em] text-slate-950">
              {t("problemHeadline")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{t("problemBody")}</p>
          </article>

          <article className="interactive-panel rounded-[34px] border border-black/8 bg-slate-950 p-6 text-white shadow-[0_34px_100px_-64px_rgba(15,23,42,0.5)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{t("solutionTitle")}</div>
            <h2 className="mt-4 text-3xl font-[var(--font-display)] font-semibold tracking-[-0.04em]">
              {t("solutionHeadline")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">{t("solutionBody")}</p>
          </article>
        </div>
      </section>

      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px] space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900">{t("outcomesTitle")}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {outcomes.map((item, index) => (
              <div
                key={item.title}
                className="interactive-panel premium-spotlight rounded-[26px] border border-black/8 bg-white/92 px-5 py-5 text-sm text-slate-600 shadow-[0_24px_64px_-52px_rgba(15,23,42,0.3)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg font-semibold text-slate-900">{item.title}</div>
                  <span className={`h-2.5 w-2.5 rounded-full ${index % 2 === 0 ? "bg-emerald-500" : "bg-[#8b5e34]"}`} />
                </div>
                <p className="mt-3 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f7fafc_100%)] px-6 py-12 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="premium-grid absolute inset-0 opacity-45" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1760px] space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900">{t("modulesTitle")}</h2>
            <p className="max-w-3xl text-base text-slate-600">{t("modulesBody")}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {modules.map((item, index) => (
              <div
                key={item.title}
                className="interactive-panel premium-spotlight rounded-[26px] border border-black/8 bg-white/92 px-5 py-5 text-sm text-slate-600 shadow-[0_24px_64px_-52px_rgba(15,23,42,0.3)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-base font-semibold text-slate-900">{item.title}</div>
                  <div className="rounded-full border border-black/8 bg-white/84 px-3 py-1 text-[11px] font-semibold text-slate-500">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                </div>
                <p className="mt-3 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="interactive-panel mx-auto rounded-[36px] border border-black/8 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-6 py-10 shadow-[0_34px_100px_-68px_rgba(15,23,42,0.26)] sm:px-8 lg:px-10">
          <div className="space-y-3">
            <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900">{t("agentsTitle")}</h2>
            <p className="max-w-3xl text-base text-slate-600">{t("agentsBody")}</p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {AGENT_PRODUCTS.map((agent, index) => (
              <Link
                key={agent.key}
                href={`${base}/agents/${agent.key}`}
                className="interactive-panel premium-spotlight rounded-[26px] border border-black/8 bg-white/92 px-5 py-5 text-sm shadow-[0_24px_64px_-52px_rgba(15,23,42,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg font-semibold text-slate-900">{a(`${agent.key}.name`)}</div>
                  <span className={`h-2.5 w-2.5 rounded-full ${index % 2 === 0 ? "bg-emerald-500" : "bg-[#8b5e34]"}`} />
                </div>
                <p className="mt-3 text-slate-600">{a(`${agent.key}.tagline`)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="interactive-panel mx-auto rounded-[36px] border border-black/8 bg-white/92 px-6 py-10 shadow-[0_34px_100px_-68px_rgba(15,23,42,0.26)] sm:px-8 lg:px-10">
          <div className="space-y-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{t("proofTitle")}</div>
            <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900">{t("proofHeadline")}</h2>
            <p className="max-w-3xl text-base leading-relaxed text-slate-600">{t("proofBody")}</p>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-500">{t("proofNote")}</p>
            <Button asChild variant="outline">
              <Link href={`${base}/projects`}>{t("proofCta")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px] space-y-6">
          <div className="space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{t("galleryEyebrow")}</div>
            <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900">{t("galleryTitle")}</h2>
            <p className="max-w-3xl text-base text-slate-600">{t("galleryBody")}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {galleryItems.map((item) => (
              <article
                key={item.title}
                className="group interactive-panel overflow-hidden rounded-[32px] border border-black/8 bg-white/92 shadow-[0_30px_90px_-62px_rgba(15,23,42,0.32)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.02]"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </div>
                <div className="space-y-3 p-6">
                  <h3 className="text-xl font-[var(--font-display)] font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px] space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900">{t("reasonsTitle")}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reasons.map((item) => (
              <div
                key={item}
                className="interactive-panel premium-spotlight rounded-[26px] border border-black/8 bg-white/92 px-5 py-5 text-sm text-slate-600 shadow-[0_24px_64px_-52px_rgba(15,23,42,0.3)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-black/8 bg-slate-950 px-6 py-12 text-white sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="absolute inset-0 opacity-70" aria-hidden="true">
          <div className="absolute -left-32 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.25),_transparent_70%)] blur-2xl" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(120,53,15,0.22),_transparent_70%)] blur-2xl" />
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-[1760px] flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
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
