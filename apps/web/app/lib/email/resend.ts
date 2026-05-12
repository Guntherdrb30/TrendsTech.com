import { Resend } from 'resend';
import type { CreateEmailOptions } from 'resend';

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('Missing RESEND_API_KEY. Set RESEND_API_KEY in your environment.');
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export async function sendResendEmail(options: CreateEmailOptions) {
  return getResend().emails.send(options);
}

export const EMAIL_CONFIG = {
  from: process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@trends172tech.com',
  replyTo: process.env.RESEND_REPLY_TO_EMAIL || 'support@trends172tech.com',
} as const;

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && EMAIL_CONFIG.from);
}