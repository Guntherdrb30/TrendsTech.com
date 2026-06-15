import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { Button } from "@/components/ui/button";
import { getResolvedPageImageSlots } from "@/lib/page-images";

const WHATSAPP_BUY_NUMBER = "584122640371";

function buildWhatsAppLink(msg = "Quiero una demo de LUNA para mi empresa") {
  return `https://wa.me/${WHATSAPP_BUY_NUMBER}?text=${encodeURIComponent(msg)}`;
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
  const isEs = locale.startsWith("es");
  const base = `/${locale}`;
  const t = await getTranslations("lunaPage");
  const pageImages = await getResolvedPageImageSlots("systems-luna", locale);

  const uiCopy = isEs
    ? {
        platformState: "Estado de plataforma",
        enterpriseCore: "Nucleo empresarial",
        platformBody: "Visibilidad comercial, administrativa, logistica y ejecutiva alineada dentro de un mismo sistema.",
        visualPreview: "Vista del sistema",
        visualCaption: "Interfaz enterprise, operaciones por rol y experiencia PWA dentro de una sola superficie.",
        heroAlt: "Vista premium de LUNA en desktop y mobile",
        pillarsEyebrow: "TODO EN UN SOLO SISTEMA",
        pillarsTitle: "Cuatro áreas. Una plataforma.",
        plansEyebrow: "PLANES",
        plansTitle: "Elige el plan para tu empresa",
        plansSubtitle: "Activa solo los módulos que necesitas. Puedes escalar en cualquier momento sin perder tus datos ni tu historial.",
        plansNoPriceBadge: "Consulta precios",
        plansIdealLabel: "Ideal para:",
        plansMostPopular: "Más popular",
        plansCta: "Solicitar información",
        plansCtaEnterprise: "Hablar con un asesor"
      }
    : {
        platformState: "Platform state",
        enterpriseCore: "Enterprise core",
        platformBody: "Commercial, administrative, logistics, and executive visibility aligned in one system.",
        visualPreview: "System preview",
        visualCaption: "Enterprise interface, role-based operations, and PWA experience in a single surface.",
        heroAlt: "Premium LUNA preview across desktop and mobile",
        pillarsEyebrow: "ALL IN ONE SYSTEM",
        pillarsTitle: "Four areas. One platform.",
        plansEyebrow: "PLANS",
        plansTitle: "Choose the plan for your business",
        plansSubtitle: "Activate only the modules you need. Scale at any time without losing your data or history.",
        plansNoPriceBadge: "Ask for pricing",
        plansIdealLabel: "Ideal for:",
        plansMostPopular: "Most popular",
        plansCta: "Request information",
        plansCtaEnterprise: "Talk to an advisor"
      };

  const pillars = isEs
    ? [
        {
          title: "Administración",
          desc: "Control total del negocio",
          items: ["Usuarios y roles por función", "Panel de control unificado", "Auditoría y trazabilidad", "Multi-sede (Enterprise)"]
        },
        {
          title: "Finanzas",
          desc: "CxC, CxP, contabilidad",
          items: ["Cuentas por cobrar y pagar", "Registro de pagos y referencias", "Reportes financieros con IA", "Contabilidad completa (Enterprise)"]
        },
        {
          title: "Tienda Online",
          desc: "E-commerce propio incluido",
          items: ["Catálogo con PWA instalable", "Carrito y checkout propio", "Gestión de pedidos completa", "WhatsApp Business integrado"]
        },
        {
          title: "IA integrada",
          desc: "Agentes que trabajan solos",
          items: ["Reportes ejecutivos asistidos", "Recomendador de productos", "Soporte conversacional", "Manuales generados por IA"]
        }
      ]
    : [
        {
          title: "Administration",
          desc: "Full business control",
          items: ["Users and roles by function", "Unified control panel", "Audit and traceability", "Multi-branch (Enterprise)"]
        },
        {
          title: "Finances",
          desc: "AR, AP, accounting",
          items: ["Accounts receivable and payable", "Payment and reference records", "AI-powered financial reports", "Full accounting (Enterprise)"]
        },
        {
          title: "Online Store",
          desc: "Own e-commerce included",
          items: ["Catalog with installable PWA", "Own cart and checkout", "Full order management", "WhatsApp Business integrated"]
        },
        {
          title: "AI integrated",
          desc: "Agents that work on their own",
          items: ["AI-assisted executive reports", "Product recommender", "Conversational support", "AI-generated manuals"]
        }
      ];

  const plans = isEs
    ? [
        {
          name: "Starter",
          tagline: "Arranca tu operación digital",
          ideal: "Pequeñas empresas y comercios",
          badge: null,
          dark: false,
          features: [
            "Gestión de ventas y órdenes",
            "Control de inventario y stock",
            "Órdenes de compra y proveedores",
            "Cuentas por cobrar (CxC)",
            "Cuentas por pagar (CxP)",
            "Tienda online propia",
            "App móvil PWA instalable",
            "Facturación electrónica fiscal",
            "Presupuestos y cotizaciones",
            "WhatsApp Business integrado",
            "1 Agente IA incluido",
            "Hasta 3 usuarios"
          ]
        },
        {
          name: "Business",
          tagline: "Opera con control total",
          ideal: "Empresas de 10 a 50 empleados",
          badge: "Más popular",
          dark: true,
          features: [
            "Todo lo de Starter",
            "Control de envíos y logística",
            "Repartidores con tracking GPS",
            "Nómina y pagos de empleados",
            "Comisiones de vendedores",
            "Caja registradora (POS)",
            "Reportes ejecutivos con IA",
            "Panel de novedades internas",
            "Contabilidad básica",
            "Módulo de promociones",
            "WhatsApp multi-agente",
            "3 Agentes IA incluidos",
            "Hasta 15 usuarios"
          ]
        },
        {
          name: "Enterprise",
          tagline: "Ventaja competitiva total",
          ideal: "Medianas y grandes empresas",
          badge: null,
          dark: false,
          features: [
            "Todo lo de Business",
            "Contabilidad completa (balances, P&L)",
            "Conciliación bancaria",
            "Marketing IA con Meta Ads",
            "Catálogo sincronizado Facebook/Instagram",
            "Red de aliados y referidos",
            "Multi-sede y multi-almacén",
            "Auditoría y seguridad avanzada",
            "Roles y permisos granulares",
            "Manuales IA generados automáticamente",
            "6+ Agentes IA especializados",
            "Actualizaciones con IA por 6 meses",
            "API abierta para integraciones",
            "Usuarios ilimitados",
            "Manager de cuenta dedicado"
          ]
        }
      ]
    : [
        {
          name: "Starter",
          tagline: "Launch your digital operation",
          ideal: "Small businesses and shops",
          badge: null,
          dark: false,
          features: [
            "Sales and order management",
            "Inventory and stock control",
            "Purchase orders and suppliers",
            "Accounts receivable (AR)",
            "Accounts payable (AP)",
            "Own online store",
            "Installable PWA mobile app",
            "Electronic fiscal invoicing",
            "Quotes and estimates",
            "WhatsApp Business integrated",
            "1 AI Agent included",
            "Up to 3 users"
          ]
        },
        {
          name: "Business",
          tagline: "Operate with full control",
          ideal: "Companies from 10 to 50 employees",
          badge: "Most popular",
          dark: true,
          features: [
            "Everything in Starter",
            "Shipping and logistics control",
            "Delivery tracking with GPS",
            "Payroll and employee payments",
            "Sales commissions",
            "Point of Sale (POS)",
            "AI executive reports",
            "Internal news panel",
            "Basic accounting",
            "Promotions module",
            "Multi-agent WhatsApp",
            "3 AI Agents included",
            "Up to 15 users"
          ]
        },
        {
          name: "Enterprise",
          tagline: "Total competitive advantage",
          ideal: "Medium and large businesses",
          badge: null,
          dark: false,
          features: [
            "Everything in Business",
            "Full accounting (P&L, balance sheet)",
            "Bank reconciliation",
            "AI Marketing with Meta Ads",
            "Facebook/Instagram catalog sync",
            "Affiliate and referral network",
            "Multi-branch and multi-warehouse",
            "Advanced audit and security",
            "Granular roles and permissions",
            "AI-generated manuals",
            "6+ specialized AI Agents",
            "6 months AI-assisted updates",
            "Open API for integrations",
            "Unlimited users",
            "Dedicated account manager"
          ]
        }
      ];

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
      image: pageImages.gallery_01?.imageUrl ?? "/marketing/luna/luna-hero-dark.png",
      alt: pageImages.gallery_01?.alt,
      title: isEs ? "Vista comercial principal" : "Primary commercial view",
      body: isEs
        ? "Composicion hero para ventas, inventario y operacion con lenguaje visual de plataforma enterprise."
        : "Hero composition for sales, inventory, and operations with a true enterprise platform visual language."
    },
    {
      image: pageImages.gallery_02?.imageUrl ?? "/marketing/luna/luna-hero-light.png",
      alt: pageImages.gallery_02?.alt,
      title: isEs ? "Vista premium del sistema" : "Premium system view",
      body: isEs
        ? "Lectura clara de dashboard, cobros, inventario, despachos y uso instalable en mobile."
        : "Clear dashboard view across collections, inventory, dispatches, and installable mobile use."
    },
    {
      image: pageImages.gallery_03?.imageUrl ?? "/cases/carpihogar/carpihogar-pwa-home.svg",
      alt: pageImages.gallery_03?.alt,
      title: t("gallery.g1Title"),
      body: t("gallery.g1Body")
    },
    {
      image: pageImages.gallery_04?.imageUrl ?? "/cases/carpihogar/carpihogar-catalog-grid.svg",
      alt: pageImages.gallery_04?.alt,
      title: t("gallery.g2Title"),
      body: t("gallery.g2Body")
    },
    {
      image: pageImages.gallery_05?.imageUrl ?? "/cases/carpihogar/carpihogar-product-detail.svg",
      alt: pageImages.gallery_05?.alt,
      title: t("gallery.g3Title"),
      body: t("gallery.g3Body")
    },
    {
      image: pageImages.gallery_06?.imageUrl ?? "/cases/carpihogar/carpihogar-news.svg",
      alt: pageImages.gallery_06?.alt,
      title: t("gallery.g4Title"),
      body: t("gallery.g4Body")
    },
    {
      image: pageImages.gallery_07?.imageUrl ?? "/cases/carpihogar/carpihogar-admin-dashboard.svg",
      alt: pageImages.gallery_07?.alt,
      title: t("gallery.g5Title"),
      body: t("gallery.g5Body")
    },
    {
      image: pageImages.gallery_08?.imageUrl ?? "/cases/carpihogar/carpihogar-sales-form.svg",
      alt: pageImages.gallery_08?.alt,
      title: t("gallery.g6Title"),
      body: t("gallery.g6Body")
    },
    {
      image: pageImages.gallery_09?.imageUrl ?? "/cases/carpihogar/carpihogar-ai-modules.svg",
      alt: pageImages.gallery_09?.alt,
      title: t("gallery.g7Title"),
      body: t("gallery.g7Body")
    },
    {
      image: pageImages.gallery_10?.imageUrl ?? "/cases/carpihogar/carpihogar-exec-reports.svg",
      alt: pageImages.gallery_10?.alt,
      title: t("gallery.g8Title"),
      body: t("gallery.g8Body")
    }
  ];

  return (
    <div className={`${display.variable} ${body.variable} space-y-14 font-[var(--font-body)]`}>
      {/* ── HERO ── */}
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

            <div className="inline-flex">
              <Image
                src="/branding/luna-logo.svg"
                alt="LUNA ERP inteligente by Trends172Tech"
                width={360}
                height={105}
                className="h-auto w-[260px] sm:w-[340px]"
                priority
              />
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap items-center gap-2">
              {["Administración", "Finanzas", "Tienda Online", "IA integrada"].map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#00bfa5]/30 bg-[#f0fdf9] px-3 py-1 text-[11px] font-semibold text-[#00897b]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00bfa5]" />
                  {pill}
                </span>
              ))}
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
                    src={pageImages.hero_primary?.imageUrl ?? "/marketing/luna/luna-hero-light.png"}
                    alt={pageImages.hero_primary?.alt ?? uiCopy.heroAlt}
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
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{uiCopy.platformBody}</p>
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

      {/* ── PILARES DE PRODUCTO ── */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px] space-y-8">
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#00897b]">
              {uiCopy.pillarsEyebrow}
            </div>
            <h2 className="text-3xl font-[var(--font-display)] font-semibold tracking-[-0.04em] text-slate-950">
              {uiCopy.pillarsTitle}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="group interactive-panel rounded-[28px] border border-black/8 bg-white/92 p-6 shadow-[0_24px_64px_-52px_rgba(15,23,42,0.28)] transition-shadow hover:shadow-[0_32px_80px_-52px_rgba(0,191,165,0.18)]"
              >
                <div className="mb-1 text-sm font-bold text-slate-900">{pillar.title}</div>
                <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00897b]">
                  {pillar.desc}
                </div>
                <ul className="space-y-2">
                  {pillar.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00bfa5]" fill="none" viewBox="0 0 16 16">
                        <path d="M13 4L6.5 11 3 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEMA / SOLUCIÓN ── */}
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

      {/* ── QUÉ GANA TU EMPRESA ── */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px] space-y-6">
          <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900">{t("outcomesTitle")}</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {outcomes.map((item, index) => (
              <div
                key={item.title}
                className="interactive-panel premium-spotlight rounded-[26px] border border-black/8 bg-white/92 px-5 py-5 text-sm text-slate-600 shadow-[0_24px_64px_-52px_rgba(15,23,42,0.3)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg font-semibold text-slate-900">{item.title}</div>
                  <span className={`h-2.5 w-2.5 rounded-full ${index % 2 === 0 ? "bg-[#00bfa5]" : "bg-[#00897b]"}`} />
                </div>
                <p className="mt-3 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANES ── */}
      <section className="relative overflow-hidden border-y border-black/8 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_50%,#f8fafc_100%)] px-6 py-14 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="premium-grid absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1760px] space-y-10">
          <div className="space-y-3 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#00897b]">
              {uiCopy.plansEyebrow}
            </div>
            <h2 className="text-4xl font-[var(--font-display)] font-semibold tracking-[-0.05em] text-slate-950">
              {uiCopy.plansTitle}
            </h2>
            <p className="mx-auto max-w-2xl text-base text-slate-500">{uiCopy.plansSubtitle}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-[32px] border p-7 shadow-[0_34px_100px_-64px_rgba(15,23,42,0.38)] ${
                  plan.dark
                    ? "border-[#00bfa5]/20 bg-slate-950 text-white"
                    : "border-black/8 bg-white/95 text-slate-900"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00bfa5] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_4px_16px_rgba(0,191,165,0.4)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-1">
                  <div className={`text-[11px] font-bold uppercase tracking-[0.22em] ${plan.dark ? "text-[#00bfa5]" : "text-[#00897b]"}`}>
                    LUNA
                  </div>
                  <div className="text-2xl font-[var(--font-display)] font-bold tracking-[-0.03em]">
                    {plan.name}
                  </div>
                  <div className={`text-sm ${plan.dark ? "text-slate-300" : "text-slate-500"}`}>
                    {plan.tagline}
                  </div>
                </div>

                <div className={`mt-4 rounded-[14px] border px-3 py-2 text-[11px] font-semibold ${
                  plan.dark
                    ? "border-white/10 bg-white/6 text-slate-300"
                    : "border-black/8 bg-slate-50 text-slate-500"
                }`}>
                  <span className={plan.dark ? "text-slate-400" : "text-slate-400"}>{uiCopy.plansIdealLabel}</span>{" "}
                  <span className={plan.dark ? "text-slate-200" : "text-slate-700"}>{plan.ideal}</span>
                </div>

                <div className={`my-6 h-px ${plan.dark ? "bg-white/10" : "bg-black/8"}`} />

                <ul className="flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex items-start gap-2.5 text-sm ${plan.dark ? "text-slate-200" : "text-slate-600"}`}>
                      <svg
                        className={`mt-0.5 h-4 w-4 shrink-0 ${plan.dark ? "text-[#00bfa5]" : "text-[#00897b]"}`}
                        fill="none"
                        viewBox="0 0 16 16"
                      >
                        <path d="M13 4L6.5 11 3 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className={feature === "Todo lo de Starter" || feature === "Todo lo de Business" || feature === "Everything in Starter" || feature === "Everything in Business" ? "font-semibold" : ""}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 space-y-3">
                  <Link
                    href={buildWhatsAppLink(`Quiero información sobre LUNA ${plan.name}`)}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex w-full items-center justify-center rounded-[16px] px-5 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      plan.dark
                        ? "bg-[#00bfa5] text-white shadow-[0_4px_20px_rgba(0,191,165,0.35)] hover:bg-[#00897b] focus-visible:ring-[#00bfa5]"
                        : "bg-slate-950 text-white hover:bg-slate-800 focus-visible:ring-slate-900"
                    }`}
                  >
                    {plan.name === "Enterprise" ? uiCopy.plansCtaEnterprise : uiCopy.plansCta}
                  </Link>
                  <div className={`text-center text-[11px] font-semibold uppercase tracking-[0.16em] ${plan.dark ? "text-slate-400" : "text-slate-400"}`}>
                    {uiCopy.plansNoPriceBadge}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MÓDULOS ── */}
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

      {/* ── ARSENAL DE IA ── */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px]">
          <div className="rounded-[36px] border border-black/8 bg-slate-950 px-6 py-10 shadow-[0_34px_100px_-68px_rgba(15,23,42,0.5)] sm:px-8 lg:px-10">
            <div className="space-y-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#00bfa5]">
                {isEs ? "INTELIGENCIA ARTIFICIAL INTEGRADA" : "BUILT-IN ARTIFICIAL INTELLIGENCE"}
              </div>
              <h2 className="text-3xl font-[var(--font-display)] font-semibold tracking-[-0.04em] text-white">
                {isEs ? "El arsenal de IA que trabaja por tu empresa" : "The AI arsenal working for your business"}
              </h2>
              <p className="max-w-3xl text-base leading-relaxed text-slate-300">
                {isEs
                  ? "LUNA no es solo un ERP. Cada plan incluye agentes de inteligencia artificial que automatizan tareas, generan reportes y atienden a tus clientes sin intervención humana."
                  : "LUNA is not just an ERP. Every plan includes AI agents that automate tasks, generate reports, and serve your customers without human intervention."}
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {(isEs
                ? [
                    { icon: "📊", title: "Reportes ejecutivos con IA", body: "Análisis automático de ventas, inventario y finanzas. El sistema genera resúmenes diarios y detecta anomalías antes de que sean problemas." },
                    { icon: "🛒", title: "Recomendador inteligente", body: "Sugiere productos a tus clientes en tiempo real basado en su historial de compras, stock disponible y márgenes de ganancia." },
                    { icon: "💬", title: "Soporte conversacional", body: "Agente de chat integrado en tu tienda online y WhatsApp que responde preguntas, confirma pedidos y escala a humanos cuando es necesario." },
                    { icon: "📖", title: "Manuales generados por IA", body: "LUNA crea automáticamente guías de uso, procedimientos internos y documentación de procesos adaptada a cómo opera tu empresa." },
                    { icon: "📣", title: "Marketing IA con Meta Ads", body: "Genera campañas publicitarias optimizadas para Facebook e Instagram sincronizadas con tu catálogo de productos en tiempo real. (Plan Enterprise)" },
                    { icon: "🔔", title: "Alertas y predicciones", body: "El sistema aprende de tus patrones de venta y te avisa cuando un producto está por agotarse, cuando hay picos de demanda o caídas inusuales." }
                  ]
                : [
                    { icon: "📊", title: "AI executive reports", body: "Automatic analysis of sales, inventory, and finances. The system generates daily summaries and detects anomalies before they become problems." },
                    { icon: "🛒", title: "Smart recommender", body: "Suggests products to your customers in real time based on their purchase history, available stock, and profit margins." },
                    { icon: "💬", title: "Conversational support", body: "Chat agent integrated in your online store and WhatsApp that answers questions, confirms orders, and escalates to humans when needed." },
                    { icon: "📖", title: "AI-generated manuals", body: "LUNA automatically creates usage guides, internal procedures, and process documentation tailored to how your business operates." },
                    { icon: "📣", title: "AI Marketing with Meta Ads", body: "Generates optimized ad campaigns for Facebook and Instagram synchronized with your product catalog in real time. (Enterprise plan)" },
                    { icon: "🔔", title: "Alerts and predictions", body: "The system learns from your sales patterns and warns you when a product is about to run out, when there are demand spikes, or unusual drops." }
                  ]
              ).map((item) => (
                <div
                  key={item.title}
                  className="rounded-[26px] border border-white/10 bg-white/6 px-5 py-5 backdrop-blur"
                >
                  <div className="mb-3 text-2xl">{item.icon}</div>
                  <div className="mb-2 text-base font-semibold text-white">{item.title}</div>
                  <p className="text-sm leading-relaxed text-slate-300">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EN LA NUBE ── */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px]">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[34px] border border-black/8 bg-white/92 p-8 shadow-[0_30px_90px_-62px_rgba(15,23,42,0.3)]">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#00897b]">
                {isEs ? "100% EN LA NUBE" : "100% CLOUD"}
              </div>
              <h2 className="mb-4 text-2xl font-[var(--font-display)] font-semibold tracking-[-0.04em] text-slate-950">
                {isEs ? "Tu negocio disponible desde cualquier lugar, siempre" : "Your business available from anywhere, always"}
              </h2>
              <div className="space-y-3">
                {(isEs
                  ? [
                      { label: "Acceso 24/7", body: "Entra desde el teléfono, tablet o computadora. No depende de un servidor local que puede fallar." },
                      { label: "Backups automáticos", body: "Tus datos se respaldan en la nube continuamente. Nunca pierdas información por un daño de hardware." },
                      { label: "Actualizaciones sin reinstalar", body: "Cada mejora llega automáticamente. No necesitas técnicos ni interrumpir tu operación para actualizar." },
                      { label: "Multi-dispositivo y PWA", body: "Instala LUNA como app en tu celular. Los repartidores, cajeros y gerentes tienen su propia vista optimizada." }
                    ]
                  : [
                      { label: "24/7 access", body: "Log in from phone, tablet, or computer. No dependency on a local server that can fail." },
                      { label: "Automatic backups", body: "Your data is continuously backed up in the cloud. Never lose information due to hardware damage." },
                      { label: "Updates without reinstalling", body: "Every improvement arrives automatically. No technicians or operational interruptions needed." },
                      { label: "Multi-device and PWA", body: "Install LUNA as an app on your phone. Delivery drivers, cashiers, and managers have their own optimized view." }
                    ]
                ).map((item) => (
                  <div key={item.label} className="flex items-start gap-3 rounded-[16px] border border-black/6 bg-slate-50 px-4 py-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#00bfa5]" />
                    <div>
                      <span className="text-sm font-semibold text-slate-900">{item.label}: </span>
                      <span className="text-sm text-slate-600">{item.body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── ADAPTADO PARA VENEZUELA ── */}
            <div className="rounded-[34px] border border-[#00bfa5]/20 bg-[linear-gradient(135deg,#0F172A_0%,#0d2a26_100%)] p-8 text-white shadow-[0_34px_100px_-64px_rgba(0,191,165,0.25)]">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#00bfa5]">
                {isEs ? "HECHO PARA VENEZUELA" : "BUILT FOR VENEZUELA"}
              </div>
              <h2 className="mb-4 text-2xl font-[var(--font-display)] font-semibold tracking-[-0.04em]">
                {isEs ? "El único ERP que entiende cómo funciona el mercado local" : "The only ERP that understands how the local market works"}
              </h2>
              <div className="space-y-3">
                {(isEs
                  ? [
                      { label: "Precios en Bs. y USD", body: "Maneja productos con precios en bolívares y dólares simultáneamente. Actualiza automáticamente con la tasa BCV." },
                      { label: "Facturación fiscal SENIAT", body: "Genera facturas que cumplen los requisitos fiscales venezolanos. Preparado para el sistema de facturación electrónica." },
                      { label: "Pago Móvil integrado", body: "Tus clientes pagan con Pago Móvil, Zelle o efectivo directamente desde la tienda o en caja." },
                      { label: "WhatsApp como canal principal", body: "Venezuela vive en WhatsApp. LUNA integra WhatsApp Business para pedidos, confirmaciones y soporte al cliente." },
                      { label: "Soporte local en tu zona horaria", body: "El equipo de Trends172 Tech está en Venezuela. Te atendemos en tu horario, en español, sin tickets internacionales." }
                    ]
                  : [
                      { label: "Prices in Bs. and USD", body: "Manage products with prices in bolivars and dollars simultaneously. Automatically updates with the BCV rate." },
                      { label: "SENIAT fiscal invoicing", body: "Generates invoices that comply with Venezuelan tax requirements. Ready for the electronic invoicing system." },
                      { label: "Pago Móvil integrated", body: "Your customers pay with Pago Móvil, Zelle, or cash directly from the store or at the register." },
                      { label: "WhatsApp as primary channel", body: "Venezuela lives on WhatsApp. LUNA integrates WhatsApp Business for orders, confirmations, and customer support." },
                      { label: "Local support in your timezone", body: "The Trends172 Tech team is in Venezuela. We serve you on your schedule, in Spanish, no international tickets." }
                    ]
                ).map((item) => (
                  <div key={item.label} className="flex items-start gap-3 rounded-[16px] border border-white/10 bg-white/6 px-4 py-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#00bfa5]" />
                    <div>
                      <span className="text-sm font-semibold text-white">{item.label}: </span>
                      <span className="text-sm text-slate-300">{item.body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DESARROLLO PROPIO ── */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px]">
          <div className="relative overflow-hidden rounded-[36px] border border-black/8 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-8 py-10 shadow-[0_34px_100px_-68px_rgba(15,23,42,0.26)]">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,191,165,0.08),transparent_70%)] blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_1.4fr]">
              <div className="space-y-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#00897b]">
                  {isEs ? "DESARROLLO PROPIO" : "PROPRIETARY DEVELOPMENT"}
                </div>
                <h2 className="text-3xl font-[var(--font-display)] font-semibold tracking-[-0.04em] text-slate-950">
                  {isEs
                    ? "Una plataforma que crece contigo y se adapta a tu empresa"
                    : "A platform that grows with you and adapts to your business"}
                </h2>
                <p className="text-base leading-relaxed text-slate-600">
                  {isEs
                    ? "LUNA es un desarrollo 100% propio de Trends172 Tech. Eso significa que no dependemos de terceros para agregar funciones, corregir errores o adaptar el sistema a las necesidades específicas de cada empresa."
                    : "LUNA is 100% built in-house by Trends172 Tech. That means we don't depend on third parties to add features, fix bugs, or adapt the system to each company's specific needs."}
                </p>
                <Link
                  href={buildWhatsAppLink(isEs ? "Quiero saber más sobre módulos personalizados de LUNA" : "I want to know more about LUNA custom modules")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-[14px] bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {isEs ? "Hablar sobre módulos a medida" : "Talk about custom modules"}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {(isEs
                  ? [
                      { num: "01", title: "Módulos a la medida", body: "Si tu empresa tiene un proceso único, lo convertimos en un módulo dentro de LUNA. Desde control de producción hasta flujos de aprobación personalizados." },
                      { num: "02", title: "Sin dependencia de terceros", body: "No esperamos que otro proveedor apruebe cambios. Actualizamos, ajustamos y mejoramos según las necesidades de nuestros clientes." },
                      { num: "03", title: "Crece sin reiniciar", body: "Puedes empezar con Ventas e Inventario y añadir Logística, Contabilidad o Nómina más adelante sin migrar a otro sistema." },
                      { num: "04", title: "API abierta para integraciones", body: "Conecta LUNA con plataformas externas: pasarelas de pago, sistemas fiscales, marketplaces o cualquier herramienta que ya uses. (Enterprise)" }
                    ]
                  : [
                      { num: "01", title: "Custom modules", body: "If your business has a unique process, we turn it into a module inside LUNA. From production control to custom approval workflows." },
                      { num: "02", title: "No third-party dependency", body: "We don't wait for another vendor to approve changes. We update, adjust, and improve based on our clients' needs." },
                      { num: "03", title: "Grows without restarting", body: "Start with Sales and Inventory, then add Logistics, Accounting, or Payroll later without migrating to another system." },
                      { num: "04", title: "Open API for integrations", body: "Connect LUNA to external platforms: payment gateways, tax systems, marketplaces, or any tool you already use. (Enterprise)" }
                    ]
                ).map((item) => (
                  <div
                    key={item.num}
                    className="rounded-[22px] border border-black/8 bg-white px-5 py-5 shadow-[0_8px_32px_-12px_rgba(15,23,42,0.12)]"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0fdf9] text-[11px] font-bold text-[#00897b]">
                        {item.num}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CASO REAL ── */}
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

      {/* ── GALERÍA ── */}
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
                    alt={item.alt ?? item.title}
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

      {/* ── POR QUÉ LUNA ── */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px] space-y-6">
          <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900">{t("reasonsTitle")}</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reasons.map((item, i) => (
              <div
                key={item}
                className="interactive-panel premium-spotlight flex items-start gap-4 rounded-[26px] border border-black/8 bg-white/92 px-5 py-5 text-sm text-slate-600 shadow-[0_24px_64px_-52px_rgba(15,23,42,0.3)]"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f0fdf9] text-[11px] font-bold text-[#00897b]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative overflow-hidden border-y border-black/8 bg-slate-950 px-6 py-16 text-white sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="absolute inset-0 opacity-70" aria-hidden="true">
          <div className="absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(0,191,165,0.22),_transparent_70%)] blur-3xl" />
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(0,137,123,0.18),_transparent_70%)] blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(0,191,165,0.10),_transparent_70%)] blur-2xl" />
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-[1760px] flex-col items-center gap-8 text-center lg:gap-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00bfa5]/30 bg-[#00bfa5]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#00bfa5]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00bfa5]" />
              LUNA ERP · {isEs ? "Por Trends172 Tech" : "By Trends172 Tech"}
            </div>
            <h2 className="text-4xl font-[var(--font-display)] font-semibold tracking-[-0.05em] sm:text-5xl">
              {t("finalTitle")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-300">{t("finalBody")}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href={buildWhatsAppLink("Quiero una demo de LUNA para mi empresa")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-[18px] bg-[#00bfa5] px-7 py-4 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(0,191,165,0.4)] transition-all hover:bg-[#00897b] hover:shadow-[0_4px_32px_rgba(0,191,165,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00bfa5] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.12 1.535 5.845L0 24l6.337-1.513A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.809 9.809 0 01-5.001-1.368l-.358-.214-3.726.889.926-3.619-.235-.372A9.818 9.818 0 012.182 12C2.182 6.573 6.573 2.182 12 2.182S21.818 6.573 21.818 12 17.427 21.818 12 21.818z" />
              </svg>
              {t("finalPrimary")}
            </Link>
            <Link
              href={buildWhatsAppLink("Quiero implementar LUNA en mi empresa")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-[18px] border border-white/20 bg-white/8 px-7 py-4 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {t("finalSecondary")}
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#00bfa5]" />{isEs ? "Sin permanencia mínima" : "No lock-in"}</span>
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#00bfa5]" />{isEs ? "Demo sin costo" : "Free demo"}</span>
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#00bfa5]" />{isEs ? "Implementación guiada" : "Guided implementation"}</span>
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#00bfa5]" />{isEs ? "Soporte local" : "Local support"}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
