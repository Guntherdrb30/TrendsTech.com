'use server';

import { revalidatePath } from 'next/cache';
import { syncVercelProjects } from '@/lib/engineering-studio/infrastructure-sync';

export async function syncVercelNowAction(formData: FormData): Promise<void> {
  const locale = String(formData.get('locale') || 'es');
  await syncVercelProjects();
  revalidatePath(`/${locale}/admin/programming/integrations`);
  revalidatePath(`/${locale}/admin/programming/projects`);
}
