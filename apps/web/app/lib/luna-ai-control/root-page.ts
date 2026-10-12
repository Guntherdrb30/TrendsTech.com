import { redirect } from 'next/navigation';
import { AuthError, requireRole } from '@/lib/auth/guards';
export async function requireRootPage(locale: string) {
  try { return await requireRole('ROOT'); }
  catch (e) {
    if (e instanceof AuthError) redirect(e.status === 401 ? `/${locale}/login` : `/${locale}/dashboard`);
    throw e;
  }
}
