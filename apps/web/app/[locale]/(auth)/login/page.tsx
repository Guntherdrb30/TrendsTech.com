import Link from 'next/link';
import { LoginForm } from '@/components/login-form';

function getLoginPageCopy(locale: string) {
  if (locale.startsWith('es')) {
    return {
      title: 'Iniciar sesion',
      subtitle: 'Solo credenciales (dev).',
      linkLabel: 'Crear cuenta',
      forgotLabel: 'Olvidaste tu contrasena?'
    };
  }
  return {
    title: 'Login',
    subtitle: 'Credentials only (dev).',
    linkLabel: 'Create an account',
    forgotLabel: 'Forgot your password?'
  };
}

export default async function LoginPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = getLoginPageCopy(locale);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{copy.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{copy.subtitle}</p>
        <Link className="text-sm text-blue-600 hover:underline" href={`/${locale}/register`}>
          {copy.linkLabel}
        </Link>
        <Link className="text-sm text-blue-600 hover:underline" href={`/${locale}/forgot-password`}>
          {copy.forgotLabel}
        </Link>
      </div>
      <LoginForm locale={locale} />
    </section>
  );
}
