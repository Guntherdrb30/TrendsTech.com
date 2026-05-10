'use server';

import { revalidatePath } from 'next/cache';
import {
  AdminAiAgentStatus,
  AdminLicenseStatus,
  AdminPriority,
  AdminProjectStatus,
  AdminProposalStatus,
  AdminSubscriptionStatus,
  Prisma,
  prisma
} from '@trends172tech/db';
import { z } from 'zod';
import { requireRole } from '@/lib/auth/guards';

const localeSchema = z.string().min(2).max(10);

const clientSchema = z.object({
  locale: localeSchema,
  name: z.string().min(2).max(120),
  contactName: z.string().max(120).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(40).optional(),
  country: z.string().max(80).optional(),
  industry: z.string().max(120).optional()
});

const projectSchema = z.object({
  locale: localeSchema,
  clientId: z.string().min(1),
  name: z.string().min(2).max(160),
  description: z.string().max(2000).optional(),
  status: z.nativeEnum(AdminProjectStatus),
  priority: z.nativeEnum(AdminPriority),
  soldAmount: z.coerce.number().min(0),
  monthlyRetainer: z.coerce.number().min(0),
  operationalCostsMonthly: z.coerce.number().min(0).default(0),
  licenseCostsMonthly: z.coerce.number().min(0).default(0),
  paymentMethod: z.string().max(80).optional(),
  manager: z.string().max(120).optional(),
  soldAt: z.string().optional(),
  systemName: z.string().max(160).optional(),
  repositoryUrl: z.string().url().optional().or(z.literal('')),
  vercelProject: z.string().max(160).optional(),
  domain: z.string().max(160).optional(),
  databaseName: z.string().max(160).optional(),
  stack: z.string().max(500).optional()
});

const proposalSchema = z.object({
  locale: localeSchema,
  clientId: z.string().min(1),
  title: z.string().min(2).max(160),
  summary: z.string().max(2000).optional(),
  status: z.nativeEnum(AdminProposalStatus),
  amount: z.coerce.number().min(0),
  probability: z.coerce.number().int().min(0).max(100),
  sentAt: z.string().optional(),
  validUntil: z.string().optional()
});

const licenseSchema = z.object({
  locale: localeSchema,
  projectId: z.string().min(1),
  name: z.string().min(2).max(160),
  provider: z.string().max(120).optional(),
  status: z.nativeEnum(AdminLicenseStatus),
  monthlyCost: z.coerce.number().min(0),
  renewsAt: z.string().optional()
});

const subscriptionSchema = z.object({
  locale: localeSchema,
  projectId: z.string().min(1),
  name: z.string().min(2).max(160),
  status: z.nativeEnum(AdminSubscriptionStatus),
  monthlyAmount: z.coerce.number().min(0),
  nextBillingAt: z.string().optional()
});

const aiAgentSchema = z.object({
  locale: localeSchema,
  name: z.string().min(2).max(120),
  role: z.string().max(180).optional(),
  status: z.nativeEnum(AdminAiAgentStatus),
  monthlyCost: z.coerce.number().min(0),
  successRate: z.coerce.number().int().min(0).max(100)
});

function optionalString(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function optionalDate(value?: string | null) {
  const normalized = optionalString(value);
  return normalized ? new Date(`${normalized}T00:00:00.000Z`) : null;
}

function actorLabel(user: Awaited<ReturnType<typeof requireRole>>) {
  return user.name ?? user.email ?? 'ROOT';
}

function revalidateAdmin(locale: string) {
  revalidatePath(`/${locale}/admin`);
  revalidatePath(`/${locale}/admin/clients`);
  revalidatePath(`/${locale}/admin/projects`);
  revalidatePath(`/${locale}/admin/proposals`);
  revalidatePath(`/${locale}/admin/licenses`);
  revalidatePath(`/${locale}/admin/ai-agents`);
}

async function writeActivity(input: {
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  clientId?: string | null;
  projectId?: string | null;
  metaJson?: Prisma.InputJsonValue;
}) {
  await prisma.adminActivityLog.create({
    data: {
      actor: input.actor,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      metaJson: input.metaJson,
      client: input.clientId ? { connect: { id: input.clientId } } : undefined,
      project: input.projectId ? { connect: { id: input.projectId } } : undefined
    }
  });
}

export async function createAdminClient(formData: FormData) {
  const user = await requireRole('ROOT');
  const parsed = clientSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    throw new Error('Invalid admin client payload.');
  }

  const client = await prisma.adminClient.create({
    data: {
      name: parsed.data.name.trim(),
      contactName: optionalString(parsed.data.contactName),
      email: optionalString(parsed.data.email),
      phone: optionalString(parsed.data.phone),
      country: optionalString(parsed.data.country),
      industry: optionalString(parsed.data.industry)
    }
  });

  await writeActivity({
    actor: actorLabel(user),
    action: `Cliente creado: ${client.name}`,
    entity: 'AdminClient',
    entityId: client.id,
    clientId: client.id
  });

  revalidateAdmin(parsed.data.locale);
}

