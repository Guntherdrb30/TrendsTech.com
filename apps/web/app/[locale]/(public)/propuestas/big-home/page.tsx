import type { Metadata } from 'next';
import { DM_Sans, Syne } from 'next/font/google';
import Link from 'next/link';
import { BookingWidget } from '@/components/booking/booking-widget';

const display = Syne({ subsets:['latin'], weight:['500','600','700','800'], variable:'--font-proposal-display' });
const body = DM_Sans({ subsets:['latin'], weight:['300','400','500','600','700'], variable:'--font-proposal-body' });

const capabilities = [
  ['01','Ventas y cajas','POS por sucursal, cajas, vendedores, cotizaciones, pedidos, devoluciones, métodos de pago y control operativo.'],
  ['02','Inventario multi-sucursal','Productos, SKUs, existencias, almacenes, transferencias, costos, precios y trazabilidad entre sedes.'],
  ['03','Compras y proveedores','Órdenes de compra, recepción de mercancía, proveedores, costos y reposición conectada con inventario.'],
  ['04','E-commerce conectado','Catálogo digital, búsqueda, carrito, pedidos y disponibilidad vinculada con la operación real.'],
  ['05','CRM + IA comercial','Historial del cliente, segmentación, seguimiento y agentes IA entrenados sobre información autorizada del negocio.'],
  ['06','Dirección y BI','Indicadores de ventas, inventario, rotación, compras, sucursales y consultas ejecutivas asistidas por IA.'],
];

const roadmap = [
  ['01','Diagnóstico e integración','Mapear procesos, sistemas actuales, sucursales, cajas, almacenes, catálogo, usuarios e integraciones.'],
  ['02','Núcleo LUNA','Adaptar ventas, compras, inventario, proveedores, cajas, usuarios, permisos y operación multi-sucursal.'],
  ['03','Comercio + clientes','Conectar e-commerce, CRM, atención y experiencia omnicanal con la operación central.'],
  ['04','Marketing IA','Campañas, promociones, contenido y automatización comercial basados en catálogo y datos autorizados.'],
  ['05','Video Marketing AI','Flujo especializado para transformar productos y campañas en piezas de video y variantes creativas asistidas por IA.'],
  ['06','Inteligencia avanzada','Analítica conversacional y experiencias visuales para explorar productos en espacios, sujetas al alcance acordado.'],
];

export const metadata: Metadata = {
  title:'LUNA for Big Home — Propuesta privada',
  description:'Propuesta tecnológica de Trends172Tech para Big Home.',
  robots:{ index:false, follow:false, nocache:true, googleBot:{ index:false, follow:false, noimageindex:true } },
};

