import Link from 'next/link';
import { LoginForm } from '@/components/login-form';

function getLoginPageCopy(locale: string) {
  if (locale.startsWith('es')) {
    return {
      title: 'Iniciar sesion',
      subtitle: 'Acceso seguro para administrar Trends172 Tech y sus productos.',
      linkLabel: 'Crear cuenta',
      forgotLabel: 'Olvidaste tu contrasena?',
      eyebrow: 'Acceso empresarial',
      workspaceTitle: 'Acceso operativo',
      workspaceBody: 'Entra a tus agentes, dashboard y control operativo con una superficie limpia y enfocada.',
      securityTitle: 'Sesion verificada',
      securityBody: 'Autenticacion alineada con el entorno administrativo y el acceso a demos privadas.'
    };
  }
  return {
    title: 'Login',
    subtitle: 'Secure access to manage Trends172 Tech and its products.',
    linkLabel: 'Create an account',
    forgotLabel: 'Forgot your password?',
    eyebrow: 'Enterprise access',
    workspaceTitle: 'Operational access',
    workspaceBody: 'Enter your agents, dashboard, and operating controls through a clean focused surface.',
    securityTitle: 'Verified session',
    securityBody: 'Authentication aligned with the admin environment and private demo access.'
  };
}

export default async function LoginPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { locale } = await params;
  const { redirectTo } = await searchParams;
  const copy = getLoginPageCopy(locale);
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
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace</div>
              <div className="mt-3 text-lg font-semibold tracking-[-0.03em] text-slate-950">{copy.workspaceTitle}</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {copy.workspaceBody}
              </p>
            </div>
            <div className="interactive-panel rounded-[24px] border border-black/8 bg-slate-950 px-5 py-5 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.45)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{copy.eyebrow}</div>
              <div className="mt-3 text-lg font-semibold tracking-[-0.03em] text-white">{copy.securityTitle}</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {copy.securityBody}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              className="interactive-chip inline-flex items-center justify-center rounded-full border border-black/8 bg-white/88 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
              href={`/${locale}/register${query}`}
            >
              {copy.linkLabel}
            </Link>
            <Link
              className="interactive-chip inline-flex items-center justify-center rounded-full border border-black/8 bg-white/88 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
              href={`/${locale}/forgot-password`}
            >
              {copy.forgotLabel}
            </Link>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 items-start justify-center xl:justify-end">
        <LoginForm locale={locale} redirectTo={redirectTo} />
      </div>
    </section>
  );
}
