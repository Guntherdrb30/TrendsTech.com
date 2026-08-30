import Link from 'next/link';
import { buildLocalizedMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    pathname: 'que-ofrecemos',
    title: { es: 'Desarrollo de software e inteligencia artificial para empresas', en: 'Enterprise software and artificial intelligence development' },
    description: {
      es: 'Software empresarial, automatización, integraciones e inteligencia artificial adaptada a procesos reales.',
      en: 'Enterprise software, automation, integrations and artificial intelligence adapted to real business processes.'
    }
  });
}

export default async function WhatWeOfferPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const es = locale.startsWith('es');
  const base = `/${locale}`;
  const services = es ? [
    ['Desarrollo de software empresarial', 'Plataformas, portales, paneles y aplicaciones construidos alrededor de los procesos, roles y exigencias de cada organización.'],
    ['Inteligencia artificial aplicada', 'Integramos IA dentro del software para analizar información, asistir decisiones y ejecutar acciones controladas sobre procesos reales.'],
    ['Automatización de flujos de trabajo', 'Conectamos solicitudes, validaciones, responsables, aprobaciones, documentos, alertas y seguimiento de principio a fin.'],
    ['Integraciones y arquitectura de datos', 'Conectamos sistemas existentes, APIs, bases de datos, canales empresariales y servicios externos sin imponer reemplazos innecesarios.'],
    ['IA local, privada e híbrida', 'Diseñamos soluciones que combinan nube e infraestructura local según las necesidades de privacidad, control, continuidad y rendimiento.'],
    ['Plataformas modulares y white-label', 'Partimos de núcleos tecnológicos como LUNA y los adaptamos a la identidad, industria y operación de cada empresa.']
  ] : [
    ['Enterprise software development', 'Platforms, portals, dashboards and applications built around each organisation’s processes, roles and requirements.'],
    ['Applied artificial intelligence', 'We embed AI into software to analyse information, support decisions and perform controlled actions across real processes.'],
    ['Workflow automation', 'We connect requests, validations, owners, approvals, documents, alerts and follow-up from end to end.'],
    ['Integrations and data architecture', 'We connect existing systems, APIs, databases, enterprise channels and external services without forcing unnecessary replacement.'],
    ['Local, private and hybrid AI', 'We design solutions combining cloud and local infrastructure according to privacy, control, continuity and performance needs.'],
    ['Modular and white-label platforms', 'We use technology cores such as LUNA and adapt them to each company’s identity, industry and operation.']
  ];

  return (
    <div className="space-y-16 pb-16">
      <section className="relative overflow-hidden border-y border-black/8 bg-white px-6 py-16 sm:px-8 lg:px-12 xl:px-16">
        <div className="premium-grid absolute inset-0 opacity-45" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1600px]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">{es ? 'QUÉ OFRECEMOS' : 'WHAT WE OFFER'}</p>
          <h1 className="mt-5 max-w-5xl text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">
            {es ? 'Software e inteligencia artificial diseñados para la operación real.' : 'Software and artificial intelligence designed for real operations.'}
          </h1>
          <p className="mt-6 max-w-4xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            {es
              ? 'Desde Venezuela desarrollamos tecnología empresarial de calidad y acompañamos a cada organización en la implementación de inteligencia artificial adaptada a sus procesos, datos, permisos y objetivos.'
              : 'From Venezuela, we develop quality enterprise technology and support each organisation in implementing artificial intelligence adapted to its processes, data, permissions and objectives.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`${base}/contact`} className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white">{es ? 'Conversemos sobre su operación' : 'Let’s discuss your operation'}</Link>
            <Link href={`${base}/projects`} className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900">{es ? 'Ver implementaciones' : 'View implementations'}</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12 xl:px-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{es ? 'CAPACIDADES' : 'CAPABILITIES'}</p>
        <h2 className="mt-3 mb-8 max-w-4xl text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">{es ? 'Una empresa tecnológica para acompañar todo el proceso.' : 'A technology company supporting the entire process.'}</h2>
        <div className="grid gap-px overflow-hidden rounded-[32px] border border-slate-200 bg-slate-200 md:grid-cols-2 lg:grid-cols-3">
          {services.map(([title, body], index) => (
            <article key={title} className="min-h-64 bg-white p-7">
              <span className="text-sm font-semibold text-emerald-700">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-8 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{title}</h3>
              <p className="mt-4 leading-relaxed text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid gap-8 rounded-[36px] bg-slate-950 p-8 text-white lg:grid-cols-[0.9fr_1.1fr] lg:p-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">{es ? 'IA QUE EJECUTA' : 'AI THAT EXECUTES'}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">{es ? 'Más que responder: comprender, decidir y actuar con control.' : 'Beyond answering: understand, decide and act with control.'}</h2>
          </div>
          <div className="space-y-5 text-base leading-relaxed text-slate-300 sm:text-lg">
            <p>{es ? 'Desarrollamos capacidades transaccionales que pueden consultar información autorizada, crear o actualizar registros, activar flujos y solicitar aprobaciones.' : 'We develop transactional capabilities that can query authorised information, create or update records, trigger workflows and request approvals.'}</p>
            <p>{es ? 'Cada implementación se diseña con permisos, reglas, límites de acción, aprobación humana cuando corresponde y trazabilidad completa.' : 'Every implementation is designed with permissions, rules, action limits, human approval where required and full traceability.'}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid gap-8 border-t border-slate-200 pt-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-700">{es ? 'NUESTRA VISIÓN' : 'OUR VISION'}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">{es ? 'El futuro de la IA empresarial será híbrido.' : 'The future of enterprise AI will be hybrid.'}</h2>
          </div>
          <p className="text-lg leading-relaxed text-slate-600">{es ? 'Nube cuando la empresa necesita escalar. IA local cuando la privacidad, el control de los datos y la continuidad operativa son prioritarios. Diseñamos la arquitectura adecuada para cada realidad.' : 'Cloud when the company needs to scale. Local AI when privacy, data control and operational continuity are priorities. We design the right architecture for each reality.'}</p>
        </div>
      </section>
    </div>
  );
}
