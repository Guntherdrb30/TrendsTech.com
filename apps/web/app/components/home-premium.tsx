'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { PublicConciergeChat } from '@/[locale]/(public)/public-concierge-chat';
import { LunaSystemMap } from './luna-system-map';

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
  problemEyebrow: string;
  problemTitle: string;
  problemBody: string;
  problemItems: string[];
  implementationsEyebrow: string;
  implementationsTitle: string;
  implementationsBody: string;
  implementationItems: Array<{ title: string; label: string; body: string; image: string }>;
  capabilitiesEyebrow: string;
  capabilitiesTitle: string;
  capabilities: Array<{ number: string; title: string; body: string }>;
  architectureEyebrow: string;
  architectureTitle: string;
  architectureBody: string;
  architectureNodes: string[];
  intelligenceTitle: string;
  intelligenceBody: string;
  technologyEyebrow: string;
  technologyTitle: string;
  technologyItems: Array<{ title: string; body: string }>;
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
    platform: 'La plataforma empresarial que se adapta a tu operación.',
    heroBody: 'Conecta procesos, equipos, comercio, datos e inteligencia sin obligar a tu empresa a trabajar alrededor de un sistema rígido.',
    demo: 'Solicitar una demostración',
    discover: 'Conocer la plataforma',
    proof: 'Una plataforma. Distintas formas de operar.',
    proofItems: ['Operaciones conectadas', 'Comercio integrado', 'Automatización controlada', 'Inteligencia con contexto'],
    problemEyebrow: 'Por qué existe LUNA',
    problemTitle: 'El crecimiento no debería fragmentar la empresa.',
    problemBody: 'Cuando cada equipo opera con herramientas, datos y procesos aislados, la empresa pierde velocidad, control y claridad. LUNA crea un núcleo común que evoluciona con la operación.',
    problemItems: ['Información dispersa', 'Procesos manuales', 'Sistemas rígidos', 'Decisiones sin contexto'],
    implementationsEyebrow: 'Implementaciones',
    implementationsTitle: 'La plataforma se demuestra operando.',
    implementationsBody: 'Cada implementación adopta una identidad, una industria y una lógica operacional diferente sin perder el mismo núcleo tecnológico.',
    implementationItems: [
      { title: 'Carpihogar', label: 'Comercio y operaciones', body: 'Ecommerce, ventas, inventario, cotizaciones y experiencia instalable conectados sobre una operación real.', image: '/screenshots/luna/luna-dekomundo-storefront.png' },
      { title: 'LUNA Football', label: 'Gestión deportiva', body: 'Jugadores, equipos, mensualidades, inventario y planificación deportiva desde una experiencia especializada.', image: '/screenshots/luna/luna-admin-dashboard.png' },
    ],
    capabilitiesEyebrow: 'Capacidades',
    capabilitiesTitle: 'Un núcleo operativo para toda la empresa.',
    capabilities: [
      { number: '01', title: 'Operaciones', body: 'Ventas, compras, inventario, clientes, cobros, despachos y trazabilidad dentro de un entorno conectado.' },
      { number: '02', title: 'Comercio', body: 'Catálogos, cotizaciones y experiencias digitales sincronizadas con la operación interna.' },
      { number: '03', title: 'Inteligencia', body: 'Agentes y asistentes que trabajan sobre datos, permisos y procesos reales.' },
      { number: '04', title: 'Adaptabilidad', body: 'Módulos, identidad, permisos y flujos configurados para cada organización.' },
    ],
    architectureEyebrow: 'Arquitectura',
    architectureTitle: 'LUNA funciona como un sistema vivo.',
    architectureBody: 'Un núcleo común coordina módulos, datos, automatizaciones e interfaces. Cada capa puede crecer sin fragmentar la operación.',
    architectureNodes: ['Operaciones', 'Comercio', 'Finanzas', 'Clientes', 'Analítica', 'Agentes IA'],
    intelligenceTitle: 'Inteligencia conectada al contexto',
    intelligenceBody: 'La IA no vive como un accesorio aislado. Opera sobre permisos, procesos y datos empresariales para producir respuestas útiles y acciones controladas.',
    technologyEyebrow: 'Diseñada para producción',
    technologyTitle: 'Tecnología que se traduce en capacidad operacional.',
    technologyItems: [
      { title: 'Disponible donde ocurre el trabajo', body: 'Una experiencia web progresiva preparada para equipos, dispositivos y roles diferentes.' },
      { title: 'Crece sin rehacerse', body: 'Una arquitectura modular que permite incorporar nuevas capacidades sobre el mismo núcleo.' },
      { title: 'Se integra con el ecosistema', body: 'APIs, automatizaciones e integraciones que conectan LUNA con herramientas existentes.' },
    ],
    visionEyebrow: 'Nuestra visión',
    visionQuote: 'Construimos LUNA para que la tecnología entienda la operación de una empresa,',
    visionAccent: 'no para que la empresa tenga que adaptarse a la tecnología.',
    conciergeEyebrow: 'Diagnóstico',
    conciergeTitle: 'Conversemos sobre tu operación.',
    conciergeBody: 'Describe cómo funciona tu empresa y nuestro asesor te ayudará a identificar dónde LUNA puede generar más control, velocidad y claridad.',
    finalEyebrow: 'El siguiente paso',
    finalTitle: 'Una plataforma debe encajar en tu empresa. No al revés.',
    finalBody: 'Conoce cómo LUNA puede configurarse para tus procesos, tus equipos y tu siguiente etapa de crecimiento.',
    contact: 'Hablar con el equipo',
    footer: 'Creadora de LUNA · Plataforma Empresarial Inteligente',
  },
  en: {
    creator: 'Created by Trends172Tech',
    platform: 'The business platform that adapts to your operation.',
    heroBody: 'Connect processes, teams, commerce, data and intelligence without forcing your company to work around rigid software.',
    demo: 'Request a demonstration',
    discover: 'Explore the platform',
    proof: 'One platform. Different ways to operate.',
    proofItems: ['Connected operations', 'Integrated commerce', 'Controlled automation', 'Contextual intelligence'],
    problemEyebrow: 'Why LUNA exists',
    problemTitle: 'Growth should not fragment the company.',
    problemBody: 'When every team operates with isolated tools, data and processes, the company loses speed, control and clarity. LUNA creates a shared core that evolves with the operation.',
    problemItems: ['Scattered information', 'Manual processes', 'Rigid systems', 'Decisions without context'],
    implementationsEyebrow: 'Implementations',
    implementationsTitle: 'The platform proves itself in operation.',
    implementationsBody: 'Each implementation adopts a different identity, industry and operating logic without losing the same technology core.',
    implementationItems: [
      { title: 'Carpihogar', label: 'Commerce and operations', body: 'Ecommerce, sales, inventory, quotations and an installable experience connected to a real operation.', image: '/screenshots/luna/luna-dekomundo-storefront.png' },
      { title: 'LUNA Football', label: 'Sports management', body: 'Players, teams, memberships, inventory and sports planning through a specialised experience.', image: '/screenshots/luna/luna-admin-dashboard.png' },
    ],
    capabilitiesEyebrow: 'Capabilities',
    capabilitiesTitle: 'One operating core for the entire company.',
    capabilities: [
      { number: '01', title: 'Operations', body: 'Sales, purchasing, inventory, customers, collections, dispatch and traceability in one connected environment.' },
      { number: '02', title: 'Commerce', body: 'Catalogues, quotations and digital experiences synchronised with internal operations.' },
      { number: '03', title: 'Intelligence', body: 'Agents and assistants working across real data, permissions and processes.' },
      { number: '04', title: 'Adaptability', body: 'Modules, identity, permissions and workflows configured for each organisation.' },
    ],
    architectureEyebrow: 'Architecture',
    architectureTitle: 'LUNA behaves like a living system.',
    architectureBody: 'A common core coordinates modules, data, automations and interfaces. Every layer can grow without fragmenting the operation.',
    architectureNodes: ['Operations', 'Commerce', 'Finance', 'Customers', 'Analytics', 'AI Agents'],
    intelligenceTitle: 'Intelligence connected to context',
    intelligenceBody: 'AI is not an isolated add-on. It operates across permissions, processes and business data to produce useful answers and controlled actions.',
    technologyEyebrow: 'Built for production',
    technologyTitle: 'Technology translated into operating capability.',
    technologyItems: [
      { title: 'Available where work happens', body: 'A progressive web experience prepared for different teams, devices and roles.' },
      { title: 'Grows without being rebuilt', body: 'A modular architecture that adds new capabilities on the same core.' },
      { title: 'Connects to the ecosystem', body: 'APIs, automations and integrations connecting LUNA to existing tools.' },
    ],
    visionEyebrow: 'Our vision',
    visionQuote: 'We built LUNA so technology can understand how a company operates,',
    visionAccent: 'not so the company has to adapt to technology.',
    conciergeEyebrow: 'Diagnosis',
    conciergeTitle: 'Let us talk about your operation.',
    conciergeBody: 'Describe how your company works and our advisor will help identify where LUNA can create more control, speed and clarity.',
    finalEyebrow: 'The next step',
    finalTitle: 'A platform should fit your company. Not the other way around.',
    finalBody: 'Discover how LUNA can be configured for your processes, teams and next stage of growth.',
    contact: 'Talk to the team',
    footer: 'Creator of LUNA · Intelligent Business Platform',
  },
};

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const visible = useInView(ref, { once: true, margin: '-80px' });
  const reduce = useReducedMotion();
  return <motion.div ref={ref} initial={reduce ? false : { opacity: 0, y: 28 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>{children}</motion.div>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-[11px] font-semibold uppercase tracking-[.22em] text-[#079f9f]">{children}</p>;
}

function Hero({ locale, t }: { locale: string; t: LocaleCopy }) {
  const reduce = useReducedMotion();
  return <section className="relative isolate overflow-hidden bg-[#f6f7f4] pt-20 sm:pt-24 lg:min-h-[94vh] lg:pt-28">
    <motion.div aria-hidden="true" className="absolute -right-24 top-12 -z-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(20,217,217,.22),rgba(20,217,217,.08)_38%,transparent_70%)] blur-3xl sm:h-[560px] sm:w-[560px] lg:right-[4%] lg:top-[8%]" animate={reduce ? undefined : { scale: [0.92, 1.08, 0.92], opacity: [0.55, 0.9, 0.55] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
    <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,.94))]" />
    <div className="relative mx-auto grid max-w-7xl items-center gap-4 px-6 pb-10 sm:pb-14 lg:min-h-[calc(94vh-112px)] lg:grid-cols-[.92fr_1.08fr] lg:gap-10 lg:pb-20">
      <div className="relative z-10 max-w-2xl pt-5 sm:pt-8 lg:pt-0">
        <motion.p initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5 text-xs font-semibold uppercase tracking-[.16em] text-[#59606b] sm:mb-7 sm:text-sm sm:normal-case sm:tracking-normal">{t.creator}</motion.p>
        <motion.h1 initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08, duration: .8 }} className="font-[var(--font-display)] text-[64px] font-semibold leading-[.86] tracking-[-.07em] text-[#0b0d10] min-[390px]:text-[72px] sm:text-[104px] lg:text-[132px]">LUNA</motion.h1>
        <motion.p initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .18, duration: .7 }} className="mt-5 max-w-[18ch] text-[27px] font-medium leading-[1.03] tracking-[-.045em] text-[#20252b] sm:mt-6 sm:max-w-2xl sm:text-4xl">{t.platform}</motion.p>
        <motion.p initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .28 }} className="mt-5 max-w-[31rem] text-[15px] leading-6 text-[#69717c] sm:mt-7 sm:text-lg sm:leading-7">{t.heroBody}</motion.p>
        <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .38 }} className="mt-7 flex max-w-md flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
          <Link href={`/${locale}/systems/luna`} className="rounded-full bg-[#0b0d10] px-7 py-3.5 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#079f9f]">{t.discover}</Link>
          <Link href={`/${locale}/contact`} className="rounded-full border border-black/10 bg-white/80 px-7 py-3.5 text-center text-sm font-semibold text-[#20252b] backdrop-blur transition hover:border-black/25">{t.demo}</Link>
        </motion.div>
      </div>
      <motion.div className="relative min-h-[250px] sm:min-h-[360px] lg:min-h-0" initial={reduce ? false : { opacity: 0, scale: .96, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: .2, duration: 1 }}>
        <LunaSystemMap nodes={t.architectureNodes} />
      </motion.div>
      <motion.div aria-hidden="true" className="mx-auto mt-1 flex flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-[#899198] lg:absolute lg:bottom-5 lg:left-1/2 lg:-translate-x-1/2" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
        <span className="h-8 w-px bg-gradient-to-b from-[#18beba] to-transparent" />
        <span>Scroll</span>
      </motion.div>
    </div>
    <div className="border-y border-black/[.05] bg-white/75 py-4 backdrop-blur"><div className="mx-auto flex max-w-7xl gap-5 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><span className="shrink-0 text-[10px] font-semibold uppercase tracking-[.16em] text-[#8a9199] sm:text-xs">{t.proof}</span>{t.proofItems.map(item => <span key={item} className="shrink-0 text-xs text-[#515862] sm:text-sm">{item}</span>)}</div></div>
  </section>;
}

