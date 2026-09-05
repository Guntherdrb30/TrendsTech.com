'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/guards';
import { syncVercelProjects } from '@/lib/engineering-studio/infrastructure-sync';
import { publicVercelError } from '@/lib/engineering-studio/vercel-discovery';

export async function syncVercelNowAction(formData: FormData): Promise<void> {
  await requireRole('ROOT');
  const locale = String(formData.get('locale') || 'es');
  let outcome = 'ok';
  try { await syncVercelProjects(); }
  catch (error) { outcome = `error:${publicVercelError(error).message}`; }
  revalidatePath(`/${locale}/admin/programming/integrations`);
  revalidatePath(`/${locale}/admin/programming/projects`);
  redirect(`/${locale}/admin/programming/integrations?sync=${encodeURIComponent(outcome)}`);
}
