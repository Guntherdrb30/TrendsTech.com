import os from "node:os";
import { RunnerApiClient, type RunnerClaimTask } from "./client";
import { runCodexTask } from "./executors/codex";
import { runDryTask } from "./executors/dry-run";
import { runShellTask } from "./executors/shell";

type RunnerMode = "LOCAL" | "REMOTE" | "GITHUB";
type RunnerRuntime = "DRY_RUN" | "SHELL" | "CODEX_CLI";

const config = {
  apiBaseUrl: process.env.LUNA_RUNNER_API_BASE_URL ?? "",
  runnerId: process.env.LUNA_RUNNER_ID ?? "",
  runnerToken: process.env.LUNA_RUNNER_TOKEN ?? "",
  mode: (process.env.LUNA_RUNNER_MODE ?? "LOCAL") as RunnerMode,
  runtime: (process.env.LUNA_RUNNER_RUNTIME ?? "DRY_RUN") as RunnerRuntime,
  pollIntervalMs: Number(process.env.LUNA_RUNNER_POLL_INTERVAL_MS ?? "5000"),
  maxTaskMs: Number(process.env.LUNA_RUNNER_MAX_TASK_SECONDS ?? "300") * 1000,
  allowedCommands: (process.env.LUNA_RUNNER_ALLOWED_COMMANDS ?? "git,npm,pnpm,node")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  defaultWorkdir: process.env.LUNA_RUNNER_DEFAULT_WORKDIR,
  host: process.env.LUNA_RUNNER_HOST ?? os.hostname(),
  machineLabel: process.env.LUNA_RUNNER_MACHINE_LABEL ?? os.hostname()
};

let runnerStatus: "ONLINE" | "BUSY" | "OFFLINE" | "DISABLED" = "ONLINE";

function ensureConfig() {
  for (const key of ["apiBaseUrl", "runnerId", "runnerToken"] as const) {
    if (!config[key]) {
      throw new Error(`Missing required runner env: ${key}`);
    }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  ensureConfig();
  const client = new RunnerApiClient(config.apiBaseUrl, config.runnerId, config.runnerToken);

  const capabilities = {
    supportsCodex: true,
    supportsClaude: false,
    supportsShell: true,
    supportsGit: true,
    supportsFilesystem: true
  };

  await client.handshake({
    mode: config.mode,
    host: config.host,
    machineLabel: config.machineLabel,
    capabilities
  });

  void heartbeatLoop(client, capabilities);

  for (;;) {
    try {
      const claim = await client.claim([config.runtime]);
      if (!claim) {
        runnerStatus = "ONLINE";
        await sleep(config.pollIntervalMs);
        continue;
      }

      await handleTask(client, claim);
    } catch (error) {
      console.error("[luna-runner] loop error", error);
      await sleep(config.pollIntervalMs);
    }
  }
}

async function heartbeatLoop(client: RunnerApiClient, capabilities: Record<string, unknown>) {
  for (;;) {
    try {
      await client.heartbeat({
        status: runnerStatus,
        capabilities
      });
    } catch (error) {
      console.error("[luna-runner] heartbeat error", error);
    }

    await sleep(Math.max(5000, config.pollIntervalMs));
  }
}

async function handleTask(client: RunnerApiClient, claim: RunnerClaimTask) {
  const startedAt = Date.now();
  runnerStatus = "BUSY";

  const onProgress = async (
    message: string,
    level: "INFO" | "WARNING" | "ERROR" | "SUCCESS" = "INFO"
  ) => {
    if (!message.trim()) {
      return;
    }

    await client.progress({
      taskId: claim.task.id,
      level,
      message: message.slice(0, 4000),
      status: "RUNNING"
    });
  };

  try {
    await onProgress(`Runner procesando tarea ${claim.task.title}`);

    const timeoutGuard = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Tiempo maximo de ejecucion excedido.")), config.maxTaskMs)
    );

    const resultPromise = executeByRuntime(claim, onProgress);
    const result = await Promise.race([resultPromise, timeoutGuard]);

    await client.complete({
      taskId: claim.task.id,
      status: "DONE",
      resultSummary: `${result.resultSummary}\nTiempo total: ${Math.round((Date.now() - startedAt) / 1000)}s`,
      files: result.files
    });
    runnerStatus = "ONLINE";
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fallo desconocido del runner.";

    try {
      await client.progress({
        taskId: claim.task.id,
        level: "ERROR",
        message
      });
      await client.complete({
        taskId: claim.task.id,
        status: "FAILED",
        lastError: message
      });
      runnerStatus = "ONLINE";
    } catch (completeError) {
      console.error("[luna-runner] complete error", completeError);
    }
  }
}

async function executeByRuntime(
  claim: RunnerClaimTask,
  onProgress: (message: string, level?: "INFO" | "WARNING" | "ERROR") => Promise<void>
) {
  switch (claim.runtime) {
    case "DRY_RUN":
      return runDryTask(claim.task, (message) => onProgress(message));
    case "SHELL":
      return runShellTask({
        task: claim.task,
        allowedCommands: config.allowedCommands,
        timeoutMs: config.maxTaskMs,
        workdir: config.defaultWorkdir,
        onProgress
      });
    case "CODEX_CLI":
      return runCodexTask({
        task: claim.task,
        onProgress
      });
  }
}

void main().catch((error) => {
  console.error("[luna-runner] fatal error", error);
  process.exit(1);
});
