'use server';

import { randomUUID } from 'crypto';
import { prisma } from '@trends172tech/db';
import { requireTenant } from '@/lib/auth/guards';
import { enqueueKnowledgeJob } from '@/lib/kb/queue';

export type PublicSkillItem = {
  id: string;
  key: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  descriptionEn: string;
  priceMonthly: number;
  isFeatured: boolean;
  industry: string;
  industryEn: string;
};

export type PublicSkillGroup = {
  industry: string;
  industryEn: string;
  skills: PublicSkillItem[];
};

export type CreateAgentSessionInput = {
  name: string;
  description: string;
  language: 'ES' | 'EN';
  skillIds: string[];
  knowledge?: {
    textContent: string | null;
    websiteUrl: string | null;
  };
  targetChannel?: 'web' | 'whatsapp' | 'both';
};

export type CreateAgentSessionResult = {
  agentId: string;
  installPublicKey: string;
  selectedSkills: Array<{ key: string; name: string; nameEn: string; icon: string }>;
  hasCredits: boolean;
};

export async function getPublicSkills(): Promise<PublicSkillGroup[]> {
  const skills = await prisma.skill.findMany({
    where: { isActive: true },
    orderBy: [{ industry: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      key: true,
      name: true,
      nameEn: true,
      industry: true,
      industryEn: true,
      icon: true,
      description: true,
      descriptionEn: true,
      priceMonthly: true,
      isFeatured: true,
    },
  });

  const map = new Map<string, PublicSkillGroup>();
  for (const skill of skills) {
    if (!map.has(skill.industry)) {
      map.set(skill.industry, { industry: skill.industry, industryEn: skill.industryEn, skills: [] });
    }
    map.get(skill.industry)!.skills.push(skill);
  }
  return Array.from(map.values());
}

export async function createAgentFromSession(
  input: CreateAgentSessionInput
): Promise<CreateAgentSessionResult> {
  const user = await requireTenant();
  const tenantId = user.tenantId!;

  const skills = await prisma.skill.findMany({
    where: { id: { in: input.skillIds }, isActive: true },
    select: { id: true, key: true, name: true, nameEn: true, icon: true },
  });

  const { agentInstance, install } = await prisma.$transaction(async (tx) => {
    const agentInstance = await tx.agentInstance.create({
      data: {
        tenantId,
        name: input.name,
        baseAgentKey: 'skill_agent',
        languageDefault: input.language,
        status: 'ACTIVE',
        featuresJson: { description: input.description },
      },
    });

    if (skills.length > 0) {
      await tx.agentSkill.createMany({
        data: skills.map((s) => ({
          agentInstanceId: agentInstance.id,
          skillId: s.id,
          isEnabled: true,
        })),
      });
    }

    await tx.agentAccess.create({
      data: {
        tenantId,
        agentId: agentInstance.id,
        name: `${input.name} — Web`,
        channel: 'embedded_web',
        allowedDomains: [],
        isActive: true,
      },
    });

    const install = await tx.install.create({
      data: {
        tenantId,
        agentInstanceId: agentInstance.id,
        publicKey: randomUUID(),
        allowedDomains: [],
        status: 'ACTIVE',
      },
    });

    return { agentInstance, install };
  });

  const wallet = await prisma.tokenWallet.findUnique({ where: { tenantId } });
  const hasCredits = (wallet?.balance ?? 0) > 0;

  return {
    agentId: agentInstance.id,
    installPublicKey: install.publicKey,
    selectedSkills: skills,
    hasCredits,
  };
}

export async function createKnowledgeFromSession(input: {
  agentInstanceId: string;
  textContent: string | null;
  websiteUrl: string | null;
}): Promise<{ sourceIds: string[] }> {
  const user = await requireTenant();
  const tenantId = user.tenantId!;

  const agent = await prisma.agentInstance.findFirst({
    where: { id: input.agentInstanceId, tenantId },
    select: { id: true },
  });
  if (!agent) throw new Error('Agent not found');

  const sourceIds: string[] = [];

  if (input.websiteUrl) {
    const source = await prisma.knowledgeSource.create({
      data: {
        tenantId,
        agentInstanceId: input.agentInstanceId,
        type: 'URL',
        url: input.websiteUrl,
        title: input.websiteUrl,
        status: 'PENDING',
      },
    });
    await enqueueKnowledgeJob({ sourceId: source.id, tenantId, actorUserId: user.id });
    sourceIds.push(source.id);
  }

  if (input.textContent) {
    const source = await prisma.knowledgeSource.create({
      data: {
        tenantId,
        agentInstanceId: input.agentInstanceId,
        type: 'TEXT',
        rawText: input.textContent,
        title: 'Descripción del negocio',
        status: 'PENDING',
      },
    });
    await enqueueKnowledgeJob({ sourceId: source.id, tenantId, actorUserId: user.id });
    sourceIds.push(source.id);
  }

  return { sourceIds };
}

export type KbSourceStatus = {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';
};

export async function getKnowledgeSourceStatuses(
  sourceIds: string[]
): Promise<KbSourceStatus[]> {
  if (sourceIds.length === 0) return [];
  const user = await requireTenant();
  const tenantId = user.tenantId!;

  const sources = await prisma.knowledgeSource.findMany({
    where: { id: { in: sourceIds }, tenantId },
    select: { id: true, status: true },
  });

  return sources.map((s) => ({
    id: s.id,
    status: s.status as KbSourceStatus['status'],
  }));
}
