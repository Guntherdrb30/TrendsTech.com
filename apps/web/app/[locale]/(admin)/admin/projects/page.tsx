import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { AdminDataTable, TableCell, TableRow } from '@/components/admin/admin-data-table';
import { MetricCard } from '@/components/admin/metric-card';
import { StatusBadge, getProjectStatusTone } from '@/components/admin/status-badge';
import { getAdminClients, getAdminProjects } from '@/lib/admin-ai/data';

function money(value: number) {
  return `$${value.toLocaleString('en-US')}`;
}

export default async function AdminProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('admin');
  const [projects, clients] = await Promise.all([getAdminProjects(), getAdminClients()]);
  const clientMap = new Map(clients.map((client) => [client.id, client]));
  const sold = projects.reduce((sum, project) => sum + project.finance.soldAmount, 0);
  const mrr = projects.reduce((sum, project) => sum + project.finance.recurringMonthly, 0);
  const profit = projects.reduce((sum, project) => sum + project.finance.estimatedMonthlyProfit, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t('projects.title')}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('projects.subtitle')}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label={t('metrics.projects')} value={String(projects.length)} />
        <MetricCard label={t('metrics.soldTotal')} value={money(sold)} accent="emerald" />
        <MetricCard label={t('metrics.mrr')} value={money(mrr)} accent="cyan" />
        <MetricCard label={t('metrics.estimatedProfit')} value={money(profit)} accent="slate" />
      </div>
      <AdminDataTable
        title={t('projects.table')}
        columns={[t('fields.project'), t('fields.client'), t('fields.status'), t('fields.manager'), t('fields.mrr'), t('fields.actions')]}
        rows={projects}
        emptyLabel={t('empty')}
        renderRow={(project) => (
          <TableRow key={project.id}>
            <TableCell className="font-semibold text-slate-950 dark:text-white">{project.name}</TableCell>
            <TableCell>{clientMap.get(project.clientId)?.name ?? '-'}</TableCell>
            <TableCell>
              <StatusBadge label={t(`status.project.${project.status}`)} tone={getProjectStatusTone(project.status)} />
            </TableCell>
            <TableCell>{project.manager}</TableCell>
            <TableCell>{money(project.finance.recurringMonthly)}</TableCell>
            <TableCell>
              <Link className="font-semibold text-cyan-700 dark:text-cyan-300" href={`/${locale}/admin/projects/${project.id}`}>
                {t('actions.open')}
              </Link>
            </TableCell>
          </TableRow>
        )}
      />
    </div>
  );
}
