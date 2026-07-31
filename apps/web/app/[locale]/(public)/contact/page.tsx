import Link from 'next/link';
import { buildLocalizedMetadata } from '@/lib/seo';

const EMAIL = 'trends172tech@gmail.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    pathname: 'contact',
    title: { es: 'Contacto corporativo', en: 'Corporate contact' },
    description: { es: 'Contacta a Trends172Tech LLC para soporte, privacidad, seguridad o alianzas.', en: 'Contact Trends172Tech LLC for support, privacy, security, or partnerships.' },
  });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isEs = locale.startsWith('es');
  const channels = [
    { title: isEs ? 'Ventas y proyectos' : 'Sales and projects', body: isEs ? 'Demos, alcance, implementaciones y propuestas.' : 'Demos, scope, implementations, and proposals.', subject: isEs ? 'Ventas y proyectos' : 'Sales and projects' },
    { title: isEs ? 'Soporte y cuentas' : 'Support and accounts', body: isEs ? 'Acceso, funcionamiento y asistencia para clientes.' : 'Access, operation, and customer assistance.', subject: isEs ? 'Soporte' : 'Support' },
    { title: isEs ? 'Privacidad y seguridad' : 'Privacy and security', body: isEs ? 'Solicitudes de datos o reporte responsable de vulnerabilidades.' : 'Data requests or responsible vulnerability reports.', subject: isEs ? 'Privacidad o seguridad' : 'Privacy or security' },
    { title: isEs ? 'Alianzas' : 'Partnerships', body: isEs ? 'Colaboraciones tecnológicas y oportunidades comerciales.' : 'Technology collaborations and commercial opportunities.', subject: isEs ? 'Alianzas' : 'Partnerships' },
  ];

  return (
    <div className="pb-16">
      <section className="premium-spotlight relative overflow-hidden border-y border-black/8 bg-[linear-gradient(180deg,#eefbfb_0%,#ffffff_72%)] px-6 py-14 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="premium-grid absolute inset-0 opacity-45" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-5xl">
          <div className="inline-flex rounded-full border border-cyan-500/20 bg-white/88 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
            Trends172Tech LLC
          </div>
          <h1 className="mt-5 text-4xl font-[var(--font-display)] font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
            {isEs ? 'Hablemos' : 'Let’s talk'}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {isEs ? 'Empresa de software, inteligencia artificial y automatización constituida en Florida, Estados Unidos.' : 'A software, artificial intelligence, and automation company formed in Florida, United States.'}
          </p>
          <p className="mt-3 text-sm font-medium text-slate-700">Florida document number: L26000329377</p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-5 px-6 pt-10 sm:grid-cols-2 sm:px-8">
        {channels.map((channel) => (
          <article key={channel.title} className="rounded-[28px] border border-black/8 bg-white/92 p-6 shadow-[0_28px_80px_-64px_rgba(15,23,42,0.35)] sm:p-8">
            <h2 className="text-xl font-[var(--font-display)] font-semibold text-slate-950">{channel.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{channel.body}</p>
            <Link href={`mailto:${EMAIL}?subject=${encodeURIComponent(channel.subject)}`} className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2">
              {EMAIL}
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
