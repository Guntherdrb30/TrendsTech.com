import 'server-only';

import { randomUUID } from 'node:crypto';
import { Prisma, prisma } from '@trends172tech/db';

export type VaultEntryType = 'CONVERSATION_SUMMARY'|'PRD'|'REQUIREMENT'|'DECISION'|'ARCHITECTURE'|'CHANGE_REQUEST'|'TASK'|'CODEX_RESULT'|'TEST_RESULT'|'DEPLOYMENT'|'ARTIFACT'|'NOTE';

export type CreateVaultEntryInput = {
  projectId: string;
  type: VaultEntryType;
  title: string;
  content: string;
  source?: 'CHATGPT'|'CODEX'|'ASTRA'|'NVIDIA'|'ENGINEERING_STUDIO'|'USER';
  sourceRef?: string | null;
  actorUserId?: string | null;
  supersedesId?: string | null;
  meta?: Record<string, unknown>;
};

export async function addVaultEntry(input: CreateVaultEntryInput) {
  const id = randomUUID();
  return prisma.$transaction(async tx => {
    let version = 1;
    if (input.supersedesId) {
      const previous = await tx.$queryRaw<Array<{ version: number; projectId: string }>>(Prisma.sql`
        SELECT "version", "projectId" FROM "StudioVaultEntry" WHERE "id"=${input.supersedesId} LIMIT 1 FOR UPDATE
      `);
      if (!previous[0] || previous[0].projectId !== input.projectId) throw new Error('Entrada anterior inválida.');
      version = previous[0].version + 1;
      await tx.$executeRaw(Prisma.sql`UPDATE "StudioVaultEntry" SET "status"='SUPERSEDED', "updatedAt"=CURRENT_TIMESTAMP WHERE "id"=${input.supersedesId}`);
    }
    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "StudioVaultEntry" ("id","projectId","type","title","content","status","source","sourceRef","version","supersedesId","createdByUserId","metaJson","createdAt","updatedAt")
      VALUES (${id},${input.projectId},${input.type},${input.title},${input.content},'CURRENT',${input.source||'ENGINEERING_STUDIO'},${input.sourceRef||null},${version},${input.supersedesId||null},${input.actorUserId||null},CAST(${JSON.stringify(input.meta||{})} AS jsonb),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
    `);
    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "StudioEvent" ("id","projectId","type","actorType","actorRef","message","metaJson","createdAt")
      VALUES (${randomUUID()},${input.projectId},'VAULT_ENTRY_ADDED',${input.source==='CHATGPT'?'CHATGPT':'SYSTEM'},${input.actorUserId||input.source||'studio'},${`Vault: ${input.title}`},CAST(${JSON.stringify({vaultEntryId:id,type:input.type,version})} AS jsonb),CURRENT_TIMESTAMP)
    `);
    return { id, version };
  });
}

export async function listVaultEntries(projectId: string, currentOnly = true) {
  return prisma.$queryRaw<Array<{id:string;type:string;title:string;content:string;status:string;source:string;sourceRef:string|null;version:number;createdAt:Date}>>(Prisma.sql`
    SELECT "id","type","title","content","status","source","sourceRef","version","createdAt"
    FROM "StudioVaultEntry"
    WHERE "projectId"=${projectId} ${currentOnly ? Prisma.sql`AND "status"='CURRENT'` : Prisma.empty}
    ORDER BY "createdAt" DESC
  `);
}

export async function searchVault(projectId: string, query: string) {
  const term = `%${query.trim()}%`;
  return prisma.$queryRaw<Array<{id:string;type:string;title:string;content:string;source:string;version:number;createdAt:Date}>>(Prisma.sql`
    SELECT "id","type","title","content","source","version","createdAt"
    FROM "StudioVaultEntry"
    WHERE "projectId"=${projectId} AND "status"='CURRENT' AND ("title" ILIKE ${term} OR "content" ILIKE ${term})
    ORDER BY "updatedAt" DESC LIMIT 50
  `);
}
