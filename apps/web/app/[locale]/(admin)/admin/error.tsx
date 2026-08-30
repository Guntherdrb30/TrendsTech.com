'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const params = useParams<{ locale?: string }>();
  const isSpanish = (params.locale ?? 'es').startsWith('es');

  useEffect(() => {
    console.error('[admin-ui] Operational data unavailable', error);
  }, [error]);

  return (
    <section className="rounded-[28px] border border-amber-200 bg-amber-50 px-6 py-8 text-slate-950 shadow-sm dark:border-amber-900 dark:bg-amber-950/30 dark:text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
        {isSpanish ? 'Datos no disponibles' : 'Data unavailable'}
      </p>
      <h2 className="mt-3 text-2xl font-semibold">
        {isSpanish ? 'No pudimos consultar la base operativa' : 'We could not query the operational database'}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
        {isSpanish
          ? 'No mostramos clientes, métricas ni proyectos de demostración para sustituir la información real. Revisa la conexión e inténtalo de nuevo.'
          : 'We do not show demonstration clients, metrics, or projects in place of real information. Check the connection and try again.'}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
      >
        {isSpanish ? 'Reintentar consulta' : 'Retry query'}
      </button>
    </section>
  );
}
