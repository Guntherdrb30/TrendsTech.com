'use client';

import { useMemo, useState, useTransition } from 'react';

type RunnerSnapshot = {
  configured: boolean;
  tenantSlug: string;
  runner: null | {
    id: string;
    name: string;
    slug: string;
    mode: string;
    status: string;
    storedStatus: string;
    host: string | null;
    machineLabel: string | null;
    lastHeartbeatAt: string | null;
    capabilities: unknown;
    queueItems: number;
    events: number;
    createdAt: string;
    updatedAt: string;
  };
};

type ProvisionResult = {
  runner: { id: string; name: string; slug: string; mode: string };
  token: string;
  rotated: boolean;
};

function formatCapabilities(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'Sin handshake todavía';
  return Object.entries(value as Record<string, unknown>)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([key]) => key)
    .join(' · ') || 'Sin capacidades reportadas';
}

export function StudioRunnerPanel({ initialSnapshot }: { initialSnapshot: RunnerSnapshot }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [pairing, setPairing] = useState<ProvisionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const bootstrap = useMemo(() => {
    if (!pairing || typeof window === 'undefined') return null;
    const baseUrl = window.location.origin;
    return [
      `$env:LUNA_RUNNER_API_BASE_URL="${baseUrl}"`,
      `$env:LUNA_RUNNER_ID="${pairing.runner.id}"`,
      `$env:LUNA_RUNNER_TOKEN="${pairing.token}"`,
      '$env:LUNA_RUNNER_MODE="LOCAL"',
      '$env:LUNA_RUNNER_RUNTIME="CODEX_CLI"',
      '$env:LUNA_RUNNER_MAX_TASK_SECONDS="1200"',
      'npm run luna:runner:build',
      'npm run luna:runner:start'
    ].join('\n');
  }, [pairing]);

  const refresh = () => {
    startTransition(async () => {
      setError(null);
      const response = await fetch('/api/admin/programming/runner', { cache: 'no-store' });
      const payload = (await response.json().catch(() => ({}))) as { data?: RunnerSnapshot; error?: string };
      if (!response.ok || !payload.data) {
        setError(payload.error ?? 'No se pudo actualizar el estado del runner.');
        return;
      }
      setSnapshot(payload.data);
    });
  };

  const provision = (action: 'provision' | 'rotate') => {
    setError(null);
    if (action === 'rotate') {
      const confirmed = window.confirm(
        'Rotar la credencial invalida inmediatamente el token anterior del Trends Engineering Runner. ¿Continuar?'
      );
      if (!confirmed) return;
    }

    startTransition(async () => {
      const response = await fetch('/api/admin/programming/runner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const payload = (await response.json().catch(() => ({}))) as { data?: ProvisionResult; error?: string };
      if (!response.ok || !payload.data) {
        setError(payload.error ?? 'No se pudo configurar el runner.');
        return;
      }

      setPairing(payload.data);
      const snapshotResponse = await fetch('/api/admin/programming/runner', { cache: 'no-store' });
      const snapshotPayload = (await snapshotResponse.json().catch(() => ({}))) as { data?: RunnerSnapshot };
      if (snapshotResponse.ok && snapshotPayload.data) setSnapshot(snapshotPayload.data);
    });
  };

  const status = snapshot.runner?.status ?? 'NOT_CONFIGURED';
  const online = status === 'ONLINE' || status === 'BUSY';

  return (
    <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Execution Plane</p>
          <h4 className="mt-2 text-xl font-semibold">Trends Engineering Runner</h4>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Runner interno exclusivo de Engineering Studio. Reclama tareas aprobadas, ejecuta Codex en la rama asignada y devuelve progreso, archivos y commit al Project Vault.
          </p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${online ? 'bg-emerald-50 text-emerald-700' : status === 'NOT_CONFIGURED' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700'}`}>
          {status}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Tenant interno', snapshot.tenantSlug],
          ['Heartbeat', snapshot.runner?.lastHeartbeatAt ? new Date(snapshot.runner.lastHeartbeatAt).toLocaleString() : 'Sin señal'],
          ['Cola asociada', String(snapshot.runner?.queueItems ?? 0)],
          ['Eventos', String(snapshot.runner?.events ?? 0)]
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="mt-1 break-all text-sm font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {snapshot.runner ? (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
          <strong>Runner:</strong> {snapshot.runner.name} · {snapshot.runner.mode}
          <br />
          <strong>Host:</strong> {snapshot.runner.machineLabel ?? snapshot.runner.host ?? 'Pendiente de handshake'}
          <br />
          <strong>Capacidades:</strong> {formatCapabilities(snapshot.runner.capabilities)}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        {!snapshot.configured ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => provision('provision')}
            className="rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
          >
            {isPending ? 'Configurando...' : 'Crear Trends Engineering Runner'}
          </button>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => provision('rotate')}
            className="rounded-full border border-amber-300 px-5 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50"
          >
            Rotar credencial
          </button>
        )}
        <button
          type="button"
          disabled={isPending}
          onClick={refresh}
          className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-900"
        >
          Actualizar estado
        </button>
      </div>

      {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}

      {pairing && bootstrap ? (
        <div className="mt-6 space-y-3">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <strong>Token de un solo uso visual.</strong> Cópialo ahora al PC/VPS del runner. Al salir o recargar esta pantalla no se podrá recuperar; solo rotarlo.
          </div>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
            <code>{bootstrap}</code>
          </pre>
          <p className="text-xs leading-5 text-slate-500">
            El host necesita Git, Node.js y Codex CLI autenticados. Este bloque no despliega producción ni autoriza merges a main.
          </p>
        </div>
      ) : null}
    </section>
  );
}
