import type { Metadata } from 'next';
import { DM_Sans, Syne } from 'next/font/google';
import Link from 'next/link';

const display = Syne({ subsets: ['latin'], weight: ['500','600','700','800'], variable: '--font-proposal-display' });
const body = DM_Sans({ subsets: ['latin'], weight: ['300','400','500','600','700'], variable: '--font-proposal-body' });

const pillars = [
  { n:'01', title:'Centro comercial digital', text:'Una extensión web del complejo donde cada comercio puede tener presencia, catálogo y una experiencia conectada con la operación física.' },
  { n:'02', title:'Espacio para cada comercio', text:'Cada aliado comercial puede operar su propia vitrina digital y, según el alcance contratado, gestionar productos, promociones, pedidos y herramientas comerciales.' },
  { n:'03', title:'Inteligencia artificial', text:'LUNA puede incorporar agentes capaces de orientar al visitante, descubrir comercios y productos y conectar la intención del cliente con la oferta disponible.' },
  { n:'04', title:'Control central City Center', text:'Una administración central permite gobernar el ecosistema digital, altas de comercios, visibilidad, campañas, configuración y métricas de la plataforma.' },
];

const phases = [
  ['01','City Center Digital','Directorio, espacios digitales de comercios, catálogo, promociones, búsqueda y administración central.'],
  ['02','City Center Intelligence','Agente IA, búsqueda conversacional, recomendaciones, analítica e inteligencia comercial.'],
  ['03','City Center Commerce','Órdenes y experiencia omnicanal, con el modelo transaccional definido junto a City Center.'],
  ['04','Marketing IA','Herramientas para contenido, campañas y capacidades de marketing asistidas por inteligencia artificial.'],
  ['05','Smart Mall','Evolución hacia experiencias físico-digitales, navegación, eventos, fidelización e integraciones.'],
];

export const metadata: Metadata = {
  title: 'LUNA for City Center Maracay — Propuesta privada',
  description: 'Propuesta digital de Trends172Tech para City Center Maracay.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
};

