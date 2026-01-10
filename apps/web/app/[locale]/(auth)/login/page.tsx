import Link from 'next/link';
import { LoginForm } from '@/components/login-form';

export default async function LoginPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Credentials only (dev).</p>
        <Link className="text-sm text-blue-600 hover:underline" href={`/${locale}/register`}>
          Create an account
        </Link>
      </div>
      <LoginForm locale={locale} />
    </section>
  );
}
