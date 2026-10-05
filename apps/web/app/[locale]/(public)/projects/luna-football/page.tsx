import Image from 'next/image';
import { buildLocalizedMetadata } from '@/lib/seo';

type PageParams = { locale: string };

const capabilityCards = [
  {
    eyebrow: 'Gestión integral',
    title: 'Un solo sistema para operar el club',
    text: 'Centraliza jugadores, representantes, categorías, equipos, entrenadores, inscripciones, autorizaciones, comunicaciones y configuración por roles.',
    items: ['Ficha completa del jugador', 'Representantes y autorizaciones', 'Categorías, equipos y cuerpo técnico', 'Usuarios y permisos por rol']
  },
  {
    eyebrow: 'Administración y finanzas',
    title: 'Control operativo y financiero',
    text: 'Ordena mensualidades, reportes de pago, conciliación, historial, solvencia, gastos, nómina y empleados para reducir procesos dispersos.',
    items: ['Mensualidades y estado de solvencia', 'Reporte y conciliación de pagos', 'Historial financiero', 'Gastos, nómina y empleados']
  },
  {
    eyebrow: 'Competencia',
    title: 'La actividad deportiva también queda registrada',
    text: 'Gestiona torneos, partidos, alineaciones, eventos y estadísticas para convertir la operación deportiva diaria en información consultable.',
    items: ['Torneos y partidos', 'Alineaciones y eventos', 'Tablas y goleadores calculados', 'Estadísticas de jugadores y categorías']
  },
  {
    eyebrow: 'Entrenamiento',
    title: 'Planificación, asistencia y equipamiento',
    text: 'Los entrenadores trabajan por equipo con sesiones, asistencia, planes, microciclos y solicitudes de equipamiento desde su propio panel.',
    items: ['Sesiones por equipo', 'Control de asistencia', 'Planes y microciclos', 'Inventario y solicitudes de equipamiento']
  }
];

const aiCapabilities = [
  {
    title: 'Sesiones con IA',
    text: 'El entrenador describe el objetivo y LUNA propone una sesión estructurada, apropiada para la categoría y limitada operativamente a un máximo de 90 minutos.'
  },
  {
    title: 'Microciclos semanales',
    text: 'Genera varios días de entrenamiento con progresión coherente, objetivos diferenciados y bloques listos para revisar y adaptar.'
  },
  {
    title: 'Adaptación desde Excel',
    text: 'Los planes existentes pueden importarse y la IA los reorganiza en un formato moderno de bloques, conservando la intención metodológica original.'
  },
  {
    title: 'LUNA como asistente de reportes',
    text: 'La capa de IA consulta datos reales para apoyar reportes de finanzas, cobranza, estadísticas de jugadores, rankings, resultados por categoría y noticias de partidos.'
  }
];

const roles = [
  ['Administrador', 'Control global de la operación.'],
  ['Administradora / Supervisor', 'Gestión operativa con permisos delimitados.'],
  ['Entrenador', 'Equipos, jugadores, torneos, partidos, entrenamientos y equipamiento.'],
  ['Entrenador de porteros', 'Jugadores y sesiones específicas de porteros.'],
  ['Delegado', 'Jugadores y alineaciones.'],
  ['Representante', 'Jugadores, pagos, uniformes, partidos y autorizaciones.'],
  ['Invitado', 'Recorrido del sistema en modo solo lectura, sin modificar la información.']
];

const realImplementation = [
  'Inscripción guiada de jugadores y representantes',
  'Pagos, conciliación y solvencia',
  'Torneos, resultados y estadísticas',
  'Entrenamientos, asistencia y planes',
  'Paneles diferenciados por rol',
  'Acceso invitado de solo lectura'
];

