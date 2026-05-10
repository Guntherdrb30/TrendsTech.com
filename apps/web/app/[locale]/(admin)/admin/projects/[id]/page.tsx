import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ProjectOverview, ProjectTabs } from '@/components/admin/project-panels';
import { getProjectById } from '@/lib/admin-ai/mock-data';

function buildProjectLabels(t: Awaited<ReturnType<typeof getTranslations>>) {
  return {
    overview: t('projectDetail.overview'),
    finances: t('projectDetail.finances'),
    client: t('fields.client'),
    manager: t('fields.manager'),
    repository: t('fields.repository'),
    domain: t('fields.domain'),
    soldAmount: t('fields.soldAmount'),
    monthlyRevenue: t('fields.monthlyRevenue'),
    monthlyCosts: t('fields.monthlyCosts'),
    monthlyProfit: t('fields.monthlyProfit'),
    tasks: t('tasks.title'),
    task: t('fields.task'),
    status: t('fields.status'),
    priority: t('fields.priority'),
    assignee: t('fields.assignee'),
    deliverables: t('deliverables.title'),
    deliverable: t('fields.deliverable'),
    dueDate: t('fields.dueDate'),
    empty: t('empty'),
    ...Object.fromEntries(['PLANNING', 'ACTIVE', 'PAUSED', 'MAINTENANCE', 'COMPLETED', 'CANCELLED'].map((status) => [`projectStatus.${status}`, t(`status.project.${status}`)])),
    ...Object.fromEntries(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED'].map((status) => [`taskStatus.${status}`, t(`status.task.${status}`)])),
    ...Object.fromEntries(['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority) => [`priority.${priority}`, t(`status.priority.${priority}`)]))
  };
}

export default async function AdminProjectDetailPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const project = getProjectById(id);
  if (!project) {
    notFound();
  }

  const t = await getTranslations('admin');
  const labels = buildProjectLabels(t);

  return (
    <div>
      <ProjectTabs locale={locale} projectId={id} active="overview" labels={labels} />
      <ProjectOverview project={project} locale={locale} labels={labels} />
    </div>
  );
}