export default function CityCenterProposalPage() {
  return (
    <div className={`${display.variable} ${body.variable} min-h-screen bg-white font-[var(--font-proposal-body)] text-slate-950 print:hidden`}>
      <div className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
          <Link href="/es" className="font-[var(--font-proposal-display)] text-sm font-bold tracking-tight">TRENDS<span className="text-cyan-600">172</span>TECH</Link>
          <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span className="hidden sm:inline">Propuesta privada</span><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />City Center Maracay
          </div>
        </div>
      </div>

      <main onContextMenu={undefined}>
        <section className="relative overflow-hidden px-5 pb-20 pt-32 md:px-8 md:pb-28 md:pt-40">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_15%,rgba(6,182,212,.12),transparent_28%),radial-gradient(circle_at_15%_70%,rgba(99,102,241,.08),transparent_30%)]" />
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">LUNA · Implementación especializada</div>
            <h1 className="max-w-5xl font-[var(--font-proposal-display)] text-5xl font-semibold leading-[.98] tracking-[-.045em] md:text-7xl lg:text-[88px]">
              Del centro comercial físico a un <span className="text-cyan-600">ecosistema comercial inteligente.</span>
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">Propuesta conceptual de Trends172Tech para extender la experiencia de City Center Maracay al entorno digital mediante LUNA, nuestra plataforma tecnológica empresarial.</p>
            <div className="mt-12 flex flex-wrap gap-3">
              <a href="#vision" className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Explorar propuesta</a>
              <a href="#demo" className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold transition hover:bg-slate-50">Ver concepto IA</a>
            </div>
          </div>
        </section>

        <section id="vision" className="border-y border-slate-200 bg-slate-50 px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-700">La oportunidad</p>
            <div className="mt-5 grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
              <h2 className="font-[var(--font-proposal-display)] text-4xl font-semibold tracking-[-.035em] md:text-6xl">Cada local físico puede tener una extensión digital dentro del mismo ecosistema.</h2>
              <div className="space-y-5 text-base leading-7 text-slate-600">
                <p>La propuesta no consiste únicamente en crear un e-commerce. Consiste en construir una capa digital propia de City Center que conecte visitantes, comercios, productos, promociones, datos e inteligencia artificial.</p>
                <p>El objetivo es que la relación con el comercio pueda evolucionar de <strong className="text-slate-950">local físico</strong> a <strong className="text-slate-950">local físico + presencia digital</strong>, bajo una plataforma gobernada por City Center.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-700">Arquitectura de la experiencia</p>
            <h2 className="mt-5 max-w-3xl font-[var(--font-proposal-display)] text-4xl font-semibold tracking-[-.035em] md:text-6xl">Una plataforma. Múltiples comercios. Un solo ecosistema.</h2>
            <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 md:grid-cols-2">
              {pillars.map((p)=><article key={p.n} className="bg-white p-7 md:p-10"><div className="text-xs font-bold tracking-[.2em] text-cyan-700">{p.n}</div><h3 className="mt-8 font-[var(--font-proposal-display)] text-2xl font-semibold">{p.title}</h3><p className="mt-3 leading-7 text-slate-600">{p.text}</p></article>)}
            </div>
          </div>
        </section>

        <section id="demo" className="bg-slate-950 px-5 py-20 text-white md:px-8 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
            <div><p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-400">LUNA AI Commerce</p><h2 className="mt-5 font-[var(--font-proposal-display)] text-4xl font-semibold tracking-[-.035em] md:text-6xl">El centro comercial también puede conversar.</h2><p className="mt-6 max-w-xl leading-7 text-slate-300">Una capa de inteligencia artificial puede ayudar al visitante a descubrir qué comprar, dónde encontrarlo y qué alternativas existen dentro de City Center. La experiencia se diseñaría sobre datos autorizados de los comercios.</p></div>
            <div className="rounded-[30px] border border-white/10 bg-white/[.06] p-4 shadow-2xl md:p-7">
              <div className="rounded-2xl bg-white p-5 text-slate-950 md:p-7">
                <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-cyan-100 font-bold text-cyan-700">L</span><div><div className="font-semibold">LUNA · City Center</div><div className="text-xs text-slate-500">Asistente comercial · Concepto</div></div></div>
                <div className="mt-7 rounded-2xl bg-slate-100 p-4 text-sm leading-6">Busco un regalo de tecnología y quiero comparar opciones disponibles en el centro comercial.</div>
                <div className="ml-auto mt-3 max-w-[92%] rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-white">Puedo ayudarte a descubrir comercios, productos y promociones disponibles. Cuando la plataforma esté conectada a los catálogos de City Center, la búsqueda podrá realizarse sobre información real y autorizada.</div>
                <div className="mt-6 flex gap-2"><span className="rounded-full border border-slate-200 px-3 py-2 text-xs">Tecnología</span><span className="rounded-full border border-slate-200 px-3 py-2 text-xs">Regalos</span><span className="rounded-full border border-slate-200 px-3 py-2 text-xs">Promociones</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-700">Tecnología aplicada</p>
            <div className="mt-5 grid gap-10 lg:grid-cols-2 lg:items-end"><h2 className="font-[var(--font-proposal-display)] text-4xl font-semibold tracking-[-.035em] md:text-6xl">LUNA no parte de una idea aislada.</h2><p className="leading-7 text-slate-600">LUNA es la plataforma tecnológica desarrollada por Trends172Tech. Su arquitectura se adapta a operaciones empresariales específicas. CarpiHogar es una implementación comercial real de esta tecnología y sirve como referencia de cómo gestión, comercio digital e inteligencia artificial pueden convivir en un mismo ecosistema.</p></div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {['Operación empresarial + comercio digital','Arquitectura modular y adaptable','Inteligencia artificial integrada al flujo'].map(x=><div key={x} className="rounded-2xl border border-slate-200 p-6 font-semibold">{x}</div>)}
            </div>
            <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-950"><strong>Propiedad intelectual.</strong> La documentación legal y los datos registrales específicos de LUNA se incorporarán a la versión comercial final una vez validados para presentación externa.</div>
          </div>
        </section>

        <section className="bg-slate-50 px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-700">Ruta de implementación</p>
            <h2 className="mt-5 max-w-4xl font-[var(--font-proposal-display)] text-4xl font-semibold tracking-[-.035em] md:text-6xl">Construir por fases. Validar. Escalar.</h2>
            <div className="mt-14 divide-y divide-slate-200 border-y border-slate-200">{phases.map(([n,t,d])=><div key={n} className="grid gap-4 py-7 md:grid-cols-[90px_280px_1fr] md:items-start"><div className="text-sm font-bold text-cyan-700">{n}</div><h3 className="font-[var(--font-proposal-display)] text-xl font-semibold">{t}</h3><p className="leading-7 text-slate-600">{d}</p></div>)}</div>
            <p className="mt-5 text-xs leading-5 text-slate-500">El alcance, cronograma, modelo transaccional, integraciones y condiciones comerciales se definen con City Center antes de la implementación.</p>
          </div>
        </section>

        <section className="px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-5xl rounded-[36px] bg-[linear-gradient(135deg,#07111f,#0f2537)] px-7 py-14 text-center text-white md:px-14 md:py-20">
            <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-400">Siguiente conversación</p>
            <h2 className="mx-auto mt-5 max-w-3xl font-[var(--font-proposal-display)] text-4xl font-semibold tracking-[-.035em] md:text-6xl">Diseñemos el City Center que también existe online.</h2>
            <p className="mx-auto mt-6 max-w-2xl leading-7 text-slate-300">Esta versión presenta la visión tecnológica inicial. El siguiente paso es validar junto a City Center el modelo comercial, la experiencia de los comercios y el alcance de la primera fase.</p>
            <a href="https://wa.me/584222640371?text=Hola%2C%20estoy%20interesado%20en%20la%20propuesta%20LUNA%20para%20City%20Center%20Maracay.%20Me%20gustaria%20coordinar%20una%20reunion%20para%20conocer%20mas%20detalles." target="_blank" rel="noreferrer" className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-50"><span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-[11px] text-white">W</span>Hablar por WhatsApp</a>
          </div>
          <p className="mx-auto mt-8 max-w-5xl text-center text-[11px] uppercase tracking-[.16em] text-slate-400">Documento digital de visualización · Preparado por Trends172Tech · City Center Maracay</p>
        </section>
      </main>
      <a href="https://wa.me/584222640371?text=Hola%2C%20estoy%20interesado%20en%20la%20propuesta%20LUNA%20para%20City%20Center%20Maracay.%20Me%20gustaria%20coordinar%20una%20reunion%20para%20conocer%20mas%20detalles." target="_blank" rel="noreferrer" aria-label="Contactar por WhatsApp" className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-[0_14px_40px_rgba(16,185,129,.35)] transition hover:-translate-y-0.5 hover:bg-emerald-600 md:bottom-7 md:right-7 md:px-5"><span className="grid h-6 w-6 place-items-center rounded-full bg-white/20 text-xs">W</span><span className="hidden sm:inline">Estoy interesado</span></a>
    </div>
  );
}
