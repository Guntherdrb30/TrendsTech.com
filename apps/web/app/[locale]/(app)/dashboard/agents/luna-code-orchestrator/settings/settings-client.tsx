"use client";

import { DevAIProviderType, type DevAIProvider, type RemoteSession } from "@trends172tech/db";
import QRCode from "qrcode";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SafeProvider = Pick<DevAIProvider, "id" | "label" | "provider" | "isActive" | "isDefault" | "baseUrl" | "createdAt">;

type SafeSession = Pick<RemoteSession, "id" | "status" | "createdAt" | "expiresAt" | "lastSeenAt">;

type BillingSnapshot = {
  policy: {
    sourcePlanKey: string;
    planKey: "basic" | "pro" | "enterprise";
    supportsRemote: boolean;
    supportsMultiProvider: boolean;
    supportsRunnerExecution: boolean;
    supportsAdvancedRuntime: boolean;
    taskLimit: number | null;
    projectLimit: number | null;
    subscriptionStatus: string;
  };
  usage: {
    tasksCreated: number;
    activeProjects: number;
    activeProviders: number;
    activeRunners: number;
    remoteSessions: number;
  };
};

export function SettingsClient({
  locale,
  providers,
  sessions,
  snapshot
}: {
  locale: string;
  providers: SafeProvider[];
  sessions: SafeSession[];
  snapshot: BillingSnapshot;
}) {
  const isEs = locale.startsWith("es");
  const tr = (es: string, en: string) => (isEs ? es : en);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [providerError, setProviderError] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [provider, setProvider] = useState<DevAIProviderType>(DevAIProviderType.CODEX);
  const [label, setLabel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [isDefault, setIsDefault] = useState(true);
  const [expiresInMinutes, setExpiresInMinutes] = useState("30");
  const [activeRemoteUrl, setActiveRemoteUrl] = useState<string | null>(null);
  const [activeQrDataUrl, setActiveQrDataUrl] = useState<string | null>(null);
  const providerLocked = !snapshot.policy.supportsMultiProvider && providers.length >= 1;
  const remoteLocked = !snapshot.policy.supportsRemote;
  const taskLabel =
    snapshot.policy.taskLimit === null
      ? `${snapshot.usage.tasksCreated} / ${tr("ilimitado", "unlimited")}`
      : `${snapshot.usage.tasksCreated} / ${snapshot.policy.taskLimit}`;
  const projectLabel =
    snapshot.policy.projectLimit === null
      ? `${snapshot.usage.activeProjects} / ${tr("ilimitado", "unlimited")}`
      : `${snapshot.usage.activeProjects} / ${snapshot.policy.projectLimit}`;

  const submitProvider = (event: React.FormEvent) => {
    event.preventDefault();
    setProviderError(null);

    if (providerLocked) {
      setProviderError(tr("Tu plan actual solo permite un proveedor IA activo. Sube de plan para agregar más.", "Your current plan only allows one active AI provider. Upgrade to add more."));
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/luna-agent/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          label,
          apiKey,
          baseUrl,
          isDefault
        })
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setProviderError(payload.error ?? tr("No se pudo guardar el proveedor.", "The provider could not be saved."));
        return;
      }

      setLabel("");
      setApiKey("");
      setBaseUrl("");
      router.refresh();
    });
  };

  const createRemoteSession = () => {
    setSessionError(null);

    if (remoteLocked) {
      setSessionError(tr("Tu plan actual no habilita sesiones remotas QR.", "Your current plan does not include remote QR sessions."));
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/luna-agent/remote-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expiresInMinutes: Number.parseInt(expiresInMinutes, 10) || 30
        })
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        data?: { token: string };
      };

      if (!response.ok || !payload.data?.token) {
        setSessionError(payload.error ?? tr("No se pudo crear la sesión remota.", "The remote session could not be created."));
        return;
      }

      const remoteUrl = `${window.location.origin}/${locale}/remote/luna-code-orchestrator/${payload.data.token}`;
      const qrDataUrl = await QRCode.toDataURL(remoteUrl, {
        margin: 1,
        width: 280
      });

      setActiveRemoteUrl(remoteUrl);
      setActiveQrDataUrl(qrDataUrl);
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <Card className="border-slate-200/90 bg-gradient-to-br from-white via-slate-50 to-amber-50 dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
          <CardHeader>
            <CardTitle>{tr("Plan comercial de Luna", "Luna commercial plan")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white dark:bg-white dark:text-slate-900">
                {snapshot.policy.sourcePlanKey}
              </div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {tr("Estado", "Status")} {snapshot.policy.subscriptionStatus}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm dark:border-slate-800 dark:bg-slate-950/70">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{tr("Tareas del mes", "Tasks this month")}</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{taskLabel}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm dark:border-slate-800 dark:bg-slate-950/70">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{tr("Proyectos activos", "Active projects")}</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{projectLabel}</div>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { label: tr("Control remoto QR", "QR remote control"), enabled: snapshot.policy.supportsRemote },
                { label: tr("Múltiples proveedores IA", "Multiple AI providers"), enabled: snapshot.policy.supportsMultiProvider },
                { label: "Runners", enabled: snapshot.policy.supportsRunnerExecution },
                { label: "Codex CLI", enabled: snapshot.policy.supportsAdvancedRuntime }
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] ${
                    item.enabled
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <Button asChild size="sm">
                <Link href={`/${locale}/dashboard/agents/luna-code-orchestrator/billing`}>{tr("Ver facturación", "View billing")}</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/${locale}/pricing`}>{tr("Subir de plan", "Upgrade plan")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tr("Proveedor IA", "AI provider")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitProvider} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider-type">{tr("Proveedor", "Provider")}</Label>
                <select
                  id="provider-type"
                  className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                  value={provider}
                  onChange={(event) => setProvider(event.target.value as DevAIProviderType)}
                >
                  <option value={DevAIProviderType.CODEX}>Codex</option>
                  <option value={DevAIProviderType.CLAUDE}>Claude</option>
                  <option value={DevAIProviderType.CUSTOM}>Custom</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider-label">{tr("Etiqueta", "Label")}</Label>
                <Input id="provider-label" value={label} onChange={(event) => setLabel(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider-api-key">API key</Label>
                <Input id="provider-api-key" value={apiKey} onChange={(event) => setApiKey(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider-base-url">Base URL</Label>
                <Input id="provider-base-url" value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} />
                {tr("Definir como proveedor por defecto", "Set as default provider")}
              </label>
              {providerLocked ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  {tr("Tu plan actual ya alcanzó su límite de proveedores IA. Para conectar múltiples motores, sube a Pro o Enterprise.", "Your current plan has reached its AI provider limit. Upgrade to Pro or Enterprise to connect multiple engines.")}
                </div>
              ) : null}
              {providerError ? <p className="text-sm text-red-500">{providerError}</p> : null}
              <Button type="submit" disabled={isPending || providerLocked}>
                {tr("Guardar proveedor", "Save provider")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tr("Control remoto QR", "QR remote control")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expiresInMinutes">{tr("Expira en minutos", "Expires in minutes")}</Label>
              <Input
                id="expiresInMinutes"
                value={expiresInMinutes}
                onChange={(event) => setExpiresInMinutes(event.target.value)}
              />
            </div>
            {remoteLocked ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                {tr("El control remoto por QR no está habilitado para este plan. Actívalo mediante una mejora de plan.", "QR remote control is not enabled for this plan. Enable it by upgrading your plan.")}
              </div>
            ) : null}
            {sessionError ? <p className="text-sm text-red-500">{sessionError}</p> : null}
            <Button type="button" onClick={createRemoteSession} disabled={isPending || remoteLocked}>
              {tr("Generar sesión remota", "Generate remote session")}
            </Button>
            {activeRemoteUrl && activeQrDataUrl ? (
              <div className="space-y-3 rounded-2xl border border-slate-200 p-4 text-sm dark:border-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeQrDataUrl} alt={tr("QR remoto", "Remote QR code")} className="h-56 w-56 rounded-xl border border-slate-200" />
                <div className="break-all text-xs text-slate-500 dark:text-slate-400">{activeRemoteUrl}</div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{tr("Proveedores guardados", "Saved providers")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {providers.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{tr("Aún no hay proveedores IA.", "There are no AI providers yet.")}</p>
            ) : (
              providers.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 px-4 py-4 text-sm dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{item.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{item.provider}</div>
                    </div>
                    {item.isDefault ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                        {tr("por defecto", "default")}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Base URL: {item.baseUrl ?? tr("valor por defecto del proveedor", "provider default")}
                  </div>
                </div>
              ))
            )}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
              {tr("Proveedores activos", "Active providers")}: {snapshot.usage.activeProviders}. {tr("Runners activos", "Active runners")}: {snapshot.usage.activeRunners}.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tr("Sesiones remotas recientes", "Recent remote sessions")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{tr("No hay sesiones recientes.", "There are no recent sessions.")}</p>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="rounded-2xl border border-slate-200 px-4 py-4 text-sm dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-semibold text-slate-900 dark:text-white">{session.status}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{session.createdAt.toISOString()}</div>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {tr("Expira", "Expires")}: {session.expiresAt.toISOString()}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {tr("Última actividad", "Last activity")}: {session.lastSeenAt?.toISOString() ?? tr("sin actividad", "no activity")}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
