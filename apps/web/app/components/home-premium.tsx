'use client';

import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { PublicConciergeChat } from '@/[locale]/(public)/public-concierge-chat';

type ConciergeCopy = {
  locale: string;
  intakeBadge: string;
  intakeTitle: string;
  intakeSubtitle: string;
  intakeNote: string;
  chatPlaceholder: string;
  chatClearLabel: string;
  chatSuggestionsTitle: string;
  chatSuggestions: Array<{ label: string; prompt: string }>;
};

export type HomePremiumCopy = {
  badge: string;
  heroPrefix: string;
  heroAccent: string;
  heroSuffix: string;
  heroSubhead: string;
  heroPrimary: string;
  heroSecondary: string;
  heroImageAlt: string;
  trustEyebrow: string;
  trustItems: string[];
  carouselEyebrow: string;
  carouselTitle: string;
  carouselItems: Array<{ tag: string; title: string; description: string }>;
  ecosystemEyebrow: string;
  ecosystemTitle: string;
  ecosystemMore: string;
  ecosystemItems: Array<{ tag: string; description: string }>;
  stats: string[];
  agentEyebrow: string;
  agentTitle: string;
  agentBody: string;
  showcaseEyebrow: string;
  showcaseTitle: string;
  showcaseBody: string;
  showcaseItems: Array<{ title: string; subtitle: string }>;
  marketingEyebrow: string;
  marketingTitle: string;
  marketingItems: string[];
  founderEyebrow: string;
  founderQuotePrefix: string;
  founderQuoteAccent: string;
  founderRole: string;
  founderImageAlt: string;
  finalEyebrow: string;
  finalTitle: string;
  finalBody: string;
  finalPrimary: string;
  finalSecondary: string;
  footerTagline: string;
  footerContact: string;
  footerCopyright: string;
};

/* ── Fade-up reusable ── */
function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
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


