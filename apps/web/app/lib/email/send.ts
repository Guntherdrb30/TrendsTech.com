import { EMAIL_CONFIG, isEmailConfigured, sendResendEmail } from './resend';
import type { CreateEmailOptions } from 'resend';
import { EmailTemplate, EmailTemplateData, SendEmailOptions, EmailResult } from './types';
import { render } from '@react-email/render';

export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    console.warn('Email service not configured. Skipping email send.');
    return { ok: false, error: 'Email service not configured.' };
  }

  try {
    const { to, subject, html, text, replyTo, template, templateData } = options;

    let emailHtml = html;
    let emailText = text;

    if (template && templateData) {
      const { html: renderedHtml, text: renderedText } = await renderEmailTemplate(template, templateData, options.locale);
      emailHtml = renderedHtml;
      emailText = renderedText;
    }

    if (!emailHtml && !emailText) {
      return { ok: false, error: 'Either html, text, or template must be provided.' };
    }

    const result = await sendResendEmail({
      from: EMAIL_CONFIG.from,
      to: Array.isArray(to) ? to : [to],
      subject,
      ...(emailHtml ? { html: emailHtml } : {}),
      ...(emailText ? { text: emailText } : {}),
      replyTo: replyTo || EMAIL_CONFIG.replyTo,
    } as CreateEmailOptions);

    return { ok: true, emailId: result.data?.id };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred while sending email.'
    };
  }
}

async function renderEmailTemplate<T extends EmailTemplate>(
  template: T,
  data: EmailTemplateData[T],
  locale?: string
): Promise<{ html: string; text: string }> {
  const templateModule = await import(`./templates/${template}`);
  const TemplateComponent = templateModule.default;

  if (!TemplateComponent) {
    throw new Error(`Template ${template} not found.`);
  }

  const html = await render(TemplateComponent({ ...data, locale: locale || 'es' }));
  const text = await render(TemplateComponent({ ...data, locale: locale || 'es' }), { plainText: true });

  return { html, text };
}
