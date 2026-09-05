'use server';

import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/guards';
import { createStudioProject } from '@/lib/engineering-studio/store';
import { getGlobalRoutingPolicy, saveProjectRoutingPolicy, type OrchestrationProfile } from '@/lib/engineering-studio/routing';

const allowedOrigins = new Set(['idea', 'prd', 'chatgpt', 'repository', 'recovery']);
const allowedProfiles = new Set<OrchestrationProfile>(['ECONOMY', 'STANDARD', 'ASTRA']);

export async function createStudioProjectAction(formData: FormData) {
  const user = await requireRole('ROOT');
  const locale = String(formData.get('locale') || 'es');
  const origin = String(formData.get('origin') || 'idea');
  const name = String(formData.get('name') || '').trim();
  const clientName = String(formData.get('clientName') || '').trim();
  const summary = String(formData.get('summary') || '').trim();
  const repositoryUrl = String(formData.get('repositoryUrl') || '').trim();
  const marginPercent = Number(formData.get('marginPercent') || 0);
  const commercialBudget = Number(formData.get('commercialBudget') || 0);
  const localAiRequired = formData.get('localAiRequired') === 'on';
  const globalPolicy = await getGlobalRoutingPolicy();
  const requestedProfile = String(formData.get('orchestrationProfile') || globalPolicy.defaultProfile) as OrchestrationProfile;

  if (!allowedOrigins.has(origin)) throw new Error('Origen de proyecto inválido.');
  if (!allowedProfiles.has(requestedProfile)) throw new Error('Perfil de orquestación inválido.');
  if (name.length < 3) throw new Error('El nombre del proyecto es obligatorio.');
  if (summary.length < 20) throw new Error('Describe el objetivo MVP con al menos 20 caracteres.');
  if (!Number.isFinite(marginPercent) || marginPercent < 0 || marginPercent >= 100) throw new Error('El margen debe estar entre 0 y 99.99%.');
  if (!Number.isFinite(commercialBudget) || commercialBudget < 0) throw new Error('El presupuesto comercial no puede ser negativo.');
  if ((origin === 'repository' || origin === 'recovery') && !repositoryUrl) throw new Error('Debes indicar el repositorio para este modo.');

  const result = await createStudioProject({
    origin: origin as 'idea' | 'prd' | 'chatgpt' | 'repository' | 'recovery',
    name, clientName, summary, repositoryUrl, marginPercent, commercialBudget, localAiRequired,
    createdByUserId: user.id
  });

  await saveProjectRoutingPolicy(result.projectId, requestedProfile, user.id);
  redirect(`/${locale}/admin/programming/projects/${result.projectId}`);
}
