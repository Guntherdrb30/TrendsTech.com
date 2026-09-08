import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/guards';

export async function requirePartner(locale = 'es') {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  if (user.role !== 'PARTNER') {
    redirect(`/${locale}/dashboard`);
  }

  if (!user.emailVerified) {
    redirect(`/${locale}/verify-email`);
  }

  return user;
}
