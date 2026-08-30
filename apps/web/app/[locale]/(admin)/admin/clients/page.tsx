import { getTranslations } from 'next-intl/server';
import { AdminDataTable, TableCell, TableRow } from '@/components/admin/admin-data-table';
import { AdminField, AdminFormCard, AdminTextInput } from '@/components/admin/admin-form';
import { MetricCard } from '@/components/admin/metric-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { createAdminClient } from '@/lib/admin-ai/actions';
import { getAdminClients } from '@/lib/admin-ai/data';
import { getLocalizedValue } from '@/lib/admin-ai/localization';

function money(value: number) {
  return `$${value.toLocaleString('en-US')}`;
}

export default async function AdminClientsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('admin');
  const clients = await getAdminClients();
  const totalMrr = clients.reduce((sum, client) => sum + client.mrr, 0);
  const openBalance = clients.reduce((sum, client) => sum + client.openBalance, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t('clients.title')}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('clients.subtitle')}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label={t('metrics.clients')} value={String(clients.length)} />
        <MetricCard label={t('metrics.mrr')} value={money(totalMrr)} accent="emerald" />
        <MetricCard label={t('metrics.openBalance')} value={money(openBalance)} accent="amber" />
      </div>
      <AdminFormCard
        title={t('forms.client.title')}
        description={t('forms.client.description')}
        action={createAdminClient}
        submitLabel={t('forms.client.submit')}
      >
        <input type="hidden" name="locale" value={locale} />
        <div className="grid gap-4 md:grid-cols-3">
          <AdminField id="name" label={t('forms.fields.company')}>
            <AdminTextInput id="name" name="name" placeholder="Trends172 Tech" required />
          </AdminField>
          <AdminField id="contactName" label={t('forms.fields.contactName')}>
            <AdminTextInput id="contactName" name="contactName" placeholder="Gunther Del Rosario" />
          </AdminField>
          <AdminField id="email" label={t('forms.fields.email')}>
            <AdminTextInput id="email" name="email" type="email" placeholder="cliente@empresa.com" />
          </AdminField>
          <AdminField id="phone" label={t('forms.fields.phone')}>
            <AdminTextInput id="phone" name="phone" placeholder="+58..." />
          </AdminField>
          <AdminField id="country" label={t('forms.fields.country')}>
            <AdminTextInput id="country" name="country" placeholder="Venezuela" />
          </AdminField>
          <AdminField id="industry" label={t('forms.fields.industry')}>
            <AdminTextInput id="industry" name="industry" placeholder="Retail, servicios, ecommerce" />
          </AdminField>
        </div>
      </AdminFormCard>
      <AdminDataTable
        title={t('clients.table')}
        columns={[t('fields.client'), t('fields.contact'), t('fields.industry'), t('fields.projects'), t('fields.mrr'), t('fields.health')]}
        rows={clients}
        emptyLabel={t('empty')}
        renderRow={(client) => (
          <TableRow key={client.id}>
            <TableCell>
              <div className="font-semibold text-slate-950 dark:text-white">{client.name}</div>
              <div className="text-xs text-slate-500">{client.email}</div>
            </TableCell>
            <TableCell>{client.contactName}</TableCell>
            <TableCell>{getLocalizedValue(client.industry, locale)}</TableCell>
            <TableCell>{client.activeProjects}</TableCell>
            <TableCell>{money(client.mrr)}</TableCell>
            <TableCell>
              <StatusBadge label={t(`status.health.${client.health}`)} tone={client.health === 'GOOD' ? 'success' : client.health === 'WATCH' ? 'warning' : 'danger'} />
            </TableCell>
          </TableRow>
        )}
      />
    </div>
  );
}
