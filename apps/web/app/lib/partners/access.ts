import { redirect } from 'next/navigation';
import { prisma } from '@trends172tech/db';
import { getCurrentUser } from '@/lib/auth/guards';

type PartnerAccessRow = {
  id: string;
  companyName: string;
  status: string;
};

export async function requirePartner(locale = 'es') {
  const user = await getCurrentUser();

  if (!user) redirect(`/${locale}/login`);
  if (user.role !== 'PARTNER') redirect(`/${locale}/dashboard`);
  if (!user.emailVerified) redirect(`/${locale}/verify-email`);

  const rows = await prisma.$queryRaw<PartnerAccessRow[]>`
    SELECT "id", "companyName", "status"
    FROM "Partner"
    WHERE "userId" = ${user.id}
    LIMIT 1
  `;
  const partner = rows[0];

  if (!partner) redirect(`/${locale}/partner/access-error`);
  if (partner.status === 'SUSPENDED') redirect(`/${locale}/partner/suspended`);

  return { user, partner };
}
