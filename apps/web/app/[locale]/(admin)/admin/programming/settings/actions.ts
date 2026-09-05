'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth/guards';
import { saveGlobalRoutingPolicy, type OrchestrationProfile } from '@/lib/engineering-studio/routing';

const profiles = new Set<OrchestrationProfile>(['ECONOMY', 'STANDARD', 'ASTRA']);

export async function saveRoutingPolicyAction(formData: FormData) {
  await requireRole('ROOT');
  const profile = String(formData.get('defaultProfile') || 'STANDARD') as OrchestrationProfile;
  if (!profiles.has(profile)) throw new Error('Perfil de orquestación inválido.');

  await saveGlobalRoutingPolicy({
    defaultProfile: profile,
    allowAutomaticAstraEscalation: false,
    requireApprovalForAstra: formData.get('requireApprovalForAstra') === 'on',
    economyLabel: 'Económico',
    standardLabel: 'Estándar',
    astraLabel: 'Astra / Alta complejidad'
  });

  revalidatePath('/es/admin/programming/settings');
}
