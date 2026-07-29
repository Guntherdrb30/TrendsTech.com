'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
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

export type HomePremiumCopy = Record<string, unknown>;

type LocaleCopy = {
  creator: string;
  platform: string;
  heroBody: string;
  demo: string;
  discover: string;
  proof: string;
  proofItems: string[];
  evolutionEyebrow: string;
  evolutionTitle: string;
  evolutionBody: string;
  capabilitiesEyebrow: string;
  capabilitiesTitle: string;
  capabilities: Array<{ number: string; title: string; body: string }>;
  implementationsEyebrow: string;
  implementationsTitle: string;
  implementationsBody: string;
  implementationItems: Array<{ title: string; label: string; body: string; image: string }>;
  architectureEyebrow: string;
  architectureTitle: string;
  architectureBody: string;
  architectureNodes: string[];
  intelligenceTitle: string;
  intelligenceBody: string;
  technologyEyebrow: string;
  technologyTitle: string;
  technologyItems: string[];
  visionEyebrow: string;
  visionQuote: string;
  visionAccent: string;
  conciergeEyebrow: string;
  conciergeTitle: string;
  conciergeBody: string;
  finalEyebrow: string;
  finalTitle: string;
  finalBody: string;
  contact: string;
  footer: string;
};

const COPY: Record<'es' | 'en', LocaleCopy> = {
  es: {
    creator: 'Creada por Trends172Tech',
    platform: 'Plataforma Empresarial Inteligente',
    heroBody: 'Una plataforma adaptable que conecta operación, comercio, datos e inteligencia artificial en un solo núcleo empresarial.',
    demo: 'Solicitar una demostración',
    discover: 'Conocer la plataforma',
    proof: 'Diseñada para operaciones reales',
    proofItems: ['Ventas e inventario', 'Comercio digital', 'Automatización', 'Inteligencia aplicada'],
    evolutionEyebrow: 'Construida para evolucionar',
    evolutionTitle: 'Una base tecnológica. Múltiples formas de operar.',
    evolutionBody: 'LUNA no obliga a la empresa a adaptarse a un software rígido. Su arquitectura modular se configura alrededor de los procesos, equipos y objetivos de cada implementación.',
    capabilitiesEyebrow: 'Capacidades',
    capabilitiesTitle: 'El núcleo operativo que conecta toda la empresa.',
    capabilities: [
      { number: '01', title: 'Operaciones', body: 'Ventas, compras, inventario, clientes, cobros, despachos y trazabilidad en un entorno conectado.' },
      { number: '02', title: 'Comercio', body: 'Experiencias digitales, catálogos, cotizaciones y canales comerciales integrados con la operación.' },
      { number: '03', title: 'Inteligencia', body: 'Agentes y asistentes que consultan datos reales, automatizan procesos y apoyan decisiones.' },
      { number: '04', title: 'Adaptabilidad', body: 'Módulos, permisos, identidad y flujos configurables para cada organización e industria.' },
    ],
    implementationsEyebrow: 'Implementaciones',
    implementationsTitle: 'Tecnología validada en escenarios reales.',
    implementationsBody: 'Cada implementación amplía la plataforma y demuestra cómo LUNA puede adoptar la identidad y la lógica operativa de organizaciones diferentes.',
    implementationItems: [
      { title: 'Carpihogar', label: 'Comercio y operaciones', body: 'Ecommerce, ventas, inventario, cotizaciones y experiencia instalable conectados sobre una operación real.', image: '/screenshots/luna/luna-dekomundo-storefront.png' },
      { title: 'LUNA Football', label: 'Gestión deportiva', body: 'Jugadores, equipos, mensualidades, inventario y planificación deportiva desde una plataforma especializada.', image: '/screenshots/luna/luna-admin-dashboard.png' },
    ],
    architectureEyebrow: 'Arquitectura',
    architectureTitle: 'LUNA funciona como un sistema vivo.',
    architectureBody: 'Un núcleo común coordina módulos, datos, automatizaciones e interfaces. Cada capa puede crecer sin fragmentar la operación.',
    architectureNodes: ['Operaciones', 'Comercio', 'Finanzas', 'Clientes', 'Analítica', 'Agentes IA'],
    intelligenceTitle: 'Inteligencia conectada al contexto',
    intelligenceBody: 'La IA no vive como un accesorio aislado. Trabaja sobre permisos, procesos y datos empresariales para producir respuestas útiles y acciones controladas.',
    technologyEyebrow: 'Tecnología',
    technologyTitle: 'Arquitectura moderna, preparada para producción.',
    technologyItems: ['Aplicación web progresiva', 'Experiencias multirol', 'Arquitectura modular', 'Integraciones y APIs', 'Automatización segura', 'Escalabilidad por implementación'],
    visionEyebrow: 'Nuestra visión',
    visionQuote: 'Construimos LUNA porque necesitábamos una plataforma capaz de entender la operación real de una empresa, no solamente registrar transacciones.',
    visionAccent: 'Ahora esa plataforma puede evolucionar con cada organización.',
    conciergeEyebrow: 'Diagnóstico',
    conciergeTitle: 'Conversemos sobre tu operación.',
    conciergeBody: 'Describe tu empresa y nuestro asesor te ayudará a identificar dónde LUNA puede generar más control, velocidad y claridad.',
    finalEyebrow: 'Una plataforma para crecer con estructura',
    finalTitle: 'La transformación empieza entendiendo cómo opera tu empresa.',
    finalBody: 'Conoce cómo LUNA puede configurarse para tus procesos, tus equipos y tu siguiente etapa de crecimiento.',
    contact: 'Hablar con el equipo',
    footer: 'Creadora de LUNA · Plataforma Empresarial Inteligente',
  },
  en: {
    creator: 'Created by Trends172Tech',
    platform: 'Intelligent Business Platform',
    heroBody: 'An adaptable platform connecting operations, commerce, data and artificial intelligence through one business core.',
    demo: 'Request a demonstration',
    discover: 'Explore the platform',
    proof: 'Designed for real operations',
    proofItems: ['Sales and inventory', 'Digital commerce', 'Automation', 'Applied intelligence'],
    evolutionEyebrow: 'Built to evolve',
    evolutionTitle: 'One technology foundation. Multiple ways to operate.',
    evolutionBody: 'LUNA does not force a company into rigid software. Its modular architecture is configured around the processes, teams and objectives of each implementation.',
    capabilitiesEyebrow: 'Capabilities',
    capabilitiesTitle: 'The operating core connecting the entire company.',
    capabilities: [
      { number: '01', title: 'Operations', body: 'Sales, purchasing, inventory, customers, collections, dispatch and traceability in one connected environment.' },
      { number: '02', title: 'Commerce', body: 'Digital experiences, catalogues, quotations and commercial channels integrated with operations.' },
      { number: '03', title: 'Intelligence', body: 'Agents and assistants that use real data, automate processes and support decisions.' },
      { number: '04', title: 'Adaptability', body: 'Configurable modules, permissions, identity and workflows for every organisation and industry.' },
    ],
    implementationsEyebrow: 'Implementations',
    implementationsTitle: 'Technology validated in real scenarios.',
    implementationsBody: 'Each implementation expands the platform and demonstrates how LUNA can adopt the identity and operating logic of different organisations.',
    implementationItems: [
      { title: 'Carpihogar', label: 'Commerce and operations', body: 'Ecommerce, sales, inventory, quotations and an installable experience connected to a real operation.', image: '/screenshots/luna/luna-dekomundo-storefront.png' },
      { title: 'LUNA Football', label: 'Sports management', body: 'Players, teams, memberships, inventory and sports planning through a specialised platform.', image: '/screenshots/luna/luna-admin-dashboard.png' },
    ],
    architectureEyebrow: 'Architecture',
    architectureTitle: 'LUNA behaves like a living system.',
    architectureBody: 'A common core coordinates modules, data, automations and interfaces. Every layer can grow without fragmenting the operation.',
    architectureNodes: ['Operations', 'Commerce', 'Finance', 'Customers', 'Analytics', 'AI Agents'],
    intelligenceTitle: 'Intelligence connected to context',
    intelligenceBody: 'AI is not an isolated add-on. It works across permissions, processes and business data to produce useful answers and controlled actions.',
    technologyEyebrow: 'Technology',
    technologyTitle: 'Modern architecture, ready for production.',
    technologyItems: ['Progressive web application', 'Multi-role experiences', 'Modular architecture', 'Integrations and APIs', 'Secure automation', 'Implementation-level scalability'],
    visionEyebrow: 'Our vision',
    visionQuote: 'We built LUNA because we needed a platform capable of understanding how a real company operates, not merely recording transactions.',
    visionAccent: 'Now that platform can evolve with every organisation.',
    conciergeEyebrow: 'Diagnosis',
    conciergeTitle: 'Let us talk about your operation.',
    conciergeBody: 'Describe your company and our advisor will help identify where LUNA can create more control, speed and clarity.',
    finalEyebrow: 'A platform for structured growth',
    finalTitle: 'Transformation begins by understanding how your company operates.',
    finalBody: 'Discover how LUNA can be configured for your processes, your teams and your next stage of growth.',
    contact: 'Talk to the team',
    footer: 'Creator of LUNA · Intelligent Business Platform',
  },
};

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const visible = useInView(ref, { once: true, margin: '-80px' });
  const reduce = useReducedMotion();
  return <motion.div ref={ref} initial={reduce ? false : { opacity: 0, y: 28 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: .7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>{children}</motion.div>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-[11px] font-semibold uppercase tracking-[.22em] text-[#0aa9a9]">{children}</p>;
}

function Hero({ locale, t }: { locale: string; t: LocaleCopy }) {
  const reduce = useReducedMotion();
  return <section className="relative isolate min-h-[92vh] overflow-hidden bg-[#f7f8f6] pt-28">
    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_25%,rgba(20,217,217,.16),transparent_30%),linear-gradient(to_bottom,transparent,rgba(255,255,255,.8))]" />
    <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 lg:grid-cols-[.9fr_1.1fr] lg:pb-28">
      <div>
        <motion.p initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-sm font-medium text-[#59606b]">{t.creator}</motion.p>
        <motion.h1 initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08, duration: .8 }} className="font-[var(--font-display)] text-[72px] font-semibold leading-[.88] tracking-[-.065em] text-[#0b0d10] sm:text-[104px] lg:text-[132px]">LUNA</motion.h1>
        <motion.p initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .18, duration: .7 }} className="mt-6 max-w-xl text-2xl font-medium leading-tight tracking-[-.025em] text-[#20252b] sm:text-3xl">{t.platform}</motion.p>
        <motion.p initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .28 }} className="mt-7 max-w-xl text-base leading-7 text-[#69717c] sm:text-lg">{t.heroBody}</motion.p>
        <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .38 }} className="mt-10 flex flex-wrap gap-3">
          <Link href={`/${locale}/contact`} className="rounded-full bg-[#0b0d10] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0aa9a9]">{t.demo}</Link>
          <Link href={`/${locale}/systems/luna`} className="rounded-full border border-black/10 bg-white/70 px-7 py-3.5 text-sm font-semibold text-[#20252b] backdrop-blur transition hover:border-black/25">{t.discover}</Link>
        </motion.div>
      </div>
      <motion.div initial={reduce ? false : { opacity: 0, scale: .96, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: .2, duration: 1 }} className="relative mx-auto aspect-square w-full max-w-[620px]">
        <div className="absolute inset-[12%] rounded-full border border-[#12bebe]/20" />
        <div className="absolute inset-[25%] rounded-full border border-[#12bebe]/25" />
        <motion.div animate={reduce ? {} : { rotate: 360 }} transition={{ duration: 42, repeat: Infinity, ease: 'linear' }} className="absolute inset-[12%] rounded-full border border-dashed border-[#12bebe]/25" />
        <div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[34px] border border-white/80 bg-white shadow-[0_30px_100px_rgba(15,40,45,.15)]"><Image src="/branding/luna-logo.png" alt="LUNA" width={125} height={70} className="object-contain" priority /></div>
        {t.architectureNodes.map((node, i) => {
          const positions = ['left-[5%] top-[23%]','right-[2%] top-[23%]','left-[0] bottom-[24%]','right-[0] bottom-[24%]','left-1/2 top-[2%] -translate-x-1/2','left-1/2 bottom-[2%] -translate-x-1/2'];
          return <motion.div key={node} animate={reduce ? {} : { y: [0, -6, 0] }} transition={{ duration: 4 + i * .3, repeat: Infinity, delay: i * .2 }} className={`absolute ${positions[i]} rounded-full border border-black/8 bg-white/90 px-4 py-2 text-xs font-semibold text-[#424a54] shadow-sm backdrop-blur`}>{node}</motion.div>;
        })}
      </motion.div>
    </div>
    <div className="border-y border-black/[.05] bg-white/70 py-5 backdrop-blur"><div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-6"><span className="text-xs font-semibold uppercase tracking-[.16em] text-[#8a9199]">{t.proof}</span>{t.proofItems.map(x => <span key={x} className="text-sm text-[#515862]">{x}</span>)}</div></div>
  </section>;
}

