import Link from 'next/link';
import { RegisterForm } from '@/components/register-form';

function getRegisterPageCopy(locale: string) {
  if (locale.startsWith('es')) {
    return {
      title: 'Crear cuenta',
      subtitle: 'Registra para acceder a demos y administrar tus agentes.',
      linkLabel: 'Ya tienes cuenta? Iniciar sesion'
    };
  }
  return {
    title: 'Create account',
    subtitle: 'Register to access demos and manage your agents.',
    linkLabel: 'Already have an account? Sign in'
  };
}

export default async function RegisterPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = getRegisterPageCopy(locale);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{copy.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{copy.subtitle}</p>
        <Link className="text-sm text-blue-600 hover:underline" href={`/${locale}/login`}>
          {copy.linkLabel}
        </Link>
      </div>
      <RegisterForm locale={locale} />
    </section>
  );
}
