import { z } from 'zod';

export const createAgentInstanceSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  baseAgentKey: z.string().min(2, 'Base agent key is required'),
  languageDefault: z.enum(['ES', 'EN']).default('ES'),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED']).default('DRAFT'),
  endCustomerId: z.string().optional().nullable()
});

export type CreateAgentInstanceInput = z.infer<typeof createAgentInstanceSchema>;
