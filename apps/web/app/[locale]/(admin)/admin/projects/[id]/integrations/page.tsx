import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ProjectIntegrationsTable, ProjectTabs } from '@/components/admin/project-panels';
import { getAdminProjectById } from '@/lib/admin-ai/data';

function buildIntegrationLabels(t: Awaited<ReturnType<typeof getTranslations>>) {
  return {
    overview: t('projectDetail.overview'),
    finances: t('projectDetail.finances'),
    tasks: t('projectDetail.tasks'),
    deliverables: t('projectDetail.deliverables'),
    integrations: t('projectDetail.integrations'),
    integration: t('fields.integration'),
    type: t('fields.type'),
    status: t('fields.status'),
    empty: t('empty'),
    ...Object.fromEntries(['CONNECTED', 'PENDING', 'ISSUE'].map((status) => [`status.integration.${status}`, t(`status.integration.${status}`)]))
  };
}

export default async function AdminProjectIntegrationsPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const project = await getAdminProjectById(id);
  if (!project) {
    notFound();
  }

  const t = await getTranslations('admin');
  const labels = buildIntegrationLabels(t);

  return (
    <div className="space-y-6">
      <ProjectTabs locale={locale} projectId={id} active="integrations" labels={labels} />
      <ProjectIntegrationsTable project={project} locale={locale} labels={labels} />
    </div>
  );
}
