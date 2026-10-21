import { z } from 'zod';

export const projectCategory = z.enum(['NEW', 'IMPROVE', 'AUTOMATE', 'INTEGRATE', 'IDEA']);
export const projectMessage = z.object({
  role: z.enum(['agent', 'user']),
  content: z.string().min(1).max(1500)
});

export const projectDetails = z.object({
  description: z.string().max(6000).default(''),
  existingSystem: z.string().max(3000).default(''),
  problem: z.string().max(3000).default(''),
  goals: z.string().max(3000).default(''),
  timeline: z.string().max(200).default(''),
  budget: z.string().max(200).default('')
});

export const projectIntakePayload = z.object({
  sessionId: z.string().uuid(),
  locale: z.enum(['es', 'en']).default('es'),
  category: projectCategory,
  projectTitle: z.string().max(160).default(''),
  details: projectDetails,
  transcript: z.array(projectMessage).max(40),
  contact: z.object({
    name: z.string().max(120).default(''),
    email: z.string().max(200).default(''),
    phone: z.string().max(40).default(''),
    company: z.string().max(160).default(''),
    country: z.string().max(100).default('')
  }),
  consent: z.literal(true),
  finalize: z.boolean().default(false)
});

export type ProjectIntakePayload = z.infer<typeof projectIntakePayload>;

export function validateFinalIntake(input: ProjectIntakePayload): string | null {
  if (input.projectTitle.trim().length < 4 || input.details.description.trim().length < 12) {
    return 'Incluye un título y una descripción de la idea.';
  }
  if (input.contact.name.trim().length < 2 || input.contact.phone.trim().length < 7) {
    return 'Incluye tu nombre y un teléfono de contacto válido.';
  }
  if (!z.string().email().safeParse(input.contact.email.trim()).success) {
    return 'Incluye un correo electrónico válido.';
  }
  if (input.transcript.filter((message) => message.role === 'user').length < 2) {
    return 'Completa la conversación sobre tu proyecto.';
  }
  return null;
}

export function escapeIntakeHtml(raw: string): string {
  return raw.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character] || character);
}
