'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type Slot = { key: string; startsAt: string; label: string };

export function BookingWidget({ source = 'city-center-maracay' }: { source?: string }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState('');
  const [state, setState] = useState<'idle'|'loading'|'sending'|'done'|'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/bookings/availability')
      .then((r) => r.json())
      .then((data) => { setSlots(data.slots ?? []); setState('idle'); })
      .catch(() => { setMessage('No pudimos cargar los horarios. Intenta nuevamente.'); setState('error'); });
  }, []);

  const days = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const slot of slots) {
      const day = slot.startsAt.slice(0, 10);
      map.set(day, [...(map.get(day) ?? []), slot]);
    }
    return [...map.entries()].slice(0, 5);
  }, [slots]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) { setMessage('Selecciona un horario.'); return; }
    setState('sending'); setMessage('');
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    const res = await fetch('/api/bookings', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ ...payload, slotKey:selected, source }) });
    const data = await res.json();
    if (!res.ok) { setState('error'); setMessage(data.error ?? 'No pudimos completar la reserva.'); return; }
    setState('done'); setMessage('Reserva confirmada. Recibirás la información de la llamada en el correo indicado.');
  }

  return <div className="rounded-[32px] border border-slate-200 bg-white p-5 text-left shadow-xl shadow-slate-200/40 md:p-8">
    <div className="mb-6"><div className="text-xs font-bold uppercase tracking-[.2em] text-cyan-700">Reservas Trends172Tech</div><h3 className="mt-2 font-[var(--font-proposal-display)] text-2xl font-semibold text-slate-950">Agenda una llamada</h3><p className="mt-2 text-sm leading-6 text-slate-500">Selecciona uno de nuestros horarios disponibles. Hora de Venezuela.</p></div>
    {state === 'loading' ? <p className="text-sm text-slate-500">Cargando disponibilidad…</p> :
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-3">{days.map(([day, daySlots]) => <div key={day}><div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{new Intl.DateTimeFormat('es-VE',{weekday:'long',day:'numeric',month:'short',timeZone:'America/Caracas'}).format(new Date(daySlots[0].startsAt))}</div><div className="flex flex-wrap gap-2">{daySlots.map(s=><button type="button" key={s.key} onClick={()=>setSelected(s.key)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selected===s.key?'border-cyan-600 bg-cyan-600 text-white':'border-slate-200 text-slate-700 hover:border-cyan-400'}`}>{s.label}</button>)}</div></div>)}</div>
      <input name="name" required maxLength={120} placeholder="Nombre y apellido" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none focus:border-cyan-500" />
      <div className="grid gap-3 sm:grid-cols-2"><input name="company" maxLength={120} placeholder="Empresa" className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none focus:border-cyan-500" /><input name="phone" maxLength={40} placeholder="Teléfono / WhatsApp" className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none focus:border-cyan-500" /></div>
      <input name="email" required type="email" placeholder="Correo electrónico" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none focus:border-cyan-500" />
      <textarea name="notes" maxLength={1000} rows={3} placeholder="¿Qué te gustaría conversar?" className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none focus:border-cyan-500" />
      <button disabled={state==='sending'||!selected} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">{state==='sending'?'Reservando…':'Confirmar reunión'}</button>
      {message && <p className={`text-sm ${state==='done'?'text-emerald-700':'text-rose-600'}`}>{message}</p>}
    </form>}
  </div>;
}
