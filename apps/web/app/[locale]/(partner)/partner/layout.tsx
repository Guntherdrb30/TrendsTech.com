import { prisma } from '@trends172tech/db';
import { requirePartner } from '@/lib/auth/partner-guard';
import { PartnerShell } from '@/components/partner/partner-shell';

export const dynamic = 'force-dynamic';

export default async function PartnerLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requirePartner();
  const partner = await prisma.partner.findUnique({
    where: { userId: user.id },
    select: { companyName: true, status: true }
  });

  if (!partner) {
    throw new Error('Partner profile not found.');
  }

  if (partner.status === 'SUSPENDED') {
    throw new Error('Partner account suspended.');
  }

  return <PartnerShell locale={locale} partnerName={partner.companyName}>{children}</PartnerShell>;
}
