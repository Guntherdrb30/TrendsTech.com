import { sendEmail } from './send';

type PasswordResetEmailInput = {
  to: string;
  resetUrl: string;
  locale: string;
};

type EmailResult = {
  ok: boolean;
  error?: string;
};

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  locale
}: PasswordResetEmailInput): Promise<EmailResult> {
  const subject = locale.startsWith('es') ? 'Recupera tu contraseña' : 'Reset your password';

  return await sendEmail({
    to,
    subject,
    template: 'reset-password',
    templateData: {
      resetUrl
    },
    locale,
  });
}
