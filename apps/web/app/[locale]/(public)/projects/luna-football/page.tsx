import Link from 'next/link';
import { IBM_Plex_Sans, Space_Grotesk } from 'next/font/google';
import { buildLocalizedMetadata } from '@/lib/seo';

const display = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-display' });
const body = IBM_Plex_Sans({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-body' });

type PageParams = { locale: string };

const modules = [
  'Inscripción y postulación de jugadores',
  'Pagos, solvencia y recibos',
  'Categorías, equipos y entrenadores',
  'Torneos, partidos y estadísticas',
  'Entrenamientos y planificación deportiva',
  'Uniformidad, inventario y tienda'
];

const plans = [
  {
    name: 'Academia Pro',
    range: 'Más de 500 jugadores',
    setup: '$5',
    monthly: '$1',
    note: 'Para escuelas grandes que distribuyen la implementación con una cuota especial inicial por jugador.'
  },
  {
    name: 'Escuela Growth',
    range: '250 a 500 jugadores',
    setup: '$6',
    monthly: '$1',
    note: 'Para academias en crecimiento que necesitan ordenar pagos, jugadores, categorías y comunicación oficial.'
  },
  {
    name: 'Club Starter',
    range: 'Menos de 250 jugadores',
    setup: '$8',
    monthly: '$1',
    note: 'Ideal para iniciar la digitalización completa sin depender de hojas de cálculo y grupos dispersos.'
  }
];

export async function generateMetadata({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;

  return buildLocalizedMetadata({
    locale,
    pathname: 'projects/luna-football',
    title: {
      es: 'LUNA Football | Demo personalizada para escuelas y clubes',
      en: 'LUNA Football | Personalized demo for football academies and clubs'
    },
    description: {
      es: 'Crea una demo personalizada de LUNA Football con nombre, logo, colores, jugadores, pagos, torneos y dashboard operativo ficticio.',
      en: 'Create a personalized LUNA Football demo with name, logo, colors, players, payments, tournaments, and a fictional operating dashboard.'
    }
  });
}

export default async function LunaFootballLanding({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  const base = `/${locale}`;
  const demoHref = `${base}/projects/luna-football/demo`;

  return (
    <main className={`${display.variable} ${body.variable} font-[var(--font-body)] text-slate-950`}>
      <section className="relative overflow-hidden border-y border-black/8 bg-[linear-gradient(180deg,#f6fbfb_0%,#ffffff_36%,#f7fafc_100%)] px-6 py-12 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.08)_1px,transparent_1px)] bg-[size:56px_56px]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1760px] gap-10 xl:grid-cols-[0.95fr_1.05fr] xl:items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-teal-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-teal-400" aria-hidden="true" />
              LUNA Football
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-[var(--font-display)] font-semibold leading-[1.02] tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-6xl">
                Crea una demo visual de tu escuela de fútbol en minutos.
              </h1>
              <p className="max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
                LUNA Football digitaliza inscripciones, jugadores, representantes, pagos, torneos, entrenamientos y operación administrativa. Cada escuela puede probar una demo ficticia con su nombre, logo, colores, roles y cantidad de jugadores.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={demoHref} className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(15,23,42,0.65)] transition hover:-translate-y-0.5 hover:bg-slate-800">
                Crear mi demo personalizada →
              </Link>
              <Link href="#planes" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-700">
                Ver planes por jugador
              </Link>
            </div>
            <div className="grid gap-3 pt-3 text-sm text-slate-600 sm:grid-cols-3">
              {['Demo con identidad propia', 'Datos ficticios seguros', 'Roles por permisos reales'].map((item) => (
                <div key={item} className="rounded-2xl border border-black/8 bg-white/75 px-4 py-3 shadow-sm">
                  <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-teal-400" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[38px] border border-black/8 bg-white/88 p-3 shadow-[0_48px_120px_-70px_rgba(15,23,42,0.55)] sm:p-5">
            <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-slate-950 text-white">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-teal-300">Demo preview</p>
                  <p className="mt-1 text-sm text-slate-300">Academia personalizada</p>
                </div>
                <div className="flex gap-1.5"><span className="h-3 w-3 rounded-full bg-teal-300" /><span className="h-3 w-3 rounded-full bg-orange-300" /><span className="h-3 w-3 rounded-full bg-white/35" /></div>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-3xl bg-white p-5 text-slate-950">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-lg font-bold text-teal-700">FC</div>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Tu escuela</p>
                  <h2 className="mt-2 text-2xl font-[var(--font-display)] font-semibold tracking-[-0.04em]">Fútbol Club Demo</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">Inscripciones, pagos, torneos, entrenamientos y roles conectados en una sola plataforma.</p>
                  <div className="mt-5 rounded-full bg-slate-950 px-4 py-2 text-center text-sm font-semibold text-white">Entrar al sistema demo</div>
                </div>
                <div className="grid gap-3">
                  {[
                    ['Jugadores activos', '520'], ['Solvencia estimada', '86%'], ['Categorías', '8'], ['Mensualidad demo', '$520']
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/8 p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-2xl font-semibold text-white">{value}</p></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-14 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto grid max-w-[1760px] gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">Módulos principales</p>
            <h2 className="text-3xl font-[var(--font-display)] font-semibold tracking-[-0.04em] sm:text-4xl">Todo centrado en la operación deportiva.</h2>
            <p className="text-slate-600">Sin mezclarlo con LUNA empresarial general. Esta página se concentra únicamente en escuelas, academias y clubes de fútbol.</p>
            <Link href={demoHref} className="inline-flex rounded-full bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-teal-600">Probar demo ahora →</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {modules.map((module) => <div key={module} className="rounded-2xl border border-black/8 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm"><span className="mr-2 inline-flex h-2 w-2 rounded-full bg-orange-400" aria-hidden="true" />{module}</div>)}
          </div>
        </div>
      </section>

      <section id="planes" className="border-y border-black/8 bg-slate-50 px-6 py-16 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px] space-y-9">
          <div className="max-w-4xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600">Planes de implementación</p>
            <h2 className="text-3xl font-[var(--font-display)] font-semibold tracking-[-0.04em] sm:text-4xl">Precio simple por jugador.</h2>
            <p className="text-slate-600">La implementación incluye el primer mes. La mensualidad operativa empieza desde el segundo mes y es de $1 por jugador activo en el sistema.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <article key={plan.name} className="rounded-[30px] border border-black/8 bg-white p-6 shadow-[0_34px_90px_-68px_rgba(15,23,42,0.45)]">
                <p className="text-sm font-semibold text-teal-600">{plan.range}</p>
                <h3 className="mt-3 text-2xl font-[var(--font-display)] font-semibold tracking-[-0.04em]">{plan.name}</h3>
                <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white"><p className="text-xs uppercase tracking-[0.18em] text-slate-400">Implementación + primer mes</p><div className="mt-2 flex items-end gap-2"><span className="text-5xl font-semibold tracking-[-0.06em]">{plan.setup}</span><span className="pb-2 text-sm text-slate-300">por jugador</span></div></div>
                <div className="mt-4 rounded-3xl border border-teal-100 bg-teal-50 p-5 text-teal-950"><p className="text-xs uppercase tracking-[0.18em] text-teal-700">Mensualidad desde el segundo mes</p><div className="mt-2 flex items-end gap-2"><span className="text-4xl font-semibold tracking-[-0.05em]">{plan.monthly}</span><span className="pb-1 text-sm text-teal-700">por jugador / mes</span></div></div>
                <p className="mt-5 text-sm leading-relaxed text-slate-600">{plan.note}</p>
              </article>
            ))}
          </div>
          <div className="rounded-[30px] border border-orange-100 bg-orange-50 p-6 text-sm leading-relaxed text-orange-950"><strong>Nota comercial:</strong> los jugadores exonerados o por convenio también forman parte del cálculo operativo del sistema. La forma de distribuir ese costo queda como acuerdo interno de cada escuela.</div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto grid max-w-[1760px] gap-5 overflow-hidden rounded-[36px] bg-slate-950 p-7 text-white shadow-[0_40px_120px_-80px_rgba(15,23,42,0.8)] lg:grid-cols-[1fr_auto] lg:items-center sm:p-10">
          <div className="space-y-3"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">Siguiente paso</p><h2 className="text-3xl font-[var(--font-display)] font-semibold tracking-[-0.04em] sm:text-4xl">Muestra la demo, no solo una presentación.</h2><p className="max-w-3xl text-sm leading-relaxed text-slate-300">La publicidad de Instagram debe llevar directamente al configurador para que el cliente visualice su propia escuela con LUNA Football.</p></div>
          <Link href={demoHref} className="inline-flex justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-200">Crear demo personalizada</Link>
        </div>
      </section>
    </main>
  );
}
