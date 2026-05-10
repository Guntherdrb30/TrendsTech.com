import { getTranslations } from 'next-intl/server';
import { AdminDataTable, TableCell, TableRow } from '@/components/admin/admin-data-table';
import { MetricCard } from '@/components/admin/metric-card';
import { StatusBadge, getFinanceStatusTone } from '@/components/admin/status-badge';
import { adminProjects, getProjectLicenses, getProjectSubscriptions } from '@/lib/admin-ai/mock-data';

function money(value: number) {
  return `$${value.toLocaleString('en-US')}`;
}

export default async function AdminLicensesPage() {
  const t = await getTranslations('admin');
  const licenses = getProjectLicenses();
  const subscriptions = getProjectSubscriptions();
  const licenseCost = licenses.reduce((sum, license) => sum + license.monthlyCost, 0);
  const subscriptionRevenue = subscriptions.reduce((sum, subscription) => sum + subscription.monthlyAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t('licenses.title')}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('licenses.subtitle')}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label={t('metrics.licenses')} value={String(licenses.length)} />
        <MetricCard label={t('metrics.licenseCosts')} value={money(licenseCost)} accent="amber" />
        <MetricCard label={t('metrics.subscriptions')} value={String(subscriptions.length)} accent="cyan" />
        <MetricCard label={t('metrics.mrr')} value={money(subscriptionRevenue)} accent="emerald" />
      </div>
      <AdminDataTable
        title={t('licenses.table')}
        columns={[t('fields.license'), t('fields.project'), t('fields.provider'), t('fields.status'), t('fields.monthlyCost'), t('fields.renewsAt')]}
        rows={licenses}
        emptyLabel={t('empty')}
        renderRow={(license) => (
          <TableRow key={license.id}>
            <TableCell className="font-semibold text-slate-950 dark:text-white">{license.name}</TableCell>
            <TableCell>{adminProjects.find((project) => project.id === license.projectId)?.name ?? '-'}</TableCell>
            <TableCell>{license.provider}</TableCell>
            <TableCell>
              <StatusBadge label={t(`status.license.${license.status}`)} tone={getFinanceStatusTone(license.status)} />
            </TableCell>
            <TableCell>{money(license.monthlyCost)}</TableCell>
            <TableCell>{license.renewsAt}</TableCell>
          </TableRow>
        )}
      />
    </div>
  );
}
