import type { Metadata } from 'next';
import { prisma } from '@trends172tech/db';
import { getCurrentUser } from '@/lib/auth/guards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/login-form';
import { RegisterForm } from '@/components/register-form';
import { RechargeForm } from './recharge-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

function getCopy(locale: string) {
  if (locale.startsWith('es')) {
    return {
      title: 'Recargar créditos',
      subtitle: 'Elige tu moneda y método de pago para mantener tus agentes activos.',
      authTitle: 'Accede para continuar',
      authSubtitle: 'Inicia sesión o crea tu cuenta para registrar el pago.',
      tenantTitle: 'Cuenta sin empresa',
      tenantSubtitle: 'Tu cuenta no tiene una empresa activa. Contacta al equipo para habilitarla.'
    };
  }
  return {
    title: 'Recharge credits',
    subtitle: 'Choose your currency and payment method to keep your agents active.',
    authTitle: 'Access required',
    authSubtitle: 'Sign in or create an account to register the payment.',
    tenantTitle: 'Account missing tenant',
    tenantSubtitle: 'Your account has no active company. Contact support to enable it.'
  };
}

export default async function RechargePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const copy = getCopy(locale);
  const user = await getCurrentUser();
  const settings = await prisma.globalSettings.findUnique({ where: { id: 1 } });
  const redirectTo = `/${locale}/recharge`;

  const bcvRate = settings?.usdToVesRate ? Number(settings.usdToVesRate) : null;
  const vesMarkup = settings?.vesMarkupPercent ? Number(settings.vesMarkupPercent) : 30;
  const bcvUpdatedAt = settings?.bcvRateUpdatedAt ?? null;

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{copy.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{copy.subtitle}</p>
      </div>

      {user && !user.tenantId ? (
        <Card className="max-w-xl">
          <CardHeader><CardTitle>{copy.tenantTitle}</CardTitle></CardHeader>
          <CardContent className="text-sm text-slate-500">{copy.tenantSubtitle}</CardContent>
        </Card>
      ) : user ? (
        <RechargeForm
          locale={locale}
          zelleEmail={settings?.zelleEmail ?? null}
          zelleRecipientName={settings?.zelleRecipientName ?? null}
          binanceEmail={settings?.binanceEmail ?? null}
          pagoMovilPhone={settings?.pagoMovilPhone ?? null}
          pagoMovilBank={settings?.pagoMovilBank ?? null}
          pagoMovilCedula={settings?.pagoMovilCedula ?? null}
          bcvRate={bcvRate}
          vesMarkupPercent={vesMarkup}
          bcvUpdatedAt={bcvUpdatedAt ? bcvUpdatedAt.toISOString() : null}
        />
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{copy.authTitle}</h2>
            <p className="text-sm text-slate-500">{copy.authSubtitle}</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <LoginForm locale={locale} redirectTo={redirectTo} />
            <RegisterForm locale={locale} redirectTo={redirectTo} />
          </div>
        </div>
      )}
    </section>
  );
}
