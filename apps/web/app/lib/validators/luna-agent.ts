import {
  DevAIProviderType,
  DevExecutionMode,
  DevExecutionRuntime,
  DevRunnerMode,
  DevRunnerStatus,
  DevTaskFileChangeType,
  DevTaskLogLevel,
  DevTaskPriority,
  DevTaskStatus
} from "@trends172tech/db";
import { z } from "zod";

const optionalTrimmed = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional()
);

export const createDevProjectSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/),
  repositoryUrl: optionalTrimmed,
  localPath: optionalTrimmed,
  defaultBranch: optionalTrimmed,
  executionMode: z.nativeEnum(DevExecutionMode),
  isActive: z.boolean().default(true)
});

export const createDevTaskSchema = z.object({
  projectId: z.string().trim().min(1),
  title: z.string().trim().min(2).max(180),
  description: optionalTrimmed,
  branch: optionalTrimmed,
  executionMode: z.nativeEnum(DevExecutionMode),
  runtime: z.nativeEnum(DevExecutionRuntime).default(DevExecutionRuntime.DRY_RUN),
  aiProvider: z.nativeEnum(DevAIProviderType).optional(),
  prompt: optionalTrimmed,
  priority: z.nativeEnum(DevTaskPriority).default(DevTaskPriority.MEDIUM)
});

export const createAiProviderSchema = z.object({
  provider: z.nativeEnum(DevAIProviderType),
  label: z.string().trim().min(2).max(120),
  apiKey: z.string().trim().min(6).max(400),
  baseUrl: optionalTrimmed,
  isDefault: z.boolean().default(false)
});

export const createRemoteSessionSchema = z.object({
  expiresInMinutes: z.number().int().min(5).max(240).default(30)
});

export const createRemoteTaskSchema = z.object({
  title: z.string().trim().min(2).max(180),
  description: optionalTrimmed,
  projectId: z.string().trim().min(1),
  priority: z.nativeEnum(DevTaskPriority).default(DevTaskPriority.MEDIUM),
  executionMode: z.nativeEnum(DevExecutionMode).default(DevExecutionMode.REMOTE),
  runtime: z.nativeEnum(DevExecutionRuntime).default(DevExecutionRuntime.DRY_RUN),
  prompt: optionalTrimmed
});

export const createRunnerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/),
  mode: z.nativeEnum(DevRunnerMode).default(DevRunnerMode.LOCAL),
  machineLabel: optionalTrimmed,
  host: optionalTrimmed
});

export const runnerHandshakeSchema = z.object({
  runnerId: z.string().trim().min(1),
  token: z.string().trim().min(8),
  capabilities: z
    .object({
      supportsCodex: z.boolean().optional(),
      supportsClaude: z.boolean().optional(),
      supportsShell: z.boolean().optional(),
      supportsGit: z.boolean().optional(),
      supportsFilesystem: z.boolean().optional()
    })
    .default({}),
  host: optionalTrimmed,
  machineLabel: optionalTrimmed,
  mode: z.nativeEnum(DevRunnerMode).default(DevRunnerMode.LOCAL)
});

export const runnerHeartbeatSchema = z.object({
  runnerId: z.string().trim().min(1),
  token: z.string().trim().min(8),
  status: z.nativeEnum(DevRunnerStatus),
  capabilities: z.record(z.any()).optional()
});

export const runnerClaimSchema = z.object({
  runnerId: z.string().trim().min(1),
  token: z.string().trim().min(8),
  runtimes: z.array(z.nativeEnum(DevExecutionRuntime)).min(1)
});

export const runnerProgressSchema = z.object({
  runnerId: z.string().trim().min(1),
  token: z.string().trim().min(8),
  taskId: z.string().trim().min(1),
  level: z.nativeEnum(DevTaskLogLevel).default(DevTaskLogLevel.INFO),
  message: z.string().trim().min(1).max(4000),
  status: z.nativeEnum(DevTaskStatus).optional(),
  files: z
    .array(
      z.object({
        filePath: z.string().trim().min(1).max(400),
        changeType: z.nativeEnum(DevTaskFileChangeType),
        summary: optionalTrimmed
      })
    )
    .default([])
});

export const runnerCompleteSchema = z.object({
  runnerId: z.string().trim().min(1),
  token: z.string().trim().min(8),
  taskId: z.string().trim().min(1),
  status: z.enum(["DONE", "FAILED", "CANCELED"]),
  resultSummary: optionalTrimmed,
  lastError: optionalTrimmed,
  files: z
    .array(
      z.object({
        filePath: z.string().trim().min(1).max(400),
        changeType: z.nativeEnum(DevTaskFileChangeType),
        summary: optionalTrimmed
      })
    )
    .default([])
});

export type CreateDevProjectInput = z.infer<typeof createDevProjectSchema>;
export type CreateDevTaskInput = z.infer<typeof createDevTaskSchema>;
export type CreateAiProviderInput = z.infer<typeof createAiProviderSchema>;
export type CreateRemoteSessionInput = z.infer<typeof createRemoteSessionSchema>;
export type CreateRemoteTaskInput = z.infer<typeof createRemoteTaskSchema>;
export type CreateRunnerInput = z.infer<typeof createRunnerSchema>;
