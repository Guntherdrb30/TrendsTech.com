'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth/guards';
import { addVaultEntry } from '@/lib/engineering-studio/vault';
import { getStudioProjectDetail } from '@/lib/engineering-studio/store';
import { requireProjectMemoryConsent, setProjectMemoryConsent } from '@/lib/engineering-studio/memory-consent';
import { validateMobileMemory } from '@/lib/engineering-studio/memory-contract';

function context(form: FormData) {
  const projectId = String(form.get('projectId') ?? '');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId)) {
    throw new Error('ID de proyecto invalido.');
  }
  const locale = form.get('locale') === 'en' ? 'en' : 'es';
  return { projectId, locale };
}

async function validateProject(projectId: string) {
  const project = await getStudioProjectDetail(projectId);
  if (!project) throw new Error('Proyecto no encontrado.');
}

export async function setMobileMemoryConsentAction(form: FormData) {
  const user = await requireRole('ROOT');
  const { projectId, locale } = context(form);
  await validateProject(projectId);
  const enabled = form.get('enabled') === 'true';
  if (enabled && form.get('confirm') !== 'yes') {
    throw new Error('Confirma expresamente que autorizas guardar memoria de este proyecto.');
  }
  await setProjectMemoryConsent(projectId, enabled, user.id);
  revalidatePath(`/${locale}/admin/programming/projects/${projectId}/memory`);
}

export async function saveMobileMemoryAction(form: FormData) {
  const user = await requireRole('ROOT');
  const { projectId, locale } = context(form);
  await validateProject(projectId);
  await requireProjectMemoryConsent(projectId);
  const memory = validateMobileMemory({
    type: String(form.get('type') ?? ''),
    title: String(form.get('title') ?? ''),
    content: String(form.get('content') ?? '')
  });
  await addVaultEntry({
    projectId,
    ...memory,
    source: 'USER',
    actorUserId: user.id,
    sourceRef: 'studio-mobile-manual',
    meta: { capture: 'ADMIN_MOBILE', manualEntry: true }
  });
  revalidatePath(`/${locale}/admin/programming/projects/${projectId}/memory`);
}
