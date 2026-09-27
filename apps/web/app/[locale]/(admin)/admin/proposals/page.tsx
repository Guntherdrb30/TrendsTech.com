import { ProposalLinkActions } from '@/components/admin/proposal-link-actions';
import { getTranslations } from 'next-intl/server';
import { AdminDataTable, TableCell, TableRow } from '@/components/admin/admin-data-table';
import { AdminField, AdminFormCard, AdminSelect, AdminTextarea, AdminTextInput } from '@/components/admin/admin-form';
import { MetricCard } from '@/components/admin/metric-card';
import { StatusBadge, getFinanceStatusTone } from '@/components/admin/status-badge';
import { createAdminProposal } from '@/lib/admin-ai/actions';
import { getAdminClients, getAdminProposals } from '@/lib/admin-ai/data';
import { getLocalizedValue } from '@/lib/admin-ai/localization';

function money(value: number) {
  return `$${value.toLocaleString('en-US')}`;
}

export default async function AdminProposalsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('admin');
  const es = locale.startsWith('es');
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
      <section className="space-y-4" aria-label={es ? 'Propuestas publicadas' : 'Published proposals'}>
        <div><h3 className="text-lg font-semibold">{es ? 'Propuestas listas para compartir' : 'Proposals ready to share'}</h3><p className="mt-1 text-sm text-slate-500">{es ? 'Abre la presentación completa, consulta su alcance o copia el enlace para enviarlo al cliente.' : 'Open the full presentation, review its scope or copy its client link.'}</p></div>
        <div className="grid gap-4 xl:grid-cols-2">
          {proposals.filter(proposal => proposal.presentationUrl).map(proposal => (
            <article key={proposal.id} className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">{clientMap.get(proposal.clientId)?.name}</p>
              <h4 className="mt-2 text-xl font-semibold">{getLocalizedValue(proposal.title, locale)}</h4>
              <div className="my-4 flex flex-wrap items-center gap-3"><StatusBadge label={t(`status.proposal.${proposal.status}`)} tone={getFinanceStatusTone(proposal.status)} /><span className="text-sm text-slate-500">{proposal.amount === 0 ? (es ? 'Inversión por definir' : 'Investment to be defined') : money(proposal.amount)}</span></div>
              <ProposalLinkActions url={proposal.presentationUrl!} locale={locale} />
              <details className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-700"><summary className="cursor-pointer text-sm font-semibold">{es ? 'Ver alcance y condiciones' : 'View scope and terms'}</summary><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300">{proposal.summary}</p></details>
            </article>
          ))}
        </div>
      </section>
      <section className="rounded-xl border border-teal-200 bg-teal-50/60 p-5 dark:border-teal-900 dark:bg-teal-950/30">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">{es ? 'Material comercial general' : 'General sales material'}</p>
        <h3 className="mt-2 text-lg font-semibold">FDE · Software + IA aplicada a negocios reales</h3>
        <p className="mb-4 mt-2 text-sm text-slate-600 dark:text-slate-300">{es ? 'Presentación corporativa de Trends172Tech. Disponible para compartir; sin cliente ni importe comercial asociado.' : 'Trends172Tech corporate presentation, available to share without an associated client or commercial amount.'}</p>
        <ProposalLinkActions url="https://www.trends172tech.com/presentaciones/fde.html" locale={locale} />
      </section>
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
            <AdminField id="presentationUrl" label={es ? 'Enlace de presentación (opcional)' : 'Presentation link (optional)'}>
              <AdminTextInput id="presentationUrl" name="presentationUrl" type="url" placeholder="https://www.trends172tech.com/es/propuestas/..." />
            </AdminField>
          </div>
          <div className="lg:col-span-4">
            <AdminField id="summary" label={t('forms.fields.summary')}>
              <AdminTextarea id="summary" name="summary" rows={3} placeholder={t('forms.placeholders.proposalSummary')} />
            </AdminField>
          </div>
        </div>
      </AdminFormCard>
      <AdminDataTable
        title={t('proposals.table')}
        columns={[t('fields.proposal'), t('fields.client'), t('fields.status'), t('fields.amount'), t('fields.probability'), t('fields.validUntil'), es ? 'Presentación' : 'Presentation']}
        rows={proposals}
        emptyLabel={t('empty')}
        renderRow={(proposal) => (
          <TableRow key={proposal.id}>
            <TableCell className="font-semibold text-slate-950 dark:text-white">{getLocalizedValue(proposal.title, locale)}</TableCell>
            <TableCell>{clientMap.get(proposal.clientId)?.name ?? '-'}</TableCell>
            <TableCell>
              <StatusBadge label={t(`status.proposal.${proposal.status}`)} tone={getFinanceStatusTone(proposal.status)} />
            </TableCell>
            <TableCell>{proposal.presentationUrl && proposal.amount === 0 ? (es ? 'Por definir' : 'To be defined') : money(proposal.amount)}</TableCell>
            <TableCell>{proposal.probability}%</TableCell>
            <TableCell>{proposal.validUntil || '—'}</TableCell>
            <TableCell>{proposal.presentationUrl ? <ProposalLinkActions url={proposal.presentationUrl} locale={locale} /> : '—'}</TableCell>
          </TableRow>
        )}
      />
    </div>
  );
}
