import { requirePartner } from '@/lib/partners/access';
import { PartnerShell } from '@/components/partner/partner-shell';

export const dynamic = 'force-dynamic';

export default async function PartnerLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { partner } = await requirePartner(locale);

  return <PartnerShell locale={locale} partnerName={partner.companyName}>{children}</PartnerShell>;
}
