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
        setError(payload.error ?? "No se pudo crear el runner.");
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
            <CardTitle>Cola pendiente</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{queueSummary.pending}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>En proceso</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{queueSummary.processing}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fallidas recientes</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{queueSummary.failed}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Runners registrados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {runners.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Aun no hay runners. Registra el primero para empezar a reclamar tareas de la cola.
                </p>
              ) : (
                runners.map((runner) => (
                  <div key={runner.id} className="rounded-2xl border border-slate-200 px-4 py-4 text-sm dark:border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{runner.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {runner.slug} · {runner.mode} · {runner.machineLabel ?? runner.host ?? "sin label"}
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {runner.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span>Queue items: {runner._count.queueItems}</span>
                      <span>Eventos: {runner._count.events}</span>
                      <span>
                        Heartbeat:{" "}
                        {runner.lastHeartbeatAt ? new Date(runner.lastHeartbeatAt).toLocaleString() : "sin señal"}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Link
                        href={`/${locale}/dashboard/agents/luna-code-orchestrator/runners/${runner.id}`}
                        className="text-sm font-semibold text-blue-600 hover:underline"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Eventos recientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentEvents.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No hay eventos todavia.</p>
              ) : (
                recentEvents.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {event.runner.name} · {event.type}
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
              <CardTitle>Crear runner local</CardTitle>
            </CardHeader>
            <CardContent>
              {!canManage ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Solo TENANT_ADMIN o ROOT pueden crear runners.
                </p>
              ) : (
                <form onSubmit={submitRunner} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="runner-name">Nombre</Label>
                    <Input id="runner-name" value={name} onChange={(event) => handleNameChange(event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="runner-slug">Slug</Label>
                    <Input id="runner-slug" value={slug} onChange={(event) => setSlug(event.target.value)} required />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="runner-mode">Modo</Label>
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
                      <Input id="runner-machine" value={machineLabel} onChange={(event) => setMachineLabel(event.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="runner-host">Host</Label>
                    <Input id="runner-host" value={host} onChange={(event) => setHost(event.target.value)} />
                  </div>
                  {error ? <p className="text-sm text-red-500">{error}</p> : null}
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Creando..." : "Crear runner"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pairing y bootstrap</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pairing ? (
                <>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                    Token generado para <span className="font-semibold">{pairing.slug}</span>. Guardalo ahora: no se vuelve a mostrar.
                  </div>
                  <pre className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs text-slate-100 dark:border-slate-800">
                    <code>{bootstrapSnippet}</code>
                  </pre>
                </>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Crea un runner para obtener el token de emparejamiento y el bloque de arranque.
                </p>
              )}
              <div className="rounded-2xl border border-slate-200 px-4 py-4 text-sm dark:border-slate-800">
                <div className="font-semibold text-slate-900 dark:text-white">Flujo recomendado</div>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-600 dark:text-slate-300">
                  <li>Registra el runner desde este panel.</li>
                  <li>Ejecuta el bloque de variables en la maquina local o VPS.</li>
                  <li>Construye y arranca `packages/luna-runner`.</li>
                  <li>Verifica el heartbeat en el detalle del runner.</li>
                  <li>Crea una tarea y deja que el runner la reclame.</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
