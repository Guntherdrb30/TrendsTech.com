"use client";

import { useMemo, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type AgentOption = {
  id: string;
  name: string;
};

type InstallItem = {
  id: string;
  publicKey: string;
  allowedDomains: string[];
  status: 'ACTIVE' | 'DISABLED';
  agentInstance: {
    name: string;
  };
};

type InstallsClientProps = {
  installs: InstallItem[];
  agentInstances: AgentOption[];
  widgetScriptUrl: string;
};

function parseDomains(input: string) {
  return input
    .split(/[\n,]+/)
    .map((domain) => domain.trim())
    .filter(Boolean);
}

export function InstallsClient({ installs, agentInstances, widgetScriptUrl }: InstallsClientProps) {
  const [rows, setRows] = useState<InstallItem[]>(installs);
  const [agentInstanceId, setAgentInstanceId] = useState(agentInstances[0]?.id ?? '');
  const [domainsInput, setDomainsInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [editedDomains, setEditedDomains] = useState<Record<string, string>>({});

  const hasAgents = agentInstances.length > 0;

  const snippet = useMemo(
    () =>
      (installId: string) =>
        `<script src=\"${widgetScriptUrl}\"></script>\\n<script>\\n  Trends172Widget.init({ installId: \"${installId}\" });\\n</script>`,
    [widgetScriptUrl]
  );

  const loadInstalls = async () => {
    const response = await fetch('/api/installs');
    if (!response.ok) {
      return;
    }
    const result = await response.json();
    setRows(result.data ?? []);
  };

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!agentInstanceId) {
      setError('Selecciona un agente.');
      return;
    }

    startTransition(async () => {
      const response = await fetch('/api/installs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentInstanceId,
          allowedDomains: parseDomains(domainsInput)
        })
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error ?? 'No se pudo crear el install.');
        return;
      }

      setDomainsInput('');
      await loadInstalls();
    });
  };

  const handleSaveDomains = (install: InstallItem) => {
    setError(null);
    const value = editedDomains[install.publicKey] ?? install.allowedDomains.join('\n');

    startTransition(async () => {
      const response = await fetch(`/api/installs/${install.publicKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allowedDomains: parseDomains(value)
        })
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error ?? 'No se pudo actualizar dominios.');
        return;
      }

      await loadInstalls();
    });
  };

  const handleCopy = async (installId: string) => {
    const value = snippet(installId);
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      setError('No se pudo copiar el script.');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="agentInstanceId">Agente</Label>
          <select
            id="agentInstanceId"
            className="w-full rounded border border-slate-200 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            value={agentInstanceId}
            onChange={(event) => setAgentInstanceId(event.target.value)}
            disabled={!hasAgents}
          >
            {hasAgents ? (
              agentInstances.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))
            ) : (
              <option value="">No hay agentes disponibles</option>
            )}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="allowedDomains">Dominios permitidos</Label>
          <textarea
            id="allowedDomains"
            className="min-h-[90px] w-full rounded border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            value={domainsInput}
            onChange={(event) => setDomainsInput(event.target.value)}
            placeholder="miempresa.com&#10;app.miempresa.com"
          />
        </div>
        <Button type="submit" disabled={pending || !hasAgents}>
          Crear install
        </Button>
      </form>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No hay installs todavia.</p>
        ) : (
          rows.map((install) => {
            const domainValue = editedDomains[install.publicKey] ?? install.allowedDomains.join('\n');
            return (
              <div key={install.id} className="space-y-3 rounded border border-slate-200 p-4 dark:border-slate-700">
                <div className="flex flex-col gap-2 text-sm md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">{install.agentInstance.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      installId: <span className="font-mono">{install.publicKey}</span>
                    </p>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{install.status}</div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`domains-${install.id}`}>Dominios</Label>
                  <textarea
                    id={`domains-${install.id}`}
                    className="min-h-[80px] w-full rounded border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                    value={domainValue}
                    onChange={(event) =>
                      setEditedDomains((prev) => ({ ...prev, [install.publicKey]: event.target.value }))
                    }
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" disabled={pending} onClick={() => handleSaveDomains(install)}>
                    Guardar dominios
                  </Button>
                  <Button type="button" variant="outline" onClick={() => handleCopy(install.publicKey)}>
                    Copiar script
                  </Button>
                </div>

                <div className="rounded border border-dashed border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  {snippet(install.publicKey)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
