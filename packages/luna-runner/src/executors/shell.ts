import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import type { RunnerClaimTask } from "../client";

const MAX_STREAM_CHARS = 12_000;

function tokenizeCommand(commandText: string) {
  const tokens: string[] = [];
  let current = "";
  let quote: "'" | '"' | null = null;

  for (let index = 0; index < commandText.length; index += 1) {
    const char = commandText[index];

    if ((char === '"' || char === "'") && quote === null) {
      quote = char;
      continue;
    }

    if (quote && char === quote) {
      quote = null;
      continue;
    }

    if (!quote && /\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += char;
  }

  if (quote) {
    throw new Error("El comando shell contiene comillas sin cerrar.");
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

function trimOutput(text: string) {
  if (text.length <= MAX_STREAM_CHARS) {
    return text;
  }

  return `${text.slice(0, MAX_STREAM_CHARS)}\n...[salida truncada]`;
}

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

  const [command, ...args] = tokenizeCommand(commandText);
  const normalizedAllowlist = params.allowedCommands.map((item) => item.toLowerCase());
  if (!command || !normalizedAllowlist.includes(command.toLowerCase())) {
    throw new Error(`Comando no permitido para shell runtime: ${command ?? "unknown"}`);
  }

  const cwd = resolve(params.task.project.localPath ?? params.workdir ?? process.cwd());
  if (!existsSync(cwd)) {
    throw new Error(`El directorio de trabajo no existe: ${cwd}`);
  }

  await params.onProgress(`Shell runtime ejecutando: ${command} ${args.join(" ")}`.trim());

  const output = await new Promise<string>((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd,
      shell: false,
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
      stdout = trimOutput(`${stdout}${text}`);
      await params.onProgress(trimOutput(text).trim().slice(0, 1200));
    });

    child.stderr?.on("data", async (chunk) => {
      const text = chunk.toString();
      stderr = trimOutput(`${stderr}${text}`);
      await params.onProgress(trimOutput(text).trim().slice(0, 1200), "WARNING");
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
        resolvePromise([stdout.trim(), stderr.trim()].filter(Boolean).join("\n"));
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

export { tokenizeCommand };
