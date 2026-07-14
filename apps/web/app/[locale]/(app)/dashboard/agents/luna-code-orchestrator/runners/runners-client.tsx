"use client";

import Link from "next/link";
import { DevRunnerMode, type DevRunner, type DevRunnerEvent } from "@trends172tech/db";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SafeRunner = DevRunner & {
  _count: {
    queueItems: number;
    events: number;
  };
};

type SafeEvent = DevRunnerEvent & {
  runner: {
    id: string;
    name: string;
    status: string;
  };
  task: {
    id: string;
    title: string;
  } | null;
};

export function RunnersClient({
  locale,
  canManage,
  originHint,
  runners,
  recentEvents,
  queueSummary
}: {
  locale: string;
  canManage: boolean;
  originHint: string;
  runners: SafeRunner[];
  recentEvents: SafeEvent[];
  queueSummary: {
    pending: number;
    processing: number;
    failed: number;
  };
}) {
  const isEs = locale.startsWith("es");
  const tr = (es: string, en: string) => (isEs ? es : en);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pairing, setPairing] = useState<{ id: string; slug: string; token: string } | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [mode, setMode] = useState<DevRunnerMode>(DevRunnerMode.LOCAL);
  const [machineLabel, setMachineLabel] = useState("");
  const [host, setHost] = useState("");

  const bootstrapSnippet = useMemo(() => {
    if (!pairing) {
      return null;
    }

    return [
      `$env:LUNA_RUNNER_API_BASE_URL="${originHint}"`,
      `$env:LUNA_RUNNER_ID="${pairing.id}"`,
      `$env:LUNA_RUNNER_TOKEN="${pairing.token}"`,
      `$env:LUNA_RUNNER_MODE="${mode}"`,
      `$env:LUNA_RUNNER_RUNTIME="DRY_RUN"`,
      "npm run luna:runner:build",
      "npm run luna:runner:start"
    ].join("\n");
  }, [originHint, mode, pairing]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60)
      );
    }
  };

  const submitRunner = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/luna-agent/runners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          mode,
          machineLabel,
          host
        })
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        token?: string;
        data?: { id: string; slug: string };
      };

      if (!response.ok || !payload.data || !payload.token) {
        setError(payload.error ?? tr("No se pudo crear el runner.", "The runner could not be created."));
        return;
      }

      setPairing({
        id: payload.data.id,
        slug: payload.data.slug,
        token: payload.token
      });
      setName("");
      setSlug("");
      setMachineLabel("");
      setHost("");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{tr("Cola pendiente", "Pending queue")}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{queueSummary.pending}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{tr("En proceso", "Processing")}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{queueSummary.processing}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{tr("Fallidas recientes", "Recent failures")}</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{queueSummary.failed}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{tr("Runners registrados", "Registered runners")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {runners.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {tr("Aún no hay runners. Registra el primero para empezar a reclamar tareas de la cola.", "There are no runners yet. Register the first one to begin claiming queued tasks.")}
                </p>
              ) : (
                runners.map((runner) => (
                  <div
                    key={runner.id}
                    className="rounded-2xl border border-slate-200 px-4 py-4 text-sm dark:border-slate-800"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {runner.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {runner.slug} | {runner.mode} | {runner.machineLabel ?? runner.host ?? tr("sin etiqueta", "no label")}
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {runner.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span>{tr("Elementos en cola", "Queue items")}: {runner._count.queueItems}</span>
                      <span>{tr("Eventos", "Events")}: {runner._count.events}</span>
                      <span>
                        Heartbeat:{" "}
                        {runner.lastHeartbeatAt
                          ? new Date(runner.lastHeartbeatAt).toLocaleString()
                          : tr("sin señal", "no signal")}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Link
                        href={`/${locale}/dashboard/agents/luna-code-orchestrator/runners/${runner.id}`}
                        className="text-sm font-semibold text-blue-600 hover:underline"
                      >
                        {tr("Ver detalle", "View details")}
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tr("Eventos recientes", "Recent events")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentEvents.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">{tr("No hay eventos todavía.", "There are no events yet.")}</p>
              ) : (
                recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {event.runner.name} | {event.type}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(event.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">{event.message}</p>
                    {event.task ? (
                      <Link
                        href={`/${locale}/dashboard/agents/luna-code-orchestrator/tasks/${event.task.id}`}
                        className="mt-2 inline-flex text-xs font-semibold text-blue-600 hover:underline"
                      >
                        {event.task.title}
                      </Link>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{tr("Crear runner local", "Create local runner")}</CardTitle>
            </CardHeader>
            <CardContent>
              {!canManage ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {tr("Solo TENANT_ADMIN o ROOT pueden crear runners.", "Only TENANT_ADMIN or ROOT users can create runners.")}
                </p>
              ) : (
                <form onSubmit={submitRunner} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="runner-name">{tr("Nombre", "Name")}</Label>
                    <Input
                      id="runner-name"
                      value={name}
                      onChange={(event) => handleNameChange(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="runner-slug">Slug</Label>
                    <Input
                      id="runner-slug"
                      value={slug}
                      onChange={(event) => setSlug(event.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="runner-mode">{tr("Modo", "Mode")}</Label>
                      <select
                        id="runner-mode"
                        className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                        value={mode}
                        onChange={(event) => setMode(event.target.value as DevRunnerMode)}
                      >
                        <option value={DevRunnerMode.LOCAL}>Local</option>
                        <option value={DevRunnerMode.REMOTE}>Remote</option>
                        <option value={DevRunnerMode.GITHUB}>GitHub</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="runner-machine">Machine label</Label>
                      <Input
                        id="runner-machine"
                        value={machineLabel}
                        onChange={(event) => setMachineLabel(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="runner-host">Host</Label>
                    <Input id="runner-host" value={host} onChange={(event) => setHost(event.target.value)} />
                  </div>
                  {error ? <p className="text-sm text-red-500">{error}</p> : null}
                  <Button type="submit" disabled={isPending}>
                    {isPending ? tr("Creando...", "Creating...") : tr("Crear runner", "Create runner")}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tr("Emparejamiento y arranque", "Pairing and bootstrap")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pairing ? (
                <>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                    {tr("Token generado para", "Token generated for")} <span className="font-semibold">{pairing.slug}</span>. {tr("Guárdalo ahora: no se volverá a mostrar.", "Save it now: it will not be displayed again.")}
                  </div>
                  <pre className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs text-slate-100 dark:border-slate-800">
                    <code>{bootstrapSnippet}</code>
                  </pre>
                </>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {tr("Crea un runner para obtener el token de emparejamiento y el bloque de arranque.", "Create a runner to obtain the pairing token and bootstrap block.")}
                </p>
              )}
              <div className="rounded-2xl border border-slate-200 px-4 py-4 text-sm dark:border-slate-800">
                <div className="font-semibold text-slate-900 dark:text-white">{tr("Flujo recomendado", "Recommended flow")}</div>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-600 dark:text-slate-300">
                  <li>{tr("Registra el runner desde este panel.", "Register the runner from this dashboard.")}</li>
                  <li>{tr("Ejecuta el bloque de variables en la máquina local o VPS.", "Run the environment block on the local machine or VPS.")}</li>
                  <li>{tr("Construye e inicia `packages/luna-runner`.", "Build and start `packages/luna-runner`.")}</li>
                  <li>{tr("Verifica el heartbeat en el detalle del runner.", "Verify the heartbeat in the runner details.")}</li>
                  <li>{tr("Crea una tarea y deja que el runner la reclame.", "Create a task and let the runner claim it.")}</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
