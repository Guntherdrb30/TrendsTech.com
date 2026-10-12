'use server';

import { revalidatePath } from 'next/cache';
import { DevExecutionRuntime } from '@trends172tech/db';
import { requireRole } from '@/lib/auth/guards';
import { dispatchAgentRunToOrchestrator } from '@/lib/engineering-studio/orchestrator-bridge';

export async function dispatchAgentRunAction(formData: FormData) {
  const user = await requireRole('ROOT');
  const runId = String(formData.get('runId') || '');
  const locale = String(formData.get('locale') || 'es');
  const runtime = String(formData.get('runtime') || DevExecutionRuntime.CODEX_CLI) as DevExecutionRuntime;

  if (!runId) throw new Error('Agent Run inválido.');
  if (!Object.values(DevExecutionRuntime).includes(runtime)) throw new Error('Runtime inválido.');

  await dispatchAgentRunToOrchestrator(runId, user.id, runtime);
  revalidatePath(`/${locale}/admin/programming/runs`);
}
