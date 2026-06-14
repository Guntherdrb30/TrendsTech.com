'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createAgentFromSession } from './actions';
import type { CreateAgentSessionResult, CreateAgentSessionInput } from './actions';

const STORAGE_KEY = 'pendingAgentConfig';

type State =
  | { phase: 'loading' }
  | { phase: 'creating' }
  | { phase: 'no_credits'; result: CreateAgentSessionResult }
  | { phase: 'done'; result: CreateAgentSessionResult }
  | { phase: 'error'; message: string }
  | { phase: 'no_data' };

export function RestoreHandler({ locale }: { locale: string }) {
  const isEs = locale.startsWith('es');
  const [state, setState] = useState<State>({ phase: 'loading' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setState({ phase: 'no_data' });
      return;
    }

    let data: CreateAgentSessionInput;
    try {
      data = JSON.parse(raw) as CreateAgentSessionInput;
    } catch {
      setState({ phase: 'no_data' });
      return;
    }

    setState({ phase: 'creating' });
    createAgentFromSession(data)
      .then((result) => {
        window.sessionStorage.removeItem(STORAGE_KEY);
        setState(result.hasCredits ? { phase: 'done', result } : { phase: 'no_credits', result });
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        setState({ phase: 'error', message });
      });
  }, []);

  const copy = isEs
    ? {
        loading: 'Cargando tu configuración...',
        creating: 'Creando tu agente...',
        doneTitle: '¡Tu agente está activo!',
        doneSub: 'Copia el snippet y pégalo antes del </body> de tu sitio web.',
        copyLabel: 'Copiar snippet',
        copiedLabel: '¡Copiado!',
        viewAgent: 'Ver mi agente en el panel →',
        createAnother: 'Crear otro agente',
        noCreditsTitle: '¡Agente creado! Ahora necesitas créditos.',
        noCreditsSub: 'Tu agente está listo pero inactivo. Recarga créditos para activar las respuestas y obtener el código de instalación.',
        recharge: 'Recargar créditos →',
        rechargeSub: 'Una vez tengas créditos, el código de instalación estará disponible en el panel.',
        viewPanel: 'Ir a mi panel',
        errorTitle: 'Algo salió mal',
        errorRetry: 'Volver al inicio',
        noDataTitle: 'No encontramos tu configuración',
        noDataSub: 'Parece que la sesión expiró. Vuelve a crear tu agente.',
        noDataCta: 'Crear agente de nuevo',
        skills: 'Skills activas',
        snippet: 'Código de instalación',
      }
    : {
        loading: 'Loading your configuration...',
        creating: 'Creating your agent...',
        doneTitle: 'Your agent is live!',
        doneSub: 'Copy the snippet and paste it before the </body> of your website.',
        copyLabel: 'Copy snippet',
        copiedLabel: 'Copied!',
        viewAgent: 'View my agent in the dashboard →',
        createAnother: 'Create another agent',
        noCreditsTitle: 'Agent created! Now you need credits.',
        noCreditsSub: 'Your agent is ready but inactive. Recharge credits to activate responses and get the installation code.',
        recharge: 'Recharge credits →',
        rechargeSub: 'Once you have credits, the installation code will be available in your dashboard.',
        viewPanel: 'Go to my dashboard',
        errorTitle: 'Something went wrong',
        errorRetry: 'Back to start',
        noDataTitle: 'Configuration not found',
        noDataSub: 'Your session appears to have expired. Please create your agent again.',
        noDataCta: 'Create agent again',
        skills: 'Active skills',
        snippet: 'Installation code',
      };

  const buildSnippet = (publicKey: string) =>
    `<script src="https://cdn.trends172tech.com/widget.js" data-token="${publicKey}" defer></script>`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (state.phase === 'loading' || state.phase === 'creating') {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00bfa5]/30 border-t-[#00bfa5]" />
        <p className="text-sm font-medium text-slate-500">
          {state.phase === 'loading' ? copy.loading : copy.creating}
        </p>
      </div>
    );
  }

  if (state.phase === 'no_data') {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <div className="mx-auto mb-4 text-5xl">😕</div>
        <h2 className="text-xl font-semibold text-slate-900">{copy.noDataTitle}</h2>
        <p className="mt-2 text-sm text-slate-500">{copy.noDataSub}</p>
        <Link
          href={`/${locale}/crear-agente`}
          className="mt-6 inline-flex items-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
        >
          {copy.noDataCta}
        </Link>
      </div>
    );
  }

  if (state.phase === 'error') {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <div className="mx-auto mb-4 text-5xl">⚠️</div>
        <h2 className="text-xl font-semibold text-slate-900">{copy.errorTitle}</h2>
        <p className="mt-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.message}
        </p>
        <Link
          href={`/${locale}/crear-agente`}
          className="mt-6 inline-flex items-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
        >
          {copy.errorRetry}
        </Link>
      </div>
    );
  }

  const { result } = state;
  const snippet = buildSnippet(result.installPublicKey);

  /* ── No credits ── */
  if (state.phase === 'no_credits') {
    return (
      <div className="mx-auto max-w-lg py-4">
        <div className="overflow-hidden rounded-[32px] border border-amber-200 bg-white shadow-[0_24px_64px_-48px_rgba(245,158,11,0.2)]">
          <div className="border-b border-amber-100 bg-[linear-gradient(135deg,#fffbeb,#fef3c7)] px-7 py-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{copy.noCreditsTitle}</h2>
                <p className="mt-0.5 text-sm text-slate-600">{copy.noCreditsSub}</p>
              </div>
            </div>
          </div>
          <div className="px-7 py-6 space-y-4">
            {/* agent summary */}
            <div className="rounded-2xl border border-black/8 bg-slate-50 px-4 py-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2">
                {copy.skills}
              </div>
              <div className="flex flex-wrap gap-2">
                {result.selectedSkills.map((s) => (
                  <span key={s.key} className="rounded-full border border-[#00bfa5]/30 bg-white px-3 py-1 text-xs font-medium text-[#00897b]">
                    {s.key}
                  </span>
                ))}
              </div>
            </div>

            {/* locked snippet */}
            <div className="relative overflow-hidden rounded-2xl border border-black/8">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur-sm z-10">
                <span className="text-2xl">🔒</span>
                <span className="text-xs font-semibold text-slate-600 text-center px-4">
                  {isEs ? 'Disponible cuando tengas créditos' : 'Available once you have credits'}
                </span>
              </div>
              <pre className="overflow-x-auto bg-slate-950 px-4 py-4 text-xs text-slate-300 select-none blur-[2px]">
                {snippet}
              </pre>
            </div>

            <Link
              href={`/${locale}/recharge`}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-14px_rgba(245,158,11,0.5)] transition hover:bg-amber-600"
            >
              ⚡ {copy.recharge}
            </Link>
            <p className="text-center text-xs text-slate-500">{copy.rechargeSub}</p>
            <Link
              href={`/${locale}/dashboard`}
              className="block text-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition"
            >
              {copy.viewPanel}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Done with credits ── */
  return (
    <div className="mx-auto max-w-2xl py-4">
      <div className="overflow-hidden rounded-[32px] border border-[#00bfa5]/30 bg-white shadow-[0_24px_64px_-48px_rgba(0,191,165,0.25)]">
        <div className="border-b border-[#00bfa5]/20 bg-[linear-gradient(135deg,#00bfa5,#00897b)] px-7 py-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h2 className="text-xl font-semibold text-white">{copy.doneTitle}</h2>
              <p className="mt-0.5 text-sm text-[rgba(255,255,255,0.8)]">{copy.doneSub}</p>
            </div>
          </div>
        </div>
        <div className="px-7 py-6 space-y-5">
          {/* skills */}
          <div>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {copy.skills}
            </div>
            <div className="flex flex-wrap gap-2">
              {result.selectedSkills.map((s) => (
                <span key={s.key} className="rounded-full border border-[#00bfa5]/30 bg-[#f0fdf9] px-3 py-1 text-xs font-medium text-[#00897b]">
                  {s.key}
                </span>
              ))}
            </div>
          </div>

          {/* snippet */}
          <div>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {copy.snippet}
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-black/8 bg-slate-950">
              <pre className="overflow-x-auto px-4 py-4 text-xs text-[#00bfa5]">{snippet}</pre>
              <button
                type="button"
                onClick={() => handleCopy(snippet)}
                className="absolute right-3 top-3 rounded-xl border border-white/12 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/20"
              >
                {copied ? copy.copiedLabel : copy.copyLabel}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${locale}/dashboard/agents/${result.agentId}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {copy.viewAgent}
            </Link>
            <Link
              href={`/${locale}/crear-agente`}
              className="flex items-center justify-center rounded-full border border-black/8 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              {copy.createAnother}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
