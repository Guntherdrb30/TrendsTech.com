'use client';

import { useFormStatus } from 'react-dom';

export function SyncButton({ disabled = false, label = 'Sincronizar ahora' }: { disabled?: boolean; label?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={disabled || pending} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-950">
    {pending ? 'Sincronizando…' : label}
  </button>;
}
