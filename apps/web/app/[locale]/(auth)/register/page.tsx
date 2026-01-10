import Link from 'next/link';
import { RegisterForm } from '@/components/register-form';

export default async function RegisterPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Register to access demos and manage your agents.
        </p>
        <Link className="text-sm text-blue-600 hover:underline" href={`/${locale}/login`}>
          Already have an account? Sign in
        </Link>
      </div>
      <RegisterForm locale={locale} />
    </section>
  );
}
