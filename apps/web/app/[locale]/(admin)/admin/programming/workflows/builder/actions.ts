'use server';

import { redirect } from 'next/navigation';
import { createWorkflowDefinition } from '../../../../../../../lib/engineering-studio/workflow-builder';
import { validateWorkflowDefinition } from '../../../../../../../lib/engineering-studio/workflow-contract';
import { interpretWorkflowNaturalLanguage } from '../../../../../../../lib/engineering-studio/workflow-interpreter';

export async function interpretWorkflowAction(input: { text: string; reusable: boolean }) {
  return interpretWorkflowNaturalLanguage(input.text, input.reusable);
}

export async function saveWorkflowDraftAction(formData: FormData) {
  const locale = String(formData.get('locale') || 'es');
  const definitionRaw = String(formData.get('definition') || '');
  if (!definitionRaw) throw new Error('No hay definición de workflow para guardar.');

  const validated = validateWorkflowDefinition(JSON.parse(definitionRaw));
  if (!validated.success) {
    throw new Error(`Workflow inválido: ${validated.error.issues.map(issue => issue.message).join(' · ')}`);
  }

  const created = await createWorkflowDefinition(validated.data, 'workflow-builder');
  redirect(`/${locale}/admin/programming/workflows?created=${created.workflowId}`);
}
