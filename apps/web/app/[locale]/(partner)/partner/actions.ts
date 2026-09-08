'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { prisma } from '@trends172tech/db';
import { requirePartner } from '@/lib/partners/access';

const categories = new Set([
  'FACT', 'ASSUMPTION', 'OPEN_QUESTION', 'RISK', 'NEXT_ACTION', 'DECISION',
  'REQUIREMENT', 'RESEARCH', 'DISCOVERY', 'DOCUMENT', 'PROPOSAL', 'MEETING_NOTE'
]);
const confidences = new Set(['CONFIRMED', 'RESEARCHED', 'INFERRED', 'WORKING_ASSUMPTION']);

export async function addWorkspaceEntry(formData: FormData) {
  const locale = String(formData.get('locale') || 'es');
  const opportunityId = String(formData.get('opportunityId') || '');
  const category = String(formData.get('category') || 'FACT');
  const confidence = String(formData.get('confidence') || 'CONFIRMED');
  const title = String(formData.get('title') || '').trim();
  const body = String(formData.get('content') || '').trim();
  const sourceLabel = String(formData.get('sourceLabel') || '').trim();
  const dueAt = String(formData.get('dueAt') || '').trim();
  const url = String(formData.get('url') || '').trim();

  if (!opportunityId || !body || body.length > 8000 || !categories.has(category) || !confidences.has(confidence)) return;
  const { partner } = await requirePartner(locale);
  const [project] = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT "id" FROM "PartnerOpportunity" WHERE "id"=${opportunityId} AND "partnerId"=${partner.id} LIMIT 1
  `;
  if (!project) return;

  const metadata = [title && `Título: ${title}`, dueAt && `Fecha: ${dueAt}`, url && `Enlace: ${url}`].filter(Boolean);
  const content = [...metadata, body].join('\n');
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      INSERT INTO "ProjectMemoryEntry" ("id","opportunityId","category","content","sourceType","sourceLabel","confidence","isCurrent","createdAt")
      VALUES (${randomUUID()},${opportunityId},${category},${content},'ALLY_INPUT',${sourceLabel || 'Portal de Aliados'},${confidence},true,NOW())
    `;
    if (category === 'FACT') await tx.$executeRaw`UPDATE "ProjectMemory" SET "confirmedFacts"="confirmedFacts" || ${JSON.stringify([body])}::jsonb,"updatedAt"=NOW() WHERE "opportunityId"=${opportunityId}`;
    if (category === 'ASSUMPTION') await tx.$executeRaw`UPDATE "ProjectMemory" SET "assumptions"="assumptions" || ${JSON.stringify([body])}::jsonb,"updatedAt"=NOW() WHERE "opportunityId"=${opportunityId}`;
    if (category === 'OPEN_QUESTION') await tx.$executeRaw`UPDATE "ProjectMemory" SET "openQuestions"="openQuestions" || ${JSON.stringify([body])}::jsonb,"updatedAt"=NOW() WHERE "opportunityId"=${opportunityId}`;
    if (category === 'RISK') await tx.$executeRaw`UPDATE "ProjectMemory" SET "risks"="risks" || ${JSON.stringify([body])}::jsonb,"updatedAt"=NOW() WHERE "opportunityId"=${opportunityId}`;
    if (category === 'NEXT_ACTION') await tx.$executeRaw`UPDATE "ProjectMemory" SET "nextActions"="nextActions" || ${JSON.stringify([content])}::jsonb,"updatedAt"=NOW() WHERE "opportunityId"=${opportunityId}`;
  });
  revalidatePath(`/${locale}/partner`);
}

export async function updatePartnerProfile(formData: FormData) {
  const locale = String(formData.get('locale') || 'es');
  const companyName = String(formData.get('companyName') || '').trim();
  const legalName = String(formData.get('legalName') || '').trim();
  const country = String(formData.get('country') || '').trim();
  const website = String(formData.get('website') || '').trim();
  const description = String(formData.get('description') || '').trim();
  if (!companyName || companyName.length > 160 || description.length > 3000) return;
  const { partner } = await requirePartner(locale);
  await prisma.$executeRaw`
    UPDATE "Partner" SET "companyName"=${companyName},"legalName"=${legalName || null},"country"=${country || null},"website"=${website || null},"description"=${description || null},"updatedAt"=NOW()
    WHERE "id"=${partner.id}
  `;
  revalidatePath(`/${locale}/partner`);
}
