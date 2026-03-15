import { DevAIProviderType, DevExecutionMode, DevTaskPriority } from "@trends172tech/db";
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
  prompt: optionalTrimmed
});

export type CreateDevProjectInput = z.infer<typeof createDevProjectSchema>;
export type CreateDevTaskInput = z.infer<typeof createDevTaskSchema>;
export type CreateAiProviderInput = z.infer<typeof createAiProviderSchema>;
export type CreateRemoteSessionInput = z.infer<typeof createRemoteSessionSchema>;
export type CreateRemoteTaskInput = z.infer<typeof createRemoteTaskSchema>;
