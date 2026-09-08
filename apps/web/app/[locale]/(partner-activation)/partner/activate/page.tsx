import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@trends172tech/db';
import { getCurrentUser } from '@/lib/auth/guards';
import { PartnerActivationForm } from '@/components/partner/partner-activation-form';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

type PartnerRow = { id: string; companyName: string; status: string };

export default async function PartnerActivatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.role !== 'PARTNER') redirect(`/${locale}/dashboard`);
  if (!user.emailVerified) redirect(`/${locale}/verify-email`);

  const rows = await prisma.$queryRaw<PartnerRow[]>`
    SELECT "id", "companyName", "status" FROM "Partner" WHERE "userId" = ${user.id} LIMIT 1
  `;
  const partner = rows[0];
  if (!partner) redirect(`/${locale}/partner/access-error`);
  if (partner.status === 'SUSPENDED') redirect(`/${locale}/partner/suspended`);
  if (partner.status === 'ACTIVE') redirect(`/${locale}/partner`);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">Trends172Tech · Portal de Aliados</p>
          <h1 className="mt-2 text-3xl font-semibold">Activa tu acceso</h1>
          <p className="mt-2 text-sm text-slate-500">{partner.companyName}. Tu correo ya fue verificado. Por seguridad debes reemplazar la clave temporal antes de entrar al portal.</p>
        </div>
        <PartnerActivationForm locale={locale} />
      </div>
    </main>
  );
}
