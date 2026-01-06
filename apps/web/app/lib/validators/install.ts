import { z } from 'zod';

export const createInstallSchema = z.object({
  agentInstanceId: z.string().min(1),
  allowedDomains: z.array(z.string().min(1)).optional()
});

export const updateInstallSchema = z.object({
  allowedDomains: z.array(z.string().min(1)).optional(),
  status: z.enum(['ACTIVE', 'DISABLED']).optional()
});
