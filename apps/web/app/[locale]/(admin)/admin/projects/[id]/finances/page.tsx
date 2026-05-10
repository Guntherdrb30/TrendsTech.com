import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ProjectFinanceSummary, ProjectLicensesTable, ProjectTabs } from '@/components/admin/project-panels';
import { getAdminProjectById } from '@/lib/admin-ai/data';

function buildFinanceLabels(t: Awaited<ReturnType<typeof getTranslations>>) {
  return {
    overview: t('projectDetail.overview'),
    finances: t('projectDetail.finances'),
    initialBudget: t('fields.initialBudget'),
    soldAmount: t('fields.soldAmount'),
    recurringMonthly: t('fields.recurringMonthly'),
    estimatedProfit: t('fields.estimatedProfit'),
    costBreakdown: t('finances.costBreakdown'),
    operationalCosts: t('fields.operationalCosts'),
    licenseCosts: t('fields.licenseCosts'),
    totalCosts: t('fields.totalCosts'),
    collectionStatus: t('finances.collectionStatus'),
    pendingInvoices: t('metrics.pendingInvoices'),
    overduePayments: t('metrics.overduePayments'),
    licenses: t('licenses.title'),
    license: t('fields.license'),
    provider: t('fields.provider'),
    status: t('fields.status'),
    monthlyCost: t('fields.monthlyCost'),
    renewsAt: t('fields.renewsAt'),
    empty: t('empty'),
    ...Object.fromEntries(['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'CANCELLED'].map((status) => [`licenseStatus.${status}`, t(`status.license.${status}`)]))
  };
}

export default async function AdminProjectFinancesPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const project = await getAdminProjectById(id);
  if (!project) {
    notFound();
  }

  const t = await getTranslations('admin');
  const labels = buildFinanceLabels(t);

  return (
    <div>
      <ProjectTabs locale={locale} projectId={id} active="finances" labels={labels} />
      <div className="space-y-6">
        <ProjectFinanceSummary project={project} locale={locale} labels={labels} />
        <ProjectLicensesTable project={project} locale={locale} labels={labels} />
      </div>
    </div>
  );
}
