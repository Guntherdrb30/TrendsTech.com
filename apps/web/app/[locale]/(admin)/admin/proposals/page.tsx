import { getTranslations } from 'next-intl/server';
import { AdminDataTable, TableCell, TableRow } from '@/components/admin/admin-data-table';
import { MetricCard } from '@/components/admin/metric-card';
import { StatusBadge, getFinanceStatusTone } from '@/components/admin/status-badge';
import { getAdminClients, getAdminProposals } from '@/lib/admin-ai/data';
import { getLocalizedValue } from '@/lib/admin-ai/mock-data';

function money(value: number) {
  return `$${value.toLocaleString('en-US')}`;
}

export default async function AdminProposalsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('admin');
  const [proposals, clients] = await Promise.all([getAdminProposals(), getAdminClients()]);
  const clientMap = new Map(clients.map((client) => [client.id, client]));
  const total = proposals.reduce((sum, proposal) => sum + proposal.amount, 0);
  const accepted = proposals.filter((proposal) => proposal.status === 'ACCEPTED').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t('proposals.title')}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('proposals.subtitle')}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label={t('metrics.proposals')} value={String(proposals.length)} />
        <MetricCard label={t('metrics.acceptedProposals')} value={String(accepted)} accent="emerald" />
        <MetricCard label={t('metrics.pipeline')} value={money(total)} accent="cyan" />
      </div>
      <AdminDataTable
        title={t('proposals.table')}
        columns={[t('fields.proposal'), t('fields.client'), t('fields.status'), t('fields.amount'), t('fields.probability'), t('fields.validUntil')]}
        rows={proposals}
        emptyLabel={t('empty')}
        renderRow={(proposal) => (
          <TableRow key={proposal.id}>
            <TableCell className="font-semibold text-slate-950 dark:text-white">{getLocalizedValue(proposal.title, locale)}</TableCell>
            <TableCell>{clientMap.get(proposal.clientId)?.name ?? '-'}</TableCell>
            <TableCell>
              <StatusBadge label={t(`status.proposal.${proposal.status}`)} tone={getFinanceStatusTone(proposal.status)} />
            </TableCell>
            <TableCell>{money(proposal.amount)}</TableCell>
            <TableCell>{proposal.probability}%</TableCell>
            <TableCell>{proposal.validUntil}</TableCell>
          </TableRow>
        )}
      />
    </div>
  );
}
