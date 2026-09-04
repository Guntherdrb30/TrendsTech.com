'use server';

import { redirect } from 'next/navigation';
import { createWorkflowDefinition, type WorkflowDefinition } from '../../../../../../../lib/engineering-studio/workflow-builder';

export async function saveWorkflowDraftAction(formData: FormData) {
  const locale = String(formData.get('locale') || 'es');
  const definitionRaw = String(formData.get('definition') || '');
  if (!definitionRaw) throw new Error('No hay definición de workflow para guardar.');

  const parsed = JSON.parse(definitionRaw) as WorkflowDefinition;
  if (!parsed.name || !parsed.trigger?.eventType || !Array.isArray(parsed.actions) || parsed.actions.length === 0) {
    throw new Error('La definición del workflow está incompleta.');
  }

  const created = await createWorkflowDefinition(parsed, 'workflow-builder');
  redirect(`/${locale}/admin/programming/workflows?created=${created.workflowId}`);
}
