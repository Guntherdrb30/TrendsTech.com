import type { ReactNode } from 'react';
import { SiteHeader } from '../../components/site-header';
import { PublicSiteFooter } from '../../components/public-site-footer';

export default async function PublicLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f8fb_0%,#ffffff_20%,#f8fafc_100%)]">
      <SiteHeader locale={locale} />
      <main className="w-full">{children}</main>
      <PublicSiteFooter locale={locale} />
    </div>
  );
}
