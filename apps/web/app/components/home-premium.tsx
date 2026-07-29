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
    footer: 'Creadora de LUNA · Plataforma empresarial adaptable',
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
    footer: 'Creator of LUNA · Adaptable business platform',
  },
};

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const visible = useInView(ref, { once: true, margin: '-80px' });
  const reduce = useReducedMotion();
  return <motion.div ref={ref} initial={reduce ? false : { opacity: 0, y: 24 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.68, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>{children}</motion.div>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-[11px] font-semibold uppercase tracking-[.22em] text-[#00aeb3]">{children}</p>;
}

function Hero({ locale, t }: { locale: string; t: LocaleCopy }) {
  const reduce = useReducedMotion();
  return <section className="relative isolate overflow-hidden bg-[#fbfcfb] pt-20 sm:pt-24 lg:min-h-[94vh] lg:pt-28">
    <motion.div aria-hidden="true" className="absolute -right-28 top-10 -z-10 h-[430px] w-[430px] rounded-full bg-[radial-gradient(circle,rgba(0,194,199,.2),rgba(167,243,233,.1)_42%,transparent_72%)] blur-3xl sm:h-[600px] sm:w-[600px] lg:right-[2%] lg:top-[5%]" animate={reduce ? undefined : { scale: [0.94, 1.06, 0.94], opacity: [0.48, 0.8, 0.48] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} />
    <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_bottom,#fbfcfb_0%,#f7fbfa_58%,#ffffff_100%)]" />
    <div className="relative mx-auto grid max-w-7xl items-center gap-3 px-6 pb-10 sm:pb-14 lg:min-h-[calc(94vh-112px)] lg:grid-cols-[.96fr_1.04fr] lg:gap-12 lg:pb-20">
      <div className="relative z-10 max-w-2xl pt-5 sm:pt-8 lg:pt-0">
        <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex items-center gap-3 sm:mb-7">
          <span className="h-2 w-2 rounded-full bg-[#00c2c7] shadow-[0_0_18px_rgba(0,194,199,.65)]" />
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#66717a] sm:text-sm sm:normal-case sm:tracking-normal">{t.creator}</p>
        </motion.div>
        <motion.h1 initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08, duration: .8 }} className="font-[var(--font-display)] text-[64px] font-semibold leading-[.86] tracking-[-.07em] text-[#111418] min-[390px]:text-[72px] sm:text-[104px] lg:text-[132px]">LUNA</motion.h1>
        <motion.p initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .18, duration: .7 }} className="mt-5 max-w-[18ch] text-[27px] font-medium leading-[1.03] tracking-[-.045em] text-[#20252b] sm:mt-6 sm:max-w-2xl sm:text-4xl">{t.platform}</motion.p>
        <motion.p initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .28 }} className="mt-5 max-w-[31rem] text-[15px] leading-6 text-[#6b7280] sm:mt-7 sm:text-lg sm:leading-7">{t.heroBody}</motion.p>
        <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .38 }} className="mt-7 flex max-w-md flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
          <Link href={`/${locale}/systems/luna`} className="rounded-full bg-[#111418] px-7 py-3.5 text-center text-sm font-semibold text-white shadow-[0_14px_35px_rgba(17,20,24,.12)] transition hover:-translate-y-0.5 hover:bg-[#00aeb3]">{t.discover}</Link>
          <Link href={`/${locale}/contact`} className="rounded-full border border-black/10 bg-white/88 px-7 py-3.5 text-center text-sm font-semibold text-[#20252b] shadow-[0_10px_28px_rgba(17,20,24,.05)] backdrop-blur transition hover:border-[#00aeb3]/45 hover:text-[#008f94]">{t.demo}</Link>
        </motion.div>
      </div>
      <motion.div className="relative min-h-[250px] sm:min-h-[360px] lg:min-h-0" initial={reduce ? false : { opacity: 0, scale: .97, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: .2, duration: 1 }}>
        <LunaSystemMap nodes={t.architectureNodes} decorative className="absolute right-[-145px] top-[30px] w-[330px] opacity-[.28] sm:right-[-80px] sm:top-[10px] sm:w-[430px] sm:opacity-[.38] lg:relative lg:right-auto lg:top-auto lg:w-full lg:opacity-100" />
      </motion.div>
    </div>
    <div className="border-y border-black/[.05] bg-white/82 py-4 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl gap-5 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><span className="shrink-0 text-[10px] font-semibold uppercase tracking-[.16em] text-[#8a9199] sm:text-xs">{t.proof}</span>{t.proofItems.map(item => <span key={item} className="shrink-0 text-xs text-[#515862] sm:text-sm">{item}</span>)}</div></div>
  </section>;
}

