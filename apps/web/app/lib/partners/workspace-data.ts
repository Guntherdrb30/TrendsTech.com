import { prisma } from '@trends172tech/db';

export type PartnerProjectOption = { id: string; name: string; targetCompany: string };
export type PartnerWorkspaceEntry = { id: string; opportunityId: string; projectName: string; targetCompany: string; category: string; content: string; sourceLabel: string | null; confidence: string; createdAt: Date };

export async function getPartnerProjects(partnerId: string) {
  return prisma.$queryRaw<PartnerProjectOption[]>`SELECT "id","name","targetCompany" FROM "PartnerOpportunity" WHERE "partnerId"=${partnerId} AND "status"='ACTIVE' ORDER BY "updatedAt" DESC`;
}

export async function getPartnerEntries(partnerId: string, categories: string[]) {
  const rows = await prisma.$queryRaw<PartnerWorkspaceEntry[]>`
    SELECT e."id",e."opportunityId",o."name" AS "projectName",o."targetCompany",e."category",e."content",e."sourceLabel",e."confidence",e."createdAt"
    FROM "ProjectMemoryEntry" e JOIN "PartnerOpportunity" o ON o."id"=e."opportunityId"
    WHERE o."partnerId"=${partnerId} AND e."isCurrent"=true
    ORDER BY e."createdAt" DESC LIMIT 100
  `;
  return rows.filter((row) => categories.includes(row.category));
}
