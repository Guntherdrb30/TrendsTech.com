import { spawn } from "node:child_process";
import type { RunnerClaimTask } from "../client";

export async function runShellTask(params: {
  task: RunnerClaimTask["task"];
  allowedCommands: string[];
  timeoutMs: number;
  workdir?: string;
  onProgress: (message: string, level?: "INFO" | "WARNING" | "ERROR") => Promise<void>;
}) {
  const commandText = params.task.prompt?.trim();
  if (!commandText) {
    throw new Error("La tarea no incluye prompt/comando para modo shell.");
  }

  const firstToken = commandText.split(/\s+/)[0]?.toLowerCase();
  if (!firstToken || !params.allowedCommands.map((item) => item.toLowerCase()).includes(firstToken)) {
    throw new Error(`Comando no permitido para shell runtime: ${firstToken ?? "unknown"}`);
  }

  await params.onProgress(`Shell runtime ejecutando: ${commandText}`);

  const cwd = params.task.project.localPath ?? params.workdir ?? process.cwd();

  const output = await new Promise<string>((resolve, reject) => {
    const child = spawn(commandText, {
      cwd,
      shell: true,
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        child.kill();
        settled = true;
        reject(new Error(`Tiempo excedido para comando shell (${params.timeoutMs} ms).`));
      }
    }, params.timeoutMs);

    child.stdout?.on("data", async (chunk) => {
      const text = chunk.toString();
      stdout += text;
      await params.onProgress(text.trim().slice(0, 1200));
    });

    child.stderr?.on("data", async (chunk) => {
      const text = chunk.toString();
      stderr += text;
      await params.onProgress(text.trim().slice(0, 1200), "WARNING");
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      if (!settled) {
        settled = true;
        reject(error);
      }
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (settled) {
        return;
      }

      if (code === 0) {
        settled = true;
        resolve([stdout.trim(), stderr.trim()].filter(Boolean).join("\n"));
      } else {
        settled = true;
        reject(new Error(stderr.trim() || `El comando termino con codigo ${code ?? "desconocido"}.`));
      }
    });
  });

  return {
    resultSummary: output || `Shell runtime completo para ${params.task.title}.`,
    files: [] as Array<{ filePath: string; changeType: "CREATED" | "UPDATED" | "DELETED"; summary?: string }>
  };
}
