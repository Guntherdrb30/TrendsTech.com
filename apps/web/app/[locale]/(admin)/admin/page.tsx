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
  const dataTimestamp = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC'
  }).format(new Date());

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[28px] border border-cyan-100 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_34%),linear-gradient(135deg,#ffffff_0%,#f0fdfa_100%)] px-6 py-7 shadow-[0_30px_90px_-65px_rgba(8,145,178,0.55)] dark:border-cyan-950 dark:bg-slate-950 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-600">
              {locale.startsWith('es') ? 'Operación multiempresa' : 'Multi-company operations'}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
              {t('dashboard.title')}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {t('dashboard.subtitle')}
            </p>
            <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              {locale.startsWith('es') ? 'Fuente: base operativa' : 'Source: operational database'} · {dataTimestamp} UTC
            </p>
          </div>
          <Link
            href={`/${locale}/admin/projects`}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 dark:bg-white dark:text-slate-950"
          >
            {locale.startsWith('es') ? 'Gestionar proyectos' : 'Manage projects'}
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
