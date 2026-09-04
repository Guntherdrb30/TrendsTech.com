'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth/guards';
import { approveBlueprintGate } from '@/lib/engineering-studio/approvals';
import { prepareAgentRun } from '@/lib/engineering-studio/agent-runner';

export async function approveBlueprintAction(formData: FormData) {
  const user = await requireRole('ROOT');
  const projectId = String(formData.get('projectId') || '');
  const locale = String(formData.get('locale') || 'es');
  if (!projectId) throw new Error('Proyecto inválido.');
  await approveBlueprintGate(projectId, user.id);
  revalidatePath(`/${locale}/admin/programming/projects/${projectId}`);
  revalidatePath(`/${locale}/admin/programming/projects`);
}

export async function prepareAgentRunAction(formData: FormData) {
  const user = await requireRole('ROOT');
  const projectId = String(formData.get('projectId') || '');
  const locale = String(formData.get('locale') || 'es');
  const task = String(formData.get('task') || '');
  if (!projectId) throw new Error('Proyecto inválido.');
  await prepareAgentRun(projectId, user.id, task);
  revalidatePath(`/${locale}/admin/programming/projects/${projectId}`);
  revalidatePath(`/${locale}/admin/programming/runs`);
}
