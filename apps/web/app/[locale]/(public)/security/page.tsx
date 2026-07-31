import { LegalPage } from '@/components/legal-page';
import { legalContent, resolveLegalLocale } from '@/lib/legal-content';
import { buildLocalizedMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    pathname: 'security',
    title: { es: 'Seguridad y confianza', en: 'Security and trust' },
    description: { es: 'Controles de seguridad y reporte responsable de Trends172Tech LLC.', en: 'Trends172Tech LLC security controls and responsible reporting.' },
  });
}

export default async function SecurityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPage locale={locale} content={legalContent.security[resolveLegalLocale(locale)]} />;
}
