import { redirect } from 'next/navigation';

export default async function AdminProjectOverviewRedirect({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  redirect(`/${locale}/admin/projects/${id}`);
}
