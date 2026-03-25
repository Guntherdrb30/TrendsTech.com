"use client";

import { useMemo, useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
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
  const locale = useLocale();
  const isEs = locale.startsWith('es');
  const [rows, setRows] = useState<InstallItem[]>(installs);
  const [agentInstanceId, setAgentInstanceId] = useState(agentInstances[0]?.id ?? '');
  const [domainsInput, setDomainsInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [editedDomains, setEditedDomains] = useState<Record<string, string>>({});

  const hasAgents = agentInstances.length > 0;
  const selectClassName =
    'interactive-field h-11 w-full rounded-2xl border border-slate-200 bg-white/96 px-4 text-sm text-slate-900 shadow-[0_14px_35px_-28px_rgba(15,23,42,0.35)] outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200';
  const textareaClassName =
    'interactive-field min-h-[96px] w-full rounded-[22px] border border-slate-200 bg-white/96 p-4 text-sm text-slate-900 shadow-[0_14px_35px_-28px_rgba(15,23,42,0.35)] outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200';

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
      setError(isEs ? 'Selecciona un agente.' : 'Select an agent.');
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
        setError(payload?.error ?? (isEs ? 'No se pudo crear la instalacion.' : 'Could not create install.'));
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
        setError(payload?.error ?? (isEs ? 'No se pudieron actualizar los dominios.' : 'Could not update domains.'));
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
      setError(isEs ? 'No se pudo copiar el script.' : 'Could not copy the script.');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="interactive-panel space-y-4 rounded-[28px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.24)]">
        <div className="space-y-2">
          <Label htmlFor="agentInstanceId">{isEs ? 'Agente' : 'Agent'}</Label>
          <select
            id="agentInstanceId"
            className={selectClassName}
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
              <option value="">{isEs ? 'No hay agentes disponibles' : 'No agents available'}</option>
            )}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="allowedDomains">{isEs ? 'Dominios permitidos' : 'Allowed domains'}</Label>
          <textarea
            id="allowedDomains"
            className={textareaClassName}
            value={domainsInput}
            onChange={(event) => setDomainsInput(event.target.value)}
            placeholder="miempresa.com&#10;app.miempresa.com"
          />
        </div>
        <Button type="submit" disabled={pending || !hasAgents}>
          {isEs ? 'Crear instalacion' : 'Create install'}
        </Button>
      </form>

      {error ? (
        <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        {rows.length === 0 ? (
          <div className="interactive-panel rounded-[24px] border border-dashed border-black/10 bg-slate-50/80 px-5 py-6 text-sm text-slate-500">
            {isEs ? 'No hay instalaciones todavia. Crea la primera para generar el script y los dominios permitidos.' : 'No installs yet. Create the first one to generate the script and allowed domains.'}
          </div>
        ) : (
          rows.map((install) => {
            const domainValue = editedDomains[install.publicKey] ?? install.allowedDomains.join('\n');
            return (
              <div
                key={install.id}
                className="interactive-panel space-y-4 rounded-[28px] border border-black/8 bg-white/92 p-5 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.24)]"
              >
                <div className="flex flex-col gap-2 text-sm md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{install.agentInstance.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      installId: <span className="font-mono">{install.publicKey}</span>
                    </p>
                  </div>
                  <div className="rounded-full border border-black/8 bg-white/88 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {install.status}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`domains-${install.id}`}>{isEs ? 'Dominios' : 'Domains'}</Label>
                  <textarea
                    id={`domains-${install.id}`}
                    className={textareaClassName}
                    value={domainValue}
                    onChange={(event) =>
                      setEditedDomains((prev) => ({ ...prev, [install.publicKey]: event.target.value }))
                    }
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" disabled={pending} onClick={() => handleSaveDomains(install)}>
                    {isEs ? 'Guardar dominios' : 'Save domains'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => handleCopy(install.publicKey)}>
                    {isEs ? 'Copiar script' : 'Copy script'}
                  </Button>
                </div>

                <div className="rounded-[22px] border border-dashed border-black/10 bg-slate-50/90 p-4 text-xs font-mono leading-relaxed text-slate-600">
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
