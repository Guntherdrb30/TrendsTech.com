import Link from 'next/link';
import { buildLocalizedMetadata } from '@/lib/seo';

const EMAIL = 'trends172tech@gmail.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    pathname: 'aliados',
    title: { es: 'Alianzas y despliegue empresarial de IA', en: 'Enterprise AI deployment and partnerships' },
    description: {
      es: 'Transforme procesos críticos con un equipo FDE, inteligencia artificial aplicada, automatización y un sistema de trabajo ejecutivo con trazabilidad.',
      en: 'Transform critical workflows with an FDE team, applied AI, automation, and an executive delivery system with full traceability.'
    }
  });
}

export default async function PartnersLandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const es = locale.startsWith('es');
  const base = `/${locale}`;
  const enterpriseMail = `mailto:${EMAIL}?subject=${encodeURIComponent(es ? 'Diagnóstico ejecutivo de IA aplicada' : 'Executive applied AI assessment')}`;
  const partnerMail = `mailto:${EMAIL}?subject=${encodeURIComponent(es ? 'Quiero ser aliado de Trends172Tech' : 'I want to become a Trends172Tech partner')}`;

  const phases = es ? [
    ['01', 'Descubrir', 'Entramos al proceso real, entrevistamos a los responsables y separamos hechos, supuestos, riesgos y preguntas abiertas.'],
    ['02', 'Priorizar', 'Elegimos oportunidades por impacto, viabilidad, calidad de datos, riesgo y capacidad de adopción.'],
    ['03', 'Desplegar', 'Diseñamos, integramos y llevamos a producción software, automatización y agentes con controles definidos.'],
    ['04', 'Escalar', 'Medimos resultados, fortalecemos gobierno y convertimos el primer caso en una capacidad repetible para la empresa.']
  ] : [
    ['01', 'Discover', 'We enter the real workflow, interview owners, and separate facts, assumptions, risks, and open questions.'],
    ['02', 'Prioritise', 'We select opportunities by impact, feasibility, data quality, risk, and adoption readiness.'],
    ['03', 'Deploy', 'We design, integrate, and ship software, automation, and governed agents into production.'],
    ['04', 'Scale', 'We measure outcomes, strengthen governance, and turn the first use case into a repeatable enterprise capability.']
  ];

  const capabilities = es ? [
    ['Diagnóstico empresarial', 'Mapeamos procesos, dolores, responsables, información, sistemas, controles y oportunidades antes de recomendar tecnología.'],
    ['Ingeniería FDE', 'Un equipo técnico trabaja junto al liderazgo y la operación, desde el descubrimiento hasta la adopción en producción.'],
    ['IA aplicada al proceso', 'Agentes, automatizaciones y copilotos conectados a reglas, datos, permisos y decisiones reales de la organización.'],
    ['Arquitectura híbrida', 'Combinamos nube, infraestructura privada e IA local según seguridad, continuidad, rendimiento y soberanía de datos.'],
    ['Gobierno y trazabilidad', 'Definimos aprobaciones humanas, límites de acción, evidencias, evaluación, monitoreo y rutas de escalamiento.'],
    ['Transferencia de capacidad', 'Documentamos el sistema, acompañamos a los equipos y dejamos una base que la empresa pueda operar y ampliar.']
  ] : [
    ['Business discovery', 'We map workflows, pain points, owners, information, systems, controls, and opportunities before recommending technology.'],
    ['FDE engineering', 'A technical team works alongside leadership and operations, from discovery through production adoption.'],
    ['Workflow-native AI', 'Agents, automation, and copilots connected to the organisation’s real rules, data, permissions, and decisions.'],
    ['Hybrid architecture', 'We combine cloud, private infrastructure, and local AI according to security, continuity, performance, and data sovereignty.'],
    ['Governance and traceability', 'We define human approvals, action boundaries, evidence, evaluation, monitoring, and escalation paths.'],
    ['Capability transfer', 'We document the system, support teams, and leave a foundation the organisation can operate and expand.']
  ];

  return <div className="overflow-hidden pb-20">
    <section className="relative border-b border-black/8 bg-slate-950 px-6 py-16 text-white sm:px-8 lg:px-12 lg:py-24 xl:px-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(16,185,129,.2),transparent_32%),radial-gradient(circle_at_15%_85%,rgba(59,130,246,.16),transparent_30%)]" aria-hidden="true"/>
      <div className="premium-grid absolute inset-0 opacity-10" aria-hidden="true"/>
      <div className="relative mx-auto grid max-w-[1600px] gap-12 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">{es ? 'DESPLIEGUE EMPRESARIAL DE IA · ALIANZAS ESTRATÉGICAS' : 'ENTERPRISE AI DEPLOYMENT · STRATEGIC PARTNERSHIPS'}</p>
          <h1 className="mt-6 max-w-5xl text-5xl font-semibold leading-[.98] tracking-[-0.06em] sm:text-6xl lg:text-7xl">{es ? 'La IA no transforma una empresa hasta que transforma su operación.' : 'AI does not transform an enterprise until it transforms its operations.'}</h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">{es ? 'Trends172Tech trabaja junto a líderes y equipos operativos para convertir procesos complejos en sistemas inteligentes, automatizados, medibles y listos para producción.' : 'Trends172Tech works alongside leaders and operating teams to turn complex workflows into intelligent, automated, measurable, production-ready systems.'}</p>
          <div className="mt-9 flex flex-wrap gap-3"><Link href={enterpriseMail} className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-100">{es ? 'Solicitar diagnóstico ejecutivo' : 'Request an executive assessment'}</Link><Link href="#alianza" className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">{es ? 'Quiero ser aliado' : 'Become a partner'}</Link></div>
        </div>
        <div className="rounded-[32px] border border-white/12 bg-white/[.06] p-5 shadow-2xl backdrop-blur sm:p-7">
          <div className="flex items-center justify-between border-b border-white/10 pb-5"><div><p className="text-xs uppercase tracking-[.2em] text-slate-400">Trends172Tech</p><p className="mt-1 font-semibold">Enterprise AI Deployment System</p></div><span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">FDE</span></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">{(es ? ['Estrategia y resultados','Procesos críticos','Datos e integraciones','Personas y adopción','Seguridad y control','Medición y escala'] : ['Strategy and outcomes','Critical workflows','Data and integrations','People and adoption','Security and control','Measurement and scale']).map((item,index)=><div key={item} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"><span className="text-xs font-semibold text-emerald-300">0{index+1}</span><p className="mt-3 text-sm font-medium">{item}</p></div>)}</div>
          <p className="mt-5 border-t border-white/10 pt-5 text-sm leading-6 text-slate-400">{es ? 'Un expediente vivo por iniciativa: evidencia, decisiones, riesgos, documentos, responsables y próximas acciones.' : 'A living record for every initiative: evidence, decisions, risks, documents, owners, and next actions.'}</p>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-[1600px] px-6 py-16 sm:px-8 lg:px-12 xl:px-16">
      <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-xs font-semibold uppercase tracking-[.22em] text-emerald-700">{es ? 'MODELO FDE' : 'FDE MODEL'}</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.05em] text-slate-950 sm:text-5xl">{es ? 'Del problema empresarial al sistema en producción.' : 'From business problem to production system.'}</h2></div><div className="space-y-5 text-lg leading-8 text-slate-600"><p>{es ? 'FDE significa Forward Deployed Engineering: especialistas que trabajan dentro del contexto del cliente, junto a quienes dirigen y ejecutan el proceso. No entregamos una demostración aislada; asumimos el recorrido completo desde el levantamiento hasta la operación.' : 'FDE means Forward Deployed Engineering: specialists working inside the customer context, alongside the people who lead and execute the workflow. We do not deliver an isolated demo; we own the journey from discovery to operations.'}</p><p>{es ? 'El objetivo no es “poner IA” en la empresa. Es conseguir impacto verificable con una arquitectura que las personas puedan adoptar, la dirección pueda gobernar y la organización pueda ampliar.' : 'The goal is not to “add AI” to the company. It is to achieve verifiable impact with an architecture people can adopt, leadership can govern, and the organisation can expand.'}</p></div></div>
      <div className="mt-12 grid gap-px overflow-hidden rounded-[32px] border bg-slate-200 md:grid-cols-2 lg:grid-cols-4">{phases.map(([number,title,body])=><article key={number} className="min-h-72 bg-white p-7"><span className="text-sm font-semibold text-emerald-700">{number}</span><h3 className="mt-10 text-2xl font-semibold tracking-[-.03em]">{title}</h3><p className="mt-4 text-sm leading-7 text-slate-600">{body}</p></article>)}</div>
    </section>

    <section className="border-y border-black/8 bg-slate-50 px-6 py-16 sm:px-8 lg:px-12 xl:px-16"><div className="mx-auto max-w-[1600px]"><p className="text-xs font-semibold uppercase tracking-[.22em] text-slate-500">{es ? 'CAPACIDAD EJECUTIVA + ENTREGA TÉCNICA' : 'EXECUTIVE CAPABILITY + TECHNICAL DELIVERY'}</p><h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-.05em] sm:text-5xl">{es ? 'Todo lo necesario para pasar de intención a ventaja operativa.' : 'Everything required to move from intent to operational advantage.'}</h2><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{capabilities.map(([title,body])=><article key={title} className="rounded-[26px] border border-black/8 bg-white p-7"><div className="h-2 w-12 rounded-full bg-emerald-500"/><h3 className="mt-6 text-xl font-semibold tracking-[-.02em]">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{body}</p></article>)}</div></div></section>

    <section className="mx-auto max-w-[1600px] px-6 py-16 sm:px-8 lg:px-12 xl:px-16"><div className="grid gap-8 rounded-[36px] bg-[linear-gradient(135deg,#ecfdf5_0%,#eff6ff_100%)] p-8 lg:grid-cols-2 lg:p-12"><div><p className="text-xs font-semibold uppercase tracking-[.22em] text-emerald-700">{es ? 'SISTEMA DE TRABAJO COMPARTIDO' : 'SHARED DELIVERY SYSTEM'}</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.05em] text-slate-950">{es ? 'Cada oportunidad conserva su propia memoria empresarial.' : 'Every opportunity keeps its own business memory.'}</h2><p className="mt-5 text-base leading-8 text-slate-600">{es ? 'Nuestro Portal de Aliados organiza investigación, levantamientos EFICI, documentos, propuestas, reuniones, pendientes y decisiones dentro de un expediente independiente por proyecto.' : 'Our Partner Portal organises research, EFICI discovery, documents, proposals, meetings, pending actions, and decisions inside an independent record for every project.'}</p></div><div className="grid gap-3 sm:grid-cols-2">{(es ? [['Hechos','Información confirmada y con fuente.'],['Supuestos','Hipótesis visibles, nunca presentadas como verdad.'],['Riesgos','Bloqueos operativos, técnicos o de adopción.'],['Próximas acciones','Responsabilidad y continuidad del proyecto.']] : [['Facts','Confirmed, sourced information.'],['Assumptions','Visible hypotheses, never presented as truth.'],['Risks','Operational, technical, or adoption blockers.'],['Next actions','Ownership and project continuity.']]).map(([title,body])=><div key={title} className="rounded-2xl border border-white/70 bg-white/80 p-5"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></div>)}</div></div></section>

    <section id="alianza" className="mx-auto max-w-[1600px] scroll-mt-24 px-6 pb-16 sm:px-8 lg:px-12 xl:px-16"><div className="grid gap-px overflow-hidden rounded-[36px] border bg-slate-200 lg:grid-cols-2"><article className="bg-white p-8 lg:p-12"><p className="text-xs font-semibold uppercase tracking-[.22em] text-blue-700">{es ? 'PARA EMPRESAS' : 'FOR ENTERPRISES'}</p><h2 className="mt-4 text-3xl font-semibold tracking-[-.04em]">{es ? 'Buscamos un proceso crítico que merezca ser transformado.' : 'We look for a critical workflow worth transforming.'}</h2><p className="mt-4 leading-7 text-slate-600">{es ? 'Ideal para organizaciones con patrocinio ejecutivo, acceso a los responsables del proceso y disposición para medir resultados reales.' : 'Designed for organisations with executive sponsorship, access to process owners, and a willingness to measure real outcomes.'}</p><Link href={enterpriseMail} className="mt-7 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white">{es ? 'Presentar un desafío empresarial' : 'Present a business challenge'}</Link></article><article className="bg-slate-950 p-8 text-white lg:p-12"><p className="text-xs font-semibold uppercase tracking-[.22em] text-emerald-300">{es ? 'PARA ALIADOS' : 'FOR PARTNERS'}</p><h2 className="mt-4 text-3xl font-semibold tracking-[-.04em]">{es ? 'Construyamos una capacidad conjunta de transformación.' : 'Let’s build a joint transformation capability.'}</h2><p className="mt-4 leading-7 text-slate-300">{es ? 'Buscamos consultoras, especialistas sectoriales, integradores y líderes comerciales que aporten confianza, contexto y acceso a oportunidades donde podamos ejecutar juntos.' : 'We seek consultancies, industry specialists, integrators, and commercial leaders who bring trust, context, and access to opportunities where we can deliver together.'}</p><Link href={partnerMail} className="mt-7 inline-flex rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950">{es ? 'Quiero ser aliado' : 'Become a partner'}</Link></article></div></section>

    <section className="mx-auto max-w-5xl px-6 text-center sm:px-8"><p className="text-xs font-semibold uppercase tracking-[.22em] text-slate-500">{es ? 'PRIMERA CONVERSACIÓN' : 'FIRST CONVERSATION'}</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.05em] text-slate-950 sm:text-5xl">{es ? 'Cuéntenos dónde la operación todavía depende de fricción, espera o trabajo manual.' : 'Tell us where operations still depend on friction, waiting, or manual work.'}</h2><p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">{es ? 'Le ayudaremos a determinar si existe un caso de transformación viable, qué información falta y cuál debería ser el siguiente paso.' : 'We will help determine whether there is a viable transformation case, what information is missing, and what the next step should be.'}</p><div className="mt-8 flex justify-center gap-3"><Link href={`${base}/contact`} className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold">{es ? 'Ver canales de contacto' : 'View contact channels'}</Link></div></section>
  </div>;
}
