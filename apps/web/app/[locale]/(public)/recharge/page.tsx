import { prisma } from '@trends172tech/db';
import { getCurrentUser } from '@/lib/auth/guards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/login-form';
import { RegisterForm } from '@/components/register-form';
import { TokenRechargeForm } from '@/components/token-recharge-form';

function getRechargeCopy(locale: string) {
  if (locale.startsWith('es')) {
    return {
      title: 'Recarga de tokens',
      subtitle: 'Recarga en USD para mantener tus agentes activos.',
      authTitle: 'Accede para continuar',
      authSubtitle: 'Inicia sesion o crea tu cuenta para registrar el pago.',
      tenantTitle: 'Cuenta sin tenant',
      tenantSubtitle: 'Tu cuenta no tiene una empresa activa. Contacta al equipo para habilitarla.'
    };
  }
  return {
    title: 'Token recharge',
    subtitle: 'Top up in USD to keep your agents active.',
    authTitle: 'Access required',
    authSubtitle: 'Sign in or create an account to register the payment.',
    tenantTitle: 'Account missing tenant',
    tenantSubtitle: 'Your account has no active company. Contact support to enable it.'
  };
}

export default async function RechargePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = getRechargeCopy(locale);
  const user = await getCurrentUser();
  const settings = await prisma.globalSettings.findUnique({ where: { id: 1 } });
  const redirectTo = `/${locale}/recharge`;

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{copy.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{copy.subtitle}</p>
      </div>

      {user && !user.tenantId ? (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>{copy.tenantTitle}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-500 dark:text-slate-400">
            {copy.tenantSubtitle}
          </CardContent>
        </Card>
      ) : user ? (
        <TokenRechargeForm
          locale={locale}
          zelleRecipientName={settings?.zelleRecipientName ?? null}
          zelleEmail={settings?.zelleEmail ?? null}
          zellePhone={settings?.zellePhone ?? null}
        />
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{copy.authTitle}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{copy.authSubtitle}</p>
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
