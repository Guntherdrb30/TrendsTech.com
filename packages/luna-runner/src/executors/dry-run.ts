import type { RunnerClaimTask } from "../client";

export async function runDryTask(task: RunnerClaimTask["task"], onProgress: (message: string) => Promise<void>) {
  await onProgress(`Dry-run: iniciando ${task.title}`);
  await sleep(800);
  await onProgress(`Dry-run: analizando proyecto ${task.project.name}`);
  await sleep(800);
  await onProgress("Dry-run: preparando resumen y archivos simulados.");
  await sleep(800);

  return {
    resultSummary: `Dry-run completado para ${task.title}. El runner simulo la ejecucion en ${task.project.name}.`,
    files: [
      {
        filePath: `${task.project.localPath ?? "/workspace"}/LUNA_EXECUTION_SUMMARY.md`,
        changeType: "UPDATED" as const,
        summary: "Resumen simulado de la tarea ejecutada en dry-run."
      }
    ]
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
