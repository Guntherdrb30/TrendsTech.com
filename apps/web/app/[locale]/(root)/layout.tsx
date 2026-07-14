import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SiteHeader } from '../../components/site-header';

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

export default async function RootAreaLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen">
      <SiteHeader locale={locale} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">{children}</main>
    </div>
  );
}
