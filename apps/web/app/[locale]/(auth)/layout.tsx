import type { ReactNode } from 'react';
import { SiteHeader } from '../../components/site-header';

export default async function AuthLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f8fb_0%,#ffffff_18%,#f8fafc_100%)]">
      <SiteHeader locale={locale} />
      <main className="mx-auto w-full max-w-[1760px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 xl:px-12 2xl:px-16">
        {children}
      </main>
    </div>
  );
}
