'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Script from 'next/script';

type HumanVerificationGateProps = {
  initialVerified: boolean;
  siteKey: string | null;
  locale: string;
};

type GateCopy = {
  title: string;
  body: string;
  error: string;
};

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
    };
  }
}

function getCopy(locale: string): GateCopy {
  if (locale.startsWith('es')) {
    return {
      title: 'Confirma que eres humano',
      body: 'Este paso protege los demos de bots.',
      error: 'No se pudo validar. Intenta de nuevo.'
    };
  }
  return {
    title: 'Confirm you are human',
    body: 'This step protects demos from bots.',
    error: 'Verification failed. Try again.'
  };
}

export function HumanVerificationGate({
  initialVerified,
  siteKey,
  locale
}: HumanVerificationGateProps) {
  const [verified, setVerified] = useState(initialVerified);
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const copy = useMemo(() => getCopy(locale), [locale]);

  useEffect(() => {
    if (!siteKey || verified || !scriptReady) {
      return;
    }
    if (!widgetRef.current || widgetIdRef.current || !window.turnstile) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(widgetRef.current, {
      sitekey: siteKey,
      callback: async (token: string) => {
        setError(null);
        try {
          const response = await fetch('/api/human/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });
          if (!response.ok) {
            setError(copy.error);
            return;
          }
          setVerified(true);
        } catch {
          setError(copy.error);
        }
      },
      'error-callback': () => {
        setError(copy.error);
      },
      'expired-callback': () => {
        setError(copy.error);
      }
    });

    return () => {
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [copy.error, scriptReady, siteKey, verified]);

  if (verified || !siteKey) {
    return null;
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 px-4 text-white">
        <div className="w-full max-w-md space-y-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.7)]">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">{copy.title}</h2>
            <p className="text-sm text-slate-300">{copy.body}</p>
          </div>
          <div ref={widgetRef} />
          {error ? <p className="text-sm text-amber-300">{error}</p> : null}
        </div>
      </div>
    </>
  );
}
