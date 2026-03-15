type JsonObject = Record<string, unknown>;

export type RunnerClaimTask = {
  queueId: string;
  runtime: "DRY_RUN" | "SHELL" | "CODEX_CLI";
  task: {
    id: string;
    title: string;
    description: string | null;
    prompt: string | null;
    branch: string | null;
    priority: string;
    executionMode: string;
    project: {
      id: string;
      name: string;
      repositoryUrl: string | null;
      localPath: string | null;
      defaultBranch: string | null;
    };
  };
};

export class RunnerApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly runnerId: string,
    private readonly token: string
  ) {}

  async handshake(payload: {
    mode: "LOCAL" | "REMOTE" | "GITHUB";
    host?: string;
    machineLabel?: string;
    capabilities: JsonObject;
  }) {
    return this.post("/api/luna-agent/runners/internal/handshake", payload);
  }

  async heartbeat(payload: {
    status: "ONLINE" | "OFFLINE" | "BUSY" | "DISABLED";
    capabilities?: JsonObject;
  }) {
    return this.post("/api/luna-agent/runners/internal/heartbeat", payload);
  }

  async claim(runtimes: Array<"DRY_RUN" | "SHELL" | "CODEX_CLI">) {
    const result = await this.post<{ data: RunnerClaimTask | null }>(
      "/api/luna-agent/runners/internal/claim",
      { runtimes }
    );

    return result.data;
  }

  async progress(payload: {
    taskId: string;
    level: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
    message: string;
    status?: "PENDING" | "QUEUED" | "RUNNING" | "REVIEW" | "DONE" | "FAILED";
    files?: Array<{ filePath: string; changeType: "CREATED" | "UPDATED" | "DELETED"; summary?: string }>;
  }) {
    return this.post("/api/luna-agent/runners/internal/progress", payload);
  }

  async complete(payload: {
    taskId: string;
    status: "DONE" | "FAILED" | "CANCELED";
    resultSummary?: string;
    lastError?: string;
    files?: Array<{ filePath: string; changeType: "CREATED" | "UPDATED" | "DELETED"; summary?: string }>;
  }) {
    return this.post("/api/luna-agent/runners/internal/complete", payload);
  }

  private async post<T = unknown>(path: string, payload: JsonObject): Promise<T> {
    const response = await fetch(new URL(path, this.baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        runnerId: this.runnerId,
        token: this.token,
        ...payload
      })
    });

    const json = (await response.json().catch(() => ({}))) as T & { error?: string };
    if (!response.ok) {
      throw new Error((json as { error?: string }).error ?? `Runner API failed at ${path}`);
    }

    return json;
  }
}
