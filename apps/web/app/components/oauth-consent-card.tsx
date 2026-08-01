'use client';

import { useState, useTransition } from 'react';

import { authClient } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';

type OAuthConsentCardProps = {
  clientName: string;
  clientUri?: string | null;
  scopes: string[];
  locale: string;
};

const scopeCopy: Record<string, { es: string; en: string }> = {
  openid: { es: 'Confirmar tu identidad', en: 'Confirm your identity' },
  profile: { es: 'Ver tu nombre y perfil', en: 'View your name and profile' },
  email: { es: 'Ver tu correo verificado', en: 'View your verified email' },
  offline_access: { es: 'Mantener la conexión hasta que la revoques', en: 'Keep the connection until you revoke it' },
  'mcp:read': { es: 'Consultar información autorizada de LUNA', en: 'Read authorized LUNA information' },
  'mcp:write': { es: 'Ejecutar acciones autorizadas en LUNA', en: 'Perform authorized LUNA actions' }
};

export function OAuthConsentCard({ clientName, clientUri, scopes, locale }: OAuthConsentCardProps) {
  const isEs = locale.startsWith('es');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const decide = (accept: boolean) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await authClient.oauth2.consent({ accept });
        if (!result.error) return;
        setError(isEs ? 'No pudimos completar la autorización.' : 'We could not complete authorization.');
      } catch {
        setError(isEs ? 'No pudimos completar la autorización.' : 'We could not complete authorization.');
      }
    });
  };

  return (
    <div className="interactive-panel premium-noise mx-auto w-full max-w-[620px] rounded-[32px] border border-black/8 bg-white p-7 shadow-[0_38px_110px_-74px_rgba(15,23,42,0.4)] sm:p-9">
      <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-700">
        OAuth 2.1 · LUNA
      </div>
      <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
        {isEs ? 'Autorizar conexión' : 'Authorize connection'}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        <strong className="text-slate-950">{clientName}</strong>{' '}
        {isEs ? 'solicita acceso a tu cuenta de Trends172 Tech.' : 'is requesting access to your Trends172 Tech account.'}
      </p>

      <div className="mt-6 rounded-[24px] border border-black/8 bg-slate-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {isEs ? 'Permisos solicitados' : 'Requested permissions'}
        </p>
        <ul className="mt-4 space-y-3">
          {scopes.map((scope) => (
            <li key={scope} className="flex gap-3 text-sm text-slate-700">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-500" aria-hidden="true" />
              {scopeCopy[scope]?.[isEs ? 'es' : 'en'] ?? scope}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-slate-500">
        {isEs
          ? 'LUNA solo podrá usar los permisos mostrados. Puedes retirar el acceso posteriormente.'
          : 'LUNA can only use the permissions shown. You can revoke access later.'}
        {clientUri ? ` ${clientUri}` : ''}
      </p>

      {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <Button type="button" variant="outline" disabled={isPending} onClick={() => decide(false)}>
          {isEs ? 'Cancelar' : 'Deny'}
        </Button>
        <Button type="button" disabled={isPending} onClick={() => decide(true)}>
          {isPending ? (isEs ? 'Autorizando…' : 'Authorizing…') : (isEs ? 'Autorizar' : 'Authorize')}
        </Button>
      </div>
    </div>
  );
}
