import { prisma } from '@trends172tech/db';
import type {
  AdminActivity,
  AdminClient,
  AdminOverview,
  AdminProject,
  AdminProposal,
  AgentTask,
  AiAgent,
  ProjectLicense,
  ProjectSubscription
} from './types';

function toMoney(value: unknown) {
  return Number(value ?? 0);
}

function toDateString(value?: Date | null) {
  return value ? value.toISOString().split('T')[0] : '';
}

function localized(value: string) {
  return { es: value, en: value };
}

export class AdminDataUnavailableError extends Error {
  constructor(cause: unknown) {
    super('The operational database could not be queried.', { cause });
    this.name = 'AdminDataUnavailableError';
  }
}

async function queryAdminData<T>(query: () => Promise<T>): Promise<T> {
  try {
    return await query();
  } catch (error) {
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    const errorCode = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : undefined;
    console.error('[admin-data] Operational query failed', { errorName, errorCode });
    throw new AdminDataUnavailableError(error);
  }
}

export async function getAdminClients(): Promise<AdminClient[]> {
  return queryAdminData(async () => {
    const clients = await prisma.adminClient.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        projects: true,
        invoices: true
      }
    });

    return clients.map((client) => ({
      id: client.id,
      name: client.name,
      contactName: client.contactName ?? '',
      email: client.email ?? '',
      phone: client.phone ?? '',
      country: client.country ?? '',
      industry: localized(client.industry ?? ''),
      activeProjects: client.projects.filter((project) => project.status === 'ACTIVE').length,
      mrr: client.projects.reduce((sum, project) => sum + toMoney(project.monthlyRetainer), 0),
      openBalance: client.invoices
        .filter((invoice) => invoice.status === 'SENT' || invoice.status === 'OVERDUE' || invoice.status === 'PARTIALLY_PAID')
        .reduce((sum, invoice) => sum + toMoney(invoice.amount), 0),
      health: client.health === 'RISK' || client.health === 'WATCH' ? client.health : 'GOOD'
    }));
  });
}

export async function getAdminProjects(): Promise<AdminProject[]> {
  return queryAdminData(async () => {
    const projects = await prisma.adminProject.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        system: true,
        client: true,
        finance: true,
        tasks: true,
        sprints: true,
        deliverables: true,
        licenses: true,
        subscriptions: true,
        integrations: true,
        invoices: true,
        agentTasks: true
      }
    });

    return projects.map((project) => ({
      id: project.id,
      clientId: project.clientId,
      clientName: project.client.name,
      name: project.name,
      status: project.status,
      priority: project.priority,
      soldAt: toDateString(project.soldAt),
      manager: project.manager ?? '',
      description: localized(project.description ?? ''),
      system: {
        name: project.system?.name ?? project.name,
        stack: Array.isArray(project.system?.stackJson) ? project.system.stackJson.map(String) : [],
        repositoryUrl: project.system?.repositoryUrl ?? '',
        vercelProject: project.system?.vercelProject ?? '',
        domain: project.system?.domain ?? '',
        database: project.system?.databaseName ?? ''
      },
      finance: {
        soldAmount: toMoney(project.finance?.soldAmount ?? project.soldAmount),
        initialBudget: toMoney(project.finance?.initialBudget),
        recurringMonthly: toMoney(project.finance?.recurringMonthly ?? project.monthlyRetainer),
        operationalCosts: toMoney(project.finance?.operationalCostsMonthly),
        licenseCosts: toMoney(project.finance?.licenseCostsMonthly),
        estimatedMonthlyProfit: toMoney(project.finance?.estimatedMonthlyProfit),
        pendingInvoices: project.invoices.filter((invoice) =>
          invoice.status === 'SENT' || invoice.status === 'OVERDUE' || invoice.status === 'PARTIALLY_PAID'
        ).length,
        overduePayments: project.invoices.filter((invoice) =>
          invoice.status === 'OVERDUE' ||
          (invoice.dueDate !== null && invoice.dueDate < new Date() && invoice.status !== 'PAID' && invoice.status !== 'CANCELLED')
        ).length
      },
      tasks: project.tasks.map((task) => ({
        id: task.id,
        title: localized(task.title),
        status: task.status,
        priority: task.priority,
        assignee: task.assignee ?? '',
        dueDate: toDateString(task.dueDate)
      })),
      sprints: project.sprints.map((sprint) => ({
        id: sprint.id,
        name: sprint.name,
        status: sprint.status === 'ACTIVE' || sprint.status === 'DONE' ? sprint.status : 'PLANNED',
        startsAt: toDateString(sprint.startsAt),
        endsAt: toDateString(sprint.endsAt)
      })),
      deliverables: project.deliverables.map((deliverable) => ({
        id: deliverable.id,
        title: localized(deliverable.title),
        status:
          deliverable.status === 'DELIVERED' || deliverable.status === 'APPROVED'
            ? deliverable.status
            : 'PENDING',
        dueDate: toDateString(deliverable.dueDate)
      })),
      licenses: project.licenses.map((license) => ({
        id: license.id,
        projectId: license.projectId,
        name: license.name,
        provider: license.provider ?? '',
        status: license.status,
        monthlyCost: toMoney(license.monthlyCost),
        renewsAt: toDateString(license.renewsAt)
      })),
      subscriptions: project.subscriptions.map((subscription) => ({
        id: subscription.id,
        projectId: subscription.projectId,
        name: localized(subscription.name),
        status: subscription.status,
        monthlyAmount: toMoney(subscription.monthlyAmount),
        nextBillingAt: toDateString(subscription.nextBillingAt)
      })),
      integrations: project.integrations.map((integration) => ({
        id: integration.id,
        projectId: integration.projectId,
        name: integration.name,
        type: integration.type ?? '',
        status:
          integration.status === 'CONNECTED' || integration.status === 'ISSUE'
            ? integration.status
            : 'PENDING'
      })),
      agentIds: project.agentTasks.map((task) => task.agentId)
    }));
  });
}

