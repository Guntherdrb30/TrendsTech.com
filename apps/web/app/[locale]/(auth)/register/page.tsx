import Link from 'next/link';
import { RegisterForm } from '@/components/register-form';

function getRegisterPageCopy(locale: string) {
  if (locale.startsWith('es')) {
    return {
      title: 'Crear cuenta',
      subtitle: 'Registra para acceder a demos y administrar tus agentes.',
      linkLabel: 'Ya tienes cuenta? Iniciar sesion',
      eyebrow: 'Onboarding de tenant',
      readinessTitle: 'Configuracion empresarial',
      readinessBody: 'Crea tu acceso y deja la base lista para agentes, dashboard y configuracion operativa.',
      launchTitle: 'Lanzamiento empresarial',
      launchBody: 'El registro conecta el acceso de usuario con el entorno premium y sus siguientes flujos.'
    };
  }
  return {
    title: 'Create account',
    subtitle: 'Register to access demos and manage your agents.',
    linkLabel: 'Already have an account? Sign in',
    eyebrow: 'Tenant onboarding',
    readinessTitle: 'Company setup',
    readinessBody: 'Create your access and leave the base ready for agents, dashboard, and operating setup.',
    launchTitle: 'Enterprise launch',
    launchBody: 'Registration connects user access with the premium environment and its next flows.'
  };
}

export default async function RegisterPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { locale } = await params;
  const { redirectTo } = await searchParams;
  const copy = getRegisterPageCopy(locale);
  const query = redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : '';

  return (
    <section className="grid gap-6 xl:grid-cols-[0.92fr_0.68fr]">
      <div className="interactive-panel premium-spotlight relative overflow-hidden rounded-[36px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f7fafc_100%)] p-7 shadow-[0_38px_110px_-74px_rgba(15,23,42,0.32)] sm:p-8 lg:p-10">
        <div className="premium-grid absolute inset-0 opacity-45" aria-hidden="true" />
        <div className="relative space-y-8">
          <div className="space-y-4">
            <div className="inline-flex rounded-full border border-black/8 bg-white/88 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.2)]">
              {copy.eyebrow}
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
                {copy.title}
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-600">{copy.subtitle}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="interactive-panel rounded-[24px] border border-black/8 bg-white/88 px-5 py-5 shadow-[0_22px_55px_-44px_rgba(15,23,42,0.24)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Readiness</div>
              <div className="mt-3 text-lg font-semibold tracking-[-0.03em] text-slate-950">{copy.readinessTitle}</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {copy.readinessBody}
              </p>
            </div>
            <div className="interactive-panel rounded-[24px] border border-black/8 bg-slate-950 px-5 py-5 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.45)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{copy.eyebrow}</div>
              <div className="mt-3 text-lg font-semibold tracking-[-0.03em] text-white">{copy.launchTitle}</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {copy.launchBody}
              </p>
            </div>
          </div>

          <Link
            className="interactive-chip inline-flex items-center justify-center rounded-full border border-black/8 bg-white/88 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
            href={`/${locale}/login${query}`}
          >
            {copy.linkLabel}
          </Link>
        </div>
      </div>

      <div className="flex min-w-0 items-start justify-center xl:justify-end">
        <RegisterForm locale={locale} redirectTo={redirectTo} />
      </div>
    </section>
  );
}
