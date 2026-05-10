import { getTranslations } from 'next-intl/server';
import { AdminDataTable, TableCell, TableRow } from '@/components/admin/admin-data-table';
import { AdminField, AdminFormCard, AdminSelect, AdminTextInput } from '@/components/admin/admin-form';
import { MetricCard } from '@/components/admin/metric-card';
import { StatusBadge, getFinanceStatusTone } from '@/components/admin/status-badge';
import { createAdminLicense, createAdminSubscription } from '@/lib/admin-ai/actions';
import { getAdminLicenses, getAdminProjects, getAdminSubscriptions } from '@/lib/admin-ai/data';

function money(value: number) {
  return `$${value.toLocaleString('en-US')}`;
}

export default async function AdminLicensesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('admin');
  const [licenses, subscriptions, projects] = await Promise.all([
    getAdminLicenses(),
    getAdminSubscriptions(),
    getAdminProjects()
  ]);
  const projectMap = new Map(projects.map((project) => [project.id, project]));
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
      <div className="grid gap-4 xl:grid-cols-2">
        <AdminFormCard
          title={t('forms.license.title')}
          description={t('forms.license.description')}
          action={createAdminLicense}
          submitLabel={t('forms.license.submit')}
        >
          <input type="hidden" name="locale" value={locale} />
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField id="licenseProjectId" label={t('fields.project')}>
              <AdminSelect id="licenseProjectId" name="projectId" required>
                <option value="">{t('forms.placeholders.selectProject')}</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
            <AdminField id="licenseName" label={t('fields.license')}>
              <AdminTextInput id="licenseName" name="name" placeholder="OpenAI API" required />
            </AdminField>
            <AdminField id="provider" label={t('fields.provider')}>
              <AdminTextInput id="provider" name="provider" placeholder="OpenAI, Vercel, Meta" />
            </AdminField>
            <AdminField id="licenseStatus" label={t('fields.status')}>
              <AdminSelect id="licenseStatus" name="status" defaultValue="ACTIVE">
                <option value="ACTIVE">{t('status.license.ACTIVE')}</option>
                <option value="EXPIRING_SOON">{t('status.license.EXPIRING_SOON')}</option>
                <option value="EXPIRED">{t('status.license.EXPIRED')}</option>
                <option value="CANCELLED">{t('status.license.CANCELLED')}</option>
              </AdminSelect>
            </AdminField>
            <AdminField id="monthlyCost" label={t('fields.monthlyCost')}>
              <AdminTextInput id="monthlyCost" name="monthlyCost" type="number" min="0" step="0.01" defaultValue="0" />
            </AdminField>
            <AdminField id="renewsAt" label={t('fields.renewsAt')}>
              <AdminTextInput id="renewsAt" name="renewsAt" type="date" />
            </AdminField>
          </div>
        </AdminFormCard>
        <AdminFormCard
          title={t('forms.subscription.title')}
          description={t('forms.subscription.description')}
          action={createAdminSubscription}
          submitLabel={t('forms.subscription.submit')}
        >
          <input type="hidden" name="locale" value={locale} />
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField id="subscriptionProjectId" label={t('fields.project')}>
              <AdminSelect id="subscriptionProjectId" name="projectId" required>
                <option value="">{t('forms.placeholders.selectProject')}</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
            <AdminField id="subscriptionName" label={t('forms.fields.subscription')}>
              <AdminTextInput id="subscriptionName" name="name" placeholder="Mantenimiento mensual" required />
            </AdminField>
            <AdminField id="subscriptionStatus" label={t('fields.status')}>
              <AdminSelect id="subscriptionStatus" name="status" defaultValue="ACTIVE">
                <option value="ACTIVE">{t('status.subscription.ACTIVE')}</option>
                <option value="PAUSED">{t('status.subscription.PAUSED')}</option>
                <option value="CANCELLED">{t('status.subscription.CANCELLED')}</option>
                <option value="EXPIRED">{t('status.subscription.EXPIRED')}</option>
              </AdminSelect>
            </AdminField>
            <AdminField id="monthlyAmount" label={t('forms.fields.monthlyAmount')}>
              <AdminTextInput id="monthlyAmount" name="monthlyAmount" type="number" min="0" step="0.01" defaultValue="0" />
            </AdminField>
            <AdminField id="nextBillingAt" label={t('forms.fields.nextBillingAt')}>
              <AdminTextInput id="nextBillingAt" name="nextBillingAt" type="date" />
            </AdminField>
          </div>
        </AdminFormCard>
      </div>
      <AdminDataTable
        title={t('licenses.table')}
        columns={[t('fields.license'), t('fields.project'), t('fields.provider'), t('fields.status'), t('fields.monthlyCost'), t('fields.renewsAt')]}
        rows={licenses}
        emptyLabel={t('empty')}
        renderRow={(license) => (
          <TableRow key={license.id}>
            <TableCell className="font-semibold text-slate-950 dark:text-white">{license.name}</TableCell>
            <TableCell>{projectMap.get(license.projectId)?.name ?? '-'}</TableCell>
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
