'use client';

import { useState, useTransition } from 'react';
import { approvePayment, rejectPayment, setReviewing } from './actions';

type Status = 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED';

export function PaymentActions({ paymentId, status }: { paymentId: string; status: Status }) {
  const [notes, setNotes] = useState('');
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (status === 'APPROVED' || status === 'REJECTED') {
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
        {status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}
      </span>
    );
  }

  const run = (fn: () => Promise<void>) => {
    setError(null);
    startTransition(async () => {
      try { await fn(); } catch (e) { setError((e as Error).message); }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {status === 'PENDING' && (
        <button
          onClick={() => run(() => setReviewing(paymentId))}
          disabled={isPending}
          className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Marcar revisando
        </button>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setOpen(!open)}
          disabled={isPending}
          className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Aprobar
        </button>
        <button
          onClick={() => run(() => rejectPayment(paymentId, notes))}
          disabled={isPending}
          className="rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Rechazar
        </button>
      </div>

      {open && (
        <div className="mt-1 space-y-2">
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-[#00bfa5]"
            placeholder="Nota interna (opcional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          <button
            onClick={() => run(() => approvePayment(paymentId, notes))}
            disabled={isPending}
            className="w-full rounded-full bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isPending ? 'Procesando...' : 'Confirmar aprobación y acreditar'}
          </button>
        </div>
      )}

      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
