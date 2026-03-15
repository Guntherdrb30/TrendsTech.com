"use client";

import { DevAIProviderType, DevExecutionMode, DevTaskPriority, type DevProject } from "@trends172tech/db";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProviderOption = {
  id: string;
  label: string;
  provider: DevAIProviderType;
  isDefault: boolean;
};

export function CreateTaskForm({
  locale,
  projects,
  providers
}: {
  locale: string;
  projects: DevProject[];
  providers: ProviderOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [branch, setBranch] = useState("");
  const [prompt, setPrompt] = useState("");
  const [executionMode, setExecutionMode] = useState<DevExecutionMode>(DevExecutionMode.LOCAL);
  const [priority, setPriority] = useState<DevTaskPriority>(DevTaskPriority.MEDIUM);
  const [aiProvider, setAiProvider] = useState<DevAIProviderType | "">(
    providers.find((provider) => provider.isDefault)?.provider ?? ""
  );

  const submitTask = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/luna-agent/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title,
          description,
          branch,
          prompt,
          executionMode,
          priority,
          aiProvider: aiProvider || undefined
        })
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        data?: { id: string };
      };
      if (!response.ok || !payload.data) {
        setError(payload.error ?? "No se pudo crear la tarea.");
        return;
      }

      router.push(`/${locale}/dashboard/agents/luna-code-orchestrator/tasks/${payload.data.id}`);
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva tarea de desarrollo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submitTask} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-project">Proyecto</Label>
            <select
              id="task-project"
              className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
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
            <Label htmlFor="task-title">Titulo</Label>
            <Input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-description">Descripcion</Label>
            <textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="min-h-28 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="task-priority">Prioridad</Label>
              <select
                id="task-priority"
                className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
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
              <Label htmlFor="task-mode">Modo</Label>
              <select
                id="task-mode"
                className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={executionMode}
                onChange={(event) => setExecutionMode(event.target.value as DevExecutionMode)}
              >
                <option value={DevExecutionMode.LOCAL}>Local</option>
                <option value={DevExecutionMode.REMOTE}>Remote</option>
                <option value={DevExecutionMode.GITHUB}>GitHub</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-provider">Proveedor IA</Label>
              <select
                id="task-provider"
                className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={aiProvider}
                onChange={(event) => setAiProvider(event.target.value as DevAIProviderType | "")}
              >
                <option value="">Sin proveedor</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.provider}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-branch">Branch</Label>
            <Input id="task-branch" value={branch} onChange={(event) => setBranch(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-prompt">Instruccion para la IA</Label>
            <textarea
              id="task-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={5}
              className="min-h-32 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <Button type="submit" disabled={isPending || projects.length === 0}>
            {isPending ? "Creando..." : "Crear tarea"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
