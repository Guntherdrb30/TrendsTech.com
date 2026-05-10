import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ProjectTasksTable, ProjectTabs } from '@/components/admin/project-panels';
import { getAdminProjectById } from '@/lib/admin-ai/data';

function buildTaskLabels(t: Awaited<ReturnType<typeof getTranslations>>) {
  return {
    overview: t('projectDetail.overview'),
    finances: t('projectDetail.finances'),
    tasks: t('projectDetail.tasks'),
    deliverables: t('projectDetail.deliverables'),
    integrations: t('projectDetail.integrations'),
    task: t('fields.task'),
    status: t('fields.status'),
    priority: t('fields.priority'),
    assignee: t('fields.assignee'),
    dueDate: t('fields.dueDate'),
    empty: t('empty'),
    ...Object.fromEntries(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED'].map((status) => [`taskStatus.${status}`, t(`status.task.${status}`)])),
    ...Object.fromEntries(['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority) => [`priority.${priority}`, t(`status.priority.${priority}`)]))
  };
}

export default async function AdminProjectTasksPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const project = await getAdminProjectById(id);
  if (!project) {
    notFound();
  }

  const t = await getTranslations('admin');
  const labels = buildTaskLabels(t);

  return (
    <div className="space-y-6">
      <ProjectTabs locale={locale} projectId={id} active="tasks" labels={labels} />
      <ProjectTasksTable project={project} locale={locale} labels={labels} />
    </div>
  );
}
