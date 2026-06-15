'use server';

import { randomUUID } from 'crypto';
import { prisma } from '@trends172tech/db';
import { requireTenant } from '@/lib/auth/guards';

const SKILL_CREDIT_USD = 10;
const USD_MICROS = 1_000_000;

// Tipos exportados para uso en los componentes cliente
export type SkillItem = {
  id: string;
  key: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  descriptionEn: string;
  priceMonthly: number;
  isFeatured: boolean;
};

export type SkillGroup = {
  industry: string;
  industryEn: string;
  skills: SkillItem[];
};

export type CreateAgentInput = {
  name: string;
  description: string;
  language: 'ES' | 'EN';
  skillIds: string[];
};

export type CreateAgentResult = {
  agentId: string;
  installPublicKey: string;
  selectedSkills: Array<{ key: string; name: string; nameEn: string }>;
};

// Retorna todas las skills activas agrupadas por industria
export async function getAvailableSkills(): Promise<SkillGroup[]> {
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

  const map = new Map<string, SkillGroup>();
  for (const skill of skills) {
    if (!map.has(skill.industry)) {
      map.set(skill.industry, {
        industry: skill.industry,
        industryEn: skill.industryEn,
        skills: [],
      });
    }
    map.get(skill.industry)!.skills.push(skill);
  }

  return Array.from(map.values());
}

// Crédito inicial: $10 por skill
export async function calculateAgentPrice(skillIds: string[]): Promise<{
  base: number;
  skillsTotal: number;
  total: number;
}> {
  const total = skillIds.length * SKILL_CREDIT_USD;
  return { base: 0, skillsTotal: total, total };
}

// Crea AgentInstance con sus skills, AgentAccess e Install y carga créditos iniciales
export async function createAgentWithSkills(input: CreateAgentInput): Promise<CreateAgentResult> {
  const user = await requireTenant();
  const tenantId = user.tenantId!;

  const skills = await prisma.skill.findMany({
    where: { id: { in: input.skillIds }, isActive: true },
    select: { id: true, key: true, name: true, nameEn: true },
  });

  const creditsToAdd = skills.length * SKILL_CREDIT_USD * USD_MICROS;

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

    // Acreditar $10 por cada skill al wallet del tenant
    if (creditsToAdd > 0) {
      await tx.tokenWallet.upsert({
        where: { tenantId },
        create: { tenantId, balance: creditsToAdd },
        update: { balance: { increment: creditsToAdd } },
      });
    }

    return { agentInstance, install };
  });

  return {
    agentId: agentInstance.id,
    installPublicKey: install.publicKey,
    selectedSkills: skills,
  };
}
