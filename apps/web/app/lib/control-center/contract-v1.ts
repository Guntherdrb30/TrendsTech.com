import { z } from 'zod';

const safeJsonSchema = z.record(z.unknown()).optional();

export const createControlAgentRunSchema = z.object({
  idempotencyKey: z.string().min(8).max(128),
  implementationKey: z.string().min(2).max(100),
  agentInstanceId: z.string().min(1).optional(),
  agentTemplateKey: z.string().min(1).max(100),
  agentVersion: z.number().int().positive(),
  traceId: z.string().min(8).max(128),
  externalRunId: z.string().max(128).optional(),
  channel: z.string().max(50).optional(),
  inputClass: z.string().max(80).optional(),
  actor: z
    .object({
      type: z.enum(['user', 'system', 'anonymous']),
      id: z.string().max(128).optional(),
      role: z.string().max(80).optional()
    })
    .optional(),
  safeMetadata: safeJsonSchema
});

export const createControlAgentRunEventSchema = z.object({
  sequence: z.number().int().nonnegative(),
  eventType: z.string().min(1).max(80),
  occurredAt: z.coerce.date(),
  skillKey: z.string().max(120).optional(),
  safeMetadata: safeJsonSchema
});

export const createControlAgentUsageSchema = z.object({
  provider: z.string().min(1).max(80),
  model: z.string().min(1).max(160),
  inputTokens: z.number().int().nonnegative().default(0),
  outputTokens: z.number().int().nonnegative().default(0),
  cachedTokens: z.number().int().nonnegative().default(0),
  latencyMs: z.number().int().nonnegative().optional(),
  costUsdMicros: z.number().int().nonnegative().optional(),
  gpuMillis: z.number().int().nonnegative().optional(),
  metadata: safeJsonSchema
});

export const completeControlAgentRunSchema = z.object({
  status: z.enum(['SUCCEEDED', 'FAILED', 'CANCELLED']),
  completedAt: z.coerce.date().default(() => new Date()),
  safeSummary: z.string().max(1000).optional(),
  errorCode: z.string().max(100).optional()
});

export type CreateControlAgentRunInput = z.infer<typeof createControlAgentRunSchema>;
