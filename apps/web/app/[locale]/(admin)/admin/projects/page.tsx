import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { AdminDataTable, TableCell, TableRow } from '@/components/admin/admin-data-table';
import { AdminField, AdminFormCard, AdminSelect, AdminTextarea, AdminTextInput } from '@/components/admin/admin-form';
import { MetricCard } from '@/components/admin/metric-card';
import { StatusBadge, getProjectStatusTone } from '@/components/admin/status-badge';
import { createAdminProject } from '@/lib/admin-ai/actions';
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
      <AdminFormCard
        title={t('forms.project.title')}
        description={t('forms.project.description')}
        action={createAdminProject}
        submitLabel={t('forms.project.submit')}
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
          <AdminField id="name" label={t('fields.project')}>
            <AdminTextInput id="name" name="name" placeholder="LUNA Enterprise" required />
          </AdminField>
          <AdminField id="status" label={t('fields.status')}>
            <AdminSelect id="status" name="status" defaultValue="PLANNING">
              <option value="PLANNING">{t('status.project.PLANNING')}</option>
              <option value="ACTIVE">{t('status.project.ACTIVE')}</option>
              <option value="MAINTENANCE">{t('status.project.MAINTENANCE')}</option>
              <option value="PAUSED">{t('status.project.PAUSED')}</option>
            </AdminSelect>
          </AdminField>
          <AdminField id="priority" label={t('fields.priority')}>
            <AdminSelect id="priority" name="priority" defaultValue="MEDIUM">
              <option value="LOW">{t('status.priority.LOW')}</option>
              <option value="MEDIUM">{t('status.priority.MEDIUM')}</option>
              <option value="HIGH">{t('status.priority.HIGH')}</option>
              <option value="URGENT">{t('status.priority.URGENT')}</option>
            </AdminSelect>
          </AdminField>
          <AdminField id="soldAmount" label={t('fields.soldAmount')}>
            <AdminTextInput id="soldAmount" name="soldAmount" type="number" min="0" step="0.01" defaultValue="0" />
          </AdminField>
          <AdminField id="monthlyRetainer" label={t('fields.recurringMonthly')}>
            <AdminTextInput id="monthlyRetainer" name="monthlyRetainer" type="number" min="0" step="0.01" defaultValue="0" />
          </AdminField>
          <AdminField id="operationalCostsMonthly" label={t('fields.operationalCosts')}>
            <AdminTextInput id="operationalCostsMonthly" name="operationalCostsMonthly" type="number" min="0" step="0.01" defaultValue="0" />
          </AdminField>
          <AdminField id="licenseCostsMonthly" label={t('fields.licenseCosts')}>
            <AdminTextInput id="licenseCostsMonthly" name="licenseCostsMonthly" type="number" min="0" step="0.01" defaultValue="0" />
          </AdminField>
          <AdminField id="manager" label={t('fields.manager')}>
            <AdminTextInput id="manager" name="manager" placeholder="Responsable interno" />
          </AdminField>
          <AdminField id="paymentMethod" label={t('forms.fields.paymentMethod')}>
            <AdminTextInput id="paymentMethod" name="paymentMethod" placeholder="Transferencia, Zelle, Stripe" />
          </AdminField>
          <AdminField id="soldAt" label={t('forms.fields.soldAt')}>
            <AdminTextInput id="soldAt" name="soldAt" type="date" />
          </AdminField>
          <AdminField id="domain" label={t('fields.domain')}>
            <AdminTextInput id="domain" name="domain" placeholder="cliente.com" />
          </AdminField>
          <AdminField id="systemName" label={t('forms.fields.systemName')}>
            <AdminTextInput id="systemName" name="systemName" placeholder="LUNA" />
          </AdminField>
          <AdminField id="repositoryUrl" label={t('fields.repository')}>
            <AdminTextInput id="repositoryUrl" name="repositoryUrl" type="url" placeholder="https://github.com/..." />
          </AdminField>
          <AdminField id="vercelProject" label={t('forms.fields.vercelProject')}>
            <AdminTextInput id="vercelProject" name="vercelProject" placeholder="project-name" />
          </AdminField>
          <AdminField id="databaseName" label={t('forms.fields.database')}>
            <AdminTextInput id="databaseName" name="databaseName" placeholder="Neon / Postgres" />
          </AdminField>
          <div className="lg:col-span-2">
            <AdminField id="stack" label={t('forms.fields.stack')}>
              <AdminTextInput id="stack" name="stack" placeholder="Next.js, Prisma, Postgres, Vercel" />
            </AdminField>
          </div>
          <div className="lg:col-span-2">
            <AdminField id="description" label={t('forms.fields.description')}>
              <AdminTextarea id="description" name="description" rows={3} placeholder={t('forms.placeholders.projectDescription')} />
            </AdminField>
          </div>
        </div>
      </AdminFormCard>
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
