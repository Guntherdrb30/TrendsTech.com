import { z } from 'zod';

export const createEndCustomerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal(''))
});

export type CreateEndCustomerInput = z.infer<typeof createEndCustomerSchema>;
