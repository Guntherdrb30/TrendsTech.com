import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import type { RunnerClaimTask } from "../client";

const MAX_OUTPUT_CHARS = 24_000;

function trimOutput(text: string) {
  if (text.length <= MAX_OUTPUT_CHARS) return text;
  return `${text.slice(-MAX_OUTPUT_CHARS)}\n...[salida truncada]`;
}

function safeDirectoryName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "project";
}

async function runCommand(command: string, args: string[], cwd: string, timeoutMs: number) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      shell: false,
      windowsHide: true,
      env: process.env
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        child.kill();
        settled = true;
        reject(new Error(`Tiempo excedido ejecutando ${command}.`));
      }
    }, timeoutMs);

    child.stdout?.on("data", (chunk) => {
      stdout = trimOutput(stdout + chunk.toString());
    });
    child.stderr?.on("data", (chunk) => {
      stderr = trimOutput(stderr + chunk.toString());
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
      if (settled) return;
      settled = true;
      if (code === 0) {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
      } else {
        reject(new Error(stderr.trim() || stdout.trim() || `${command} terminó con código ${code ?? "desconocido"}.`));
      }
    });
  });
}

async function commandExists(command: string) {
  const checker = process.platform === "win32" ? "where" : "which";
  try {
    await runCommand(checker, [command], process.cwd(), 10_000);
    return true;
  } catch {
    return false;
  }
}

async function ensureWorkspace(task: RunnerClaimTask["task"], workdir: string | undefined, timeoutMs: number) {
  if (task.project.localPath) {
    const local = path.resolve(task.project.localPath);
    if (!existsSync(local)) throw new Error(`El localPath configurado no existe: ${local}`);
    return local;
  }

  if (!task.project.repositoryUrl) {
    throw new Error("La tarea necesita repositoryUrl o localPath para ejecutar Codex.");
  }

  const workspaceRoot = path.resolve(
    process.env.LUNA_RUNNER_WORKSPACE_ROOT ??
      workdir ??
      path.join(os.tmpdir(), "luna-runner-workspaces")
  );
  await mkdir(workspaceRoot, { recursive: true });

  const workspace = path.join(workspaceRoot, safeDirectoryName(task.project.id));
  if (!existsSync(path.join(workspace, ".git"))) {
    if (existsSync(workspace)) {
      throw new Error(`El workspace existe pero no es un repositorio Git válido: ${workspace}`);
    }
    await runCommand("git", ["clone", task.project.repositoryUrl, workspace], workspaceRoot, timeoutMs);
  }

  return workspace;
}

async function prepareBranch(task: RunnerClaimTask["task"], cwd: string, timeoutMs: number) {
  const statusBefore = await runCommand("git", ["status", "--porcelain"], cwd, timeoutMs);
  if (statusBefore.stdout.trim()) {
    throw new Error("El workspace del runner tiene cambios pendientes. Se bloquea la tarea para evitar mezclar proyectos.");
  }

  const branch = task.branch?.trim() || task.project.defaultBranch?.trim() || "main";
  await runCommand("git", ["fetch", "origin", branch], cwd, timeoutMs);

  try {
    await runCommand("git", ["checkout", branch], cwd, timeoutMs);
  } catch {
    await runCommand("git", ["checkout", "-b", branch, `origin/${branch}`], cwd, timeoutMs);
  }

  await runCommand("git", ["reset", "--hard", `origin/${branch}`], cwd, timeoutMs);
  return branch;
}

