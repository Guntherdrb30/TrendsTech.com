type PasswordResetEmailInput = {
  to: string;
  resetUrl: string;
  locale: string;
};

type EmailResult = {
  ok: boolean;
  error?: string;
};

function buildEmailContent(resetUrl: string, locale: string) {
  if (locale.startsWith('es')) {
    return {
      subject: 'Recupera tu contrasena',
      text: [
        'Recibimos una solicitud para restablecer tu contrasena.',
        `Para continuar, usa este enlace: ${resetUrl}`,
        'Si no fuiste tu, puedes ignorar este correo.'
      ].join('\n')
    };
  }

  return {
    subject: 'Reset your password',
    text: [
      'We received a request to reset your password.',
      `Continue with this link: ${resetUrl}`,
      'If this was not you, you can ignore this email.'
    ].join('\n')
  };
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  locale
}: PasswordResetEmailInput): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    return { ok: false, error: 'Email service not configured.' };
  }

  const content = buildEmailContent(resetUrl, locale);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to,
      subject: content.subject,
      text: content.text
    })
  });

  if (!response.ok) {
    return { ok: false, error: 'Failed to send reset email.' };
  }

  return { ok: true };
}
