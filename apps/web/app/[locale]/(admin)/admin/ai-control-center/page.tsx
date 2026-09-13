import { requireRole } from '@/lib/auth/guards';
import { getRecentAgentRuns } from '@/lib/agent-platform/observability';

function money(micros: number | null) {
  if (micros === null) return 'Sin medicion';
  return `$${(micros / 1_000_000).toFixed(6)}`;
}

function number(value: number | null) {
  return value === null ? 'Sin medicion' : value.toLocaleString('en-US');
}

export default async function AiControlCenterPage() {
  await requireRole('ROOT');
  const runs = await getRecentAgentRuns({ limit: 50 });
  const successful = runs.filter((run) => run.status === 'SUCCESS').length;
  const failed = runs.filter((run) => run.status === 'FAILED').length;
  const measuredCost = runs.reduce((sum, run) => sum + (run.costUsdMicros ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Trends172 Agent Platform</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">AI Control Center</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
          Observabilidad central de ejecuciones, herramientas MCP, latencia, consumo y errores del runtime de agentes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Runs recientes" value={String(runs.length)} />
        <Metric label="Exitosos" value={String(successful)} />
        <Metric label="Fallidos" value={String(failed)} />
        <Metric label="Costo medido" value={money(measuredCost)} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h3 className="font-semibold text-slate-950 dark:text-white">Runs & Traces</h3>
          <p className="mt-1 text-xs text-slate-500">Ultimas 50 ejecuciones registradas por el control plane.</p>
        </div>
        {runs.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-500">Todavia no hay ejecuciones registradas.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-900">
            {runs.map((run) => (
              <details key={run.id} className="group px-5 py-4">
                <summary className="grid cursor-pointer list-none gap-3 md:grid-cols-[1.2fr_1fr_0.7fr_0.7fr_0.8fr] md:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${run.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">{run.id.slice(0, 8)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{run.createdAt.toLocaleString()}</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{run.agentInstanceId}</p>
                    <p className="text-xs text-slate-500">{run.channel} · {run.mode}</p>
                  </div>
                  <Cell label="Modelo" value={run.model ?? 'Deterministic'} />
                  <Cell label="Latencia" value={`${run.durationMs} ms`} />
                  <Cell label="Costo" value={money(run.costUsdMicros)} />
                </summary>

                <div className="mt-4 grid gap-4 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900/60 md:grid-cols-2 xl:grid-cols-4">
                  <Cell label="Tenant" value={run.tenantId ?? '-'} />
                  <Cell label="Sesion" value={run.sessionId} />
                  <Cell label="Deployment" value={run.deploymentId} />
                  <Cell label="Response ID" value={run.responseId ?? '-'} />
                  <Cell label="Tokens entrada" value={number(run.tokensIn)} />
                  <Cell label="Tokens salida" value={number(run.tokensOut)} />
                  <Cell label="Tokens totales" value={number(run.totalTokens)} />
                  <Cell label="Herramientas" value={String(run.toolCount)} />

                  <div className="md:col-span-2 xl:col-span-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tool trace</p>
                    {run.tools.length === 0 ? (
                      <p className="mt-2 text-slate-500">No se ejecutaron herramientas.</p>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {run.tools.map((tool, index) => (
                          <span key={`${tool.toolName}-${index}`} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs dark:border-slate-700 dark:bg-slate-950">
                            {tool.status === 'SUCCESS' ? '✓' : '✕'} {tool.toolName} · {tool.durationMs} ms
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {run.error ? (
                    <div className="md:col-span-2 xl:col-span-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                      {run.error}
                    </div>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm text-slate-700 dark:text-slate-200" title={value}>{value}</p>
    </div>
  );
}
