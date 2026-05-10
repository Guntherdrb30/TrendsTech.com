import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ActivityFeed } from '@/components/admin/activity-feed';
import { AdminDataTable, TableCell, TableRow } from '@/components/admin/admin-data-table';
import { MetricCard } from '@/components/admin/metric-card';
import { StatusBadge, getProjectStatusTone } from '@/components/admin/status-badge';
import { getAdminActivity, getAdminClients, getAdminOverview, getAdminProjects } from '@/lib/admin-ai/data';

function money(value: number) {
  return `$${value.toLocaleString('en-US')}`;
}

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('admin');
  const [overview, projects, clients, activity] = await Promise.all([
    getAdminOverview(),
    getAdminProjects(),
    getAdminClients(),
    getAdminActivity()
  ]);
  const clientMap = new Map(clients.map((client) => [client.id, client]));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{t('dashboard.title')}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t('metrics.monthSales')} value={money(overview.monthSales)} accent="emerald" />
        <MetricCard label={t('metrics.budgetsSent')} value={String(overview.budgetsSent)} accent="cyan" />
        <MetricCard label={t('metrics.acceptedProposals')} value={String(overview.acceptedProposals)} accent="slate" />
        <MetricCard label={t('metrics.activeProjects')} value={String(overview.activeProjects)} accent="amber" />
        <MetricCard label={t('metrics.activeSubscriptions')} value={String(overview.activeSubscriptions)} accent="cyan" />
        <MetricCard label={t('metrics.mrr')} value={money(overview.monthlyRecurringRevenue)} accent="emerald" />
        <MetricCard label={t('metrics.pendingInvoices')} value={String(overview.pendingInvoices)} accent="amber" />
        <MetricCard label={t('metrics.overduePayments')} value={String(overview.overduePayments)} accent="red" />
        <MetricCard label={t('metrics.expiringLicenses')} value={String(overview.expiringLicenses)} accent="amber" />
        <MetricCard label={t('metrics.overdueTasks')} value={String(overview.overdueTasks)} accent="red" />
        <MetricCard label={t('metrics.maintenanceProjects')} value={String(overview.maintenanceProjects)} accent="cyan" />
        <MetricCard label={t('metrics.estimatedProfit')} value={money(overview.estimatedMonthlyProfit)} accent="emerald" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <AdminDataTable
          title={t('tables.activeProjects')}
          columns={[t('fields.project'), t('fields.client'), t('fields.status'), t('fields.mrr'), t('fields.actions')]}
          rows={projects}
          emptyLabel={t('empty')}
          renderRow={(project) => (
            <TableRow key={project.id}>
              <TableCell className="font-semibold text-slate-950 dark:text-white">{project.name}</TableCell>
              <TableCell>{clientMap.get(project.clientId)?.name ?? '-'}</TableCell>
              <TableCell>
                <StatusBadge label={t(`status.project.${project.status}`)} tone={getProjectStatusTone(project.status)} />
              </TableCell>
              <TableCell>{money(project.finance.recurringMonthly)}</TableCell>
              <TableCell>
                <Link className="text-sm font-semibold text-cyan-700 dark:text-cyan-300" href={`/${locale}/admin/projects/${project.id}`}>
                  {t('actions.open')}
                </Link>
              </TableCell>
            </TableRow>
          )}
        />
        <ActivityFeed title={t('activity.title')} locale={locale} items={activity} />
      </div>
    </div>
  );
}