function extractAgentSummary(stdout: string) {
  const messages: string[] = [];
  for (const line of stdout.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{")) continue;
    try {
      const event = JSON.parse(trimmed) as {
        type?: string;
        item?: { type?: string; text?: string };
      };
      if (event.type === "item.completed" && event.item?.type === "agent_message" && event.item.text) {
        messages.push(event.item.text);
      }
    } catch {
      // Non-JSON lines are preserved in raw output but ignored for summary extraction.
    }
  }
  return messages.at(-1)?.trim() || "Codex completó la tarea.";
}

const SENSITIVE_PATH_PATTERNS = [
  /(^|\/)\.env(\.|$)/i,
  /(^|\/)\.npmrc$/i,
  /(^|\/)\.pypirc$/i,
  /(^|\/)(id_rsa|id_ed25519)(\.pub)?$/i,
  /\.(pem|p12|pfx|key)$/i,
  /(^|\/)(credentials?|secrets?)\.(json|ya?ml|toml|txt)$/i
];

function assertNoSensitiveFiles(files: Array<{ filePath: string }>) {
  const blocked = files.filter((file) => SENSITIVE_PATH_PATTERNS.some((pattern) => pattern.test(file.filePath)));
  if (blocked.length > 0) {
    throw new Error(`Codex generó o modificó archivos sensibles y el Runner bloqueó el commit: ${blocked.map((file) => file.filePath).join(", ")}`);
  }
}

function parseChangedFiles(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [status, ...rest] = line.split(/\s+/);
      const filePath = rest.join(" ");
      const changeType = status.startsWith("A") ? "CREATED" : status.startsWith("D") ? "DELETED" : "UPDATED";
      return {
        filePath,
        changeType: changeType as "CREATED" | "UPDATED" | "DELETED",
        summary: `Git status ${status}`
      };
    });
}

export async function runCodexTask(params: {
  task: RunnerClaimTask["task"];
  workdir?: string;
  timeoutMs: number;
  onProgress: (message: string, level?: "INFO" | "WARNING" | "ERROR") => Promise<void>;
}) {
  const hasCodex = await commandExists("codex");
  if (!hasCodex) {
    throw new Error("Codex CLI no está disponible en este runner.");
  }

  const cwd = await ensureWorkspace(params.task, params.workdir, params.timeoutMs);
  const branch = await prepareBranch(params.task, cwd, params.timeoutMs);
  const prompt = params.task.prompt?.trim() || params.task.description?.trim();
  if (!prompt) {
    throw new Error("La tarea no contiene una instrucción para Codex.");
  }

  await params.onProgress(`Codex inicia en ${params.task.project.name} · rama ${branch}.`);
  await params.onProgress("Codex full-auto activo dentro del workspace Git aislado; merge, producción y archivos sensibles permanecen bloqueados por el Runner.");

  const args = [
    "exec",
    "--json",
    "--full-auto",
    prompt
  ];

  const codex = await runCommand("codex", args, cwd, params.timeoutMs);
  const summary = extractAgentSummary(codex.stdout);
  await params.onProgress(summary.slice(0, 1200));

  const status = await runCommand("git", ["status", "--porcelain"], cwd, params.timeoutMs);
  const files = parseChangedFiles(status.stdout);
  assertNoSensitiveFiles(files);
  if (files.length === 0) {
    const head = await runCommand("git", ["rev-parse", "HEAD"], cwd, params.timeoutMs);
    return {
      resultSummary: `${summary}\nSin cambios de archivos pendientes.`,
      commitSha: head.stdout.trim(),
      files
    };
  }

  await runCommand("git", ["config", "user.name", "Trends Engineering Studio"], cwd, params.timeoutMs);
  await runCommand("git", ["config", "user.email", "engineering-studio@trends172tech.com"], cwd, params.timeoutMs);
  await runCommand("git", ["add", "-A"], cwd, params.timeoutMs);
  await runCommand(
    "git",
    ["commit", "-m", `studio: ${params.task.title.replace(/[\r\n]+/g, " ").slice(0, 72)}`],
    cwd,
    params.timeoutMs
  );

  const head = await runCommand("git", ["rev-parse", "HEAD"], cwd, params.timeoutMs);
  await params.onProgress(`Commit ${head.stdout.trim().slice(0, 8)} creado; publicando solo la rama de trabajo.`);
  await runCommand("git", ["push", "origin", `HEAD:${branch}`], cwd, params.timeoutMs);

  return {
    resultSummary: `${summary}\nCambios guardados en la rama ${branch}.`,
    commitSha: head.stdout.trim(),
    files
  };
}
