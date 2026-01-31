import { z } from 'zod';

const domainSchema = z.string().trim().min(1);

export const createAgentAccessSchema = z.object({
  agentId: z.string().trim().min(1),
  name: z.string().trim().min(1),
  allowedDomains: z.array(domainSchema).optional(),
  maxTokensPerMonth: z.number().int().nonnegative().nullable().optional(),
  isActive: z.boolean().optional()
});

export const updateAgentAccessSchema = z.object({
  name: z.string().trim().min(1).optional(),
  allowedDomains: z.array(domainSchema).optional(),
  maxTokensPerMonth: z.number().int().nonnegative().nullable().optional(),
  isActive: z.boolean().optional()
});
