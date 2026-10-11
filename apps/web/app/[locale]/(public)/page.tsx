import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { HomePremium, type HomePremiumCopy } from '@/components/home-premium';
import { buildLocalizedMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    title: {
      es: 'Trends172Tech — Ingeniería de Software e Inteligencia Artificial',
      en: 'Trends172Tech — AI Software Engineering & Enterprise Platforms',
    },
    description: {
      es: 'Trends172Tech es la creadora de LUNA, una plataforma empresarial inteligente que conecta operaciones, comercio, datos, automatización e inteligencia artificial.',
      en: 'Trends172Tech created LUNA, an intelligent business platform connecting operations, commerce, data, automation and artificial intelligence.',
    },
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const home = await getTranslations('home');

  const fontClass = `font-sans`;

  const conciergeCopy = {
    locale,
    intakeBadge: home('intakeBadge'),
    intakeTitle: home('intakeTitle'),
    intakeSubtitle: home('intakeSubtitle'),
    intakeNote: home('intakeNote'),
    chatPlaceholder: home('chatPlaceholder'),
    chatClearLabel: home('chatClearLabel'),
    chatSuggestionsTitle: home('chatSuggestionsTitle'),
    chatSuggestions: [
      { label: home('chatSuggestions.s1Label'), prompt: home('chatSuggestions.s1Prompt') },
      { label: home('chatSuggestions.s2Label'), prompt: home('chatSuggestions.s2Prompt') },
    ],
  };

  const premiumCopy = home.raw('premium') as HomePremiumCopy;

  const es = locale.startsWith('es');
  const pillars = es ? [
    ['LUNA Framework', 'Arquitectura modular y componentes reutilizables para construir soluciones empresariales y productos verticales.'],
    ['CarpiHogar: software en operación', 'Comercio, inventario, ventas, ERP, marketing asistido por IA e integraciones de comunicación en una misma plataforma.'],
    ['Engineer Studio y FDE', 'Entorno propio para organizar proyectos, propuestas y trabajo de ingeniería; desarrollo de software adaptado a cada organización.'],
    ['LUNA Football', 'Sistema utilizado por una escuela de fútbol con aproximadamente 500 jugadores; próxima implementación institucional en preparación.'],
    ['LUNA Club', 'Plataforma en desarrollo para socios, control de acceso, mensualidades y reservas de instalaciones.'],
    ['LUNA Videos AI', 'Producto en desarrollo que lleva capacidades de Marketing Studio y Motion Control hacia una plataforma especializada de video con IA.'],
  ] : [
    ['LUNA Framework', 'Reusable modular architecture and components for enterprise applications and vertical products.'],
    ['CarpiHogar: operational software', 'Commerce, inventory, sales, ERP, AI-assisted marketing and communication integrations in one platform.'],
    ['Engineer Studio and FDE', 'Our own environment for managing projects, proposals and engineering workflows, supporting custom software delivery.'],
    ['LUNA Football', 'Software used at a football school serving approximately 500 players; a second institutional deployment is being prepared.'],
    ['LUNA Club', 'In-development platform for membership, access control, dues and facility reservations.'],
    ['LUNA Videos AI', 'In-development product adapting Marketing Studio and Motion Control capabilities into a dedicated AI video platform.'],
  ];

  return <>
    <HomePremium fontClass={fontClass} conciergeCopy={conciergeCopy} copy={premiumCopy} />
    <section className="bg-[#e9fbf8] px-6 py-16 text-slate-950 sm:px-8"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"><div><p className="text-xs font-semibold uppercase tracking-widest text-teal-700">{es ? 'Ingeniería de software a tu medida' : 'Custom software engineering'}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{es ? '¿Tienes una idea para un nuevo sistema?' : 'Have an idea for a new software product?'}</h2><p className="mt-3 max-w-2xl text-slate-600">{es ? 'Conversaremos contigo para entenderla, organizar tus requerimientos y contactar a nuestro equipo.' : 'Our guided advisor helps organize your requirements for our engineering team.'}</p></div><Link href={`/${locale}/cuentanos-tu-idea`} className="shrink-0 rounded-full bg-slate-950 px-7 py-4 text-sm font-semibold text-white hover:bg-teal-700">{es ? 'Cuéntanos tu idea →' : 'Tell us your idea →'}</Link></div></section>
    <section className="mx-auto max-w-[1600px] px-6 py-16 sm:px-8 lg:px-12 xl:px-16" aria-labelledby="trends-engineering">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{es ? 'INGENIERÍA CON IMPLEMENTACIONES REALES' : 'ENGINEERING BACKED BY REAL IMPLEMENTATIONS'}</p>
      <h2 id="trends-engineering" className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{es ? 'Trends172Tech desarrolla software, frameworks y plataformas de IA para empresas.' : 'Trends172Tech builds software, frameworks and AI platforms for businesses.'}</h2>
      <p className="mt-5 max-w-4xl text-lg leading-relaxed text-slate-600">{es ? 'Nuestra experiencia combina sistemas empresariales, productos en operación y un entorno interno de ingeniería para desarrollar nuevas soluciones. LUNA es nuestra estrategia de reutilización tecnológica; CarpiHogar es una implementación de referencia.' : 'Our experience combines enterprise systems, operational products and an internal engineering environment for new solutions. LUNA is our reusable technology strategy; CarpiHogar is a flagship implementation.'}</p>
      <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{pillars.map(([name, description]) => <article key={name} className="rounded-2xl border border-slate-200 bg-white p-6"><h3 className="text-xl font-semibold text-slate-950">{name}</h3><p className="mt-3 leading-relaxed text-slate-600">{description}</p></article>)}</div>
      <p className="mt-5 text-sm text-slate-500">{es ? 'Las funcionalidades y el estado de implementación varían según el producto.' : 'Feature availability and deployment stage vary by product.'}</p>
    </section>
  </>;
}
