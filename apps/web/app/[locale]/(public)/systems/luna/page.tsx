import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Syne, DM_Sans } from "next/font/google";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { buildLunaStructuredData } from "@/lib/product-structured-data";
import { buildLocalizedMetadata } from "@/lib/seo";

const WHATSAPP_BUY_NUMBER = "584122640371";

function buildWhatsAppLink(msg = "Quiero una demo de LUNA para mi empresa") {
  return `https://wa.me/${WHATSAPP_BUY_NUMBER}?text=${encodeURIComponent(msg)}`;
}

const display = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-display",
});

const body = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    pathname: "systems/luna",
    title: {
      es: "LUNA ERP inteligente y plataforma empresarial",
      en: "LUNA intelligent ERP and business platform"
    },
    description: {
      es: "LUNA integra operaciones, ventas, inventario, comercio digital y automatización inteligente en una plataforma adaptable para cada empresa.",
      en: "LUNA combines operations, sales, inventory, digital commerce and intelligent automation in an adaptable platform for every business."
    }
  });
}

export default async function LunaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEs = locale.startsWith("es");
  const base = `/${locale}`;
  const t = await getTranslations("lunaPage");
  const structuredData = buildLunaStructuredData(locale);

  const plans = isEs
    ? [
        {
          name: "Starter",
          tagline: "Digitaliza tu operación",
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
            "Hasta 3 usuarios",
          ],
        },
        {
          name: "Business",
          tagline: "Escala con control",
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
            "Hasta 15 usuarios",
          ],
        },
        {
          name: "Enterprise",
          tagline: "Construye ventaja competitiva",
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
            "Manager de cuenta dedicado",
          ],
        },
      ]
    : [
        {
          name: "Starter",
          tagline: "Digitize your operation",
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
            "Up to 3 users",
          ],
        },
        {
          name: "Business",
          tagline: "Scale with control",
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
            "Up to 15 users",
          ],
        },
        {
          name: "Enterprise",
          tagline: "Build competitive advantage",
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
            "Dedicated account manager",
          ],
        },
      ];

  const modules = isEs
    ? [
        { title: "Ventas y Facturación", body: "Registro de ventas, cotizaciones, notas de entrega y facturación fiscal integrada." },
        { title: "Control de Inventario", body: "Stock en tiempo real, alertas de quiebre, trazabilidad por lote y ubicación." },
        { title: "Compras y Proveedores", body: "Órdenes de compra, recepción de mercancía y gestión completa de proveedores." },
        { title: "Cuentas por Cobrar", body: "Seguimiento de deudas de clientes, estados de cuenta y cobros pendientes." },
        { title: "Cuentas por Pagar", body: "Gestión de pagos a proveedores, obligaciones y flujo de caja." },
        { title: "Tienda Online PWA", body: "E-commerce propio instalable con tu marca, catálogo y checkout integrado." },
        { title: "Logística y Envíos", body: "Repartidores con tracking GPS, zonas de cobertura y gestión de despachos." },
        { title: "Nómina y RRHH", body: "Pagos de nómina, comisiones de vendedores y gestión de empleados." },
        { title: "Contabilidad", body: "Balances, P&L, conciliación bancaria y reportes fiscales completos." },
        { title: "Marketing con IA", body: "Campañas Meta Ads sincronizadas con tu catálogo en tiempo real. (Enterprise)" },
        { title: "POS y Caja", body: "Punto de venta presencial, apertura/cierre de caja y reportes diarios." },
        { title: "API e Integraciones", body: "Conecta LUNA con pasarelas, marketplaces y sistemas externos. (Enterprise)" },
      ]
    : [
        { title: "Sales & Invoicing", body: "Sales records, quotes, delivery notes, and integrated fiscal invoicing." },
        { title: "Inventory Control", body: "Real-time stock, break alerts, lot and location traceability." },
        { title: "Purchases & Suppliers", body: "Purchase orders, goods receipt, and full supplier management." },
        { title: "Accounts Receivable", body: "Customer debt tracking, account statements, and pending collections." },
        { title: "Accounts Payable", body: "Supplier payment management, obligations, and cash flow." },
        { title: "Online Store PWA", body: "Installable e-commerce with your brand, catalog, and integrated checkout." },
        { title: "Logistics & Shipping", body: "Delivery drivers with GPS tracking, coverage zones, and dispatch management." },
        { title: "Payroll & HR", body: "Payroll payments, sales commissions, and employee management." },
        { title: "Accounting", body: "Balance sheets, P&L, bank reconciliation, and full tax reports." },
        { title: "AI Marketing", body: "Meta Ads campaigns synchronized with your catalog in real time. (Enterprise)" },
        { title: "POS & Register", body: "In-person point of sale, open/close register, and daily reports." },
        { title: "API & Integrations", body: "Connect LUNA to payment gateways, marketplaces, and external systems. (Enterprise)" },
      ];

  const aiCaps = isEs
    ? [
        { icon: "⚡", title: "Automatizaciones", body: "Tareas repetitivas en piloto automático: alertas, notificaciones, actualizaciones de stock y seguimientos sin intervención humana." },
        { icon: "📊", title: "Reportes ejecutivos", body: "Análisis auto-generados de ventas, finanzas e inventario con detección de anomalías y resúmenes diarios para gerencia." },
        { icon: "📣", title: "Marketing digital", body: "Campañas publicitarias en Facebook e Instagram generadas y sincronizadas automáticamente con tu catálogo de productos." },
        { icon: "🔍", title: "Clasificación inteligente", body: "LUNA organiza solo: segmenta clientes, clasifica inventario por rotación y prioriza pedidos por rentabilidad." },
        { icon: "💬", title: "Agentes conversacionales", body: "Chat integrado en tu tienda, WhatsApp y panel admin que responde, confirma pedidos y escala a humanos cuando es necesario." },
        { icon: "🎯", title: "Recomendaciones", body: "Sugiere el producto correcto al cliente correcto en el momento correcto, basado en historial de compras y stock disponible." },
      ]
    : [
        { icon: "⚡", title: "Automations", body: "Repetitive tasks on autopilot: alerts, notifications, stock updates, and follow-ups without human intervention." },
        { icon: "📊", title: "Executive reports", body: "Auto-generated analysis of sales, finance, and inventory with anomaly detection and daily summaries for management." },
        { icon: "📣", title: "Digital marketing", body: "Ad campaigns on Facebook and Instagram automatically generated and synchronized with your product catalog." },
        { icon: "🔍", title: "Smart classification", body: "LUNA organizes on its own: segments customers, classifies inventory by turnover, and prioritizes orders by profitability." },
        { icon: "💬", title: "Conversational agents", body: "Chat integrated in your store, WhatsApp, and admin panel that responds, confirms orders, and escalates to humans when needed." },
        { icon: "🎯", title: "Recommendations", body: "Suggests the right product to the right customer at the right time, based on purchase history and available stock." },
      ];

  const steps = isEs
    ? [
        { num: "01", title: "Análisis inicial", body: "Relevamos tu operación actual, procesos internos y necesidades específicas del negocio." },
        { num: "02", title: "Personalización", body: "Adaptamos colores, logo, dominio y estructura de módulos a la identidad de tu empresa." },
        { num: "03", title: "Configuración", body: "Parametrizamos productos, usuarios, roles, listas de precios y flujos de trabajo." },
        { num: "04", title: "Migración de datos", body: "Importamos tu historial de clientes, inventario y ventas al nuevo sistema." },
        { num: "05", title: "Capacitación", body: "Entrenamos a tu equipo con sesiones prácticas sobre cada módulo activo." },
        { num: "06", title: "Lanzamiento", body: "Activación supervisada en producción con tu equipo presente para resolver dudas en vivo." },
        { num: "07", title: "Soporte continuo", body: "Acompañamiento post-implementación, mejoras iterativas y soporte local en tu zona horaria." },
      ]
    : [
        { num: "01", title: "Initial analysis", body: "We map your current operation, internal processes, and specific business needs." },
        { num: "02", title: "Personalization", body: "We adapt colors, logo, domain, and module structure to your company's identity." },
        { num: "03", title: "Configuration", body: "We configure products, users, roles, price lists, and workflows." },
        { num: "04", title: "Data migration", body: "We import your customer history, inventory, and sales to the new system." },
        { num: "05", title: "Training", body: "We train your team with hands-on sessions for each active module." },
        { num: "06", title: "Launch", body: "Supervised production activation with your team present to resolve questions live." },
        { num: "07", title: "Ongoing support", body: "Post-implementation support, iterative improvements, and local support in your time zone." },
      ];

  return (
    <div className={`${display.variable} ${body.variable} space-y-14 font-[var(--font-body)]`}>
      <JsonLd data={structuredData} />

      {/* ── HERO ── */}
      <section className="premium-spotlight relative overflow-hidden border-y border-[#e5e7eb] bg-white px-6 py-12 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="premium-grid absolute inset-0 opacity-40" aria-hidden="true" />
        {/* Turquoise glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[400px]"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(20,217,217,0.07) 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto grid w-full max-w-[1760px] gap-10 xl:grid-cols-[1fr_1fr]">
          {/* Left: copy */}
          <div className="space-y-6">
            <Link
              href={`${base}/systems`}
              className="inline-flex rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#6b7280] transition hover:border-[#14D9D9]/30 hover:text-[#0a0d14]"
            >
              {t("back")}
            </Link>

            <div className="inline-flex">
              <Image
                src="/branding/luna-logo.png"
                alt="LUNA ERP inteligente by Trends172Tech"
                width={540}
                height={180}
                className="h-auto w-[280px] sm:w-[380px]"
                priority
              />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#14D9D9]/30 bg-[#14D9D9]/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0099a8]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {isEs ? "Plataforma Empresarial Inteligente" : "Intelligent Business Platform"}
            </div>

            <div className="space-y-5">
              <h1 className="max-w-2xl font-[var(--font-display)] text-4xl font-extrabold tracking-[-0.05em] text-[#0a0d14] sm:text-5xl lg:text-6xl">
                {isEs ? "Nunca verás dos LUNA iguales." : "No two LUNA instances look alike."}
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-[#4b5563] sm:text-lg">
                {isEs
                  ? "LUNA adopta el nombre, el logo, los colores y los procesos de tu empresa. Tu plataforma tecnológica propia, sin construirla desde cero."
                  : "LUNA takes on your company's name, logo, colors, and processes. Your own technology platform, without building it from scratch."}
              </p>
              <p className="max-w-xl text-sm leading-relaxed text-[#6b7280]">
                {isEs
                  ? "ERP · Tienda Online · Facturación · Logística · IA Operativa — todo bajo una sola identidad: la tuya."
                  : "ERP · Online Store · Invoicing · Logistics · Operational AI — all under one identity: yours."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={buildWhatsAppLink(isEs ? "Quiero una demo de LUNA para mi empresa" : "I want a LUNA demo for my company")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#14D9D9] px-6 py-3 text-sm font-semibold text-[#0a0d14] shadow-[0_4px_20px_rgba(20,217,217,0.30)] transition-all hover:bg-[#0099a8] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14D9D9] focus-visible:ring-offset-2"
              >
                {isEs ? "Solicitar demostración" : "Request a demo"}
              </Link>
              <Link
                href="#casos-reales"
                className="inline-flex items-center rounded-full border border-[#e5e7eb] bg-white px-6 py-3 text-sm font-semibold text-[#374151] transition hover:border-[#14D9D9]/30 hover:bg-[#f9fafb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14D9D9]/30"
              >
                {isEs ? "Ver casos reales" : "See real cases"}
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {(isEs
                ? ["White Label nativo", "Módulos activables", "IA operativa", "100% en la nube"]
                : ["Native White Label", "Activatable modules", "Operational AI", "100% cloud"]
              ).map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#14D9D9]/30 bg-[#f0fdfd] px-3 py-1 text-[11px] font-semibold text-[#0099a8]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#14D9D9]" />
                  {pill}
                </span>
              ))}
            </div>
          </div>

          {/* Right: screenshots panel */}
          <div className="interactive-panel premium-metal relative overflow-hidden rounded-[36px] border border-[#e5e7eb] bg-white p-4 shadow-[0_40px_110px_-74px_rgba(15,23,42,0.20)]">
            <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent_0%,rgba(20,217,217,0.3)_50%,transparent_100%)]" aria-hidden="true" />
            {/* Browser chrome */}
            <div className="mb-3 flex items-center gap-2 rounded-[18px] border border-[#e5e7eb] bg-[#f9fafb] px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400/70" />
                <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
                <span className="h-3 w-3 rounded-full bg-green-400/70" />
              </div>
              <div className="mx-3 flex-1 rounded-md bg-white px-3 py-1 text-[11px] text-[#9ca3af]">
                dekomundo.com
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#14D9D9]/10 px-2 py-1 text-[10px] font-semibold text-[#0099a8]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#14D9D9]" />
                LUNA
              </div>
            </div>

            {/* Imagen principal */}
            <div className="relative overflow-hidden rounded-[22px] border border-[#e5e7eb] bg-[#f9fafb]">
              <Image
                src="/screenshots/luna/luna-dekomundo-storefront.png"
                alt={isEs ? "Tienda DekoMundo — powered by LUNA" : "DekoMundo store — powered by LUNA"}
                width={1200}
                height={680}
                priority
                className="w-full object-cover object-top"
                sizes="(min-width: 1280px) 44vw, (min-width: 768px) 50vw, 100vw"
              />
              <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/70 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {isEs ? "Tienda en vivo" : "Live store"}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="group relative overflow-hidden rounded-[16px] border border-[#e5e7eb] bg-[#f9fafb]">
                <Image
                  src="/screenshots/luna/luna-admin-dashboard.png"
                  alt={isEs ? "Panel admin LUNA" : "LUNA admin panel"}
                  width={600}
                  height={360}
                  className="w-full object-cover object-top transition duration-300 group-hover:scale-[1.03]"
                  sizes="(min-width: 1280px) 22vw, 50vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-3 py-2">
                  <p className="text-[10px] font-semibold text-white">{isEs ? "Panel ejecutivo" : "Executive panel"}</p>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-[16px] border border-[#e5e7eb] bg-[#f9fafb]">
                <Image
                  src="/screenshots/luna/luna-dekomundo-catalogo.png"
                  alt={isEs ? "Catálogo inteligente LUNA" : "LUNA intelligent catalog"}
                  width={600}
                  height={360}
                  className="w-full object-cover object-top transition duration-300 group-hover:scale-[1.03]"
                  sizes="(min-width: 1280px) 22vw, 50vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-3 py-2">
                  <p className="text-[10px] font-semibold text-white">{isEs ? "Catálogo con IA" : "AI catalog"}</p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between px-1">
              <p className="text-[11px] text-[#9ca3af]">
                {isEs ? "Capturas reales · DekoMundo en producción" : "Real screenshots · DekoMundo in production"}
              </p>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {isEs ? "En vivo" : "Live"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── UNA PLATAFORMA. INFINITAS IDENTIDADES. ── */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px]">
          <div className="overflow-hidden rounded-[36px] border border-[#1e293b]/10 bg-[#0a0d14] px-6 py-10 shadow-[0_34px_100px_-68px_rgba(15,23,42,0.5)] sm:px-8 lg:px-10">
            <div className="mb-8 space-y-3 text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#14D9D9]">
                {isEs ? "ERP CAMALEÓNICO" : "CHAMELEON ERP"}
              </div>
              <h2 className="font-[var(--font-display)] text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl">
                {isEs ? "Una plataforma. Infinitas identidades." : "One platform. Infinite identities."}
              </h2>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-300">
                {isEs
                  ? "Dos empresas diferentes, la misma tecnología detrás. LUNA desaparece y deja que tu marca tome el protagonismo."
                  : "Two different companies, the same technology behind them. LUNA disappears and lets your brand take center stage."}
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.25fr_auto_0.75fr]">
              {/* Carpihogar card */}
              <div className="rounded-[28px] border border-amber-500/20 bg-[linear-gradient(135deg,#1a1200_0%,#0f1a1a_100%)] p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-amber-500/20">
                    <span className="text-lg">🪵</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">CarpiHogar.com</div>
                    <div className="text-[11px] text-amber-400/70">
                      {isEs ? "Implementación empresarial integral" : "Comprehensive enterprise implementation"}
                    </div>
                  </div>
                </div>
                <div className="mb-5 overflow-hidden rounded-[20px] border border-white/10 bg-black/20 p-2">
                  <Image
                    src="/screenshots/luna/carpihogar-real-mobile.jpg"
                    alt={isEs ? "CarpiHogar en producción con comercio móvil y búsqueda en Modo IA" : "CarpiHogar in production with mobile commerce and AI Mode search"}
                    width={766}
                    height={1536}
                    className="mx-auto max-h-[560px] w-auto rounded-[14px] object-contain"
                    sizes="(max-width: 1024px) 90vw, 38vw"
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-slate-200">
                    {isEs
                      ? "CarpiHogar es la implementación más amplia de LUNA desarrollada por Trends172Tech: una operación omnicanal en producción que conecta comercio electrónico, punto de venta, gestión empresarial, inventario, compras, finanzas, logística, postventa y equipos con responsabilidades diferentes dentro de una sola plataforma."
                      : "CarpiHogar is the broadest LUNA implementation developed by Trends172Tech: a production omnichannel operation connecting ecommerce, point of sale, business management, inventory, purchasing, finance, logistics, after-sales and teams with different responsibilities in one platform."}
                  </p>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400/80">
                    {isEs ? "Capacidades implementadas" : "Implemented capabilities"}
                  </div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {(isEs
                    ? [
                        "E-commerce, POS, ventas y checkout",
                        "Inventario, compras y proveedores",
                        "Finanzas, caja, cobros y reportes",
                        "Delivery, despacho y trazabilidad",
                        "Portales por rol y permisos",
                        "IA transaccional conectada a datos y acciones",
                        "Marketing conectado con Meta y WhatsApp",
                        "PWA, notificaciones y flujos automatizados",
                        "Proyectos, moodboards y visualización 3D",
                        "Aliados, inversionistas y gestores de marca",
                      ]
                    : [
                        "Ecommerce, POS, sales and checkout",
                        "Inventory, purchasing and suppliers",
                        "Finance, cash management, collections and reporting",
                        "Delivery, dispatch and traceability",
                        "Role-based portals and permissions",
                        "Transactional AI connected to data and actions",
                        "Marketing connected to Meta and WhatsApp",
                        "PWA, notifications and automated workflows",
                        "Projects, moodboards and 3D visualization",
                        "Allies, investors and brand managers",
                      ]
                  ).map((item) => (
                    <div key={item} className="flex items-start gap-2 rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2 text-[12px] leading-relaxed text-slate-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-[20px] border border-[#14D9D9]/25 bg-[#14D9D9]/[0.07] p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4DE5E5]">
                    {isEs ? "IA CONECTADA A TRANSACCIONES REALES" : "AI CONNECTED TO REAL TRANSACTIONS"}
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-white">
                    {isEs
                      ? "En CarpiHogar la IA no se limita a conversar: consulta información autorizada, interpreta documentos y ejecuta acciones dentro del flujo comercial."
                      : "At CarpiHogar, AI is not limited to conversation: it queries authorized information, interprets documents and executes actions within the commercial workflow."}
                  </p>
                  <div className="mt-3 space-y-2">
                    {(isEs
                      ? [
                          "Busca en la base de datos productos, categorías, marcas, precios y existencias reales.",
                          "Genera catálogos comerciales e imprimibles con imágenes, precios y stock controlados.",
                          "Recomienda productos y puede agregar, modificar o retirar artículos del carrito.",
                          "Conduce la compra, consulta métodos de pago y vincula la operación con una orden.",
                          "Recibe comprobantes, extrae método, moneda, monto y referencia, y los registra para validación controlada.",
                          "Consulta pedidos, direcciones y opciones de despacho según la identidad y los permisos del cliente.",
                        ]
                      : [
                          "Searches the database for real products, categories, brands, prices and inventory.",
                          "Generates commercial and printable catalogs with controlled images, prices and stock.",
                          "Recommends products and can add, update or remove items from the cart.",
                          "Guides purchases, retrieves payment methods and links the transaction to an order.",
                          "Receives payment proofs, extracts method, currency, amount and reference, and records them for controlled validation.",
                          "Retrieves orders, addresses and shipping options according to customer identity and permissions.",
                        ]
                    ).map((item) => (
                      <div key={item} className="flex items-start gap-2 text-[12px] leading-relaxed text-slate-300">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4DE5E5]" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-slate-400">
                    {isEs
                      ? "Cada acción se integra con reglas, identidad, permisos y validaciones para mantener control humano y trazabilidad sobre operaciones sensibles."
                      : "Each action is integrated with rules, identity, permissions and validations to preserve human control and traceability over sensitive operations."}
                  </p>
                </div>
                <div className="mt-5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300">
                    {isEs ? "INTELIGENCIA ESPECIALIZADA POR ÁREA" : "SPECIALIZED INTELLIGENCE BY AREA"}
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {(isEs
                      ? [
                          {
                            title: "Reportes ejecutivos",
                            body: "Analiza ventas, utilidad, inventario, cartera, compras, cuentas por pagar, envíos, mensajería, equipos, proyectos y tráfico web; entrega hallazgos, riesgos y acciones recomendadas.",
                          },
                          {
                            title: "Gráficos e informes interactivos",
                            body: "Convierte consultas en visualizaciones ejecutivas y reportes descargables para apoyar reuniones, seguimiento gerencial y decisiones por periodo.",
                          },
                          {
                            title: "Análisis limitado por rol",
                            body: "Cada inversionista o responsable consulta únicamente sus ventas, rentabilidad, pagos, productos, stock y rotación conforme a su alcance autorizado.",
                          },
                          {
                            title: "Inventario y rentabilidad",
                            body: "Detecta stock crítico, baja rotación, capital inmovilizado, productos con mejor desempeño y oportunidades de reposición o liquidación.",
                          },
                          {
                            title: "Catálogos y manuales",
                            body: "Genera catálogos comerciales listos para imprimir y documentación de apoyo utilizando información estructurada y datos reales de la operación.",
                          },
                          {
                            title: "Marketing y recomendaciones",
                            body: "Apoya campañas, copys, carruseles, perfiles de marca, remarketing y recomendaciones de productos conectadas con el contexto comercial.",
                          },
                        ]
                      : [
                          {
                            title: "Executive reporting",
                            body: "Analyzes sales, profit, inventory, receivables, purchasing, payables, shipping, messaging, teams, projects and web traffic; delivering findings, risks and recommended actions.",
                          },
                          {
                            title: "Interactive charts and reports",
                            body: "Turns questions into executive visualizations and downloadable reports for meetings, management follow-up and period-based decisions.",
                          },
                          {
                            title: "Role-scoped analysis",
                            body: "Each investor or manager accesses only their authorized sales, profitability, payments, products, inventory and turnover data.",
                          },
                          {
                            title: "Inventory and profitability",
                            body: "Detects critical stock, slow turnover, tied-up capital, top-performing products and replenishment or liquidation opportunities.",
                          },
                          {
                            title: "Catalogs and manuals",
                            body: "Generates print-ready commercial catalogs and support documentation from structured information and real operational data.",
                          },
                          {
                            title: "Marketing and recommendations",
                            body: "Supports campaigns, copy, carousels, brand profiles, remarketing and product recommendations connected to commercial context.",
                          },
                        ]
                    ).map((capability) => (
                      <div key={capability.title} className="rounded-2xl border border-violet-300/15 bg-violet-300/[0.055] p-3">
                        <div className="text-[12px] font-semibold text-violet-200">{capability.title}</div>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{capability.body}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
                    {isEs
                      ? "Estas capacidades no trabajan como módulos aislados: consultan fuentes autorizadas de la misma operación y respetan el alcance de cada perfil antes de responder o ejecutar una acción."
                      : "These capabilities do not operate as isolated modules: they query authorized sources from the same operation and respect each profile's scope before answering or executing an action."}
                  </p>
                </div>
                <p className="mt-4 text-[12px] leading-relaxed text-slate-400">
                  {isEs
                    ? "Esta experiencia permite adaptar el núcleo de LUNA a otras empresas, conectando sus procesos, datos, canales y reglas sin obligarlas a operar alrededor de un software rígido."
                    : "This experience allows the LUNA core to be adapted to other companies, connecting their processes, data, channels and rules without forcing them to operate around rigid software."}
                </p>
                <div className="mt-4 rounded-[14px] border border-amber-500/20 bg-amber-500/8 px-3 py-2 text-[11px] font-semibold text-amber-400/80">
                  {isEs ? "✓ En producción desde 2024" : "✓ In production since 2024"}
                </div>
                <Link
                  href={`${base}/projects/carpihogar`}
                  className="mt-4 inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-400/15"
                >
                  {isEs ? "Explorar el caso CarpiHogar" : "Explore the CarpiHogar case"}
                </Link>
              </div>

              {/* Center LUNA CORE badge */}
              <div className="flex flex-col items-center justify-center gap-3 py-4 lg:py-0">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#14D9D9]/30 to-transparent lg:h-full lg:w-px lg:bg-gradient-to-b" />
                <div className="flex shrink-0 flex-col items-center gap-2">
                  <div className="rounded-[18px] border border-[#14D9D9]/30 bg-[#14D9D9]/10 px-4 py-3 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#14D9D9]">LUNA</div>
                    <div className="text-[10px] font-semibold text-slate-400">CORE</div>
                  </div>
                  <div className="text-[10px] text-slate-500">{isEs ? "misma base" : "same base"}</div>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#14D9D9]/30 to-transparent lg:h-full lg:w-px lg:bg-gradient-to-b" />
              </div>

              {/* DekoMundo card */}
              <div className="rounded-[28px] border border-[#14D9D9]/20 bg-[linear-gradient(135deg,#001a18_0%,#0f1a1a_100%)] p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#14D9D9]/20">
                    <span className="text-lg">🎨</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">DekoMundo</div>
                    <div className="text-[11px] text-[#14D9D9]/70">dekomundo.com</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {(isEs
                    ? ["Tienda con catálogo de decoración", "Colores teal y diseño moderno", "App PWA con logo DekoMundo", "Panel admin personalizado", "Agentes IA configurados para retail"]
                    : ["Store with decoration catalog", "Teal colors and modern design", "PWA app with DekoMundo logo", "Custom admin panel", "AI agents configured for retail"]
                  ).map((item) => (
                    <div key={item} className="flex items-center gap-2 text-[13px] text-slate-300">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#14D9D9]" />
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-[14px] border border-[#14D9D9]/20 bg-[#14D9D9]/8 px-3 py-2 text-[11px] font-semibold text-[#14D9D9]/80">
                  {isEs ? "✓ Configurado · Listo para lanzar" : "✓ Configured · Ready to launch"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHITE LABEL ── */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px] space-y-8">
          <div className="space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0099a8]">
              {isEs ? "WHITE LABEL NATIVO" : "NATIVE WHITE LABEL"}
            </div>
            <h2 className="max-w-2xl font-[var(--font-display)] text-3xl font-extrabold tracking-[-0.04em] text-[#0a0d14] sm:text-4xl">
              {isEs ? "LUNA toma la identidad de tu empresa" : "LUNA takes on your company's identity"}
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-[#6b7280]">
              {isEs
                ? "No es una personalización superficial. LUNA adapta cada punto de contacto con tu cliente y tu equipo a la identidad de tu marca."
                : "This is not superficial customization. LUNA adapts every touchpoint with your customers and team to your brand's identity."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(isEs
              ? [
                  { icon: "🎨", title: "Tu logo, no el nuestro", body: "LUNA desaparece completamente. Tu marca toma el protagonismo en cada pantalla, notificación y documento." },
                  { icon: "🌐", title: "Tu dominio propio", body: "Tus clientes y empleados acceden desde app.tuempresa.com — nunca ven que es LUNA por detrás." },
                  { icon: "📱", title: "Tu app instalable", body: "La PWA se instala en el celular con el ícono de tu empresa. Tu app, tu marca, tu presencia digital." },
                  { icon: "🏪", title: "Tu tienda al frente", body: "El catálogo online, el checkout y las notificaciones usan tus colores, tipografías y tono de marca." },
                  { icon: "📊", title: "Tu panel de control", body: "El dashboard y los módulos internos se adaptan a los términos y procesos propios de tu industria." },
                  { icon: "📄", title: "Tus documentos oficiales", body: "Facturas, cotizaciones, reportes y guías de despacho salen con tu logo y razón social." },
                ]
              : [
                  { icon: "🎨", title: "Your logo, not ours", body: "LUNA completely disappears. Your brand takes center stage on every screen, notification, and document." },
                  { icon: "🌐", title: "Your own domain", body: "Your customers and employees access from app.yourcompany.com — they never see LUNA behind it." },
                  { icon: "📱", title: "Your installable app", body: "The PWA installs on phones with your company's icon. Your app, your brand, your digital presence." },
                  { icon: "🏪", title: "Your store first", body: "The online catalog, checkout, and notifications use your colors, typography, and brand tone." },
                  { icon: "📊", title: "Your control panel", body: "The dashboard and internal modules adapt to the terms and processes specific to your industry." },
                  { icon: "📄", title: "Your official documents", body: "Invoices, quotes, reports, and dispatch guides come out with your logo and legal name." },
                ]
            ).map((item) => (
              <div
                key={item.title}
                className="rounded-[26px] border border-[#e5e7eb] bg-white px-5 py-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#14D9D9]/30 hover:shadow-[0_8px_32px_rgba(20,217,217,0.10)]"
              >
                <div className="mb-3 text-2xl">{item.icon}</div>
                <div className="mb-2 text-sm font-bold text-[#0a0d14]">{item.title}</div>
                <p className="text-sm leading-relaxed text-[#6b7280]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MÓDULOS ── */}
      <section className="relative overflow-hidden border-y border-[#e5e7eb] bg-[#fafafa] px-6 py-12 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="premium-grid absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1760px] space-y-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#14D9D9]/30 bg-[#14D9D9]/8 px-5 py-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0099a8]">LUNA CORE</span>
            </div>
            <h2 className="max-w-2xl font-[var(--font-display)] text-3xl font-extrabold tracking-[-0.04em] text-[#0a0d14]">
              {isEs ? "Activa solo los módulos que necesitas" : "Activate only the modules you need"}
            </h2>
            <p className="max-w-xl text-base text-[#6b7280]">
              {isEs
                ? "Empieza con lo esencial y agrega capacidades a medida que tu empresa crece. Sin migrar, sin reiniciar."
                : "Start with the essentials and add capabilities as your business grows. No migration, no restart."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {modules.map((item, index) => (
              <div
                key={item.title}
                className="rounded-[22px] border border-[#e5e7eb] bg-white px-4 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all hover:border-[#14D9D9]/30 hover:shadow-[0_4px_16px_rgba(20,217,217,0.08)]"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-[#0a0d14]">{item.title}</div>
                  <div className="rounded-full border border-[#e5e7eb] bg-[#fafafa] px-2 py-0.5 text-[10px] font-semibold text-[#9ca3af]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-[#6b7280]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IA OPERATIVA ── */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px]">
          <div className="rounded-[36px] border border-[#1e293b]/10 bg-[#0a0d14] px-6 py-10 shadow-[0_34px_100px_-68px_rgba(15,23,42,0.5)] sm:px-8 lg:px-10">
            <div className="space-y-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#14D9D9]">
                {isEs ? "INTELIGENCIA ARTIFICIAL OPERATIVA" : "OPERATIONAL ARTIFICIAL INTELLIGENCE"}
              </div>
              <h2 className="font-[var(--font-display)] text-3xl font-extrabold tracking-[-0.04em] text-white">
                {isEs ? "IA que trabaja dentro de tu plataforma" : "AI that works inside your platform"}
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-slate-300">
                {isEs
                  ? "No es IA decorativa. Los agentes de LUNA ejecutan tareas reales: automatizan procesos, generan reportes y atienden clientes sin intervención humana."
                  : "This is not decorative AI. LUNA's agents execute real tasks: automate processes, generate reports, and serve customers without human intervention."}
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {aiCaps.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[26px] border border-white/8 bg-white/[0.04] px-5 py-5 backdrop-blur transition-all hover:border-[#14D9D9]/20 hover:bg-[#14D9D9]/5"
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

      {/* ── CASOS REALES ── */}
      <section id="casos-reales" className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px] space-y-8">
          <div className="space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0099a8]">
              {isEs ? "CASOS REALES" : "REAL CASES"}
            </div>
            <h2 className="font-[var(--font-display)] text-3xl font-extrabold tracking-[-0.04em] text-[#0a0d14]">
              {isEs ? "LUNA en empresas reales" : "LUNA in real businesses"}
            </h2>
            <p className="max-w-2xl text-base text-[#6b7280]">
              {isEs
                ? "Instalaciones activas y configuradas. Dos empresas distintas, una plataforma adaptada a cada una."
                : "Active and configured installations. Two different businesses, one platform adapted to each."}
            </p>
          </div>

          {/* DekoMundo screenshots */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#14D9D9]/15">
                <span className="text-sm">🎨</span>
              </div>
              <div>
                <div className="text-sm font-bold text-[#0a0d14]">DekoMundo</div>
                <div className="text-[11px] text-[#6b7280]">{isEs ? "Decoración y diseño · Instalación completa con IA" : "Decoration and design · Full installation with AI"}</div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {(isEs
                ? [
                    { src: "/screenshots/luna/luna-tienda-ia.png", label: "Tienda · Modo IA activo", desc: "Catálogo con búsqueda inteligente, recomendaciones personalizadas y ofertas del día activadas." },
                    { src: "/screenshots/luna/luna-agentes-ia.png", label: "Centro de Agentes IA", desc: "6 agentes especializados: catálogos, reportes, marketing, inventario, soporte y ventas." },
                    { src: "/screenshots/luna/luna-agente-inventario.png", label: "Agente IA de Inventario", desc: "Consultas en lenguaje natural: stock crítico, rentabilidad y qué liquidar, al instante." },
                  ]
                : [
                    { src: "/screenshots/luna/luna-tienda-ia.png", label: "Store · AI Mode active", desc: "Catalog with smart search, personalized recommendations, and daily deals activated." },
                    { src: "/screenshots/luna/luna-agentes-ia.png", label: "AI Agents Center", desc: "6 specialized agents: catalogs, reports, marketing, inventory, support, and sales." },
                    { src: "/screenshots/luna/luna-agente-inventario.png", label: "Inventory AI Agent", desc: "Natural language queries: critical stock, profitability, and what to liquidate, instantly." },
                  ]
              ).map((item) => (
                <div
                  key={item.label}
                  className="group overflow-hidden rounded-[24px] border border-[#e5e7eb] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(20,217,217,0.10)]"
                >
                  <div className="relative aspect-video overflow-hidden bg-[#f9fafb]">
                    <Image
                      src={item.src}
                      alt={item.label}
                      fill
                      className="object-cover object-top transition duration-500 group-hover:scale-[1.02]"
                      sizes="(min-width: 768px) 30vw, 100vw"
                    />
                  </div>
                  <div className="px-4 py-4">
                    <div className="text-sm font-semibold text-[#0a0d14]">{item.label}</div>
                    <p className="mt-1 text-xs leading-relaxed text-[#6b7280]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carpihogar note */}
          <div className="flex items-start gap-4 rounded-[22px] border border-amber-200/60 bg-amber-50/60 px-5 py-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-amber-100">
              <span className="text-base">🪵</span>
            </div>
            <div>
              <div className="text-sm font-bold text-[#0a0d14]">
                Carpihogar — {isEs ? "Primer caso de LUNA en producción" : "First LUNA case in production"}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-[#6b7280]">
                {isEs
                  ? "Carpintería y hogar. LUNA activo desde 2024 con tienda online propia, control de inventario, facturación fiscal y atención por WhatsApp. El caso que validó la plataforma."
                  : "Carpentry and home. LUNA active since 2024 with its own online store, inventory control, fiscal invoicing, and WhatsApp support. The case that validated the platform."}
              </p>
              <Button asChild variant="outline" className="mt-3">
                <Link href={`${base}/projects`}>{isEs ? "Ver proyecto completo" : "View full project"}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLANES ── */}
      <section className="relative overflow-hidden border-y border-[#e5e7eb] bg-[#fafafa] px-6 py-14 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="premium-grid absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1760px] space-y-10">
          <div className="space-y-3 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0099a8]">
              {isEs ? "PLANES" : "PLANS"}
            </div>
            <h2 className="font-[var(--font-display)] text-4xl font-extrabold tracking-[-0.05em] text-[#0a0d14]">
              {isEs ? "Elige el plan para tu empresa" : "Choose the plan for your business"}
            </h2>
            <p className="mx-auto max-w-2xl text-base text-[#6b7280]">
              {isEs
                ? "Activa solo los módulos que necesitas. Escala en cualquier momento sin perder tus datos ni tu historial."
                : "Activate only the modules you need. Scale at any time without losing your data or history."}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-[32px] border p-7 shadow-[0_2px_32px_rgba(0,0,0,0.06)] ${
                  plan.dark
                    ? "border-[#14D9D9]/20 bg-[#0a0d14] text-white"
                    : "border-[#e5e7eb] bg-white text-[#0a0d14]"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#14D9D9] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0a0d14] shadow-[0_4px_16px_rgba(20,217,217,0.35)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0a0d14]/30" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-1">
                  <div className={`text-[11px] font-bold uppercase tracking-[0.22em] ${plan.dark ? "text-[#14D9D9]" : "text-[#0099a8]"}`}>
                    LUNA
                  </div>
                  <div className="font-[var(--font-display)] text-2xl font-extrabold tracking-[-0.03em]">
                    {plan.name}
                  </div>
                  <div className={`text-sm ${plan.dark ? "text-slate-300" : "text-[#6b7280]"}`}>
                    {plan.tagline}
                  </div>
                </div>

                <div className={`mt-4 rounded-[14px] border px-3 py-2 text-[11px] font-semibold ${
                  plan.dark
                    ? "border-white/10 bg-white/5 text-slate-300"
                    : "border-[#e5e7eb] bg-[#f9fafb] text-[#6b7280]"
                }`}>
                  <span className="text-[#9ca3af]">{isEs ? "Ideal para: " : "Ideal for: "}</span>
                  <span className={plan.dark ? "text-slate-200" : "text-[#374151]"}>{plan.ideal}</span>
                </div>

                <div className={`my-6 h-px ${plan.dark ? "bg-white/10" : "bg-[#f3f4f6]"}`} />

                <ul className="flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex items-start gap-2.5 text-sm ${plan.dark ? "text-slate-200" : "text-[#4b5563]"}`}>
                      <svg
                        className={`mt-0.5 h-4 w-4 shrink-0 ${plan.dark ? "text-[#14D9D9]" : "text-[#0099a8]"}`}
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
                    href={buildWhatsAppLink(
                      isEs
                        ? `Quiero información sobre LUNA ${plan.name}`
                        : `I would like information about LUNA ${plan.name}`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      plan.dark
                        ? "bg-[#14D9D9] text-[#0a0d14] shadow-[0_4px_20px_rgba(20,217,217,0.30)] hover:bg-[#0099a8] hover:text-white focus-visible:ring-[#14D9D9]"
                        : "bg-[#0a0d14] text-white hover:bg-[#14D9D9] hover:text-[#0a0d14] focus-visible:ring-[#0a0d14]"
                    }`}
                  >
                    {plan.name === "Enterprise" ? (isEs ? "Hablar con un asesor" : "Talk to an advisor") : (isEs ? "Solicitar información" : "Request information")}
                  </Link>
                  <div className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9ca3af]">
                    {isEs ? "Consulta precios" : "Ask for pricing"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPLEMENTACIÓN ACELERADA ── */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px] space-y-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
            <div className="space-y-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0099a8]">
                {isEs ? "IMPLEMENTACIÓN ACELERADA" : "ACCELERATED IMPLEMENTATION"}
              </div>
              <h2 className="font-[var(--font-display)] text-3xl font-extrabold tracking-[-0.04em] text-[#0a0d14]">
                {isEs ? "De cero a operando en semanas" : "From zero to operating in weeks"}
              </h2>
              <p className="text-base leading-relaxed text-[#6b7280]">
                {isEs
                  ? "Nuestro equipo local guía cada fase. Sin tickets internacionales, sin tiempos de espera indefinidos."
                  : "Our local team guides every phase. No international tickets, no indefinite wait times."}
              </p>
              <div className="space-y-2 pt-2">
                {(isEs
                  ? ["Soporte local en tu zona horaria", "Capacitación en español incluida", "Datos migrados sin pérdida", "Acompañamiento post-lanzamiento"]
                  : ["Local support in your time zone", "Training in Spanish included", "Data migrated without loss", "Post-launch support included"]
                ).map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-[#4b5563]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#14D9D9]" />
                    {item}
                  </div>
                ))}
              </div>
              <Link
                href={buildWhatsAppLink(isEs ? "Quiero iniciar la implementación de LUNA" : "I want to start the LUNA implementation")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#0a0d14] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#14D9D9] hover:text-[#0a0d14]"
              >
                {isEs ? "Iniciar proceso" : "Start the process"}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {steps.map((step) => (
                <div
                  key={step.num}
                  className="rounded-[22px] border border-[#e5e7eb] bg-white px-5 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all hover:border-[#14D9D9]/30 hover:shadow-[0_4px_16px_rgba(20,217,217,0.08)]"
                >
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0fdfd] text-[11px] font-bold text-[#0099a8]">
                      {step.num}
                    </span>
                    <span className="text-sm font-semibold text-[#0a0d14]">{step.title}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#6b7280]">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LUNA EN ACCIÓN ── */}
      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px] space-y-8">
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0099a8]">
              {isEs ? "SISTEMA REAL EN PRODUCCIÓN" : "REAL SYSTEM IN PRODUCTION"}
            </div>
            <h2 className="font-[var(--font-display)] text-3xl font-extrabold tracking-[-0.04em] text-[#0a0d14]">
              {isEs ? "Así se ve LUNA por dentro" : "This is what LUNA looks like inside"}
            </h2>
            <p className="max-w-2xl text-base text-[#6b7280]">
              {isEs
                ? "Capturas reales de una instalación activa de LUNA. Cada vista está diseñada para que tu equipo opere con claridad y velocidad."
                : "Real screenshots from an active LUNA installation. Every view is designed for your team to operate with clarity and speed."}
            </p>
          </div>

          {/* Panel admin — full width */}
          <div className="relative overflow-hidden rounded-[28px] border border-[#e5e7eb] bg-[#f9fafb] shadow-[0_4px_32px_rgba(0,0,0,0.06)]">
            <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/30 bg-slate-950/75 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {isEs ? "Panel Admin · Vista ejecutiva" : "Admin Panel · Executive view"}
            </div>
            <Image
              src="/screenshots/luna/luna-admin-dashboard.png"
              alt={isEs ? "Panel de administración LUNA con métricas en tiempo real" : "LUNA admin dashboard with real-time metrics"}
              width={1536}
              height={864}
              className="w-full object-cover"
              sizes="(min-width: 1280px) 82vw, 100vw"
            />
          </div>

          {/* 3-column */}
          <div className="grid gap-4 md:grid-cols-3">
            {(isEs
              ? [
                  { src: "/screenshots/luna/luna-tienda-ia.png", label: "Tienda · Modo IA", desc: "Búsqueda por texto, imagen o QR. Ofertas del día y recomendaciones personalizadas activadas." },
                  { src: "/screenshots/luna/luna-asistente-ia.png", label: "Asistente IA de ventas", desc: "Recomienda productos, confirma pedidos y atiende por chat en tiempo real directamente en la tienda." },
                  { src: "/screenshots/luna/luna-agentes-ia.png", label: "Centro de Agentes IA", desc: "Catálogos, reportes ejecutivos, marketing digital, inventario y soporte: todos automatizados." },
                ]
              : [
                  { src: "/screenshots/luna/luna-tienda-ia.png", label: "Store · AI Mode", desc: "Search by text, image, or QR. Daily offers and personalized recommendations activated." },
                  { src: "/screenshots/luna/luna-asistente-ia.png", label: "AI Sales Assistant", desc: "Recommends products, confirms orders, and handles chat in real time directly in the store." },
                  { src: "/screenshots/luna/luna-agentes-ia.png", label: "AI Agents Center", desc: "Catalogs, executive reports, digital marketing, inventory, and support: all automated." },
                ]
            ).map((item) => (
              <div
                key={item.label}
                className="group overflow-hidden rounded-[24px] border border-[#e5e7eb] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(20,217,217,0.10)]"
              >
                <div className="relative aspect-video overflow-hidden bg-[#f9fafb]">
                  <Image
                    src={item.src}
                    alt={item.label}
                    fill
                    className="object-cover object-top transition duration-500 group-hover:scale-[1.02]"
                    sizes="(min-width: 768px) 30vw, 100vw"
                  />
                </div>
                <div className="px-4 py-4">
                  <div className="text-sm font-semibold text-[#0a0d14]">{item.label}</div>
                  <p className="mt-1 text-xs leading-relaxed text-[#6b7280]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 2-column */}
          <div className="grid gap-4 md:grid-cols-2">
            {(isEs
              ? [
                  { src: "/screenshots/luna/luna-agente-inventario.png", label: "Agente IA de Inventario", desc: "Consultas en lenguaje natural: stock crítico, rentabilidad, qué liquidar y reportes para gerencia, al instante." },
                  { src: "/screenshots/luna/luna-nueva-venta.png", label: "Nueva Venta · POS / Tienda", desc: "Registro completo: cliente, vendedor, dirección de envío, modo de precio (P1/P2/P3) y tipo de documento fiscal." },
                ]
              : [
                  { src: "/screenshots/luna/luna-agente-inventario.png", label: "Inventory AI Agent", desc: "Natural language queries: critical stock, profitability, what to liquidate, and management reports — instantly." },
                  { src: "/screenshots/luna/luna-nueva-venta.png", label: "New Sale · POS / Store", desc: "Full sale entry: customer, seller, shipping address, pricing mode (P1/P2/P3), and fiscal document type." },
                ]
            ).map((item) => (
              <div
                key={item.label}
                className="group overflow-hidden rounded-[24px] border border-[#e5e7eb] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(20,217,217,0.10)]"
              >
                <div className="relative aspect-video overflow-hidden bg-[#f9fafb]">
                  <Image
                    src={item.src}
                    alt={item.label}
                    fill
                    className="object-cover object-top transition duration-500 group-hover:scale-[1.02]"
                    sizes="(min-width: 768px) 48vw, 100vw"
                  />
                </div>
                <div className="px-4 py-4">
                  <div className="text-sm font-semibold text-[#0a0d14]">{item.label}</div>
                  <p className="mt-1 text-xs leading-relaxed text-[#6b7280]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative overflow-hidden border-y border-[#1e293b]/10 bg-[#0a0d14] px-6 py-16 text-white sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="absolute inset-0 opacity-70" aria-hidden="true">
          <div className="absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(20,217,217,0.18),_transparent_70%)] blur-3xl" />
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(0,153,168,0.15),_transparent_70%)] blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(20,217,217,0.08),_transparent_70%)] blur-2xl" />
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-[1760px] flex-col items-center gap-8 text-center lg:gap-10">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#14D9D9]/30 bg-[#14D9D9]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#14D9D9]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#14D9D9]" />
              LUNA ERP · {isEs ? "Por Trends172 Tech" : "By Trends172 Tech"}
            </div>
            <h2 className="font-[var(--font-display)] text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">
              {isEs
                ? "Tu marca al frente. Nuestra tecnología detrás."
                : "Your brand in front. Our technology behind."}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-300">
              {isEs
                ? "LUNA es la plataforma que tu empresa necesita para competir al nivel de las grandes, con la agilidad de las pequeñas. Tu empresa con su propia plataforma tecnológica."
                : "LUNA is the platform your company needs to compete at the level of the big players, with the agility of the small ones. Your company with its own technology platform."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href={buildWhatsAppLink(isEs ? "Quiero una demo de LUNA para mi empresa" : "I want a LUNA demo for my company")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#14D9D9] px-7 py-4 text-sm font-semibold text-[#0a0d14] shadow-[0_4px_24px_rgba(20,217,217,0.35)] transition-all hover:bg-[#0099a8] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14D9D9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0d14]"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.12 1.535 5.845L0 24l6.337-1.513A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.809 9.809 0 01-5.001-1.368l-.358-.214-3.726.889.926-3.619-.235-.372A9.818 9.818 0 012.182 12C2.182 6.573 6.573 2.182 12 2.182S21.818 6.573 21.818 12 17.427 21.818 12 21.818z" />
              </svg>
              {isEs ? "Solicitar demostración" : "Request a demo"}
            </Link>
            <Link
              href={buildWhatsAppLink(isEs ? "Quiero implementar LUNA en mi empresa" : "I want to implement LUNA in my company")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-white/20 bg-white/8 px-7 py-4 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0d14]"
            >
              {isEs ? "Hablar con un asesor" : "Talk to an advisor"}
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#14D9D9]" />{isEs ? "Sin permanencia mínima" : "No lock-in"}</span>
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#14D9D9]" />{isEs ? "Demo sin costo" : "Free demo"}</span>
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#14D9D9]" />{isEs ? "Implementación guiada" : "Guided implementation"}</span>
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#14D9D9]" />{isEs ? "Soporte local Venezuela" : "Local Venezuela support"}</span>
          </div>
        </div>
      </section>

    </div>
  );
}
