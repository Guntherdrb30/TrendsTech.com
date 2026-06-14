'use server';

import { randomUUID } from 'crypto';
import { prisma } from '@trends172tech/db';
import { requireTenant } from '@/lib/auth/guards';

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
