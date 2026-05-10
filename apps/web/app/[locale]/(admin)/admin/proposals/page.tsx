import { getTranslations } from 'next-intl/server';
import { AdminDataTable, TableCell, TableRow } from '@/components/admin/admin-data-table';
import { AdminField, AdminFormCard, AdminSelect, AdminTextarea, AdminTextInput } from '@/components/admin/admin-form';
import { MetricCard } from '@/components/admin/metric-card';
import { StatusBadge, getFinanceStatusTone } from '@/components/admin/status-badge';
import { createAdminProposal } from '@/lib/admin-ai/actions';
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
      <AdminFormCard
        title={t('forms.proposal.title')}
        description={t('forms.proposal.description')}
        action={createAdminProposal}
        submitLabel={t('forms.proposal.submit')}
      >
        <input type="hidden" name="locale" value={locale} />
        <div className="grid gap-4 lg:grid-cols-4">
          <AdminField id="clientId" label={t('fields.client')}>
            <AdminSelect id="clientId" name="clientId" required>
              <option value="">{t('forms.placeholders.selectClient')}</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField id="title" label={t('fields.proposal')}>
            <AdminTextInput id="title" name="title" placeholder="Implementacion LUNA" required />
          </AdminField>
          <AdminField id="status" label={t('fields.status')}>
            <AdminSelect id="status" name="status" defaultValue="DRAFT">
              <option value="DRAFT">{t('status.proposal.DRAFT')}</option>
              <option value="SENT">{t('status.proposal.SENT')}</option>
              <option value="ACCEPTED">{t('status.proposal.ACCEPTED')}</option>
              <option value="REJECTED">{t('status.proposal.REJECTED')}</option>
              <option value="EXPIRED">{t('status.proposal.EXPIRED')}</option>
            </AdminSelect>
          </AdminField>
          <AdminField id="amount" label={t('fields.amount')}>
            <AdminTextInput id="amount" name="amount" type="number" min="0" step="0.01" defaultValue="0" />
          </AdminField>
          <AdminField id="probability" label={t('fields.probability')}>
            <AdminTextInput id="probability" name="probability" type="number" min="0" max="100" defaultValue="50" />
          </AdminField>
          <AdminField id="sentAt" label={t('forms.fields.sentAt')}>
            <AdminTextInput id="sentAt" name="sentAt" type="date" />
          </AdminField>
          <AdminField id="validUntil" label={t('fields.validUntil')}>
            <AdminTextInput id="validUntil" name="validUntil" type="date" />
          </AdminField>
          <div className="lg:col-span-4">
            <AdminField id="summary" label={t('forms.fields.summary')}>
              <AdminTextarea id="summary" name="summary" rows={3} placeholder={t('forms.placeholders.proposalSummary')} />
            </AdminField>
          </div>
        </div>
      </AdminFormCard>
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
