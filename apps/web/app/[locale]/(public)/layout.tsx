import type { ReactNode } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LocaleSwitcher } from '../../components/locale-switcher';
import { ThemeToggle } from '../../components/theme-toggle';

export default async function PublicLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations('nav');
  const { locale } = await params;
  const base = `/${locale}`;

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link href={base} className="text-sm font-semibold">
              Trends172 Tech
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href={base}>{t('home')}</Link>
              <Link href={`${base}/agents`}>{t('agents')}</Link>
              <Link href={`${base}/pricing`}>{t('pricing')}</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href={`${base}/login`} className="text-sm">
              {t('login')}
            </Link>
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
    </div>
  );
}