export function HomePremium({ fontClass = '', conciergeCopy }: { fontClass?: string; conciergeCopy: ConciergeCopy; copy: HomePremiumCopy }) {
  const locale = conciergeCopy.locale;
  const t = COPY[locale.startsWith('es') ? 'es' : 'en'];
  return <main className={`overflow-x-hidden bg-white text-[#111418] ${fontClass}`}>
    <Hero locale={locale} t={t} />

    <section className="py-24 sm:py-32"><div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[.88fr_1.12fr] lg:gap-20"><Reveal><Eyebrow>{t.problemEyebrow}</Eyebrow><h2 className="max-w-xl font-[var(--font-display)] text-4xl font-semibold leading-[1.03] tracking-[-.045em] sm:text-6xl">{t.problemTitle}</h2></Reveal><Reveal delay={.12}><p className="max-w-2xl text-xl leading-8 text-[#68717b]">{t.problemBody}</p><div className="mt-10 grid grid-cols-2 gap-3">{t.problemItems.map(item => <div key={item} className="rounded-2xl border border-black/[.06] bg-[#f8faf9] p-5 text-sm font-medium text-[#3f4650] shadow-[0_10px_35px_rgba(17,20,24,.035)]">{item}</div>)}</div></Reveal></div></section>

    <section className="bg-[#f5fbfa] py-24 sm:py-32"><div className="mx-auto max-w-7xl px-6"><Reveal className="mb-14 grid gap-8 lg:grid-cols-2"><div><Eyebrow>{t.implementationsEyebrow}</Eyebrow><h2 className="font-[var(--font-display)] text-4xl font-semibold tracking-[-.045em] sm:text-6xl">{t.implementationsTitle}</h2></div><p className="self-end text-lg leading-8 text-[#69717c]">{t.implementationsBody}</p></Reveal><div className="grid gap-6 lg:grid-cols-2">{t.implementationItems.map((item, index) => <Reveal key={item.title} delay={index * .12}><article className="group overflow-hidden rounded-[30px] border border-black/[.06] bg-white shadow-[0_24px_80px_rgba(20,60,60,.07)]"><div className="aspect-[16/10] overflow-hidden bg-[#eef5f3]"><Image src={item.image} alt={item.title} width={900} height={560} className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.025]" /></div><div className="p-8"><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#00aeb3]">{item.label}</p><h3 className="mt-3 text-3xl font-semibold tracking-[-.03em]">{item.title}</h3><p className="mt-4 max-w-xl leading-7 text-[#68707b]">{item.body}</p></div></article></Reveal>)}</div></div></section>

    <section className="relative overflow-hidden bg-white py-24 sm:py-32"><div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_0%,rgba(0,194,199,.11),transparent_65%)]" /><div className="relative mx-auto max-w-7xl px-6"><Reveal className="mb-14 max-w-3xl"><Eyebrow>{t.capabilitiesEyebrow}</Eyebrow><h2 className="font-[var(--font-display)] text-4xl font-semibold leading-[1.06] tracking-[-.045em] sm:text-6xl">{t.capabilitiesTitle}</h2></Reveal><div className="grid gap-4 md:grid-cols-2">{t.capabilities.map((item, index) => <Reveal key={item.number} delay={index * .08} className="rounded-[28px] border border-black/[.06] bg-[linear-gradient(145deg,#ffffff,#f6fbfa)] p-8 shadow-[0_20px_65px_rgba(17,20,24,.045)] sm:p-10"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-[#00aeb3]">{item.number}</span><span className="h-9 w-9 rounded-full border border-[#00c2c7]/20 bg-[#eafffb]" /></div><h3 className="mt-12 text-2xl font-semibold">{item.title}</h3><p className="mt-4 max-w-md leading-7 text-[#68717b]">{item.body}</p></Reveal>)}</div></div></section>

    <section id="arquitectura" className="bg-[#f8faf9] py-24 sm:py-32"><div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:gap-20"><Reveal><Eyebrow>{t.architectureEyebrow}</Eyebrow><h2 className="font-[var(--font-display)] text-4xl font-semibold tracking-[-.045em] sm:text-6xl">{t.architectureTitle}</h2><p className="mt-7 max-w-xl text-lg leading-8 text-[#65707a]">{t.architectureBody}</p><div className="mt-10 rounded-[28px] border border-[#00aeb3]/12 bg-white p-7 shadow-[0_18px_60px_rgba(20,70,70,.05)]"><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#00aeb3]">IA + contexto</p><h3 className="mt-3 text-xl font-semibold">{t.intelligenceTitle}</h3><p className="mt-3 leading-7 text-[#6d747d]">{t.intelligenceBody}</p></div></Reveal><Reveal delay={.15}><LunaSystemMap nodes={t.architectureNodes} compact /></Reveal></div></section>

    <section className="py-24 sm:py-32"><div className="mx-auto max-w-7xl px-6"><Reveal className="mb-14 max-w-3xl"><Eyebrow>{t.technologyEyebrow}</Eyebrow><h2 className="font-[var(--font-display)] text-4xl font-semibold tracking-[-.045em] sm:text-6xl">{t.technologyTitle}</h2></Reveal><div className="grid gap-4 lg:grid-cols-3">{t.technologyItems.map((item, index) => <Reveal key={item.title} delay={index * .07} className="rounded-[28px] border border-black/[.06] bg-white p-8 shadow-[0_18px_55px_rgba(17,20,24,.045)] sm:p-10"><span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e8fbf8] text-xs font-semibold text-[#00aeb3]">0{index + 1}</span><h3 className="mt-10 text-2xl font-semibold tracking-[-.025em]">{item.title}</h3><p className="mt-4 leading-7 text-[#68707b]">{item.body}</p></Reveal>)}</div></div></section>

    <section className="relative overflow-hidden bg-[#f4fbfa] py-24 sm:py-32"><div className="absolute -left-28 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#a7f3e9]/30 blur-3xl" /><div className="relative mx-auto max-w-5xl px-6 text-center"><Reveal><Eyebrow>{t.visionEyebrow}</Eyebrow><blockquote className="font-[var(--font-display)] text-3xl font-medium leading-tight tracking-[-.04em] text-[#111418] sm:text-5xl">“{t.visionQuote} <span className="text-[#00aeb3]">{t.visionAccent}</span>”</blockquote><div className="mx-auto mt-10 h-px w-24 bg-gradient-to-r from-transparent via-[#00c2c7] to-transparent" /></Reveal></div></section>

    <section className="bg-white py-24 sm:py-32"><div className="mx-auto max-w-7xl px-6"><Reveal className="mb-12 text-center"><Eyebrow>{t.conciergeEyebrow}</Eyebrow><h2 className="font-[var(--font-display)] text-4xl font-semibold tracking-[-.045em] sm:text-6xl">{t.conciergeTitle}</h2><p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#68717b]">{t.conciergeBody}</p></Reveal><Reveal delay={.12}><div className="rounded-[32px] border border-black/[.05] bg-[#f7fbfa] p-2 shadow-[0_24px_85px_rgba(17,20,24,.05)] sm:p-4"><PublicConciergeChat copy={conciergeCopy} /></div></Reveal></div></section>

    <section className="bg-[#f5fbfa] py-24 sm:py-32"><div className="mx-auto max-w-4xl px-6 text-center"><Reveal><Eyebrow>{t.finalEyebrow}</Eyebrow><h2 className="font-[var(--font-display)] text-4xl font-semibold leading-tight tracking-[-.045em] sm:text-6xl">{t.finalTitle}</h2><p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#68717b]">{t.finalBody}</p><div className="mt-10 flex flex-wrap justify-center gap-3"><Link href={`/${locale}/contact`} className="rounded-full bg-[#111418] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(17,20,24,.12)] transition hover:-translate-y-0.5 hover:bg-[#00aeb3]">{t.demo}</Link><Link href={`/${locale}/systems/luna`} className="rounded-full border border-black/10 bg-white px-7 py-3.5 text-sm font-semibold transition hover:border-[#00aeb3]/45 hover:text-[#008f94]">{t.discover}</Link></div></Reveal></div></section>

    <footer className="border-t border-black/[.06] bg-white py-12"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 text-center sm:flex-row sm:text-left"><div className="flex items-center gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e9fbf8] text-lg font-semibold text-[#00aeb3]">T</div><div><p className="font-[var(--font-display)] text-xl font-semibold">Trends172Tech</p><p className="mt-1 text-sm text-[#818891]">{t.footer}</p></div></div><div className="flex gap-6 text-sm text-[#626a74]"><Link href={`/${locale}/systems/luna`} className="transition hover:text-[#00aeb3]">LUNA</Link><Link href={`/${locale}/projects`} className="transition hover:text-[#00aeb3]">{t.implementationsEyebrow}</Link><Link href={`/${locale}/contact`} className="transition hover:text-[#00aeb3]">{t.contact}</Link></div></div></footer>
  </main>;
}
