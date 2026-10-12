import { randomUUID } from 'node:crypto';
import { createLunaUsageReporter } from './usage-reporter.mjs';

// Install only on the server. No provider credentials, prompts or outputs are transmitted.
export function createLunaControl({ endpoint, token, enabled = false, gatewayEnabled = false, fetchImpl = fetch, onTelemetryError = () => {} }) {
  if (!enabled) return { run: (_metadata, operation) => operation() };
  const report = createLunaUsageReporter({ endpoint, token, fetchImpl });
  const url = new URL(endpoint);
  async function gateway(action, body) {
    const response = await fetchImpl(new URL(`/api/luna-ai-control/gateway/${action}`, url), {
      method: 'POST', redirect: 'error', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(body), signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`LUNA gateway rejected request (HTTP ${response.status})`);
    return response.json();
  }
  return {
    async run(metadata, operation) {
      const operationId = randomUUID();
      const lease = gatewayEnabled ? await gateway('reserve', { agent: metadata.agent, operationId }) : null;
      const started = new Date(); let status = 'success';
      try { return await operation(); }
      catch (error) { status = 'error'; throw error; }
      finally {
        const completed = new Date();
        // Explicit allowlist: never forward arbitrary metadata, output or error messages.
        const event = { operationId, platform: metadata.platform, module: metadata.module,
          action: metadata.action, provider: metadata.provider, model: metadata.model,
          environment: metadata.environment, startedAt: started.toISOString(), completedAt: completed.toISOString(),
          durationMs: completed - started, status, ...(status === 'error' ? { errorCode: 'PROVIDER_ERROR' } : {}) };
        try { await report(event); } catch { try { onTelemetryError('TELEMETRY_UNAVAILABLE'); } catch {} }
        if (lease) { try { await gateway('release', { leaseId: lease.leaseId }); } catch {} }
      }
    },
  };
}
