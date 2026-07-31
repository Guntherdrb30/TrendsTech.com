import { LegalPage } from '@/components/legal-page';
import { legalContent, resolveLegalLocale } from '@/lib/legal-content';
import { buildLocalizedMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    pathname: 'privacy',
    title: { es: 'Política de privacidad', en: 'Privacy policy' },
    description: { es: 'Conoce cómo Trends172Tech LLC protege y utiliza la información.', en: 'Learn how Trends172Tech LLC protects and uses information.' },
  });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage locale={locale} content={legalContent.privacy[resolveLegalLocale(locale)]} />;
}
