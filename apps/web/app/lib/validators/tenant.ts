import { z } from 'zod';

export const createTenantSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase and dash-separated'),
  mode: z.enum(['SINGLE', 'RESELLER'])
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
