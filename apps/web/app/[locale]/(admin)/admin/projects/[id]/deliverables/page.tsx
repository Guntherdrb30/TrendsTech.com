import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ProjectDeliverablesTable, ProjectTabs } from '@/components/admin/project-panels';
import { getAdminProjectById } from '@/lib/admin-ai/data';

function buildDeliverableLabels(t: Awaited<ReturnType<typeof getTranslations>>) {
  return {
    overview: t('projectDetail.overview'),
    finances: t('projectDetail.finances'),
    tasks: t('projectDetail.tasks'),
    deliverables: t('projectDetail.deliverables'),
    integrations: t('projectDetail.integrations'),
    deliverable: t('fields.deliverable'),
    status: t('fields.status'),
    dueDate: t('fields.dueDate'),
    empty: t('empty'),
    ...Object.fromEntries(['PENDING', 'DELIVERED', 'APPROVED'].map((status) => [`status.deliverable.${status}`, t(`status.deliverable.${status}`)]))
  };
}

export default async function AdminProjectDeliverablesPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const project = await getAdminProjectById(id);
  if (!project) {
    notFound();
  }

  const t = await getTranslations('admin');
  const labels = buildDeliverableLabels(t);

  return (
    <div className="space-y-6">
      <ProjectTabs locale={locale} projectId={id} active="deliverables" labels={labels} />
      <ProjectDeliverablesTable project={project} locale={locale} labels={labels} />
    </div>
  );
}