export function HomePremium({ fontClass = '', conciergeCopy }: { fontClass?: string; conciergeCopy: ConciergeCopy; copy: HomePremiumCopy }) {
  const locale = conciergeCopy.locale;
  const t = COPY[locale.startsWith('es') ? 'es' : 'en'];
  return <main className={`overflow-x-hidden bg-white ${fontClass}`}>
    <Hero locale={locale} t={t} />

    <section className="py-28"><div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[.8fr_1.2fr]"><Reveal><Eyebrow>{t.evolutionEyebrow}</Eyebrow><h2 className="max-w-lg font-[var(--font-display)] text-4xl font-semibold leading-[1.05] tracking-[-.04em] text-[#111418] sm:text-6xl">{t.evolutionTitle}</h2></Reveal><Reveal delay={.12} className="flex items-end"><p className="max-w-2xl text-xl leading-8 text-[#606873]">{t.evolutionBody}</p></Reveal></div></section>

    <section className="bg-[#0d1014] py-28 text-white"><div className="mx-auto max-w-7xl px-6"><Reveal className="mb-16 max-w-3xl"><Eyebrow>{t.capabilitiesEyebrow}</Eyebrow><h2 className="font-[var(--font-display)] text-4xl font-semibold leading-[1.08] tracking-[-.04em] sm:text-6xl">{t.capabilitiesTitle}</h2></Reveal><div className="grid border-l border-t border-white/10 md:grid-cols-2">{t.capabilities.map((item, i) => <Reveal key={item.number} delay={i * .08} className="border-b border-r border-white/10 p-8 sm:p-10"><span className="text-xs text-[#40d4d4]">{item.number}</span><h3 className="mt-12 text-2xl font-semibold">{item.title}</h3><p className="mt-4 max-w-md leading-7 text-white/55">{item.body}</p></Reveal>)}</div></div></section>

    <section className="py-28"><div className="mx-auto max-w-7xl px-6"><Reveal className="mb-14 grid gap-8 lg:grid-cols-2"><div><Eyebrow>{t.implementationsEyebrow}</Eyebrow><h2 className="font-[var(--font-display)] text-4xl font-semibold tracking-[-.04em] sm:text-6xl">{t.implementationsTitle}</h2></div><p className="self-end text-lg leading-8 text-[#69717c]">{t.implementationsBody}</p></Reveal><div className="grid gap-6 lg:grid-cols-2">{t.implementationItems.map((item, i) => <Reveal key={item.title} delay={i * .12}><article className="group overflow-hidden rounded-[30px] border border-black/[.07] bg-[#f7f8f6]"><div className="aspect-[16/10] overflow-hidden"><Image src={item.image} alt={item.title} width={900} height={560} className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.025]" /></div><div className="p-8"><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#0aa9a9]">{item.label}</p><h3 className="mt-3 text-3xl font-semibold tracking-[-.03em]">{item.title}</h3><p className="mt-4 max-w-xl leading-7 text-[#68707b]">{item.body}</p></div></article></Reveal>)}</div></div></section>

    <section id="arquitectura" className="bg-[#f5f6f3] py-28"><div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2"><Reveal><Eyebrow>{t.architectureEyebrow}</Eyebrow><h2 className="font-[var(--font-display)] text-4xl font-semibold tracking-[-.04em] sm:text-6xl">{t.architectureTitle}</h2><p className="mt-7 max-w-xl text-lg leading-8 text-[#65707a]">{t.architectureBody}</p><div className="mt-12 rounded-[28px] border border-black/[.07] bg-white p-7"><h3 className="text-xl font-semibold">{t.intelligenceTitle}</h3><p className="mt-3 leading-7 text-[#6d747d]">{t.intelligenceBody}</p></div></Reveal><Reveal delay={.15}><div className="relative mx-auto aspect-square max-w-[560px] rounded-full border border-black/10 bg-white shadow-[0_30px_100px_rgba(25,40,45,.08)]"><div className="absolute inset-[26%] flex items-center justify-center rounded-full bg-[#0d1014] text-3xl font-semibold text-white">LUNA</div>{t.architectureNodes.map((n,i)=>{const p=['left-[8%] top-[16%]','right-[5%] top-[18%]','left-[-2%] top-1/2','right-[-2%] top-1/2','left-[12%] bottom-[13%]','right-[10%] bottom-[12%]'];return <div key={n} className={`absolute ${p[i]} rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium shadow-sm`}>{n}</div>})}</div></Reveal></div></section>

    <section className="py-28"><div className="mx-auto max-w-7xl px-6"><Reveal className="mb-14 max-w-3xl"><Eyebrow>{t.technologyEyebrow}</Eyebrow><h2 className="font-[var(--font-display)] text-4xl font-semibold tracking-[-.04em] sm:text-6xl">{t.technologyTitle}</h2></Reveal><div className="grid gap-px overflow-hidden rounded-[28px] bg-black/10 sm:grid-cols-2 lg:grid-cols-3">{t.technologyItems.map((x,i)=><Reveal key={x} delay={i*.05} className="bg-white p-8"><span className="text-xs text-[#0aa9a9]">0{i+1}</span><p className="mt-8 text-xl font-semibold tracking-[-.02em]">{x}</p></Reveal>)}</div></div></section>

    <section className="bg-[#0d1014] py-28 text-white"><div className="mx-auto max-w-5xl px-6 text-center"><Reveal><Eyebrow>{t.visionEyebrow}</Eyebrow><blockquote className="font-[var(--font-display)] text-3xl font-medium leading-tight tracking-[-.035em] sm:text-5xl">“{t.visionQuote} <span className="text-[#40d4d4]">{t.visionAccent}</span>”</blockquote><p className="mt-8 text-sm text-white/45">Gunther Del Rosario · CEO & Founder</p></Reveal></div></section>

    <section className="bg-[#f5f6f3] py-28"><div className="mx-auto max-w-7xl px-6"><Reveal className="mb-12 text-center"><Eyebrow>{t.conciergeEyebrow}</Eyebrow><h2 className="font-[var(--font-display)] text-4xl font-semibold tracking-[-.04em] sm:text-6xl">{t.conciergeTitle}</h2><p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#68717b]">{t.conciergeBody}</p></Reveal><Reveal delay={.12}><PublicConciergeChat copy={conciergeCopy} /></Reveal></div></section>

    <section className="py-28"><div className="mx-auto max-w-4xl px-6 text-center"><Reveal><Eyebrow>{t.finalEyebrow}</Eyebrow><h2 className="font-[var(--font-display)] text-4xl font-semibold leading-tight tracking-[-.04em] sm:text-6xl">{t.finalTitle}</h2><p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#68717b]">{t.finalBody}</p><div className="mt-10 flex flex-wrap justify-center gap-3"><Link href={`/${locale}/contact`} className="rounded-full bg-[#0d1014] px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#0aa9a9]">{t.demo}</Link><Link href={`/${locale}/systems/luna`} className="rounded-full border border-black/10 px-7 py-3.5 text-sm font-semibold">{t.discover}</Link></div></Reveal></div></section>

    <footer className="border-t border-black/[.06] py-12"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 text-center sm:flex-row sm:text-left"><div><p className="font-[var(--font-display)] text-xl font-semibold">Trends172Tech</p><p className="mt-1 text-sm text-[#818891]">{t.footer}</p></div><div className="flex gap-6 text-sm text-[#626a74]"><Link href={`/${locale}/systems/luna`}>LUNA</Link><Link href={`/${locale}/projects`}>{t.implementationsEyebrow}</Link><Link href={`/${locale}/contact`}>{t.contact}</Link></div></div></footer>
  </main>;
}
