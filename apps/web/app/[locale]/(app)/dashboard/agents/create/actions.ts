'use server';

import { randomUUID } from 'crypto';
import { prisma } from '@trends172tech/db';
import { requireTenant } from '@/lib/auth/guards';

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

  // Agrupar por industria manteniendo el orden de aparición
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

// Calcula precio total: $29 base + priceMonthly de cada skill seleccionada
export async function calculateAgentPrice(skillIds: string[]): Promise<{
  base: number;
  skillsTotal: number;
  total: number;
}> {
  const BASE = 29;
  if (skillIds.length === 0) {
    return { base: BASE, skillsTotal: 0, total: BASE };
  }
  const skills = await prisma.skill.findMany({
    where: { id: { in: skillIds }, isActive: true },
    select: { priceMonthly: true },
  });
  const skillsTotal = skills.reduce((sum, s) => sum + s.priceMonthly, 0);
  return { base: BASE, skillsTotal, total: BASE + skillsTotal };
}

// Crea AgentInstance con sus skills, AgentAccess e Install en una transacción atómica
export async function createAgentWithSkills(input: CreateAgentInput): Promise<CreateAgentResult> {
  const user = await requireTenant();
  const tenantId = user.tenantId!;

  // Verificar que las skills existen y están activas
  const skills = await prisma.skill.findMany({
    where: { id: { in: input.skillIds }, isActive: true },
    select: { id: true, key: true, name: true, nameEn: true },
  });

  const { agentInstance, install } = await prisma.$transaction(async (tx) => {
    // 1. Crear la instancia del agente
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

    // 2. Crear las relaciones AgentSkill para cada skill seleccionada
    if (skills.length > 0) {
      await tx.agentSkill.createMany({
        data: skills.map((s) => ({
          agentInstanceId: agentInstance.id,
          skillId: s.id,
          isEnabled: true,
        })),
      });
    }

    // 3. Crear AgentAccess inicial con canal web embebido (dominios abiertos)
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

    // 4. Crear Install con publicKey único — este token es el que usa el widget
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

  return {
    agentId: agentInstance.id,
    installPublicKey: install.publicKey,
    selectedSkills: skills,
  };
}
