import { EngineeringStudioNewProject } from '../../../../../components/admin/engineering-studio-new-project';

export default async function EngineeringStudioNewProjectPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <EngineeringStudioNewProject locale={locale} />;
}
