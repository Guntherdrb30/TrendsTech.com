'use client';

import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';

/* ── Fade-up reusable ── */
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Nav ── */
function Nav({ fontClass }: { fontClass: string }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${fontClass} ${
        scrolled ? 'border-b border-[#e5e7eb] bg-white/90 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/es" className="flex items-center gap-2.5">
          <div className="relative h-8 w-8">
            <Image src="/branding/trends172tech-logo.png" alt="Trends172Tech" fill className="object-contain" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-[#0a0d14]">Trends172Tech</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {[
            { label: 'LUNA ERP AI', href: '/es/systems/luna' },
            { label: 'Carpihogar', href: 'https://www.carpihogar.com' },
            { label: 'Ecosistema', href: '/es' },
            { label: 'Contacto', href: '/es/contact' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[14px] font-medium text-[#6b7280] transition-colors hover:text-[#0a0d14]"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Link
          href="/es/systems/luna"
          className="hidden h-9 items-center rounded-full bg-[#0a0d14] px-5 text-[13px] font-semibold text-white transition-all hover:bg-[#1a1d24] md:flex"
        >
          Ver LUNA ERP
        </Link>
      </nav>
    </header>
  );
}

/* ── Hero ── */
function Hero({ fontClass }: { fontClass: string }) {
  return (
    <section className={`relative overflow-hidden bg-white pt-32 pb-20 ${fontClass}`}>
      {/* Turquoise radial glow top center */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full opacity-25"
        style={{ background: 'radial-gradient(ellipse at center, #14D9D9 0%, transparent 70%)' }}
      />
      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#14D9D9 1px, transparent 1px), linear-gradient(90deg, #14D9D9 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <div
              className="absolute -inset-6 rounded-3xl opacity-40"
              style={{ background: 'radial-gradient(circle, #14D9D9 0%, transparent 70%)', filter: 'blur(24px)' }}
            />
            <div className="relative h-28 w-28 rounded-3xl border border-[#14D9D9]/20 bg-white/80 p-3 shadow-[0_0_80px_rgba(20,217,217,0.15)]">
              <Image src="/branding/trends172tech-logo.png" alt="Trends172Tech" fill className="object-contain p-2" priority />
            </div>
          </div>
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#14D9D9]/30 bg-[#14D9D9]/5 px-4 py-1.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#14D9D9]" />
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#14D9D9]">
            Software · IA · Automatización
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5 text-[56px] font-extrabold leading-[1.06] tracking-[-0.04em] text-[#0a0d14] sm:text-[72px] lg:text-[88px]"
        >
          Tecnología que{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #14D9D9 0%, #0fb8b8 50%, #08a8a8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            impulsa
          </span>{' '}
          el futuro
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: 'easeOut' }}
          className="mx-auto mb-10 max-w-xl text-[18px] font-normal leading-relaxed text-[#6b7280]"
        >
          Software empresarial, Inteligencia Artificial y Automatización para empresas modernas.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/es/systems/luna"
            className="group flex h-12 items-center gap-2 rounded-full bg-[#0a0d14] px-7 text-[15px] font-semibold text-white shadow-lg transition-all hover:bg-[#14D9D9] hover:shadow-[0_8px_30px_rgba(20,217,217,0.35)]"
          >
            Conocer LUNA ERP AI
            <svg className="transition-transform group-hover:translate-x-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href="/es"
            className="flex h-12 items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-7 text-[15px] font-semibold text-[#374151] transition-all hover:border-[#14D9D9]/40 hover:shadow-md"
          >
            Explorar Ecosistema
          </Link>
        </motion.div>

        {/* Hero product preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-16 overflow-hidden rounded-2xl border border-[#e5e7eb] shadow-[0_32px_100px_rgba(0,0,0,0.10)]"
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}

/* ── Inline dashboard mockup ── */
function DashboardMockup() {
  return (
    <div className="bg-[#0a0d14] p-0">
      {/* Browser chrome */}
      <div className="flex h-9 items-center gap-1.5 border-b border-white/5 bg-[#0f1318] px-4">
        <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <div className="mx-auto flex h-5 w-72 items-center rounded-md bg-white/5 px-3">
          <span className="text-[10px] text-white/30">luna.trends172tech.com</span>
        </div>
      </div>
      {/* Content */}
      <div className="flex h-80 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden w-48 shrink-0 border-r border-white/5 p-4 sm:block">
          <div className="mb-5 flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-[#14D9D9]/20">
              <div className="mx-auto mt-1 h-1 w-3 rounded bg-[#14D9D9]" />
            </div>
            <span className="text-[11px] font-semibold text-white">LUNA ERP AI</span>
          </div>
          {['Dashboard', 'Ventas', 'Inventario', 'Compras', 'IA Insights', 'Reportes'].map((item, i) => (
            <div
              key={item}
              className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5 ${i === 0 ? 'bg-[#14D9D9]/10' : ''}`}
            >
              <div className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-[#14D9D9]' : 'bg-white/20'}`} />
              <span className={`text-[11px] ${i === 0 ? 'font-medium text-[#14D9D9]' : 'text-white/40'}`}>{item}</span>
            </div>
          ))}
        </div>
        {/* Main */}
        <div className="flex-1 overflow-hidden p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-white">Dashboard General</span>
            <div className="rounded-full border border-[#14D9D9]/30 bg-[#14D9D9]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#14D9D9]">IA Activa</div>
          </div>
          {/* Stats row */}
          <div className="mb-4 grid grid-cols-4 gap-2">
            {[
              { label: 'Ventas hoy', val: '$2,840', up: true },
              { label: 'Facturas', val: '48', up: true },
              { label: 'Stock bajo', val: '3 items', up: false },
              { label: 'Clientes', val: '124', up: true },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/5 bg-white/[0.04] p-3">
                <p className="mb-1 text-[9px] text-white/30">{s.label}</p>
                <p className="text-[14px] font-bold text-white">{s.val}</p>
                <p className={`text-[9px] ${s.up ? 'text-[#14D9D9]' : 'text-red-400'}`}>{s.up ? '↑ 12%' : '↓ 2%'}</p>
              </div>
            ))}
          </div>
          {/* Chart bars */}
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
            <p className="mb-3 text-[10px] font-medium text-white/50">Ventas — últimos 7 días</p>
            <div className="flex h-16 items-end gap-1.5">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm"
                  style={{
                    height: `${h}%`,
                    background: i === 5 ? '#14D9D9' : 'rgba(20,217,217,0.2)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Trust strip ── */
function TrustStrip({ fontClass }: { fontClass: string }) {
  return (
    <div className={`border-y border-[#f3f4f6] bg-[#fafafa] py-5 ${fontClass}`}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-3">
          <span className="text-[12px] font-medium uppercase tracking-[0.15em] text-[#9ca3af]">Tecnología de nivel mundial</span>
          <div className="h-px w-8 bg-[#e5e7eb]" />
          {['Venezuela', 'Latinoamérica', 'ERP AI', 'Automatización', 'SaaS Empresarial'].map((t) => (
            <span key={t} className="text-[13px] font-medium text-[#6b7280]">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Carousel ── */
const CAROUSEL_ITEMS = [
  {
    tag: 'ERP AI',
    title: 'LUNA ERP AI',
    desc: 'Dashboard con analítica avanzada, insights de IA y gestión operativa en tiempo real.',
    accent: '#14D9D9',
    bg: '#0a0d14',
    mockup: 'erp',
  },
  {
    tag: 'Marketplace',
    title: 'Carpihogar',
    desc: 'La Tienda Inteligente de Venezuela. E-commerce operado sobre LUNA ERP AI.',
    accent: '#f97316',
    bg: '#0f0a08',
    mockup: 'store',
  },
  {
    tag: 'Automatización',
    title: 'Agentes IA',
    desc: 'Flujos automáticos, agentes inteligentes y procesamiento de datos sin intervención humana.',
    accent: '#8b5cf6',
    bg: '#09080f',
    mockup: 'agents',
  },
  {
    tag: 'Transformación',
    title: 'Proyectos Digitales',
    desc: 'Plataformas a medida, SaaS, dashboards y soluciones para empresas modernas.',
    accent: '#10b981',
    bg: '#040f0a',
    mockup: 'projects',
  },
];

function CarouselCard({ item }: { item: typeof CAROUSEL_ITEMS[0] }) {
  return (
    <div
      className="relative flex w-[340px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-white/5 sm:w-[480px]"
      style={{ background: item.bg }}
    >
      {/* Card header */}
      <div className="p-6">
        <span
          className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]"
          style={{ background: `${item.accent}15`, color: item.accent }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.accent }} />
          {item.tag}
        </span>
        <h3 className="mb-2 text-[22px] font-bold text-white">{item.title}</h3>
        <p className="text-[14px] leading-relaxed text-white/50">{item.desc}</p>
      </div>
      {/* Mini mockup */}
      <div className="mx-6 mb-6 overflow-hidden rounded-xl border border-white/5">
        <CarouselMockup type={item.mockup} accent={item.accent} />
      </div>
    </div>
  );
}

function CarouselMockup({ type, accent }: { type: string; accent: string }) {
  if (type === 'store') {
    return (
      <div className="bg-white p-4">
        <div className="mb-3 flex gap-2">
          {['Inicio', 'Productos', 'Ofertas'].map((t, i) => (
            <span key={t} className={`text-[10px] font-medium ${i === 0 ? 'text-[#f97316]' : 'text-gray-400'}`}>{t}</span>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-gray-100">
              <div className="h-12 bg-gradient-to-br from-orange-50 to-amber-50" />
              <div className="p-1.5">
                <div className="mb-1 h-1.5 w-full rounded bg-gray-100" />
                <div className="h-2 w-2/3 rounded bg-orange-400/30" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (type === 'agents') {
    return (
      <div className="bg-[#09080f] p-4">
        <div className="space-y-2">
          {['Agente Ventas', 'Agente Inventario', 'Agente Reportes', 'Agente Soporte'].map((a, i) => (
            <div key={a} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.04] px-3 py-2">
              <div className="h-2 w-2 animate-pulse rounded-full" style={{ background: accent, animationDelay: `${i * 0.3}s` }} />
              <span className="flex-1 text-[11px] text-white/60">{a}</span>
              <span className="text-[9px] font-medium" style={{ color: accent }}>Activo</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (type === 'projects') {
    return (
      <div className="bg-[#040f0a] p-4">
        <div className="grid grid-cols-2 gap-2">
          {['SaaS Platform', 'ERP Module', 'AI Pipeline', 'Mobile App'].map((p) => (
            <div key={p} className="rounded-lg border border-white/5 bg-white/[0.04] p-2.5">
              <div className="mb-1.5 h-4 w-full rounded bg-green-400/10" />
              <span className="text-[10px] text-white/50">{p}</span>
              <div className="mt-1 h-0.5 w-3/4 rounded" style={{ background: accent + '60' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  // ERP default
  return (
    <div style={{ background: '#0f1318' }} className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-medium text-white/50">Dashboard</span>
        <span className="rounded-full px-2 py-0.5 text-[9px]" style={{ background: `${accent}20`, color: accent }}>Live</span>
      </div>
      <div className="mb-2 grid grid-cols-3 gap-1.5">
        {['$12.4k', '248', '99%'].map((v) => (
          <div key={v} className="rounded-lg border border-white/5 bg-white/[0.04] py-2 text-center">
            <p className="text-[12px] font-bold" style={{ color: accent }}>{v}</p>
          </div>
        ))}
      </div>
      <div className="h-20 rounded-lg border border-white/5 bg-white/[0.03] p-2">
        <div className="flex h-full items-end gap-1">
          {[30, 55, 40, 70, 50, 85, 65].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: i === 5 ? accent : `${accent}30` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Carousel({ fontClass }: { fontClass: string }) {
  return (
    <section className={`overflow-hidden bg-white py-24 ${fontClass}`}>
      <div className="mx-auto mb-12 max-w-7xl px-6">
        <FadeUp>
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#14D9D9]">Lo que construimos</p>
          <h2 className="max-w-lg text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0a0d14] sm:text-[48px]">
            Un ecosistema tecnológico completo
          </h2>
        </FadeUp>
      </div>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {CAROUSEL_ITEMS.map((item) => (
          <CarouselCard key={item.title} item={item} />
        ))}
        <div className="w-6 shrink-0" />
      </div>
    </section>
  );
}

/* ── Ecosystem cards ── */
const ECOSYSTEM = [
  {
    icon: '🌙',
    name: 'LUNA ERP AI',
    tag: 'Producto Principal',
    desc: 'ERP inteligente para ventas, inventario, compras y automatización con Inteligencia Artificial.',
    href: '/es/systems/luna',
    accent: '#14D9D9',
  },
  {
    icon: '🏠',
    name: 'CARPIHOGAR',
    tag: 'Caso Real',
    desc: 'La Tienda Inteligente de Venezuela operada sobre LUNA ERP AI. Primer caso de uso real del ecosistema.',
    href: 'https://www.carpihogar.com',
    accent: '#f97316',
  },
  {
    icon: '⚡',
    name: 'TRENDS172TECH',
    tag: 'Empresa Tecnológica',
    desc: 'Desarrollo de software, inteligencia artificial y automatización empresarial. Tecnología hecha en Venezuela.',
    href: '/es/contact',
    accent: '#8b5cf6',
  },
];

function EcosystemCards({ fontClass }: { fontClass: string }) {
  return (
    <section className={`bg-[#fafafa] py-24 ${fontClass}`}>
      <div className="mx-auto max-w-7xl px-6">
        <FadeUp className="mb-14 text-center">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#14D9D9]">Nuestro Ecosistema</p>
          <h2 className="text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0a0d14] sm:text-[48px]">
            Tres pilares. Un ecosistema.
          </h2>
        </FadeUp>

        <div className="grid gap-6 md:grid-cols-3">
          {ECOSYSTEM.map((item, i) => (
            <FadeUp key={item.name} delay={i * 0.12}>
              <Link href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} className="group block h-full">
                <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_20px_60px_rgba(0,0,0,0.10)]">
                  {/* Top accent bar */}
                  <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl transition-opacity group-hover:opacity-100" style={{ background: item.accent, opacity: 0.4 }} />

                  <div className="mb-5 text-4xl">{item.icon}</div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: item.accent }}>{item.tag}</span>
                  </div>
                  <h3 className="mb-3 text-[22px] font-bold tracking-tight text-[#0a0d14]">{item.name}</h3>
                  <p className="flex-1 text-[14px] leading-relaxed text-[#6b7280]">{item.desc}</p>
                  <div className="mt-6 flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: item.accent }}>
                    Conocer más
                    <svg className="transition-transform group-hover:translate-x-1" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Stats ── */
const STATS = [
  { value: '17+', label: 'Años de experiencia empresarial' },
  { value: '99.9%', label: 'Uptime garantizado en producción' },
  { value: '3+', label: 'Productos en el ecosistema activo' },
];

function Stats({ fontClass }: { fontClass: string }) {
  return (
    <section className={`border-y border-[#f3f4f6] bg-white py-20 ${fontClass}`}>
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
          {STATS.map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.1} className="text-center">
              <p
                className="mb-2 text-[56px] font-extrabold leading-none tracking-[-0.04em]"
                style={{
                  background: 'linear-gradient(135deg, #14D9D9 0%, #0fb8b8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {s.value}
              </p>
              <p className="text-[14px] font-medium text-[#6b7280]">{s.label}</p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Founder ── */
function FounderSection({ fontClass }: { fontClass: string }) {
  return (
    <section className={`overflow-hidden bg-[#fafafa] py-24 ${fontClass}`}>
      <div className="mx-auto max-w-7xl px-6">
        <FadeUp className="mb-12">
          <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#14D9D9]">Fundador</p>
        </FadeUp>

        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Quote side */}
          <FadeUp delay={0.1}>
            <blockquote>
              <div className="mb-6 text-[64px] leading-none text-[#14D9D9]/30 font-serif">"</div>
              <p className="mb-8 text-[24px] font-medium leading-[1.5] tracking-[-0.02em] text-[#0a0d14] sm:text-[28px]">
                Después de más de 17 años construyendo una empresa en Venezuela, desarrollé la tecnología que necesitaba para administrarla. Lo que comenzó como una solución interna terminó convirtiéndose en{' '}
                <span style={{ color: '#14D9D9', fontWeight: 700 }}>LUNA ERP AI.</span>
              </p>
              <footer className="flex items-center gap-4">
                <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-[#14D9D9]/30 bg-[#14D9D9]/10">
                  <div className="flex h-full items-center justify-center text-[18px]">G</div>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-[#0a0d14]">Gunther Del Rosario</p>
                  <p className="text-[13px] text-[#9ca3af]">CEO & Fundador · Trends172Tech</p>
                </div>
              </footer>
            </blockquote>
          </FadeUp>

          {/* Portrait / visual side */}
          <FadeUp delay={0.25}>
            <div className="relative">
              {/* Background card */}
              <div className="relative overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white p-8 shadow-sm">
                {/* Decorative turquoise element */}
                <div
                  className="absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-20"
                  style={{ background: 'radial-gradient(circle, #14D9D9 0%, transparent 70%)' }}
                />
                <div className="relative">
                  {/* Portrait placeholder — premium monogram */}
                  <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-2xl border border-[#14D9D9]/20 bg-gradient-to-br from-[#14D9D9]/10 to-[#14D9D9]/5">
                    <span className="text-[48px] font-extrabold tracking-tight text-[#14D9D9]/50">GR</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Empresa', val: 'Trends172Tech' },
                      { label: 'Fundada', val: '2007 · Venezuela' },
                      { label: 'Productos', val: 'LUNA ERP AI · Carpihogar' },
                      { label: 'Enfoque', val: 'Software · IA · ERP' },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center gap-3 rounded-lg bg-[#fafafa] px-4 py-2.5">
                        <span className="w-20 shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9ca3af]">{row.label}</span>
                        <span className="text-[13px] font-medium text-[#374151]">{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

/* ── Showcase ── */
const SHOWCASE = [
  { title: 'LUNA ERP AI', sub: 'Gestión empresarial inteligente', type: 'erp' },
  { title: 'Carpihogar', sub: 'La tienda inteligente', type: 'store' },
  { title: 'Agentes IA', sub: 'Automatización sin límites', type: 'agents' },
  { title: 'Business Dashboard', sub: 'Analítica en tiempo real', type: 'erp' },
  { title: 'Desarrollo Digital', sub: 'Software a medida', type: 'projects' },
];

function ShowcaseSection({ fontClass }: { fontClass: string }) {
  return (
    <section className={`bg-white py-24 ${fontClass}`}>
      <div className="mx-auto max-w-7xl px-6">
        <FadeUp className="mb-14 text-center">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#14D9D9]">Showcase</p>
          <h2 className="text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0a0d14] sm:text-[48px]">
            Tecnología que se ve y se siente
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[16px] text-[#6b7280]">
            Interfaces de nivel enterprise, diseñadas para escalar con tu negocio.
          </p>
        </FadeUp>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHOWCASE.map((item, i) => (
            <FadeUp key={item.title} delay={i * 0.08} className={i === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}>
              <div className="group overflow-hidden rounded-2xl border border-[#e5e7eb] shadow-sm transition-all hover:shadow-md">
                {/* Mockup header */}
                <div className="flex h-8 items-center gap-1.5 border-b border-[#f3f4f6] bg-[#fafafa] px-3">
                  <div className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                  <div className="h-2 w-2 rounded-full bg-[#febc2e]" />
                  <div className="h-2 w-2 rounded-full bg-[#28c840]" />
                </div>
                {/* Scaled mockup */}
                <div className="overflow-hidden">
                  <CarouselMockup type={item.type} accent="#14D9D9" />
                </div>
                {/* Label */}
                <div className="border-t border-[#f3f4f6] px-5 py-4">
                  <p className="text-[14px] font-semibold text-[#0a0d14]">{item.title}</p>
                  <p className="text-[12px] text-[#9ca3af]">{item.sub}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA Final ── */
function FinalCTA({ fontClass }: { fontClass: string }) {
  return (
    <section className={`bg-[#0a0d14] py-28 ${fontClass}`}>
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <div
          className="pointer-events-none absolute -top-20 left-1/2 h-[400px] w-[600px] -translate-x-1/2 opacity-20"
          style={{ background: 'radial-gradient(ellipse, #14D9D9 0%, transparent 65%)' }}
        />
        <FadeUp className="relative">
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#14D9D9]">¿Listo para escalar?</p>
          <h2 className="mb-5 text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white sm:text-[52px]">
            Construye el futuro de tu empresa hoy.
          </h2>
          <p className="mx-auto mb-10 max-w-md text-[17px] leading-relaxed text-white/50">
            LUNA ERP AI está disponible para empresas que quieren operar con tecnología de nivel enterprise.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/es/systems/luna"
              className="flex h-12 items-center gap-2 rounded-full bg-[#14D9D9] px-7 text-[15px] font-semibold text-[#0a0d14] shadow-[0_0_40px_rgba(20,217,217,0.3)] transition-all hover:shadow-[0_0_60px_rgba(20,217,217,0.5)]"
            >
              Conocer LUNA ERP AI
            </Link>
            <Link
              href="/es/contact"
              className="flex h-12 items-center rounded-full border border-white/15 px-7 text-[15px] font-semibold text-white/70 transition-all hover:border-white/30 hover:text-white"
            >
              Hablar con el equipo
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer({ fontClass }: { fontClass: string }) {
  return (
    <footer className={`border-t border-[#f3f4f6] bg-white py-16 ${fontClass}`}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <Image src="/branding/trends172tech-logo.png" alt="Trends172Tech" fill className="object-contain" />
          </div>
          <div className="text-center">
            <p className="text-[20px] font-bold tracking-tight text-[#0a0d14]">Trends172Tech</p>
            <p className="mt-1 text-[13px] text-[#9ca3af]">Tecnología que impulsa el futuro</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 text-[13px] text-[#9ca3af]">
          {[
            { label: 'LUNA ERP AI', href: '/es/systems/luna' },
            { label: 'Carpihogar', href: 'https://www.carpihogar.com' },
            { label: 'Contacto', href: '/es/contact' },
            { label: 'WhatsApp', href: 'https://wa.me/584122640371' },
          ].map((l) => (
            <Link key={l.label} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined}
              className="transition-colors hover:text-[#0a0d14]">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="mt-10 border-t border-[#f3f4f6] pt-8 text-center">
          <p className="text-[12px] text-[#d1d5db]">
            © {new Date().getFullYear()} Trends172Tech · Software · IA · Automatización · Venezuela
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ── Root export ── */
export function HomePremium({ fontClass = '' }: { fontClass?: string }) {
  return (
    <div className="overflow-x-hidden">
      <Nav fontClass={fontClass} />
      <Hero fontClass={fontClass} />
      <TrustStrip fontClass={fontClass} />
      <Carousel fontClass={fontClass} />
      <EcosystemCards fontClass={fontClass} />
      <Stats fontClass={fontClass} />
      <FounderSection fontClass={fontClass} />
      <ShowcaseSection fontClass={fontClass} />
      <FinalCTA fontClass={fontClass} />
      <Footer fontClass={fontClass} />
    </div>
  );
}
