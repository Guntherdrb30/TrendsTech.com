import { spawn } from "node:child_process";
import type { RunnerClaimTask } from "../client";

async function commandExists(command: string) {
  const checker = process.platform === "win32" ? "where" : "which";

  return new Promise<boolean>((resolve) => {
    const child = spawn(checker, [command], {
      shell: true,
      windowsHide: true
    });

    child.on("close", (code) => resolve(code === 0));
    child.on("error", () => resolve(false));
  });
}

export async function runCodexTask(params: {
  task: RunnerClaimTask["task"];
  onProgress: (message: string, level?: "INFO" | "WARNING" | "ERROR") => Promise<void>;
}) {
  const hasCodex = await commandExists("codex");
  if (!hasCodex) {
    throw new Error("Codex CLI no esta disponible en este runner.");
  }

  await params.onProgress("Codex CLI detectado en el runner.");
  await params.onProgress(
    "Integracion inicial lista. Ajusta el comando final segun la version instalada de Codex CLI.",
    "WARNING"
  );

  return {
    resultSummary: `Codex CLI detectado para ${params.task.title}. La capa adaptadora quedo lista para la siguiente fase de comandos reales.`,
    files: [] as Array<{ filePath: string; changeType: "CREATED" | "UPDATED" | "DELETED"; summary?: string }>
  };
}
