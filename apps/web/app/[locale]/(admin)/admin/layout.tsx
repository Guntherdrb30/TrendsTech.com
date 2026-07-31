import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { requireRole } from '@/lib/auth/guards';
import { AdminShell } from '@/components/admin/admin-shell';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

export default async function AdminLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireRole('ROOT');
  const t = await getTranslations('admin.shell');

  return (
    <AdminShell
      locale={locale}
      labels={{
        title: t('title'),
        subtitle: t('subtitle'),
        navigation: t('navigation'),
        dashboard: t('dashboard'),
        clients: t('clients'),
        projects: t('projects'),
        proposals: t('proposals'),
        licenses: t('licenses'),
        aiAgents: t('aiAgents'),
        luna: t('luna'),
        payments: t('payments'),
        systemNavigation: t('systemNavigation'),
        systemControl: t('systemControl'),
        users: t('users'),
        recharges: t('recharges'),
        tenants: t('tenants'),
        siteMedia: t('siteMedia'),
        globalSettings: t('globalSettings'),
        backToSite: t('backToSite')
      }}
    >
      {children}
    </AdminShell>
  );
}
