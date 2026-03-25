"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const parseDomains = (value: string) =>
  value
    .split(/[\n,]+/)
    .map((part) => part.trim())
    .filter(Boolean);

const mapAccessToRow = (access: AgentAccessItem): AccessRow => ({
  id: access.id,
  name: access.name,
  allowedDomainsText: access.allowedDomains.join("\n"),
  isActive: access.isActive,
  maxTokensInput: access.maxTokensPerMonth != null ? String(access.maxTokensPerMonth) : ""
});

type AgentAccessItem = {
  id: string;
  agentId: string;
  name: string;
  allowedDomains: string[];
  isActive: boolean;
  maxTokensPerMonth: number | null;
};

type AccessRow = {
  id: string;
  name: string;
  allowedDomainsText: string;
  isActive: boolean;
  maxTokensInput: string;
};

type AgentAccessManagerProps = {
  agentInstanceId: string;
  agentName: string;
  agentAccesses: AgentAccessItem[];
};

export function AgentAccessManager({ agentInstanceId, agentName, agentAccesses }: AgentAccessManagerProps) {
  const locale = useLocale();
  const isEs = locale.startsWith("es");
  const [rows, setRows] = useState<AccessRow[]>(() => agentAccesses.map(mapAccessToRow));
  const [nameInput, setNameInput] = useState("");
  const [domainsInput, setDomainsInput] = useState("");
  const [maxTokensInput, setMaxTokensInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaClassName =
    "interactive-field min-h-[96px] w-full rounded-[22px] border border-slate-200 bg-white/96 p-4 text-sm text-slate-900 shadow-[0_14px_35px_-28px_rgba(15,23,42,0.35)] outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200";

  const uiCopy = isEs
    ? {
        summaryEmpty: "No hay accesos configurados.",
        summaryTotal: "Total accesos: {count}",
        nameRequired: "Escribe un nombre para el acceso.",
        maxTokensPositive: "Max tokens debe ser un numero positivo.",
        createError: "No se pudo crear el acceso.",
        nameEmpty: "El nombre no puede quedar vacio.",
        maxTokensValid: "Max tokens debe ser un numero valido.",
        updateError: "No se pudo actualizar el acceso.",
        title: "Accesos para {agentName}",
        name: "Nombre",
        descriptiveName: "Nombre descriptivo",
        maxTokens: "Max tokens/mes",
        optional: "Opcional",
        allowedDomains: "Dominios permitidos",
        createAccess: "Crear acceso",
        emptyState: "No hay accesos configurados. Crea el primero para controlar dominios, estado y consumo.",
        accessId: "ID de acceso",
        active: "Activo",
        domains: "Dominios",
        save: "Guardar"
      }
    : {
        summaryEmpty: "No access rules configured.",
        summaryTotal: "Total accesses: {count}",
        nameRequired: "Enter a name for the access rule.",
        maxTokensPositive: "Max tokens must be a positive number.",
        createError: "Unable to create the access rule.",
        nameEmpty: "Name cannot be empty.",
        maxTokensValid: "Max tokens must be a valid number.",
        updateError: "Unable to update the access rule.",
        title: "Access rules for {agentName}",
        name: "Name",
        descriptiveName: "Descriptive name",
        maxTokens: "Max tokens/month",
        optional: "Optional",
        allowedDomains: "Allowed domains",
        createAccess: "Create access",
        emptyState: "No access rules configured. Create the first one to control domains, status, and consumption.",
        accessId: "accessId",
        active: "Active",
        domains: "Domains",
        save: "Save"
      };

  const summary = useMemo(() => {
    if (rows.length === 0) {
      return uiCopy.summaryEmpty;
    }
    return uiCopy.summaryTotal.replace("{count}", String(rows.length));
  }, [rows.length, uiCopy.summaryEmpty, uiCopy.summaryTotal]);

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      setError(uiCopy.nameRequired);
      return;
    }
    const allowedDomains = parseDomains(domainsInput);
    const payload: Record<string, unknown> = {
      agentId: agentInstanceId,
      name: trimmedName,
      allowedDomains,
      isActive: true
    };
    if (maxTokensInput.trim()) {
      const maxTokens = Number(maxTokensInput);
      if (!Number.isFinite(maxTokens) || maxTokens < 0) {
        setError(uiCopy.maxTokensPositive);
        return;
      }
      payload.maxTokensPerMonth = Math.floor(maxTokens);
    }

    startTransition(async () => {
      const response = await fetch("/api/agent-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? uiCopy.createError);
        return;
      }
      const body = await response.json();
      setRows((prev) => [mapAccessToRow(body.data), ...prev]);
      setNameInput("");
      setDomainsInput("");
      setMaxTokensInput("");
    });
  };

  const handleSave = (row: AccessRow) => {
    setError(null);
    const trimmedName = row.name.trim();
    if (!trimmedName) {
      setError(uiCopy.nameEmpty);
      return;
    }
    const allowedDomains = parseDomains(row.allowedDomainsText);
    const payload: Record<string, unknown> = {
      name: trimmedName,
      allowedDomains,
      isActive: row.isActive
    };
    if (row.maxTokensInput.trim()) {
      const maxTokens = Number(row.maxTokensInput);
      if (!Number.isFinite(maxTokens) || maxTokens < 0) {
        setError(uiCopy.maxTokensValid);
        return;
      }
      payload.maxTokensPerMonth = Math.floor(maxTokens);
    } else {
      payload.maxTokensPerMonth = null;
    }

    startTransition(async () => {
      const response = await fetch(`/api/agent-access/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? uiCopy.updateError);
        return;
      }
      const body = await response.json();
      setRows((prev) => prev.map((item) => (item.id === row.id ? mapAccessToRow(body.data) : item)));
    });
  };

  const updateField = (id: string, field: keyof AccessRow, value: string | boolean) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{uiCopy.title.replace("{agentName}", agentName)}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{summary}</p>
      </div>
      <form
        onSubmit={handleCreate}
        className="interactive-panel space-y-4 rounded-[28px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.24)]"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="access-name">{uiCopy.name}</Label>
            <Input
              id="access-name"
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              placeholder={uiCopy.descriptiveName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="access-max-tokens">{uiCopy.maxTokens}</Label>
            <Input
              id="access-max-tokens"
              type="number"
              min={0}
              value={maxTokensInput}
              onChange={(event) => setMaxTokensInput(event.target.value)}
              placeholder={uiCopy.optional}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="access-domains">{uiCopy.allowedDomains}</Label>
          <textarea
            id="access-domains"
            className={textareaClassName}
            value={domainsInput}
            onChange={(event) => setDomainsInput(event.target.value)}
            placeholder="miempresa.com\napp.miempresa.com"
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {uiCopy.createAccess}
        </Button>
        {error ? (
          <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}
      </form>
      {rows.length === 0 ? (
        <div className="interactive-panel rounded-[24px] border border-dashed border-black/10 bg-slate-50/80 px-5 py-6 text-sm text-slate-500">
          {uiCopy.emptyState}
        </div>
      ) : null}
      {rows.map((row) => {
        const baseId = `access-${row.id}`;
        return (
          <div
            key={row.id}
            className="interactive-panel space-y-4 rounded-[28px] border border-black/8 bg-white/92 p-5 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.24)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>
                {uiCopy.accessId}: <span className="font-mono">{row.id}</span>
              </span>
              <Label className="flex items-center gap-2 text-sm" htmlFor={`${baseId}-active`}>
                <input
                  id={`${baseId}-active`}
                  type="checkbox"
                  checked={row.isActive}
                  onChange={(event) => updateField(row.id, "isActive", event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
                />
                {uiCopy.active}
              </Label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${baseId}-name`}>{uiCopy.name}</Label>
                <Input
                  id={`${baseId}-name`}
                  value={row.name}
                  onChange={(event) => updateField(row.id, "name", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${baseId}-tokens`}>{uiCopy.maxTokens}</Label>
                <Input
                  id={`${baseId}-tokens`}
                  type="number"
                  min={0}
                  value={row.maxTokensInput}
                  onChange={(event) => updateField(row.id, "maxTokensInput", event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${baseId}-domains`}>{uiCopy.domains}</Label>
              <textarea
                id={`${baseId}-domains`}
                className={textareaClassName}
                value={row.allowedDomainsText}
                onChange={(event) => updateField(row.id, "allowedDomainsText", event.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="outline" disabled={isPending} onClick={() => handleSave(row)}>
                {uiCopy.save}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
