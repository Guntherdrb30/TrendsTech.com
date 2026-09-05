'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/guards';
import { prepareAgentRun } from '@/lib/engineering-studio/agent-runner';

export async function submitProjectInstructionAction(formData: FormData): Promise<void> {
  const user = await requireRole('ROOT');
  const projectId = String(formData.get('projectId') || '');
  const locale = String(formData.get('locale') || 'es');
  const task = String(formData.get('task') || '');
  let outcome = 'prepared';
  try {
    const run = await prepareAgentRun(projectId, user.id, task);
    outcome = `${run.status}:${run.estimatedContextTokens}`;
  } catch (error) {
    outcome = `error:${error instanceof Error ? error.message : 'No se pudo preparar la tarea.'}`;
  }
  revalidatePath(`/${locale}/admin/programming/projects/${projectId}/agent`);
  revalidatePath(`/${locale}/admin/programming/runs`);
  redirect(`/${locale}/admin/programming/projects/${projectId}/agent?result=${encodeURIComponent(outcome)}`);
}
