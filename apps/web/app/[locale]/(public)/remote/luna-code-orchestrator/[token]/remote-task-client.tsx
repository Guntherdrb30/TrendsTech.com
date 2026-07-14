"use client";

import { DevExecutionMode, DevExecutionRuntime, DevTaskPriority, type DevProject } from "@trends172tech/db";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LunaPlanSnapshot } from "@/types/luna-agent";

export function RemoteTaskClient({
  locale,
  token,
  projects,
  plan
}: {
  locale: string;
  token: string;
  projects: Pick<DevProject, "id" | "name">[];
  plan: LunaPlanSnapshot;
}) {
  const isEs = locale.startsWith("es");
  const copy = isEs
    ? {
        createError: "No se pudo crear la tarea remota.",
        created: "Tarea creada y enviada a la cola.",
        project: "Proyecto",
        title: "Título",
        description: "Descripción",
        priority: "Prioridad",
        low: "Baja",
        medium: "Media",
        high: "Alta",
        urgent: "Urgente",
        planDryRun: "Tu plan actual solo permite tareas remotas en modo de prueba.",
        planAdvanced: "Codex CLI requiere un plan avanzado. Usa Shell o sube de plan.",
        submit: "Enviar al agente",
      }
    : {
        createError: "The remote task could not be created.",
        created: "Task created and sent to the queue.",
        project: "Project",
        title: "Title",
        description: "Description",
        priority: "Priority",
        low: "Low",
        medium: "Medium",
        high: "High",
        urgent: "Urgent",
        planDryRun: "Your current plan only supports remote tasks in dry-run mode.",
        planAdvanced: "Codex CLI requires an advanced plan. Use Shell or upgrade your plan.",
        submit: "Send to agent",
      };
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [priority, setPriority] = useState<DevTaskPriority>(DevTaskPriority.MEDIUM);
  const [runtime, setRuntime] = useState<DevExecutionRuntime>(DevExecutionRuntime.DRY_RUN);
  const supportsRunnerExecution = plan.supportsRunnerExecution;
  const supportsAdvancedRuntime = plan.supportsAdvancedRuntime;

  const submitTask = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setError(null);

    const response = await fetch(`/api/luna-agent/remote/${token}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        prompt,
        projectId,
        priority,
        executionMode: DevExecutionMode.REMOTE,
        runtime
      })
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? copy.createError);
      return;
    }

    setTitle("");
    setDescription("");
    setPrompt("");
    setStatus(copy.created);
  };

  return (
    <form onSubmit={submitTask} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="remote-project">{copy.project}</Label>
        <select
          id="remote-project"
          className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm"
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
          required
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="remote-title">{copy.title}</Label>
        <Input id="remote-title" value={title} onChange={(event) => setTitle(event.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="remote-description">{copy.description}</Label>
        <textarea
          id="remote-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          className="min-h-24 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-400"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="remote-prompt">Prompt</Label>
        <textarea
          id="remote-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={5}
          className="min-h-32 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-400"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="remote-priority">{copy.priority}</Label>
        <select
          id="remote-priority"
          className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm"
          value={priority}
          onChange={(event) => setPriority(event.target.value as DevTaskPriority)}
        >
          <option value={DevTaskPriority.LOW}>{copy.low}</option>
          <option value={DevTaskPriority.MEDIUM}>{copy.medium}</option>
          <option value={DevTaskPriority.HIGH}>{copy.high}</option>
          <option value={DevTaskPriority.URGENT}>{copy.urgent}</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="remote-runtime">Runtime</Label>
        <select
          id="remote-runtime"
          className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm"
          value={runtime}
          onChange={(event) => setRuntime(event.target.value as DevExecutionRuntime)}
        >
          <option value={DevExecutionRuntime.DRY_RUN}>Dry run</option>
          <option value={DevExecutionRuntime.SHELL} disabled={!supportsRunnerExecution}>
            Shell
          </option>
          <option value={DevExecutionRuntime.CODEX_CLI} disabled={!supportsAdvancedRuntime}>
            Codex CLI
          </option>
        </select>
      </div>
      {!supportsRunnerExecution ? (
        <p className="text-xs text-amber-700">
          {copy.planDryRun}
        </p>
      ) : null}
      {supportsRunnerExecution && !supportsAdvancedRuntime ? (
        <p className="text-xs text-amber-700">
          {copy.planAdvanced}
        </p>
      ) : null}
      {status ? <p className="text-sm text-emerald-600">{status}</p> : null}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <Button type="submit">{copy.submit}</Button>
    </form>
  );
}