/* ── Hero ── */
function Hero({ fontClass, copy, locale }: { fontClass: string; copy: HomePremiumCopy; locale: string }) {
  return (
    <section className={`relative overflow-hidden bg-white pt-28 pb-0 ${fontClass}`}>
      {/* Turquoise glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full opacity-20"
        style={{ background: 'radial-gradient(ellipse at center, #14D9D9 0%, transparent 70%)' }}
      />
      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(#14D9D9 1px, transparent 1px), linear-gradient(90deg, #14D9D9 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        {/* LUNA logo badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <div
              className="absolute -inset-6 rounded-3xl opacity-35"
              style={{
                background: 'radial-gradient(circle, #14D9D9 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
            <div className="relative h-24 w-48 rounded-2xl border border-[#14D9D9]/15 bg-white/80 px-4 py-3 shadow-[0_0_60px_rgba(20,217,217,0.12)]">
              <Image
                src="/branding/luna-logo.png"
                alt="LUNA ERP AI"
                fill
                className="object-contain p-2"
                priority
              />
            </div>
          </div>
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#14D9D9]/30 bg-[#14D9D9]/5 px-4 py-1.5"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#14D9D9]" />
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#14D9D9]">
            {copy.badge}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5 text-[52px] font-extrabold leading-[1.06] tracking-[-0.04em] text-[#0a0d14] sm:text-[68px] lg:text-[84px]"
        >
          {copy.heroPrefix}{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #14D9D9 0%, #0fb8b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {copy.heroAccent}
          </span>{' '}
          {copy.heroSuffix}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mx-auto mb-10 max-w-xl text-[18px] font-normal leading-relaxed text-[#6b7280]"
        >
          {copy.heroSubhead}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href={`/${locale}/systems/luna`}
            className="group flex h-12 items-center gap-2 rounded-full bg-[#0a0d14] px-7 text-[15px] font-semibold text-white shadow-lg transition-all hover:bg-[#14D9D9] hover:text-[#0a0d14] hover:shadow-[0_8px_30px_rgba(20,217,217,0.35)]"
          >
            {copy.heroPrimary}
            <svg
              className="transition-transform group-hover:translate-x-0.5"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link
            href="#ecosistema"
            className="flex h-12 items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-7 text-[15px] font-semibold text-[#374151] transition-all hover:border-[#14D9D9]/40 hover:shadow-md"
          >
            {copy.heroSecondary}
          </Link>
        </motion.div>

        {/* Hero real image */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-14 overflow-hidden rounded-t-2xl border-x border-t border-[#e5e7eb] shadow-[0_-12px_60px_rgba(0,0,0,0.08)]"
        >
          <Image
            src="/marketing/luna/luna-hero-light.png"
            alt={copy.heroImageAlt}
            width={1200}
            height={720}
            className="w-full"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}

/* ── Trust strip ── */
function TrustStrip({ fontClass, copy }: { fontClass: string; copy: HomePremiumCopy }) {
  return (
    <div className={`border-y border-[#f3f4f6] bg-[#fafafa] py-5 ${fontClass}`}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          <span className="text-[12px] font-medium uppercase tracking-[0.15em] text-[#9ca3af]">
            {copy.trustEyebrow}
          </span>
          <div className="h-px w-6 bg-[#e5e7eb]" />
          {copy.trustItems.map(
            (t) => (
              <span key={t} className="text-[13px] font-medium text-[#6b7280]">
                {t}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Carousel ── */
const CAROUSEL_ITEMS = [
  {
    accent: '#14D9D9',
    image: '/screenshots/luna/luna-admin-dashboard.png',
  },
  {
    accent: '#f97316',
    image: '/screenshots/luna/luna-dekomundo-storefront.png',
  },
  {
    accent: '#8b5cf6',
    image: '/screenshots/luna/luna-agentes-ia.png',
  },
  {
    accent: '#10b981',
    image: '/screenshots/luna/luna-nueva-venta.png',
  },
];

function Carousel({ fontClass, copy }: { fontClass: string; copy: HomePremiumCopy }) {
  return (
    <section className={`overflow-hidden bg-white py-24 ${fontClass}`}>
      <div className="mx-auto mb-12 max-w-7xl px-6">
        <FadeUp>
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#14D9D9]">
            {copy.carouselEyebrow}
          </p>
          <h2 className="max-w-lg text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0a0d14] sm:text-[48px]">
            {copy.carouselTitle}
          </h2>
        </FadeUp>
      </div>
      <div
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CAROUSEL_ITEMS.map((item, index) => {
          const content = copy.carouselItems[index];
          return (
          <div
            key={content.title}
            className="relative flex w-[340px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm sm:w-[480px]"
          >
            {/* Card header */}
            <div className="border-b border-[#f3f4f6] p-6">
              <span
                className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]"
                style={{ background: `${item.accent}15`, color: item.accent }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.accent }} />
                {content.tag}
              </span>
              <h3 className="mb-2 text-[20px] font-bold text-[#0a0d14]">{content.title}</h3>
              <p className="text-[14px] leading-relaxed text-[#6b7280]">{content.description}</p>
            </div>
            {/* Real screenshot */}
            <div className="overflow-hidden">
              <Image
                src={item.image}
                alt={content.title}
                width={480}
                height={300}
                className="w-full object-cover object-top"
              />
            </div>
          </div>
          );
        })}
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
    path: '/systems/luna',
    accent: '#14D9D9',
  },
  {
    icon: '🏠',
    name: 'CARPIHOGAR',
    path: 'https://www.carpihogar.com',
    accent: '#f97316',
  },
  {
    icon: '⚡',
    name: 'TRENDS172TECH',
    path: '/contact',
    accent: '#8b5cf6',
  },
];

function EcosystemCards({ fontClass, copy, locale }: { fontClass: string; copy: HomePremiumCopy; locale: string }) {
  return (
    <section id="ecosistema" className={`bg-[#fafafa] py-24 ${fontClass}`}>
      <div className="mx-auto max-w-7xl px-6">
        <FadeUp className="mb-14 text-center">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#14D9D9]">
            {copy.ecosystemEyebrow}
          </p>
          <h2 className="text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0a0d14] sm:text-[48px]">
            {copy.ecosystemTitle}
          </h2>
        </FadeUp>

        <div className="grid gap-6 md:grid-cols-3">
          {ECOSYSTEM.map((item, i) => {
            const content = copy.ecosystemItems[i];
            const href = item.path.startsWith('http') ? item.path : `/${locale}${item.path}`;
            return (
            <FadeUp key={item.name} delay={i * 0.12}>
              <Link
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                className="group block h-full"
              >
                <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_20px_60px_rgba(0,0,0,0.10)]">
                  <div
                    className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl"
                    style={{ background: item.accent, opacity: 0.5 }}
                  />
                  <div className="mb-5 text-4xl">{item.icon}</div>
                  <span
                    className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: item.accent }}
                  >
                    {content.tag}
                  </span>
                  <h3 className="mb-3 text-[22px] font-bold tracking-tight text-[#0a0d14]">
                    {item.name}
                  </h3>
                  <p className="flex-1 text-[14px] leading-relaxed text-[#6b7280]">{content.description}</p>
                  <div
                    className="mt-6 flex items-center gap-1.5 text-[13px] font-semibold"
                    style={{ color: item.accent }}
                  >
                    {copy.ecosystemMore}
                    <svg
                      className="transition-transform group-hover:translate-x-1"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <path
                        d="M2 7h10M8 3l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Stats ── */
const STATS = [
  { value: '17+' },
  { value: '99.9%' },
  { value: '3+' },
];

function Stats({ fontClass, copy }: { fontClass: string; copy: HomePremiumCopy }) {
  return (
    <section className={`border-y border-[#f3f4f6] bg-white py-20 ${fontClass}`}>
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
          {STATS.map((s, i) => (
            <FadeUp key={s.value} delay={i * 0.1} className="text-center">
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
              <p className="text-[14px] font-medium text-[#6b7280]">{copy.stats[i]}</p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Agente IA Section ── */
function AgentSection({
  conciergeCopy,
  fontClass,
  copy,
}: {
  conciergeCopy: ConciergeCopy;
  fontClass: string;
  copy: HomePremiumCopy;
}) {
  return (
    <section className={`bg-[#fafafa] py-24 ${fontClass}`}>
      <div className="mx-auto max-w-7xl px-6">
        <FadeUp className="mb-12 text-center">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#14D9D9]">
            {copy.agentEyebrow}
          </p>
          <h2 className="text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0a0d14] sm:text-[48px]">
            {copy.agentTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[16px] text-[#6b7280]">
            {copy.agentBody}
          </p>
        </FadeUp>
        <FadeUp delay={0.15}>
          <PublicConciergeChat copy={conciergeCopy} />
        </FadeUp>
      </div>
    </section>
  );
}

/* ── Showcase con imágenes reales ── */
const SHOWCASE = [
  {
    image: '/screenshots/luna/luna-admin-dashboard.png',
    wide: true,
  },
  {
    image: '/screenshots/luna/luna-dekomundo-storefront.png',
    wide: false,
  },
  {
    image: '/screenshots/luna/luna-asistente-ia.png',
    wide: false,
  },
  {
    image: '/screenshots/luna/luna-agente-inventario.png',
    wide: false,
  },
  {
    image: '/screenshots/luna/luna-marketing-erp-camaleonico.png',
    wide: false,
  },
];

function ShowcaseSection({ fontClass, copy }: { fontClass: string; copy: HomePremiumCopy }) {
  return (
    <section className={`bg-white py-24 ${fontClass}`}>
      <div className="mx-auto max-w-7xl px-6">
        <FadeUp className="mb-14 text-center">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#14D9D9]">
            {copy.showcaseEyebrow}
          </p>
          <h2 className="text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0a0d14] sm:text-[48px]">
            {copy.showcaseTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[16px] text-[#6b7280]">
            {copy.showcaseBody}
          </p>
        </FadeUp>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHOWCASE.map((item, i) => {
            const content = copy.showcaseItems[i];
            return (
            <FadeUp
              key={content.title}
              delay={i * 0.08}
              className={item.wide ? 'sm:col-span-2 lg:col-span-2' : ''}
            >
              <div className="group overflow-hidden rounded-2xl border border-[#e5e7eb] shadow-sm transition-all hover:shadow-md">
                <div className="flex h-8 items-center gap-1.5 border-b border-[#f3f4f6] bg-[#fafafa] px-3">
                  <div className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                  <div className="h-2 w-2 rounded-full bg-[#febc2e]" />
                  <div className="h-2 w-2 rounded-full bg-[#28c840]" />
                </div>
                <div className="overflow-hidden">
                  <Image
                    src={item.image}
                    alt={content.title}
                    width={item.wide ? 800 : 400}
                    height={280}
                    className="w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="border-t border-[#f3f4f6] px-5 py-4">
                  <p className="text-[14px] font-semibold text-[#0a0d14]">{content.title}</p>
                  <p className="text-[12px] text-[#9ca3af]">{content.subtitle}</p>
                </div>
              </div>
            </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Marketing section con infografías ── */
function MarketingSection({ fontClass, copy }: { fontClass: string; copy: HomePremiumCopy }) {
  return (
    <section className={`bg-[#fafafa] py-24 ${fontClass}`}>
      <div className="mx-auto max-w-7xl px-6">
        <FadeUp className="mb-14 text-center">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#14D9D9]">
            {copy.marketingEyebrow}
          </p>
          <h2 className="text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0a0d14] sm:text-[48px]">
            {copy.marketingTitle}
          </h2>
        </FadeUp>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              img: '/screenshots/luna/luna-marketing-empresas-hoy.png',
               label: copy.marketingItems[0],
            },
            {
              img: '/screenshots/luna/luna-marketing-ia-operativa.png',
               label: copy.marketingItems[1],
            },
            {
              img: '/screenshots/luna/luna-marketing-infinitas-identidades.png',
               label: copy.marketingItems[2],
            },
          ].map((item) => (
            <FadeUp key={item.label}>
              <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm transition-all hover:shadow-md">
                <Image
                  src={item.img}
                  alt={item.label}
                  width={400}
                  height={560}
                  className="w-full object-cover"
                />
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Founder ── */
function FounderSection({ fontClass, copy }: { fontClass: string; copy: HomePremiumCopy }) {
  return (
    <section className={`overflow-hidden bg-white py-24 ${fontClass}`}>
      <div className="mx-auto max-w-7xl px-6">
        <FadeUp className="mb-12">
          <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#14D9D9]">
            {copy.founderEyebrow}
          </p>
        </FadeUp>

        <div className="grid items-center gap-16 lg:grid-cols-2">
          <FadeUp delay={0.1}>
            <blockquote>
              <div className="mb-6 font-serif text-[64px] leading-none text-[#14D9D9]/25">
                &ldquo;
              </div>
              <p className="mb-8 text-[24px] font-medium leading-[1.5] tracking-[-0.02em] text-[#0a0d14] sm:text-[28px]">
                {copy.founderQuotePrefix}{' '}
                <span style={{ color: '#14D9D9', fontWeight: 700 }}>{copy.founderQuoteAccent}</span>
              </p>
              <footer className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-[#14D9D9]/30 bg-gradient-to-br from-[#14D9D9]/20 to-[#14D9D9]/5">
                  <span className="text-[18px] font-bold text-[#14D9D9]">G</span>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-[#0a0d14]">Gunther Del Rosario</p>
                  <p className="text-[13px] text-[#9ca3af]">{copy.founderRole}</p>
                </div>
              </footer>
            </blockquote>
          </FadeUp>

          <FadeUp delay={0.25}>
            <div className="relative overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm">
              <div
                className="absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-15"
                style={{ background: 'radial-gradient(circle, #14D9D9 0%, transparent 70%)' }}
              />
              <Image
                src="/screenshots/luna/luna-marketing-tu-empresa.png"
                alt={copy.founderImageAlt}
                width={600}
                height={500}
                className="w-full object-cover"
              />
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

/* ── CTA Final ── */
function FinalCTA({ fontClass, copy, locale }: { fontClass: string; copy: HomePremiumCopy; locale: string }) {
  return (
    <section className={`bg-[#0a0d14] py-28 ${fontClass}`}>
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <div
          className="pointer-events-none absolute -top-20 left-1/2 h-[400px] w-[600px] -translate-x-1/2 opacity-20"
          style={{ background: 'radial-gradient(ellipse, #14D9D9 0%, transparent 65%)' }}
        />
        <FadeUp className="relative">
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#14D9D9]">
            {copy.finalEyebrow}
          </p>
          <h2 className="mb-5 text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white sm:text-[52px]">
            {copy.finalTitle}
          </h2>
          <p className="mx-auto mb-10 max-w-md text-[17px] leading-relaxed text-white/50">
            {copy.finalBody}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/${locale}/systems/luna`}
              className="flex h-12 items-center gap-2 rounded-full bg-[#14D9D9] px-7 text-[15px] font-semibold text-[#0a0d14] shadow-[0_0_40px_rgba(20,217,217,0.3)] transition-all hover:shadow-[0_0_60px_rgba(20,217,217,0.5)]"
            >
              {copy.finalPrimary}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="flex h-12 items-center rounded-full border border-white/15 px-7 text-[15px] font-semibold text-white/70 transition-all hover:border-white/30 hover:text-white"
            >
              {copy.finalSecondary}
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer({ fontClass, copy, locale }: { fontClass: string; copy: HomePremiumCopy; locale: string }) {
  return (
    <footer className={`border-t border-[#f3f4f6] bg-white py-16 ${fontClass}`}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="relative h-10 w-24">
            <Image
              src="/branding/luna-logo.png"
              alt="LUNA ERP AI"
              fill
              className="object-contain"
            />
          </div>
          <div className="text-center">
            <p className="text-[18px] font-bold tracking-tight text-[#0a0d14]">Trends172Tech</p>
            <p className="mt-1 text-[13px] text-[#9ca3af]">{copy.footerTagline}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 text-[13px] text-[#9ca3af]">
          {[
            { label: 'LUNA ERP AI', href: `/${locale}/systems/luna` },
            { label: 'Carpihogar', href: 'https://www.carpihogar.com' },
            { label: copy.footerContact, href: `/${locale}/contact` },
            { label: 'WhatsApp', href: 'https://wa.me/584122640371' },
          ].map((l) => (
            <Link
              key={l.label}
              href={l.href}
              target={l.href.startsWith('http') ? '_blank' : undefined}
              className="transition-colors hover:text-[#0a0d14]"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="mt-10 border-t border-[#f3f4f6] pt-8 text-center">
          <p className="text-[12px] text-[#d1d5db]">
            © {new Date().getFullYear()} Trends172Tech · {copy.footerCopyright}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ── Root export ── */
export function HomePremium({
  fontClass = '',
  conciergeCopy,
  copy,
}: {
  fontClass?: string;
  conciergeCopy: ConciergeCopy;
  copy: HomePremiumCopy;
}) {
  const locale = conciergeCopy.locale;

  return (
    <div className="overflow-x-hidden">
      <Hero fontClass={fontClass} copy={copy} locale={locale} />
      <TrustStrip fontClass={fontClass} copy={copy} />
      <Carousel fontClass={fontClass} copy={copy} />
      <EcosystemCards fontClass={fontClass} copy={copy} locale={locale} />
      <Stats fontClass={fontClass} copy={copy} />
      <AgentSection conciergeCopy={conciergeCopy} fontClass={fontClass} copy={copy} />
      <ShowcaseSection fontClass={fontClass} copy={copy} />
      <MarketingSection fontClass={fontClass} copy={copy} />
      <FounderSection fontClass={fontClass} copy={copy} />
      <FinalCTA fontClass={fontClass} copy={copy} locale={locale} />
      <Footer fontClass={fontClass} copy={copy} locale={locale} />
    </div>
  );
}
