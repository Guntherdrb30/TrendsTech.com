import { z } from 'zod';

export const createKnowledgeSourceSchema = z.object({
  agentInstanceId: z.string().min(1, 'Agent instance is required'),
  type: z.enum(['URL', 'PDF', 'TEXT']),
  title: z.string().optional().or(z.literal('')),
  url: z.string().url().optional().or(z.literal('')),
  fileKey: z.string().optional().or(z.literal('')),
  rawText: z.string().optional().or(z.literal(''))
});

export type CreateKnowledgeSourceInput = z.infer<typeof createKnowledgeSourceSchema>;
