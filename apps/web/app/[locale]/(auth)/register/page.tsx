import Link from 'next/link';
import { RegisterForm } from '@/components/register-form';

const FROM_AGENT_FUNNEL = 'crear-agente';

function isFromAgentFunnel(redirectTo?: string) {
  return !!redirectTo && redirectTo.includes(FROM_AGENT_FUNNEL);
}

function getRegisterPageCopy(locale: string, agentFunnel: boolean) {
  if (locale.startsWith('es')) {
    if (agentFunnel) {
      return {
        eyebrow: 'Tu agente te está esperando',
        title: 'Crea tu cuenta para activarlo',
        subtitle: 'Tu agente ya está configurado con las skills que elegiste. Solo necesitas una cuenta para desplegarlo.',
        linkLabel: '¿Ya tienes cuenta? Iniciar sesión',
        card1Label: 'Tu agente',
        card1Title: 'Listo para activarse',
        card1Body: 'La configuración de tu agente quedó guardada. En cuanto crees tu cuenta lo activamos automáticamente.',
        card2Title: 'Créditos para operar',
        card2Body: 'Necesitas créditos en tu billetera para que el agente responda a tus usuarios 24/7 en tu sitio web.',
        step1: '① Crea tu cuenta ahora',
        step2: '② El agente se activa solo',
        step3: '③ Recarga créditos y obtén el snippet',
      };
    }
    return {
      eyebrow: 'Onboarding de tenant',
      title: 'Crear cuenta',
      subtitle: 'Regístrate para acceder a demos y administrar tus agentes.',
      linkLabel: '¿Ya tienes cuenta? Iniciar sesión',
      card1Label: 'Readiness',
      card1Title: 'Configuración empresarial',
      card1Body: 'Crea tu acceso y deja la base lista para agentes, dashboard y configuración operativa.',
      card2Title: 'Lanzamiento empresarial',
      card2Body: 'El registro conecta el acceso de usuario con el entorno premium y sus siguientes flujos.',
      step1: null,
      step2: null,
      step3: null,
    };
  }

  if (agentFunnel) {
    return {
      eyebrow: 'Your agent is waiting',
      title: 'Create your account to activate it',
      subtitle: 'Your agent is already configured with the skills you chose. You just need an account to deploy it.',
      linkLabel: 'Already have an account? Sign in',
      card1Label: 'Your agent',
      card1Title: 'Ready to activate',
      card1Body: 'Your agent configuration was saved. As soon as you create your account we activate it automatically.',
      card2Title: 'Credits to operate',
      card2Body: 'You need credits in your wallet for the agent to respond to your users 24/7 on your website.',
      step1: '① Create your account now',
      step2: '② Agent activates automatically',
      step3: '③ Recharge credits and get the snippet',
    };
  }

  return {
    eyebrow: 'Tenant onboarding',
    title: 'Create account',
    subtitle: 'Register to access demos and manage your agents.',
    linkLabel: 'Already have an account? Sign in',
    card1Label: 'Readiness',
    card1Title: 'Company setup',
    card1Body: 'Create your access and leave the base ready for agents, dashboard, and operating setup.',
    card2Title: 'Enterprise launch',
    card2Body: 'Registration connects user access with the premium environment and its next flows.',
    step1: null,
    step2: null,
    step3: null,
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
  const agentFunnel = isFromAgentFunnel(redirectTo);
  const copy = getRegisterPageCopy(locale, agentFunnel);
  const query = redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : '';

  return (
    <section className="grid gap-6 xl:grid-cols-[0.92fr_0.68fr]">
      <div
        className={`interactive-panel premium-spotlight relative overflow-hidden rounded-[36px] border p-7 shadow-[0_38px_110px_-74px_rgba(15,23,42,0.32)] sm:p-8 lg:p-10 ${
          agentFunnel
            ? 'border-[#00bfa5]/25 bg-[linear-gradient(180deg,#f0fdf9_0%,#ffffff_100%)]'
            : 'border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f7fafc_100%)]'
        }`}
      >
        <div className="premium-grid absolute inset-0 opacity-45" aria-hidden="true" />
        <div className="relative space-y-8">
          <div className="space-y-4">
            <div
              className={`inline-flex rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] shadow-[0_18px_40px_-34px_rgba(15,23,42,0.2)] ${
                agentFunnel
                  ? 'border-[#00bfa5]/30 bg-[#00bfa5]/10 text-[#00897b]'
                  : 'border-black/8 bg-white/88 text-slate-500'
              }`}
            >
              {agentFunnel && <span className="mr-2">🤖</span>}
              {copy.eyebrow}
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
                {copy.title}
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-600">{copy.subtitle}</p>
            </div>
          </div>

          {/* Agent funnel: 3-step flow */}
          {agentFunnel && copy.step1 ? (
            <div className="space-y-3">
              {[copy.step1, copy.step2, copy.step3].map((step) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-[20px] border border-[#00bfa5]/20 bg-white px-4 py-3 text-sm font-semibold text-slate-800"
                >
                  <span className="text-[#00bfa5]">✓</span>
                  {step}
                </div>
              ))}
              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <div className="interactive-panel rounded-[24px] border border-[#00bfa5]/20 bg-white px-5 py-5 shadow-[0_22px_55px_-44px_rgba(0,191,165,0.2)]">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00897b]">
                    {copy.card1Label}
                  </div>
                  <div className="mt-3 text-lg font-semibold tracking-[-0.03em] text-slate-950">
                    {copy.card1Title}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{copy.card1Body}</p>
                </div>
                <div className="interactive-panel rounded-[24px] border border-black/8 bg-slate-950 px-5 py-5 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.45)]">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00bfa5]">
                    ⚡ créditos
                  </div>
                  <div className="mt-3 text-lg font-semibold tracking-[-0.03em] text-white">
                    {copy.card2Title}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{copy.card2Body}</p>
                </div>
              </div>
            </div>
          ) : (
            /* Generic register: original 2 cards */
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="interactive-panel rounded-[24px] border border-black/8 bg-white/88 px-5 py-5 shadow-[0_22px_55px_-44px_rgba(15,23,42,0.24)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {copy.card1Label}
                </div>
                <div className="mt-3 text-lg font-semibold tracking-[-0.03em] text-slate-950">
                  {copy.card1Title}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{copy.card1Body}</p>
              </div>
              <div className="interactive-panel rounded-[24px] border border-black/8 bg-slate-950 px-5 py-5 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.45)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {copy.eyebrow}
                </div>
                <div className="mt-3 text-lg font-semibold tracking-[-0.03em] text-white">
                  {copy.card2Title}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{copy.card2Body}</p>
              </div>
            </div>
          )}

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
