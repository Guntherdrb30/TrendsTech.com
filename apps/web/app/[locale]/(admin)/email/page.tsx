import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sendEmail } from '@/lib/email';
import { EmailTemplate, EmailTemplateData } from '@/lib/email/types';

export const metadata: Metadata = {
  title: 'Email Templates Preview',
  description: 'Preview and test email templates'
};

const templateInfo: Record<
  EmailTemplate,
  { name: string; description: string; color: string }
> = {
  'reset-password': {
    name: 'Reset Password',
    description: 'Email sent when user requests password reset',
    color: 'bg-red-100 text-red-800'
  },
  'verify-email': {
    name: 'Verify Email',
    description: 'Email sent when user verifies their email address',
    color: 'bg-blue-100 text-blue-800'
  },
  'budget-sent': {
    name: 'Budget Sent',
    description: 'Email sent when budget is shared with a client',
    color: 'bg-green-100 text-green-800'
  },
  'proposal-sent': {
    name: 'Proposal Sent',
    description: 'Email sent when proposal is shared with a client',
    color: 'bg-purple-100 text-purple-800'
  },
  'invoice-sent': {
    name: 'Invoice Sent',
    description: 'Email sent when invoice is generated',
    color: 'bg-orange-100 text-orange-800'
  },
  'license-expiring': {
    name: 'License Expiring',
    description: 'Email sent when a license is about to expire',
    color: 'bg-yellow-100 text-yellow-800'
  },
  'monthly-payment-reminder': {
    name: 'Monthly Payment Reminder',
    description: 'Email sent as a monthly payment reminder',
    color: 'bg-indigo-100 text-indigo-800'
  }
};

const mockData = {
  'reset-password': {
    resetUrl: 'https://trends172tech.com/reset-password?token=abc123',
    userName: 'Juan Pérez'
  },
  'verify-email': {
    verificationUrl: 'https://trends172tech.com/verify-email?token=xyz789',
    userName: 'María García'
  },
  'budget-sent': {
    budgetUrl: 'https://trends172tech.com/budgets/123',
    clientName: 'Empresa ABC',
    projectName: 'Desarrollo Web',
    budgetAmount: ',000 USD',
    userName: 'Carlos López'
  },
  'proposal-sent': {
    proposalUrl: 'https://trends172tech.com/proposals/456',
    clientName: 'Startup XYZ',
    projectName: 'App Móvil',
    proposalAmount: ',000 USD',
    userName: 'Ana Rodríguez'
  },
  'invoice-sent': {
    invoiceUrl: 'https://trends172tech.com/invoices/789',
    clientName: 'Cliente Premium',
    invoiceNumber: 'INV-2024-001',
    invoiceAmount: ',500 USD',
    dueDate: '15 de enero de 2024',
    userName: 'Pedro Sánchez'
  },
  'license-expiring': {
    licenseName: 'Licencia Pro',
    expirationDate: '30 de enero de 2024',
    renewalUrl: 'https://trends172tech.com/renewal',
    userName: 'Laura Martínez'
  },
  'monthly-payment-reminder': {
    paymentUrl: 'https://trends172tech.com/payment',
    amount: ' USD',
    dueDate: '1 de febrero de 2024',
    userName: 'Roberto Díaz'
  }
} as const;

const emailTemplates = Object.keys(templateInfo) as EmailTemplate[];

function isEmailTemplate(value: unknown): value is EmailTemplate {
  return typeof value === 'string' && value in templateInfo;
}

function getEmailSubject(template: EmailTemplate, locale: string) {
  const subjects: Record<
    EmailTemplate,
    { es: string; en: string }
  > = {
    'reset-password': {
      es: 'Restablece tu contraseña',
      en: 'Reset your password'
    },
    'verify-email': {
      es: 'Verifica tu correo electrónico',
      en: 'Verify your email'
    },
    'budget-sent': {
      es: 'Presupuesto enviado',
      en: 'Budget sent'
    },
    'proposal-sent': {
      es: 'Propuesta enviada',
      en: 'Proposal sent'
    },
    'invoice-sent': {
      es: 'Factura enviada',
      en: 'Invoice sent'
    },
    'license-expiring': {
      es: 'Licencia expirando',
      en: 'License expiring'
    },
    'monthly-payment-reminder': {
      es: 'Recordatorio de pago mensual',
      en: 'Monthly payment reminder'
    }
  };

  const localeKey = locale.startsWith('es') ? 'es' : 'en';
  return subjects[template][localeKey];
}

async function sendTestEmail(formData: FormData) {
  'use server';

  const recipientEmail = formData.get('recipientEmail');
  const template = formData.get('template');
  const locale = formData.get('locale');
  const routeLocale = formData.get('routeLocale');

  if (
    typeof recipientEmail !== 'string' ||
    !recipientEmail.trim() ||
    typeof template !== 'string' ||
    !isEmailTemplate(template) ||
    typeof locale !== 'string' ||
    (locale !== 'es' && locale !== 'en') ||
    typeof routeLocale !== 'string' ||
    !routeLocale
  ) {
    throw new Error('Invalid test email payload.');
  }

  const templateData = mockData[template] as EmailTemplateData[typeof template];
  const result = await sendEmail({
    to: recipientEmail.trim(),
    subject: getEmailSubject(template, locale),
    template,
    templateData,
    locale
  });

  const query = new URLSearchParams({
    status: result.ok ? 'success' : 'error'
  });

  if (result.error) {
    query.set('message', result.error);
  }

  redirect(`/${routeLocale}/admin/email?${query.toString()}`);
}

export default async function EmailAdminPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; message?: string }>;
}) {
  const { locale } = await params;
  await searchParams; // Ensure searchParams is awaited
  const t = await getTranslations('admin.email');

  return (
    <div className="container mx-auto py-8 space-y-10">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground mt-2">{t('description')}</p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            Admin email preview
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {emailTemplates.map((template) => (
            <Card key={template}>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-lg">{templateInfo[template].name}</CardTitle>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${templateInfo[template].color}`}>
                    {template}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">{templateInfo[template].description}</p>
                <div className="space-y-2 text-sm">
                  {Object.entries(mockData[template]).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-4">
                      <span className="font-medium text-slate-700">{key}:</span>
                      <span className="truncate text-slate-500">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{t('test')}</h2>
            <p className="text-muted-foreground">{t('testDescription')}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('testTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={sendTestEmail} className="space-y-6">
              <input type="hidden" name="routeLocale" value={locale} />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium" htmlFor="recipientEmail">
                    {t('recipientEmail')}
                  </label>
                  <input
                    id="recipientEmail"
                    name="recipientEmail"
                    type="email"
                    placeholder="test@example.com"
                    required
                    className="w-full mt-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="template">
                    {t('template')}
                  </label>
                  <select
                    id="template"
                    name="template"
                    defaultValue="reset-password"
                    className="w-full mt-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    required
                  >
                    {emailTemplates.map((template) => (
                      <option key={template} value={template}>
                        {templateInfo[template].name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium" htmlFor="locale">
                  {t('locale')}
                </label>
                <select
                  id="locale"
                  name="locale"
                  defaultValue="es"
                  className="w-full mt-1 max-w-xs rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  required
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>

              <Button type="submit">{t('sendTestEmail')}</Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