export function HomePremium({ fontClass = '', conciergeCopy }: { fontClass?: string; conciergeCopy: ConciergeCopy; copy: HomePremiumCopy }) {
  const locale = conciergeCopy.locale;
  const t = COPY[locale.startsWith('es') ? 'es' : 'en'];
  return <main className={`overflow-x-hidden bg-white ${fontClass}`}>
    <Hero locale={locale} t={t} />
    <section className="py-28 sm:py-36"><div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[.9fr_1.1fr]"><Reveal><Eyebrow>{t.problemEyebrow}</Eyebrow><h2 className="max-w-xl font-[var(--font-display)] text-4xl font-semibold leading-[1.03] tracking-[-.045em] text-[#111418] sm:text-6xl">{t.problemTitle}</h2></Reveal><Reveal delay={.12}><p className="max-w-2xl text-xl leading-8 text-[#606873]">{t.problemBody}</p><div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-black/[.08]">{t.problemItems.map(item => <div key={item} className="bg-white p-5 text-sm font-medium text-[#3f4650]">{item}</div>)}</div></Reveal></div></section>
    <section className="bg-[#f5f6f3] py-28 sm:py-36"><div className="mx-auto max-w-7xl px-6"><Reveal className="mb-14 grid gap-8 lg:grid-cols-2"><div><Eyebrow>{t.implementationsEyebrow}</Eyebrow><h2 className="font-[var(--font-display)] text-4xl font-semibold tracking-[-.045em] sm:text-6xl">{t.implementationsTitle}</h2></div><p className="self-end text-lg leading-8 text-[#69717c]">{t.implementationsBody}</p></Reveal><div className="grid gap-6 lg:grid-cols-2">{t.implementationItems.map((item, index) => <Reveal key={item.title} delay={index * .12}><article className="group overflow-hidden rounded-[30px] border border-black/[.07] bg-white shadow-[0_24px_80px_rgba(25,40,45,.06)]"><div className="aspect-[16/10] overflow-hidden bg-[#e9ece8]"><Image src={item.image} alt={item.title} width={900} height={560} className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.025]" /></div><div className="p-8"><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#079f9f]">{item.label}</p><h3 className="mt-3 text-3xl font-semibold tracking-[-.03em]">{item.title}</h3><p className="mt-4 max-w-xl leading-7 text-[#68707b]">{item.body}</p></div></article></Reveal>)}</div></div></section>
    <section className="bg-[#0d1014] py-28 text-white sm:py-36"><div className="mx-auto max-w-7xl px-6"><Reveal className="mb-16 max-w-3xl"><Eyebrow>{t.capabilitiesEyebrow}</Eyebrow><h2 className="font-[var(--font-display)] text-4xl font-semibold leading-[1.06] tracking-[-.045em] sm:text-6xl">{t.capabilitiesTitle}</h2></Reveal><div className="grid border-l border-t border-white/10 md:grid-cols-2">{t.capabilities.map((item, index) => <Reveal key={item.number} delay={index * .08} className="border-b border-r border-white/10 p-8 sm:p-10"><span className="text-xs text-[#40d4d4]">{item.number}</span><h3 className="mt-12 text-2xl font-semibold">{item.title}</h3><p className="mt-4 max-w-md leading-7 text-white/55">{item.body}</p></Reveal>)}</div></div></section>
    <section id="arquitectura" className="py-28 sm:py-36"><div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2"><Reveal><Eyebrow>{t.architectureEyebrow}</Eyebrow><h2 className="font-[var(--font-display)] text-4xl font-semibold tracking-[-.045em] sm:text-6xl">{t.architectureTitle}</h2><p className="mt-7 max-w-xl text-lg leading-8 text-[#65707a]">{t.architectureBody}</p><div className="mt-12 rounded-[28px] border border-black/[.07] bg-[#f5f6f3] p-7"><h3 className="text-xl font-semibold">{t.intelligenceTitle}</h3><p className="mt-3 leading-7 text-[#6d747d]">{t.intelligenceBody}</p></div></Reveal><Reveal delay={.15}><LunaSystemMap nodes={t.architectureNodes} compact /></Reveal></div></section>
    <section className="bg-[#f5f6f3] py-28 sm:py-36"><div className="mx-auto max-w-7xl px-6"><Reveal className="mb-14 max-w-3xl"><Eyebrow>{t.technologyEyebrow}</Eyebrow><h2 className="font-[var(--font-display)] text-4xl font-semibold tracking-[-.045em] sm:text-6xl">{t.technologyTitle}</h2></Reveal><div className="grid gap-px overflow-hidden rounded-[28px] bg-black/10 lg:grid-cols-3">{t.technologyItems.map((item, index) => <Reveal key={item.title} delay={index * .07} className="bg-white p-8 sm:p-10"><span className="text-xs text-[#079f9f]">0{index + 1}</span><h3 className="mt-10 text-2xl font-semibold tracking-[-.025em]">{item.title}</h3><p className="mt-4 leading-7 text-[#68707b]">{item.body}</p></Reveal>)}</div></div></section>
    <section className="bg-[#0d1014] py-28 text-white sm:py-36"><div className="mx-auto max-w-5xl px-6 text-center"><Reveal><Eyebrow>{t.visionEyebrow}</Eyebrow><blockquote className="font-[var(--font-display)] text-3xl font-medium leading-tight tracking-[-.04em] sm:text-5xl">“{t.visionQuote} <span className="text-[#40d4d4]">{t.visionAccent}</span>”</blockquote></Reveal></div></section>
    <section className="bg-[#f5f6f3] py-28 sm:py-36"><div className="mx-auto max-w-7xl px-6"><Reveal className="mb-12 text-center"><Eyebrow>{t.conciergeEyebrow}</Eyebrow><h2 className="font-[var(--font-display)] text-4xl font-semibold tracking-[-.045em] sm:text-6xl">{t.conciergeTitle}</h2><p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#68717b]">{t.conciergeBody}</p></Reveal><Reveal delay={.12}><PublicConciergeChat copy={conciergeCopy} /></Reveal></div></section>
    <section className="py-28 sm:py-36"><div className="mx-auto max-w-4xl px-6 text-center"><Reveal><Eyebrow>{t.finalEyebrow}</Eyebrow><h2 className="font-[var(--font-display)] text-4xl font-semibold leading-tight tracking-[-.045em] sm:text-6xl">{t.finalTitle}</h2><p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#68717b]">{t.finalBody}</p><div className="mt-10 flex flex-wrap justify-center gap-3"><Link href={`/${locale}/contact`} className="rounded-full bg-[#0d1014] px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#079f9f]">{t.demo}</Link><Link href={`/${locale}/systems/luna`} className="rounded-full border border-black/10 px-7 py-3.5 text-sm font-semibold transition hover:border-black/25">{t.discover}</Link></div></Reveal></div></section>
    <footer className="border-t border-black/[.06] py-12"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 text-center sm:flex-row sm:text-left"><div><p className="font-[var(--font-display)] text-xl font-semibold">Trends172Tech</p><p className="mt-1 text-sm text-[#818891]">{t.footer}</p></div><div className="flex gap-6 text-sm text-[#626a74]"><Link href={`/${locale}/systems/luna`}>LUNA</Link><Link href={`/${locale}/projects`}>{t.implementationsEyebrow}</Link><Link href={`/${locale}/contact`}>{t.contact}</Link></div></div></footer>
  </main>;
}
