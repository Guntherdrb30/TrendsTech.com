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
      ? `${snapshot.usage.tasksCreated} / ilimitado`
      : `${snapshot.usage.tasksCreated} / ${snapshot.policy.taskLimit}`;
  const projectLabel =
    snapshot.policy.projectLimit === null
      ? `${snapshot.usage.activeProjects} / ilimitado`
      : `${snapshot.usage.activeProjects} / ${snapshot.policy.projectLimit}`;

  const submitProvider = (event: React.FormEvent) => {
    event.preventDefault();
    setProviderError(null);

    if (providerLocked) {
      setProviderError("Tu plan actual solo permite un proveedor IA activo. Sube de plan para agregar mas.");
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
        setProviderError(payload.error ?? "No se pudo guardar el proveedor.");
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
      setSessionError("Tu plan actual no habilita sesiones remotas QR.");
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
        setSessionError(payload.error ?? "No se pudo crear la sesion remota.");
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
            <CardTitle>Plan comercial de Luna</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white dark:bg-white dark:text-slate-900">
                {snapshot.policy.sourcePlanKey}
              </div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Estado {snapshot.policy.subscriptionStatus}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm dark:border-slate-800 dark:bg-slate-950/70">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Tareas del mes</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{taskLabel}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm dark:border-slate-800 dark:bg-slate-950/70">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Proyectos activos</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{projectLabel}</div>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { label: "Control remoto QR", enabled: snapshot.policy.supportsRemote },
                { label: "Multiples proveedores IA", enabled: snapshot.policy.supportsMultiProvider },
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
                <Link href={`/${locale}/dashboard/agents/luna-code-orchestrator/billing`}>Ver billing</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/${locale}/pricing`}>Subir de plan</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proveedor IA</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitProvider} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider-type">Proveedor</Label>
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
                <Label htmlFor="provider-label">Etiqueta</Label>
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
                Definir como proveedor por defecto
              </label>
              {providerLocked ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  Tu plan actual ya tiene su cupo de proveedores IA cubierto. Para conectar multiples motores sube a Pro o Enterprise.
                </div>
              ) : null}
              {providerError ? <p className="text-sm text-red-500">{providerError}</p> : null}
              <Button type="submit" disabled={isPending || providerLocked}>
                Guardar proveedor
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Control remoto QR</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expiresInMinutes">Expira en minutos</Label>
              <Input
                id="expiresInMinutes"
                value={expiresInMinutes}
                onChange={(event) => setExpiresInMinutes(event.target.value)}
              />
            </div>
            {remoteLocked ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                El control remoto por QR no esta habilitado para este plan. Activalo desde un upgrade comercial.
              </div>
            ) : null}
            {sessionError ? <p className="text-sm text-red-500">{sessionError}</p> : null}
            <Button type="button" onClick={createRemoteSession} disabled={isPending || remoteLocked}>
              Generar sesion remota
            </Button>
            {activeRemoteUrl && activeQrDataUrl ? (
              <div className="space-y-3 rounded-2xl border border-slate-200 p-4 text-sm dark:border-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeQrDataUrl} alt="QR remoto" className="h-56 w-56 rounded-xl border border-slate-200" />
                <div className="break-all text-xs text-slate-500 dark:text-slate-400">{activeRemoteUrl}</div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Proveedores guardados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {providers.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Aun no hay proveedores IA.</p>
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
                        default
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Base URL: {item.baseUrl ?? "provider default"}
                  </div>
                </div>
              ))
            )}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
              Proveedores activos: {snapshot.usage.activeProviders}. Runners activos: {snapshot.usage.activeRunners}.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sesiones remotas recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No hay sesiones recientes.</p>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="rounded-2xl border border-slate-200 px-4 py-4 text-sm dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-semibold text-slate-900 dark:text-white">{session.status}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{session.createdAt.toISOString()}</div>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Expira: {session.expiresAt.toISOString()}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Ultima actividad: {session.lastSeenAt?.toISOString() ?? "sin actividad"}
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