export default function BigHomeProposalPage(){
 return <div className={`${display.variable} ${body.variable} min-h-screen bg-white font-[var(--font-proposal-body)] text-slate-950`}>
  <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
   <Link href="/es" className="font-[var(--font-proposal-display)] text-sm font-bold">TRENDS<span className="text-cyan-600">172</span>TECH</Link>
   <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.18em] text-slate-500"><span className="hidden sm:inline">Propuesta privada</span><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>BIG HOME × LUNA</div>
  </div></header>
  <main>
   <section className="relative overflow-hidden px-5 pb-20 pt-32 md:px-8 md:pb-28 md:pt-40"><div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_12%,rgba(6,182,212,.13),transparent_30%),radial-gradient(circle_at_12%_75%,rgba(239,68,68,.07),transparent_30%)]"/>
    <div className="mx-auto max-w-7xl"><div className="mb-8 inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-cyan-800">LUNA · Plataforma IA-Nativa</div>
     <h1 className="max-w-6xl font-[var(--font-proposal-display)] text-5xl font-semibold leading-[.98] tracking-[-.045em] md:text-7xl lg:text-[88px]">Una plataforma para conectar y escalar <span className="text-cyan-600">toda la operación de Big Home.</span></h1>
     <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">Propuesta de Trends172Tech para adaptar LUNA a Big Home e integrar operación, ventas, compras, sucursales, cajas, comercio digital, clientes, marketing e inteligencia artificial.</p>
     <div className="mt-12 flex flex-wrap gap-3"><a href="#plataforma" className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white">Explorar propuesta</a><a href="#reunion" className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold">Coordinar reunión</a></div>
    </div>
   </section>

   <section id="plataforma" className="border-y border-slate-200 bg-slate-50 px-5 py-20 md:px-8 md:py-28"><div className="mx-auto max-w-7xl">
    <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-700">La visión</p><div className="mt-5 grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
     <h2 className="font-[var(--font-proposal-display)] text-4xl font-semibold tracking-[-.035em] md:text-6xl">Big Home ya tiene la marca y la operación. LUNA puede convertirse en su núcleo tecnológico.</h2>
     <div className="space-y-5 text-base leading-7 text-slate-600"><p>No proponemos sumar herramientas aisladas. Proponemos una plataforma empresarial capaz de conectar procesos, canales y datos bajo una arquitectura diseñada alrededor de Big Home.</p><p>La implementación puede <strong className="text-slate-950">integrar, adaptar o sustituir progresivamente</strong> componentes existentes después de conocer la infraestructura actual, evitando una migración innecesariamente disruptiva.</p></div>
    </div></div>
   </section>

   <section className="px-5 py-20 md:px-8 md:py-28"><div className="mx-auto max-w-7xl">
    <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-700">Operación conectada</p><h2 className="mt-5 max-w-4xl font-[var(--font-proposal-display)] text-4xl font-semibold tracking-[-.035em] md:text-6xl">Del producto a la venta. De la caja a la dirección.</h2>
    <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 md:grid-cols-2 lg:grid-cols-3">{capabilities.map(([n,t,d])=><article key={n} className="bg-white p-7 md:p-9"><div className="text-xs font-bold tracking-[.2em] text-cyan-700">{n}</div><h3 className="mt-7 font-[var(--font-proposal-display)] text-2xl font-semibold">{t}</h3><p className="mt-3 leading-7 text-slate-600">{d}</p></article>)}</div>
   </div></section>

   <section className="bg-slate-950 px-5 py-20 text-white md:px-8 md:py-28"><div className="mx-auto max-w-7xl">
    <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-400">LUNA Marketing + Video AI</p><div className="mt-5 grid gap-12 lg:grid-cols-2">
     <div><h2 className="font-[var(--font-proposal-display)] text-4xl font-semibold tracking-[-.035em] md:text-6xl">El catálogo también puede convertirse en un motor de contenido.</h2><p className="mt-6 leading-7 text-slate-300">LUNA puede conectar información de productos, campañas y clientes con herramientas de marketing asistidas por IA para acelerar la producción comercial y mantener una operación medible.</p></div>
     <div className="grid gap-4 sm:grid-cols-2">{[['Marketing IA','Campañas, promociones, segmentación, calendario y asistencia para contenido.'],['Video Marketing AI','Creación asistida de piezas y variantes de video a partir de productos y campañas.'],['Omnicanalidad','Conectar progresivamente web, atención y canales comerciales.'],['IA visual','Evolución hacia experiencias que ayuden a visualizar productos en ambientes.']].map(([t,d])=><div key={t} className="rounded-2xl border border-white/10 bg-white/[.06] p-6"><h3 className="font-semibold">{t}</h3><p className="mt-3 text-sm leading-6 text-slate-300">{d}</p></div>)}</div>
    </div><p className="mt-8 text-xs leading-5 text-slate-400">Las capacidades avanzadas se validan durante el diagnóstico. Las funciones en desarrollo se incorporan únicamente cuando estén listas para el alcance contratado.</p>
   </div></section>

   <section className="px-5 py-20 md:px-8 md:py-28"><div className="mx-auto max-w-7xl">
    <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-700">Tecnología aplicada en retail</p><div className="mt-5 grid gap-10 lg:grid-cols-2 lg:items-end">
     <h2 className="font-[var(--font-proposal-display)] text-4xl font-semibold tracking-[-.035em] md:text-6xl">LUNA parte de experiencia construida sobre una operación real.</h2>
     <div className="space-y-4 leading-7 text-slate-600"><p><strong className="text-slate-950">CarpiHogar</strong>, plataforma insignia de nuestro ecosistema, funciona como referencia tecnológica de cómo comercio, catálogo, operación e inteligencia artificial pueden convivir en una misma experiencia.</p><p>Para Big Home no proponemos copiar CarpiHogar: proponemos utilizar esa base de conocimiento para diseñar una implementación LUNA ajustada a sus procesos, escala y necesidades.</p></div>
    </div>
    <div className="mt-12 grid gap-4 md:grid-cols-3">{['Arquitectura modular y adaptable','IA integrada al flujo empresarial','Evolución por fases sin frenar la operación'].map(x=><div key={x} className="rounded-2xl border border-slate-200 p-6 font-semibold">{x}</div>)}</div>
   </div></section>

   <section className="bg-slate-50 px-5 py-20 md:px-8 md:py-28"><div className="mx-auto max-w-7xl">
    <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-700">Ruta propuesta</p><h2 className="mt-5 max-w-4xl font-[var(--font-proposal-display)] text-4xl font-semibold tracking-[-.035em] md:text-6xl">Diagnosticar. Integrar. Operar. Escalar.</h2>
    <div className="mt-14 divide-y divide-slate-200 border-y border-slate-200">{roadmap.map(([n,t,d])=><div key={n} className="grid gap-4 py-7 md:grid-cols-[90px_280px_1fr]"><div className="text-sm font-bold text-cyan-700">{n}</div><h3 className="font-[var(--font-proposal-display)] text-xl font-semibold">{t}</h3><p className="leading-7 text-slate-600">{d}</p></div>)}</div>
    <p className="mt-5 text-xs leading-5 text-slate-500">Alcance, migración, integraciones, usuarios, sucursales, cronograma y condiciones comerciales se definen con Big Home después del diagnóstico inicial.</p>
   </div></section>

   <section id="reunion" className="px-5 py-20 md:px-8 md:py-28"><div className="mx-auto max-w-5xl rounded-[36px] bg-[linear-gradient(135deg,#07111f,#0f2537)] px-7 py-14 text-center text-white md:px-14 md:py-20">
    <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-400">Siguiente paso</p><h2 className="mx-auto mt-5 max-w-3xl font-[var(--font-proposal-display)] text-4xl font-semibold tracking-[-.035em] md:text-6xl">Conversemos sobre la operación que Big Home quiere construir.</h2>
    <p className="mx-auto mt-6 max-w-2xl leading-7 text-slate-300">Si esta visión encaja con sus objetivos, coordinemos una videollamada para conocer su operación actual y definir cómo LUNA puede adaptarse a Big Home.</p>
    <div className="mt-9 flex flex-wrap justify-center gap-3"><a href="#reservar" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950">Agendar videollamada</a><a href="https://wa.me/584222640371?text=Hola%2C%20estoy%20interesado%20en%20la%20propuesta%20LUNA%20para%20Big%20Home.%20Me%20gustaria%20coordinar%20una%20reunion." target="_blank" rel="noreferrer" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950">Hablar por WhatsApp</a></div>
   </div>
   <div id="reservar" className="mx-auto mt-12 max-w-3xl scroll-mt-24"><BookingWidget source="big-home-luna" /></div>
   <p className="mx-auto mt-8 max-w-5xl text-center text-[11px] uppercase tracking-[.16em] text-slate-400">Propuesta privada · Preparada por Trends172Tech para Big Home</p>
   </section>
  </main>
  <a href="https://wa.me/584222640371?text=Hola%2C%20estoy%20interesado%20en%20la%20propuesta%20LUNA%20para%20Big%20Home.%20Me%20gustaria%20coordinar%20una%20reunion." target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-50 rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-xl">WhatsApp</a>
 </div>
}