export async function generateMetadata({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;

  return buildLocalizedMetadata({
    locale,
    pathname: 'projects/luna-football',
    title: {
      es: 'LUNA Football | Gestión integral e inteligencia deportiva',
      en: 'LUNA Football | Club operations and sports intelligence'
    },
    description: {
      es: 'LUNA Football centraliza la gestión administrativa y deportiva de escuelas, academias y clubes de fútbol: jugadores, pagos, torneos, entrenamientos, estadísticas, roles e inteligencia artificial.',
      en: 'LUNA Football centralizes administrative and sporting operations for football schools, academies and clubs: players, payments, tournaments, training, statistics, roles and AI.'
    }
  });
}

export default async function LunaFootballLanding({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;

  return (
    <main className="font-sans text-slate-950">
      <section className="relative overflow-hidden border-y border-black/8 bg-[linear-gradient(180deg,#f3fbfa_0%,#ffffff_42%,#f8fafc_100%)] px-6 py-14 sm:px-8 lg:px-12 lg:py-20 xl:px-16 2xl:px-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.07)_1px,transparent_1px)] bg-[size:58px_58px]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1760px] gap-10 xl:grid-cols-[0.92fr_1.08fr] xl:items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-teal-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-teal-400" aria-hidden="true" />
              LUNA Football · Plataforma IA-Nativa
            </div>

            <div className="space-y-5">
              <h1 className="max-w-5xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-6xl xl:text-7xl">
                Control total del club. Inteligencia aplicada al fútbol.
              </h1>
              <p className="max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
                LUNA Football conecta la administración y la operación deportiva de escuelas, academias y clubes en una sola plataforma: jugadores, representantes, pagos, torneos, estadísticas, entrenamientos, asistencia, equipamiento y roles de trabajo.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="https://cdebarinasef.com/login"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(15,23,42,0.65)] transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Explorar implementación real →
              </a>
              <a
                href="#capacidades"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/85 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-700"
              >
                Ver todo lo que controla
              </a>
            </div>

            <div className="grid gap-3 pt-2 text-sm text-slate-700 sm:grid-cols-3">
              {[
                ['Operación centralizada', 'Administración + deporte'],
                ['IA deportiva', 'Sesiones y microciclos'],
                ['Acceso invitado', 'Solo lectura']
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-black/8 bg-white/80 px-4 py-4 shadow-sm">
                  <p className="font-semibold text-slate-950">{title}</p>
                  <p className="mt-1 text-xs text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['/cases/luna-football/luna-football-operations.svg', 'Operación integral de LUNA Football'],
              ['/cases/luna-football/luna-football-training.svg', 'Entrenamientos e inteligencia deportiva'],
              ['/cases/luna-football/luna-football-player-flow.svg', 'Flujo de jugadores y representantes'],
              ['/cases/luna-football/luna-football-payments.svg', 'Pagos y control financiero']
            ].map(([src, alt], index) => (
              <div
                key={src}
                className={`overflow-hidden rounded-[30px] border border-black/8 bg-white p-3 shadow-[0_30px_80px_-58px_rgba(15,23,42,0.55)] ${index === 0 || index === 3 ? 'sm:translate-y-5' : ''}`}
              >
                <Image src={src} alt={alt} width={900} height={620} className="h-auto w-full rounded-[22px]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8 lg:px-12 lg:py-20 xl:px-16 2xl:px-20">
        <div className="mx-auto grid max-w-[1760px] gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div className="space-y-5 lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600">El problema</p>
            <h2 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
              Cuando la información está dispersa, el club pierde control.
            </h2>
            <p className="max-w-2xl leading-relaxed text-slate-600">
              Inscripciones por un lado, pagos por otro, estadísticas en hojas separadas, entrenamientos sin trazabilidad y comunicaciones repartidas entre personas y canales. LUNA Football reúne esos procesos para que la directiva y el cuerpo técnico trabajen sobre una misma operación.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              'Información duplicada entre administración, entrenadores y representantes.',
              'Dificultad para saber quién está inscrito, solvente, activo o autorizado.',
              'Torneos, resultados y estadísticas que requieren trabajo manual.',
              'Planes de entrenamiento aislados, sin una biblioteca ni seguimiento común.',
              'Cobranza y conciliación difíciles de auditar cuando viven fuera del sistema.',
              'Falta de visibilidad ejecutiva sobre lo administrativo y lo deportivo.'
            ].map((problem) => (
              <div key={problem} className="rounded-[26px] border border-black/8 bg-slate-50 p-5 text-sm leading-relaxed text-slate-700">
                <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-700">!</span>
                <p>{problem}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="capacidades" className="border-y border-black/8 bg-slate-950 px-6 py-16 text-white sm:px-8 lg:px-12 lg:py-20 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px] space-y-10">
          <div className="max-w-4xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">Control integral</p>
            <h2 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
              Una plataforma para dirigir la operación completa.
            </h2>
            <p className="max-w-3xl leading-relaxed text-slate-300">
              LUNA Football separa los módulos y permisos, pero mantiene conectada la información para que cada rol vea y gestione exactamente lo que necesita.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {capabilityCards.map((card) => (
              <article key={card.title} className="rounded-[30px] border border-white/10 bg-white/[0.055] p-6 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">{card.eyebrow}</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.035em]">{card.title}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">{card.text}</p>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {card.items.map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-slate-200">
                      <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-orange-300" aria-hidden="true" />
                      {item}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8 lg:px-12 lg:py-20 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px] space-y-10">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">Inteligencia deportiva</p>
              <h2 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                La IA ayuda a planificar. El entrenador mantiene el criterio.
              </h2>
            </div>
            <p className="max-w-3xl leading-relaxed text-slate-600 lg:justify-self-end">
              La inteligencia artificial no sustituye al cuerpo técnico. Propone, estructura y adapta planes para acelerar el trabajo metodológico; el entrenador revisa el resultado antes de utilizarlo o compartirlo.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {aiCapabilities.map((item, index) => (
              <article key={item.title} className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_28px_80px_-64px_rgba(15,23,42,0.5)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-sm font-bold text-teal-700">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em]">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>

          <div className="rounded-[32px] border border-teal-100 bg-teal-50 p-6 sm:p-8">
            <p className="text-sm font-semibold text-teal-900">Seguridad metodológica incorporada</p>
            <p className="mt-2 max-w-5xl text-sm leading-relaxed text-teal-950/75">
              La generación de entrenamientos incorpora límites operativos y reglas explícitas: no inventar datos médicos, no autorizar retornos deportivos de jugadores lesionados y mantener cada sesión dentro del límite configurado. La propuesta de IA queda sujeta a revisión humana.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-black/8 bg-slate-50 px-6 py-16 sm:px-8 lg:px-12 lg:py-20 xl:px-16 2xl:px-20">
        <div className="mx-auto grid max-w-[1760px] gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600">Roles y permisos</p>
            <h2 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Cada persona entra a su propio espacio de trabajo.
            </h2>
            <p className="max-w-2xl leading-relaxed text-slate-600">
              La plataforma diferencia responsabilidades para evitar que todos trabajen con el mismo nivel de acceso. Esto permite adaptar LUNA Football a la estructura real de cada institución.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {roles.map(([name, description]) => (
              <div key={name} className="rounded-2xl border border-black/8 bg-white px-5 py-4 shadow-sm">
                <p className="font-semibold text-slate-950">{name}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="implementacion" className="px-6 py-16 sm:px-8 lg:px-12 lg:py-20 xl:px-16 2xl:px-20">
        <div className="mx-auto grid max-w-[1760px] overflow-hidden rounded-[38px] border border-black/8 bg-white shadow-[0_45px_120px_-78px_rgba(15,23,42,0.6)] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="p-7 sm:p-10 lg:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">Implementación real</p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
              No necesitas imaginar cómo funciona.
            </h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-slate-600">
              Club Español E.F. opera una implementación real de esta arquitectura. Para evaluación comercial, LUNA Football dispone de un usuario invitado de solo lectura que permite recorrer los paneles sin modificar datos.
            </p>

            <div className="mt-7 grid gap-2 sm:grid-cols-2">
              {realImplementation.map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-teal-400" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="https://cdebarinasef.com/login"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Ir al acceso del sistema →
              </a>
              <a
                href="https://cdebarinasef.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-700"
              >
                Ver sitio del Club Español E.F.
              </a>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              El acceso invitado está diseñado exclusivamente para evaluación en modo lectura. Las funciones operativas y los cambios de información permanecen restringidos por permisos.
            </p>
          </div>

          <div className="relative min-h-[420px] bg-slate-950 p-6 sm:p-8 lg:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(45,212,191,0.24),transparent_34%),radial-gradient(circle_at_90%_90%,rgba(251,146,60,0.16),transparent_28%)]" aria-hidden="true" />
            <div className="relative flex h-full flex-col justify-between rounded-[28px] border border-white/10 bg-white/[0.055] p-6 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">Arquitectura modular</p>
                <h3 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Configurable por institución.</h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
                  Los módulos pueden habilitarse según el alcance del club. La base contempla operación deportiva, administración, equipamiento, uniformidad y una extensión opcional para equipo profesional.
                </p>
              </div>

              <div className="mt-8 grid gap-3">
                {[
                  ['Escuelas y academias', 'Control de formación, representantes y mensualidades.'],
                  ['Clubes competitivos', 'Torneos, partidos, estadísticas y planificación deportiva.'],
                  ['Estructuras profesionales', 'Módulo independiente para plantilla, cuerpo técnico y finanzas.']
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 sm:px-8 lg:px-12 lg:pb-20 xl:px-16 2xl:px-20">
        <div className="mx-auto grid max-w-[1760px] gap-5 rounded-[36px] bg-slate-950 p-7 text-white shadow-[0_40px_120px_-80px_rgba(15,23,42,0.8)] lg:grid-cols-[1fr_auto] lg:items-center sm:p-10">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">LUNA Football</p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              De administrar jugadores a dirigir una operación deportiva conectada.
            </h2>
            <p className="max-w-4xl text-sm leading-relaxed text-slate-300">
              La plataforma está pensada para que la institución crezca sin volver a separar sus datos, su cobranza y su metodología deportiva en herramientas distintas.
            </p>
          </div>
          <a
            href="https://cdebarinasef.com/login"
            target="_blank"
            rel="noreferrer"
            className="inline-flex justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-200"
          >
            Evaluar el sistema real
          </a>
        </div>
      </section>
    </main>
  );
}
