"use client";

import { DevExecutionMode, type DevProject } from "@trends172tech/db";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProjectsClient({ locale, projects }: { locale: string; projects: DevProject[] }) {
  const isEs = locale.startsWith("es");
  const tr = (es: string, en: string) => (isEs ? es : en);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [localPath, setLocalPath] = useState("");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [executionMode, setExecutionMode] = useState<DevExecutionMode>(DevExecutionMode.LOCAL);

  const submitProject = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/luna-agent/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          repositoryUrl,
          localPath,
          defaultBranch,
          executionMode,
          isActive: true
        })
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? tr("No se pudo crear el proyecto.", "The project could not be created."));
        return;
      }

      setName("");
      setSlug("");
      setRepositoryUrl("");
      setLocalPath("");
      setDefaultBranch("main");
      setExecutionMode(DevExecutionMode.LOCAL);
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Card>
        <CardHeader>
          <CardTitle>{tr("Nuevo proyecto", "New project")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">{tr("Nombre", "Name")}</Label>
              <Input id="project-name" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-slug">Slug</Label>
              <Input id="project-slug" value={slug} onChange={(event) => setSlug(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-repo">{tr("Repositorio", "Repository")}</Label>
              <Input
                id="project-repo"
                value={repositoryUrl}
                onChange={(event) => setRepositoryUrl(event.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-path">{tr("Ruta local", "Local path")}</Label>
              <Input
                id="project-path"
                value={localPath}
                onChange={(event) => setLocalPath(event.target.value)}
                placeholder="C:\\proyectos\\app"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="project-branch">Branch</Label>
                <Input
                  id="project-branch"
                  value={defaultBranch}
                  onChange={(event) => setDefaultBranch(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-mode">{tr("Modo", "Mode")}</Label>
                <select
                  id="project-mode"
                  className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                  value={executionMode}
                  onChange={(event) => setExecutionMode(event.target.value as DevExecutionMode)}
                >
                  <option value={DevExecutionMode.LOCAL}>Local</option>
                  <option value={DevExecutionMode.REMOTE}>Remote</option>
                  <option value={DevExecutionMode.GITHUB}>GitHub</option>
                </select>
              </div>
            </div>
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            <Button type="submit" disabled={isPending}>
              {isPending ? tr("Guardando...", "Saving...") : tr("Crear proyecto", "Create project")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tr("Proyectos registrados", "Registered projects")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {projects.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {tr("Aún no hay proyectos para este agente.", "There are no projects for this agent yet.")}
            </p>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="rounded-2xl border border-slate-200 px-4 py-4 text-sm dark:border-slate-800"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{project.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{project.slug}</div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {project.executionMode}
                  </span>
                </div>
                <div className="mt-3 grid gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <div>{tr("Repositorio", "Repository")}: {project.repositoryUrl ?? tr("No definido", "Not set")}</div>
                  <div>{tr("Ruta local", "Local path")}: {project.localPath ?? tr("No definida", "Not set")}</div>
                  <div>{tr("Branch por defecto", "Default branch")}: {project.defaultBranch ?? "main"}</div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
