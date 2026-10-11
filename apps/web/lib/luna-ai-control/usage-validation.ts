import { z } from 'zod';

const nonnegative = z.number().int().nonnegative().optional();
export const usageEventSchema = z.object({
  operationId: z.string().min(1).max(120),
  platform: z.string().min(1).max(80),
  module: z.string().min(1).max(80),
  action: z.string().min(1).max(80),
  provider: z.string().min(1).max(80),
  model: z.string().max(120).optional(),
  environment: z.enum(['production', 'preview', 'test']),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
  durationMs: z.number().int().nonnegative().max(86400000),
  status: z.enum(['success', 'error']),
  inputTokens: nonnegative,
  outputTokens: nonnegative,
  imageCount: nonnegative,
  videoCount: nonnegative,
  documentCount: nonnegative,
  audioSeconds: z.number().nonnegative().optional(),
  errorCode: z.string().max(120).optional(),
}).strict().superRefine((event, ctx) => {
  const start = Date.parse(event.startedAt);
  const end = Date.parse(event.completedAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start || end - start > 86400000) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['completedAt'], message: 'Invalid event interval' });
  } else if (event.durationMs > end - start + 1000) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['durationMs'], message: 'Duration exceeds event interval' });
  }
});

export async function readBoundedJson(request: Request, maxBytes = 16384): Promise<
  { ok: true; data: unknown } | { ok: false; status: number; error: string }
> {
  const length = request.headers.get('content-length');
  if (length !== null && Number(length) > maxBytes) return { ok: false, status: 413, error: 'Payload too large' };
  if (request.body === null) return { ok: false, status: 400, error: 'Invalid JSON' };
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return { ok: false, status: 413, error: 'Payload too large' };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400, error: 'Invalid request body' };
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try {
    return { ok: true, data: JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) };
  } catch {
    return { ok: false, status: 400, error: 'Invalid JSON' };
  }
}
