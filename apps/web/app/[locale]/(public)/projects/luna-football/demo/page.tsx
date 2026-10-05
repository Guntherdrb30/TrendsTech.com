import { permanentRedirect } from 'next/navigation';

type PageParams = { locale: string };

export default async function LunaFootballDemoRedirect({
  params
}: {
  params: Promise<PageParams>;
}) {
  const { locale } = await params;
  permanentRedirect(`/${locale}/projects/luna-football`);
}
