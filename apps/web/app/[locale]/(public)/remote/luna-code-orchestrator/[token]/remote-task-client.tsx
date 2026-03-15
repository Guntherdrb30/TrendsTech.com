"use client";

import { DevExecutionMode, DevExecutionRuntime, DevTaskPriority, type DevProject } from "@trends172tech/db";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RemoteTaskClient({
  token,
  projects
}: {
  token: string;
  projects: Pick<DevProject, "id" | "name">[];
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [priority, setPriority] = useState<DevTaskPriority>(DevTaskPriority.MEDIUM);
  const [runtime, setRuntime] = useState<DevExecutionRuntime>(DevExecutionRuntime.DRY_RUN);

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
      setError(payload.error ?? "No se pudo crear la tarea remota.");
      return;
    }

    setTitle("");
    setDescription("");
    setPrompt("");
    setStatus("Tarea creada y enviada a la cola.");
  };

  return (
    <form onSubmit={submitTask} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="remote-project">Proyecto</Label>
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
        <Label htmlFor="remote-title">Titulo</Label>
        <Input id="remote-title" value={title} onChange={(event) => setTitle(event.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="remote-description">Descripcion</Label>
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
        <Label htmlFor="remote-priority">Prioridad</Label>
        <select
          id="remote-priority"
          className="h-10 w-full rounded border border-slate-200 bg-white px-3 text-sm"
          value={priority}
          onChange={(event) => setPriority(event.target.value as DevTaskPriority)}
        >
          <option value={DevTaskPriority.LOW}>Low</option>
          <option value={DevTaskPriority.MEDIUM}>Medium</option>
          <option value={DevTaskPriority.HIGH}>High</option>
          <option value={DevTaskPriority.URGENT}>Urgent</option>
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
          <option value={DevExecutionRuntime.SHELL}>Shell</option>
          <option value={DevExecutionRuntime.CODEX_CLI}>Codex CLI</option>
        </select>
      </div>
      {status ? <p className="text-sm text-emerald-600">{status}</p> : null}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <Button type="submit">Enviar al agente</Button>
    </form>
  );
}
