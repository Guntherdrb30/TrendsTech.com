'use client';

import { useMemo, useState } from 'react';
import { estimateStudioCost } from '@/lib/engineering-studio/cost-estimate';

export function ProjectCostEstimator({ remainingCents }: { remainingCents: number | null }) {
  const [inputTokens, setInputTokens] = useState('100000');
  const [outputTokens, setOutputTokens] = useState('20000');
  const [inputRate, setInputRate] = useState('2');
  const [outputRate, setOutputRate] = useState('8');
  const [runs, setRuns] = useState('1');
  const [extra, setExtra] = useState('0');
  const estimate = useMemo(() => {
    try {
      const result = estimateStudioCost({
        inputTokens: Number(inputTokens), outputTokens: Number(outputTokens),
        inputUsdPerMillion: Number(inputRate), outputUsdPerMillion: Number(outputRate),
        runs: Number(runs), extraCostCents: Math.round(Number(extra) * 100)
      });
      if ([inputTokens, outputTokens, inputRate, outputRate, runs, extra].some(value => value.trim() === '')) return null;
      if (Number(extra) < 0 || !Number.isFinite(Number(extra))) return null;
      return result;
    } catch { return null; }
  }, [inputTokens, outputTokens, inputRate, outputRate, runs, extra]);
  const fields = [
    ['Tokens de entrada por ejecución', inputTokens, setInputTokens, '1'],
    ['Tokens de salida por ejecución', outputTokens, setOutputTokens, '1'],
    ['USD / millón de tokens de entrada', inputRate, setInputRate, '0.01'],
    ['USD / millón de tokens de salida', outputRate, setOutputRate, '0.01'],
    ['Número de ejecuciones', runs, setRuns, '1'],
    ['Otros costos estimados (USD)', extra, setExtra, '0.01']
  ] as const;
  return <section className="rounded-[26px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Simulación sin consumo · Solo lectura</p>
    <h4 className="mt-2 text-lg font-semibold">Calcular costo antes de ejecutar</h4>
    <p className="mt-2 text-xs leading-5 text-slate-500">Tarifas de ejemplo, no verificadas. El cálculo se realiza en tu navegador: no crea ejecuciones, reservas ni llamadas pagadas.</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {fields.map(([label, value, setter, step]) => <label key={label} className="block text-xs text-slate-600 dark:text-slate-300">{label}
        <input aria-label={label} type="number" min={0} step={step} value={value} onChange={event => setter(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
      </label>)}
    </div>
    <div aria-live="polite" className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
      <p className="text-xs text-slate-500">Costo hipotético total</p>
      <p className="mt-1 text-2xl font-semibold">{estimate ? estimate.estimatedUsd.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'Datos inválidos'}</p>
      <p className="mt-2 text-xs text-slate-500">{remainingCents === null ? 'Presupuesto operativo no disponible: ejecución pagada bloqueada.' : estimate ? estimate.estimatedCents > remainingCents ? 'Supera el saldo informado; no ejecutar.' : 'Dentro del saldo informado, pero NO autoriza ejecución.' : 'Revisa los valores.'}</p>
    </div>
    <p className="mt-3 text-xs text-amber-700">Antes de ejecutar: confirmar modelo y tarifas reales, límites del proveedor, costo de infraestructura y autorización expresa.</p>
  </section>;
}
