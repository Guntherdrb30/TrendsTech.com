import { LunaRootClient } from './luna-root-client';

export default async function LunaRootPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LunaRootClient locale={locale} />;
}