export async function createAdminProject(formData: FormData) {
  const user = await requireRole('ROOT');
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    throw new Error('Invalid admin project payload.');
  }

  const profit =
    parsed.data.monthlyRetainer -
    parsed.data.operationalCostsMonthly -
    parsed.data.licenseCostsMonthly;
  const stack = optionalString(parsed.data.stack)
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const project = await prisma.adminProject.create({
    data: {
      clientId: parsed.data.clientId,
      name: parsed.data.name.trim(),
      description: optionalString(parsed.data.description),
      status: parsed.data.status,
      priority: parsed.data.priority,
      soldAmount: parsed.data.soldAmount,
      monthlyRetainer: parsed.data.monthlyRetainer,
      paymentMethod: optionalString(parsed.data.paymentMethod),
      manager: optionalString(parsed.data.manager),
      soldAt: optionalDate(parsed.data.soldAt),
      system: {
        create: {
          name: optionalString(parsed.data.systemName) ?? parsed.data.name.trim(),
          stackJson: stack ?? [],
          repositoryUrl: optionalString(parsed.data.repositoryUrl),
          vercelProject: optionalString(parsed.data.vercelProject),
          domain: optionalString(parsed.data.domain),
          databaseName: optionalString(parsed.data.databaseName)
        }
      },
      finance: {
        create: {
          initialBudget: parsed.data.soldAmount,
          soldAmount: parsed.data.soldAmount,
          recurringMonthly: parsed.data.monthlyRetainer,
          operationalCostsMonthly: parsed.data.operationalCostsMonthly,
          licenseCostsMonthly: parsed.data.licenseCostsMonthly,
          estimatedMonthlyProfit: profit
        }
      }
    }
  });

  await writeActivity({
    actor: actorLabel(user),
    action: `Proyecto vendido creado: ${project.name}`,
    entity: 'AdminProject',
    entityId: project.id,
    clientId: project.clientId,
    projectId: project.id,
    metaJson: {
      soldAmount: parsed.data.soldAmount,
      monthlyRetainer: parsed.data.monthlyRetainer
    }
  });

  revalidateAdmin(parsed.data.locale);
  revalidatePath(`/${parsed.data.locale}/admin/projects/${project.id}`);
  revalidatePath(`/${parsed.data.locale}/admin/projects/${project.id}/finances`);
}

export async function createAdminProposal(formData: FormData) {
  const user = await requireRole('ROOT');
  const parsed = proposalSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    throw new Error('Invalid admin proposal payload.');
  }

  const proposal = await prisma.adminProposal.create({
    data: {
      clientId: parsed.data.clientId,
      title: parsed.data.title.trim(),
      summary: optionalString(parsed.data.summary),
      status: parsed.data.status,
      amount: parsed.data.amount,
      probability: parsed.data.probability,
      sentAt: optionalDate(parsed.data.sentAt),
      validUntil: optionalDate(parsed.data.validUntil),
      acceptedAt: parsed.data.status === 'ACCEPTED' ? new Date() : null
    }
  });

  await writeActivity({
    actor: actorLabel(user),
    action: `Propuesta registrada: ${proposal.title}`,
    entity: 'AdminProposal',
    entityId: proposal.id,
    clientId: proposal.clientId,
    metaJson: {
      status: proposal.status,
      amount: parsed.data.amount
    }
  });

  revalidateAdmin(parsed.data.locale);
}

export async function createAdminLicense(formData: FormData) {
  const user = await requireRole('ROOT');
  const parsed = licenseSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    throw new Error('Invalid admin license payload.');
  }

  const license = await prisma.adminProjectLicense.create({
    data: {
      projectId: parsed.data.projectId,
      name: parsed.data.name.trim(),
      provider: optionalString(parsed.data.provider),
      status: parsed.data.status,
      monthlyCost: parsed.data.monthlyCost,
      renewsAt: optionalDate(parsed.data.renewsAt)
    }
  });

  await writeActivity({
    actor: actorLabel(user),
    action: `Licencia registrada: ${license.name}`,
    entity: 'AdminProjectLicense',
    entityId: license.id,
    projectId: license.projectId,
    metaJson: {
      status: license.status,
      monthlyCost: parsed.data.monthlyCost
    }
  });

  revalidateAdmin(parsed.data.locale);
  revalidatePath(`/${parsed.data.locale}/admin/projects/${license.projectId}/finances`);
}

export async function createAdminSubscription(formData: FormData) {
  const user = await requireRole('ROOT');
  const parsed = subscriptionSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    throw new Error('Invalid admin subscription payload.');
  }

  const subscription = await prisma.adminProjectSubscription.create({
    data: {
      projectId: parsed.data.projectId,
      name: parsed.data.name.trim(),
      status: parsed.data.status,
      monthlyAmount: parsed.data.monthlyAmount,
      nextBillingAt: optionalDate(parsed.data.nextBillingAt)
    }
  });

  await writeActivity({
    actor: actorLabel(user),
    action: `Mensualidad registrada: ${subscription.name}`,
    entity: 'AdminProjectSubscription',
    entityId: subscription.id,
    projectId: subscription.projectId,
    metaJson: {
      status: subscription.status,
      monthlyAmount: parsed.data.monthlyAmount
    }
  });

  revalidateAdmin(parsed.data.locale);
  revalidatePath(`/${parsed.data.locale}/admin/projects/${subscription.projectId}/finances`);
}

export async function createAdminAiAgent(formData: FormData) {
  const user = await requireRole('ROOT');
  const parsed = aiAgentSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    throw new Error('Invalid admin AI agent payload.');
  }

  const agent = await prisma.adminAiAgent.create({
    data: {
      name: parsed.data.name.trim(),
      role: optionalString(parsed.data.role),
      status: parsed.data.status,
      monthlyCost: parsed.data.monthlyCost,
      successRate: parsed.data.successRate
    }
  });

  await writeActivity({
    actor: actorLabel(user),
    action: `Agente IA creado: ${agent.name}`,
    entity: 'AdminAiAgent',
    entityId: agent.id,
    metaJson: {
      status: agent.status
    }
  });

  revalidateAdmin(parsed.data.locale);
}
