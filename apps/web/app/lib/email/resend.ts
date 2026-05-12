import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export { resend };

export const EMAIL_CONFIG = {
  from: process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@trends172tech.com',
  replyTo: process.env.RESEND_REPLY_TO_EMAIL || 'support@trends172tech.com',
} as const;

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && EMAIL_CONFIG.from);
}