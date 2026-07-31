import { LegalPage } from '@/components/legal-page';
import { legalContent, resolveLegalLocale } from '@/lib/legal-content';
import { buildLocalizedMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    pathname: 'terms',
    title: { es: 'Términos de uso', en: 'Terms of use' },
    description: { es: 'Condiciones de acceso y uso de los servicios de Trends172Tech LLC.', en: 'Terms governing access to and use of Trends172Tech LLC services.' },
  });
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage locale={locale} content={legalContent.terms[resolveLegalLocale(locale)]} />;
}
