'use client';

import { useState } from 'react';

export function ProposalLinkActions({ url, locale = 'es' }: { url: string; locale?: string }) {
  const es = locale.startsWith('es');
  const [message, setMessage] = useState('');
  const [manual, setManual] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage(es ? 'Enlace copiado.' : 'Link copied.');
      setManual(false);
    } catch {
      setManual(true);
      setMessage(es ? 'Selecciona y copia el enlace de abajo.' : 'Select and copy the link below.');
    }
  }
  return <div className="space-y-2">
    <div className="flex flex-wrap gap-2">
      <a href={url} target="_blank" rel="noreferrer" className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white dark:bg-cyan-400 dark:text-slate-950">{es ? 'Abrir propuesta ↗' : 'Open proposal ↗'}</a>
      <button type="button" onClick={copy} className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">{es ? 'Copiar enlace' : 'Copy link'}</button>
    </div>
    <p role="status" className="text-xs text-teal-700 dark:text-teal-300">{message}</p>
    {manual ? <input aria-label={es ? 'Enlace para compartir' : 'Shareable link'} readOnly value={url} onFocus={e => e.currentTarget.select()} className="w-full min-w-0 rounded border border-slate-300 bg-white p-2 text-xs text-slate-900" /> : null}
  </div>;
}