export async function getAdminProjectById(id: string) {
  const projects = await getAdminProjects();
  return projects.find((project) => project.id === id) ?? null;
}

export async function getAdminProposals(): Promise<AdminProposal[]> {
  return queryAdminData(async () => {
    const proposals = await prisma.adminProposal.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return proposals.map((proposal) => ({
      id: proposal.id,
      clientId: proposal.clientId,
      title: localized(proposal.title),
      status: proposal.status,
      amount: toMoney(proposal.amount),
      sentAt: toDateString(proposal.sentAt),
      validUntil: toDateString(proposal.validUntil),
      probability: proposal.probability
    }));
  });
}

export async function getAdminAiAgents(): Promise<AiAgent[]> {
  return queryAdminData(async () => {
    const agents = await prisma.adminAiAgent.findMany({
      orderBy: { createdAt: 'desc' },
      include: { tasks: true }
    });

    return agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      role: localized(agent.role ?? ''),
      status: agent.status,
      assignedTasks: agent.tasks.length,
      successRate: agent.successRate,
      monthlyCost: toMoney(agent.monthlyCost)
    }));
  });
}

export async function getAdminAgentTasks(): Promise<AgentTask[]> {
  return queryAdminData(async () => {
    const tasks = await prisma.adminAgentTask.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return tasks.map((task) => ({
      id: task.id,
      agentId: task.agentId,
      projectId: task.projectId,
      title: localized(task.title),
      status: task.status,
      priority: task.priority
    }));
  });
}

export async function getAdminActivity(): Promise<AdminActivity[]> {
  return queryAdminData(async () => {
    const items = await prisma.adminActivityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12
    });

    return items.map((item) => ({
      id: item.id,
      actor: item.actor,
      action: localized(item.action),
      entity: item.entity,
      occurredAt: item.createdAt.toISOString()
    }));
  });
}

export async function getAdminLicenses(): Promise<ProjectLicense[]> {
  const projects = await getAdminProjects();
  return projects.flatMap((project) => project.licenses);
}

export async function getAdminSubscriptions(): Promise<ProjectSubscription[]> {
  const projects = await getAdminProjects();
  return projects.flatMap((project) => project.subscriptions);
}

export async function getAdminOverview(): Promise<AdminOverview> {
  return queryAdminData(async () => {
    const [projects, proposals] = await Promise.all([
      getAdminProjects(),
      getAdminProposals()
    ]);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const activeProjects = projects.filter((project) => project.status === 'ACTIVE');
    const maintenanceProjects = projects.filter((project) => project.status === 'MAINTENANCE');
    const expiringLicenses = projects
      .flatMap((project) => project.licenses)
      .filter((license) => license.status === 'EXPIRING_SOON').length;
    const overdueTasks = projects
      .flatMap((project) => project.tasks)
      .filter((task) => task.dueDate && new Date(task.dueDate) < now && task.status !== 'DONE').length;

    return {
      monthSales: projects
        .filter((project) => project.soldAt && new Date(project.soldAt) >= monthStart)
        .reduce((sum, project) => sum + project.finance.soldAmount, 0),
      budgetsSent: proposals.filter((proposal) => proposal.status !== 'DRAFT').length,
      acceptedProposals: proposals.filter((proposal) => proposal.status === 'ACCEPTED').length,
      activeProjects: activeProjects.length,
      activeSubscriptions: projects.flatMap((project) => project.subscriptions).filter((subscription) => subscription.status === 'ACTIVE').length,
      monthlyRecurringRevenue: projects.reduce((sum, project) => sum + project.finance.recurringMonthly, 0),
      pendingInvoices: projects.reduce((sum, project) => sum + project.finance.pendingInvoices, 0),
      overduePayments: projects.reduce((sum, project) => sum + project.finance.overduePayments, 0),
      expiringLicenses,
      overdueTasks,
      maintenanceProjects: maintenanceProjects.length,
      estimatedMonthlyProfit: projects.reduce((sum, project) => sum + project.finance.estimatedMonthlyProfit, 0)
    };
  });
}
