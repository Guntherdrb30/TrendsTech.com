import { z } from 'zod';
import { CREATEABLE_AGENT_KEYS } from '@trends172tech/openai';

const baseAgentKeyEnum = CREATEABLE_AGENT_KEYS as [string, ...string[]];

export const createAgentInstanceSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  baseAgentKey: z.enum(baseAgentKeyEnum, { message: 'Base agent key is required' }),
  languageDefault: z.enum(['ES', 'EN']).default('ES'),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED']).default('DRAFT'),
  endCustomerId: z.string().optional().nullable(),
  contactPhone: z.string().min(4).max(40).optional().nullable()
});

export type CreateAgentInstanceInput = z.infer<typeof createAgentInstanceSchema>;
