import Link from 'next/link';
import Image from 'next/image';
import { RegisterForm } from '@/components/register-form';

const FROM_AGENT_FUNNEL = 'crear-agente';

function isFromAgentFunnel(redirectTo?: string) {
  return !!redirectTo && redirectTo.includes(FROM_AGENT_FUNNEL);
}

type PageCopy = {
  eyebrow: string;
  headline: string;
  subline: string;
  step1Label: string;
  step1Sub: string;
  step2Label: string;
  step2Sub: string;
  step3Label: string;
  step3Sub: string;
  statusLine: string;
  loginLink: string;
  card1Icon: string;
  card1Title: string;
  card1Body: string;
  card2Icon: string;
  card2Title: string;
  card2Body: string;
};

function getCopy(locale: string, agentFunnel: boolean): PageCopy {
  const isEs = locale.startsWith('es');

  if (agentFunnel) {
    return isEs
      ? {
          eyebrow: 'Paso 1 de 3',
          headline: 'Tu agente\nte está\nesperando.',
          subline: 'Configuración guardada. Solo necesitas una cuenta para que tu agente esté en vivo.',
          step1Label: 'Crea tu cuenta',
          step1Sub: 'Estás aquí ahora',
          step2Label: 'Agente se activa',
          step2Sub: 'Automáticamente al registrarte',
          step3Label: 'Obtén el snippet',
          step3Sub: 'Recarga créditos y despliega',
          statusLine: 'Configuración guardada · Activación pendiente',
          loginLink: '¿Ya tienes cuenta? Inicia sesión →',
          card1Icon: '🤖',
          card1Title: '',
          card1Body: '',
          card2Icon: '',
          card2Title: '',
          card2Body: '',
        }
      : {
          eyebrow: 'Step 1 of 3',
          headline: 'Your agent\nis waiting\nfor you.',
          subline: 'Configuration saved. You just need an account to get your agent live.',
          step1Label: 'Create your account',
          step1Sub: "You're here now",
          step2Label: 'Agent activates',
          step2Sub: 'Automatically after signup',
          step3Label: 'Get the snippet',
          step3Sub: 'Recharge credits and deploy',
          statusLine: 'Configuration saved · Activation pending',
          loginLink: 'Already have an account? Sign in →',
          card1Icon: '🤖',
          card1Title: '',
          card1Body: '',
          card2Icon: '',
          card2Title: '',
          card2Body: '',
        };
  }

  return isEs
    ? {
        eyebrow: 'Trends172Tech',
        headline: 'Bienvenido\na la plataforma.',
        subline: 'Accede a agentes IA personalizados y al sistema Luna ERP para transformar tu empresa.',
        step1Label: '',
        step1Sub: '',
        step2Label: '',
        step2Sub: '',
        step3Label: '',
        step3Sub: '',
        statusLine: '',
        loginLink: '¿Ya tienes cuenta? Inicia sesión →',
        card1Icon: '🤖',
        card1Title: 'Agentes IA',
        card1Body: 'Despliega asistentes con skills en tu sitio web y automatiza la atención al cliente.',
        card2Icon: '🌙',
        card2Title: 'Luna ERP',
        card2Body: 'Sistema integral para gestionar tu empresa con inteligencia operativa.',
      }
    : {
        eyebrow: 'Trends172Tech',
        headline: 'Welcome\nto the platform.',
        subline: 'Access custom AI agents and the Luna ERP system to transform your business.',
        step1Label: '',
        step1Sub: '',
        step2Label: '',
        step2Sub: '',
        step3Label: '',
        step3Sub: '',
        statusLine: '',
        loginLink: 'Already have an account? Sign in →',
        card1Icon: '🤖',
        card1Title: 'AI Agents',
        card1Body: 'Deploy skill-based assistants on your website and automate customer support.',
        card2Icon: '🌙',
        card2Title: 'Luna ERP',
        card2Body: 'A comprehensive system to manage your business with operational intelligence.',
      };
}

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { locale } = await params;
  const { redirectTo } = await searchParams;
  const agentFunnel = isFromAgentFunnel(redirectTo);
  const copy = getCopy(locale, agentFunnel);
  const query = redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : '';

  return (
    <section className="grid min-h-[640px] gap-3 xl:grid-cols-[1fr_480px]">

      {/* ── Left panel ── */}
      <div
        className="relative flex flex-col overflow-hidden rounded-[28px] p-8 lg:p-12"
        style={{ background: 'linear-gradient(145deg, #05080f 0%, #0a0f1a 60%, #071118 100%)' }}
      >
        {/* Dot-grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
          aria-hidden="true"
        />

        {/* Teal glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #00bfa5 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="relative flex flex-1 flex-col">
          {/* Logo + eyebrow */}
          <div className="flex items-center gap-3">
            <Image
              src="/branding/ttech-logo.svg"
              alt="Trends172 Tech"
              width={32}
              height={32}
              className="h-8 w-8 opacity-90"
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#00bfa5]">
              {copy.eyebrow}
            </span>
          </div>

          {/* Headline */}
          <h1
            className="mt-10 text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-white lg:text-5xl xl:text-[3.25rem]"
            style={{ whiteSpace: 'pre-line' }}
          >
            {copy.headline}
          </h1>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            {copy.subline}
          </p>

          {/* Agent funnel: status + step pipeline */}
          {agentFunnel ? (
            <div className="mt-10 flex flex-col gap-4">
              {/* Live status */}
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-3 w-3 items-center justify-center">
                  <div className="absolute h-3 w-3 animate-ping rounded-full bg-[#00bfa5] opacity-60" />
                  <div className="h-1.5 w-1.5 rounded-full bg-[#00bfa5]" />
                </div>
                <span className="text-xs text-slate-400">{copy.statusLine}</span>
              </div>

              {/* Step pipeline */}
              <div className="overflow-hidden rounded-[20px] border border-white/8">
                <div className="flex items-center gap-4 border-b border-white/6 bg-[#00bfa5]/10 px-5 py-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00bfa5] text-[11px] font-bold text-white shadow-[0_0_14px_rgba(0,191,165,0.5)]">
                    1
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white">{copy.step1Label}</div>
                    <div className="text-xs text-[#00bfa5]/80">{copy.step1Sub}</div>
                  </div>
                  <svg className="h-4 w-4 text-[#00bfa5]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <div className="flex items-center gap-4 border-b border-white/6 px-5 py-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/12 text-[11px] font-bold text-slate-500">
                    2
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-400">{copy.step2Label}</div>
                    <div className="text-xs text-slate-600">{copy.step2Sub}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/12 text-[11px] font-bold text-slate-500">
                    3
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-400">{copy.step3Label}</div>
                    <div className="text-xs text-slate-600">{copy.step3Sub}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Generic mode: product cards */
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] border border-white/8 bg-white/[0.04] p-5">
                <div className="text-2xl">{copy.card1Icon}</div>
                <div className="mt-3 text-sm font-semibold text-white">{copy.card1Title}</div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{copy.card1Body}</p>
              </div>
              <div className="rounded-[20px] border border-white/8 bg-white/[0.04] p-5">
                <div className="text-2xl">{copy.card2Icon}</div>
                <div className="mt-3 text-sm font-semibold text-white">{copy.card2Title}</div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{copy.card2Body}</p>
              </div>
              <div className="col-span-full flex items-center gap-2.5 rounded-full border border-white/8 bg-white/[0.04] px-4 py-2.5">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00bfa5]" />
                <span className="text-xs text-slate-400">
                  {locale.startsWith('es') ? 'Sistema activo · Soporte 24/7' : 'System live · 24/7 support'}
                </span>
              </div>
            </div>
          )}

          {/* Login link — bottom */}
          <div className="mt-auto pt-10">
            <Link
              href={`/${locale}/login${query}`}
              className="text-sm text-slate-500 transition hover:text-slate-300"
            >
              {copy.loginLink}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex min-w-0 items-center justify-center py-6 xl:py-0">
        <RegisterForm locale={locale} redirectTo={redirectTo} />
      </div>

    </section>
  );
}
