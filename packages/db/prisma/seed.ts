import { randomBytes } from 'crypto';
import { seedSkills } from './seeds/skills';
import {
  Prisma,
  PrismaClient,
  RoundingRule,
  TenantMode,
  TenantStatus,
  UserRole,
  AdminProjectStatus,
  AdminTaskStatus,
  AdminInvoiceStatus,
  AdminPaymentStatus,
  AdminSubscriptionStatus,
  AdminLicenseStatus,
  AdminAiAgentStatus,
  AdminPriority,
  AdminProposalStatus
} from '@prisma/client';

const prisma = new PrismaClient();

function generatePassword() {
  return randomBytes(8).toString('hex');
}

async function seedAdminData() {
  const clients = [
    {
      id: 'client-carpihogar',
      name: 'Carpihogar',
      contactName: 'Andrea Morales',
      email: 'andrea@carpihogar.example',
      phone: '+58 412 000 1144',
      country: 'VE',
      industry: 'Retail y construccion',
      health: 'GOOD'
    },
    {
      id: 'client-cosentino',
      name: 'Cosentino LATAM',
      contactName: 'Daniel Ruiz',
      email: 'daniel@cosentino.example',
      phone: '+1 305 000 2201',
      country: 'US',
      industry: 'Distribucion premium',
      health: 'WATCH'
    },
    {
      id: 'client-catemar',
      name: 'Catemar',
      contactName: 'Sofia Paredes',
      email: 'sofia@catemar.example',
      phone: '+58 414 000 3001',
      country: 'VE',
      industry: 'Servicios y operaciones',
      health: 'RISK'
    }
  ];

  for (const client of clients) {
    await prisma.adminClient.upsert({
      where: { id: client.id },
      update: client,
      create: client
    });
  }

  const proposals = [
    {
      id: 'prop-luna-carpihogar',
      clientId: 'client-carpihogar',
      title: 'Expansion LUNA operaciones y aliados',
      summary: 'LUNA commerce, operaciones, cobranza y panel de aliados.',
      status: AdminProposalStatus.ACCEPTED,
      amount: new Prisma.Decimal('18500'),
      probability: 100,
      sentAt: new Date('2026-04-08'),
      validUntil: new Date('2026-05-08'),
      acceptedAt: new Date('2026-04-19')
    },
    {
      id: 'prop-ai-clinic',
      clientId: 'client-cosentino',
      title: 'Agentes IA para ventas B2B',
      summary: 'Propuesta de inteligencia comercial para captacion y seguimiento de leads.',
      status: AdminProposalStatus.SENT,
      amount: new Prisma.Decimal('12400'),
      probability: 72,
      sentAt: new Date('2026-04-22'),
      validUntil: new Date('2026-05-22')
    },
    {
      id: 'prop-maintenance-suite',
      clientId: 'client-catemar',
      title: 'Mantenimiento mensual y soporte ejecutivo',
      summary: 'Contrato de soporte mensual con seguimiento comercial y operativo.',
      status: AdminProposalStatus.DRAFT,
      amount: new Prisma.Decimal('4200'),
      probability: 48,
      sentAt: new Date('2026-05-02'),
      validUntil: new Date('2026-06-02')
    }
  ];

  for (const proposal of proposals) {
    await prisma.adminProposal.upsert({
      where: { id: proposal.id },
      update: proposal,
      create: proposal
    });
  }

  const projects = [
    {
      id: 'project-luna-carpihogar',
      clientId: 'client-carpihogar',
      proposalId: 'prop-luna-carpihogar',
      name: 'LUNA Carpihogar Commerce',
      description: 'Sistema comercial PWA con ventas, inventario, cobros, clientes, despachos y paneles por rol.',
      status: AdminProjectStatus.ACTIVE,
      priority: AdminPriority.HIGH,
      soldAmount: new Prisma.Decimal('18500'),
      paymentMethod: 'Card',
      monthlyRetainer: new Prisma.Decimal('1450'),
      manager: 'Gunther Del Rosario',
      soldAt: new Date('2026-03-18')
    },
    {
      id: 'project-cosentino-b2b',
      clientId: 'client-cosentino',
      proposalId: 'prop-ai-clinic',
      name: 'Cosentino B2B AI Desk',
      description: 'Agentes IA para calificacion, seguimiento de leads y soporte comercial B2B.',
      status: AdminProjectStatus.PLANNING,
      priority: AdminPriority.MEDIUM,
      soldAmount: new Prisma.Decimal('12400'),
      paymentMethod: 'Bank transfer',
      monthlyRetainer: new Prisma.Decimal('2600'),
      manager: 'Sales AI',
      soldAt: new Date('2026-04-24')
    },
    {
      id: 'project-catemar-maintenance',
      clientId: 'client-catemar',
      proposalId: 'prop-maintenance-suite',
      name: 'Catemar Maintenance Desk',
      description: 'Mesa de soporte y mantenimiento para sistema operativo interno.',
      status: AdminProjectStatus.MAINTENANCE,
      priority: AdminPriority.URGENT,
      soldAmount: new Prisma.Decimal('7800'),
      paymentMethod: 'Online',
      monthlyRetainer: new Prisma.Decimal('900'),
      manager: 'Gunther Del Rosario',
      soldAt: new Date('2026-02-04')
    }
  ];

  for (const project of projects) {
    await prisma.adminProject.upsert({
      where: { id: project.id },
      update: project,
      create: project
    });
  }

  const systems = [
    {
      projectId: 'project-luna-carpihogar',
      name: 'LUNA Commerce Suite',
      stackJson: ['Next.js', 'Postgres', 'Prisma', 'Vercel', 'Blob'],
      repositoryUrl: 'https://github.com/Guntherdrb30/TrendsTech.com',
      vercelProject: 'trends172tech',
      domain: 'carpihogar.example',
      databaseName: 'Neon Postgres'
    },
    {
      projectId: 'project-cosentino-b2b',
      name: 'AI Sales Desk',
      stackJson: ['Next.js', 'OpenAI', 'Postgres'],
      repositoryUrl: 'https://github.com/Guntherdrb30/cosentino-ai-desk',
      vercelProject: 'cosentino-ai-desk',
      domain: 'ai.cosentino.example',
      databaseName: 'Supabase Postgres'
    },
    {
      projectId: 'project-catemar-maintenance',
      name: 'Operations Desk',
      stackJson: ['Next.js', 'Prisma', 'Postgres'],
      repositoryUrl: 'https://github.com/Guntherdrb30/catemar-ops',
      vercelProject: 'catemar-ops',
      domain: 'ops.catemar.example',
      databaseName: 'Neon Postgres'
    }
  ];

  for (const system of systems) {
    await prisma.adminProjectSystem.upsert({
      where: { projectId: system.projectId },
      update: system,
      create: system
    });
  }

  const finances = [
    {
      projectId: 'project-luna-carpihogar',
      initialBudget: new Prisma.Decimal('16200'),
      soldAmount: new Prisma.Decimal('18500'),
      recurringMonthly: new Prisma.Decimal('1450'),
      operationalCostsMonthly: new Prisma.Decimal('610'),
      licenseCostsMonthly: new Prisma.Decimal('240'),
      estimatedMonthlyProfit: new Prisma.Decimal('600')
    },
    {
      projectId: 'project-cosentino-b2b',
      initialBudget: new Prisma.Decimal('10800'),
      soldAmount: new Prisma.Decimal('12400'),
      recurringMonthly: new Prisma.Decimal('2600'),
      operationalCostsMonthly: new Prisma.Decimal('780'),
      licenseCostsMonthly: new Prisma.Decimal('410'),
      estimatedMonthlyProfit: new Prisma.Decimal('1410')
    },
    {
      projectId: 'project-catemar-maintenance',
      initialBudget: new Prisma.Decimal('7200'),
      soldAmount: new Prisma.Decimal('7800'),
      recurringMonthly: new Prisma.Decimal('900'),
      operationalCostsMonthly: new Prisma.Decimal('520'),
      licenseCostsMonthly: new Prisma.Decimal('160'),
      estimatedMonthlyProfit: new Prisma.Decimal('220')
    }
  ];

  for (const finance of finances) {
    await prisma.adminProjectFinance.upsert({
      where: { projectId: finance.projectId },
      update: finance,
      create: finance
    });
  }

  const tasks = [
    {
      id: 'task-carp-001',
      projectId: 'project-luna-carpihogar',
      title: 'Cerrar tablero de aliados',
      status: AdminTaskStatus.IN_PROGRESS,
      priority: AdminPriority.HIGH,
      assignee: 'Delivery PM AI',
      dueDate: new Date('2026-05-14')
    },
    {
      id: 'task-carp-002',
      projectId: 'project-luna-carpihogar',
      title: 'Validar flujo de cobros',
      status: AdminTaskStatus.REVIEW,
      priority: AdminPriority.MEDIUM,
      assignee: 'Gunther',
      dueDate: new Date('2026-05-16')
    },
    {
      id: 'task-cat-001',
      projectId: 'project-catemar-maintenance',
      title: 'Resolver alerta de dominio',
      status: AdminTaskStatus.BLOCKED,
      priority: AdminPriority.URGENT,
      assignee: 'Finance Watch',
      dueDate: new Date('2026-05-09')
    }
  ];

  for (const task of tasks) {
    await prisma.adminTask.upsert({
      where: { id: task.id },
      update: task,
      create: task
    });
  }

  const deliverables = [
    {
      id: 'del-carp-01',
      projectId: 'project-luna-carpihogar',
      title: 'Panel administrativo inicial',
      status: 'APPROVED',
      dueDate: new Date('2026-04-12')
    },
    {
      id: 'del-carp-02',
      projectId: 'project-luna-carpihogar',
      title: 'Modulo de despachos',
      status: 'DELIVERED',
      dueDate: new Date('2026-05-15')
    },
    {
      id: 'del-cat-01',
      projectId: 'project-catemar-maintenance',
      title: 'Reporte mensual de soporte',
      status: 'PENDING',
      dueDate: new Date('2026-05-31')
    }
  ];

  for (const deliverable of deliverables) {
    await prisma.adminDeliverable.upsert({
      where: { id: deliverable.id },
      update: deliverable,
      create: deliverable
    });
  }

  const licenses = [
    {
      id: 'lic-carp-vercel',
      projectId: 'project-luna-carpihogar',
      name: 'Vercel Pro',
      provider: 'Vercel',
      status: AdminLicenseStatus.ACTIVE,
      monthlyCost: new Prisma.Decimal('20'),
      renewsAt: new Date('2026-06-01')
    },
    {
      id: 'lic-carp-openai',
      projectId: 'project-luna-carpihogar',
      name: 'OpenAI API',
      provider: 'OpenAI',
      status: AdminLicenseStatus.EXPIRING_SOON,
      monthlyCost: new Prisma.Decimal('220'),
      renewsAt: new Date('2026-05-18')
    },
    {
      id: 'lic-cat-domain',
      projectId: 'project-catemar-maintenance',
      name: 'Dominio ops.catemar',
      provider: 'Registrar',
      status: AdminLicenseStatus.EXPIRING_SOON,
      monthlyCost: new Prisma.Decimal('12'),
      renewsAt: new Date('2026-05-20')
    }
  ];

  for (const license of licenses) {
    await prisma.adminProjectLicense.upsert({
      where: { id: license.id },
      update: license,
      create: license
    });
  }

  const subscriptions = [
    {
      id: 'sub-carp-maint',
      projectId: 'project-luna-carpihogar',
      name: 'Mantenimiento LUNA',
      status: AdminSubscriptionStatus.ACTIVE,
      monthlyAmount: new Prisma.Decimal('1450'),
      nextBillingAt: new Date('2026-06-01')
    },
    {
      id: 'sub-cos-ai',
      projectId: 'project-cosentino-b2b',
      name: 'Operacion IA B2B',
      status: AdminSubscriptionStatus.ACTIVE,
      monthlyAmount: new Prisma.Decimal('2600'),
      nextBillingAt: new Date('2026-06-05')
    },
    {
      id: 'sub-cat-maint',
      projectId: 'project-catemar-maintenance',
      name: 'Soporte mensual',
      status: AdminSubscriptionStatus.ACTIVE,
      monthlyAmount: new Prisma.Decimal('900'),
      nextBillingAt: new Date('2026-05-28')
    }
  ];

  for (const subscription of subscriptions) {
    await prisma.adminProjectSubscription.upsert({
      where: { id: subscription.id },
      update: subscription,
      create: subscription
    });
  }

  const integrations = [
    {
      id: 'int-carp-github',
      projectId: 'project-luna-carpihogar',
      name: 'GitHub',
      type: 'Repository',
      status: 'CONNECTED'
    },
    {
      id: 'int-carp-vercel',
      projectId: 'project-luna-carpihogar',
      name: 'Vercel',
      type: 'Deployment',
      status: 'CONNECTED'
    },
    {
      id: 'int-cat-vercel',
      projectId: 'project-catemar-maintenance',
      name: 'Vercel',
      type: 'Deployment',
      status: 'CONNECTED'
    }
  ];

  for (const integration of integrations) {
    await prisma.adminProjectIntegration.upsert({
      where: { id: integration.id },
      update: integration,
      create: integration
    });
  }

  const agents = [
    {
      id: 'agent-sales-ops',
      name: 'LUNA Sales Ops',
      role: 'Seguimiento comercial y CRM',
      status: AdminAiAgentStatus.ACTIVE,
      monthlyCost: new Prisma.Decimal('180'),
      successRate: 91
    },
    {
      id: 'agent-delivery-pm',
      name: 'Delivery PM AI',
      role: 'Control de tareas, sprints y entregables',
      status: AdminAiAgentStatus.TRAINING,
      monthlyCost: new Prisma.Decimal('140'),
      successRate: 78
    },
    {
      id: 'agent-finance-watch',
      name: 'Finance Watch',
      role: 'Alertas de facturas, pagos y licencias',
      status: AdminAiAgentStatus.ACTIVE,
      monthlyCost: new Prisma.Decimal('120'),
      successRate: 88
    }
  ];

  for (const agent of agents) {
    await prisma.adminAiAgent.upsert({
      where: { id: agent.id },
      update: agent,
      create: agent
    });
  }

  const agentTasks = [
    {
      id: 'agent-task-001',
      agentId: 'agent-sales-ops',
      projectId: 'project-cosentino-b2b',
      title: 'Preparar follow-up de propuesta',
      status: AdminTaskStatus.TODO,
      priority: AdminPriority.HIGH
    },
    {
      id: 'agent-task-002',
      agentId: 'agent-finance-watch',
      projectId: 'project-catemar-maintenance',
      title: 'Alertar pago vencido',
      status: AdminTaskStatus.IN_PROGRESS,
      priority: AdminPriority.URGENT
    }
  ];

  for (const agentTask of agentTasks) {
    await prisma.adminAgentTask.upsert({
      where: { id: agentTask.id },
      update: agentTask,
      create: agentTask
    });
  }

  const invoices = [
    {
      id: 'inv-001',
      clientId: 'client-carpihogar',
      projectId: 'project-luna-carpihogar',
      number: 'T172-2026-001',
      status: AdminInvoiceStatus.SENT,
      amount: new Prisma.Decimal('1450'),
      dueDate: new Date('2026-06-01'),
      issuedAt: new Date('2026-05-10')
    },
    {
      id: 'inv-002',
      clientId: 'client-cosentino',
      projectId: 'project-cosentino-b2b',
      number: 'T172-2026-002',
      status: AdminInvoiceStatus.OVERDUE,
      amount: new Prisma.Decimal('1200'),
      dueDate: new Date('2026-05-04'),
      issuedAt: new Date('2026-04-30')
    }
  ];

  for (const invoice of invoices) {
    await prisma.adminInvoice.upsert({
      where: { id: invoice.id },
      update: invoice,
      create: invoice
    });
  }

  const payments = [
    {
      id: 'pay-001',
      clientId: 'client-carpihogar',
      projectId: 'project-luna-carpihogar',
      invoiceId: 'inv-001',
      status: AdminPaymentStatus.PENDING,
      amount: new Prisma.Decimal('1450')
    },
    {
      id: 'pay-002',
      clientId: 'client-cosentino',
      projectId: 'project-cosentino-b2b',
      invoiceId: 'inv-002',
      status: AdminPaymentStatus.PENDING,
      amount: new Prisma.Decimal('1200')
    }
  ];

  for (const payment of payments) {
    await prisma.adminPayment.upsert({
      where: { id: payment.id },
      update: payment,
      create: payment
    });
  }
}

async function main() {
  const rootEmail = process.env.ROOT_EMAIL ?? 'root@trends172tech.local';
  const rootPassword = process.env.ROOT_PASSWORD ?? generatePassword();
  const demoEmail = process.env.DEMO_EMAIL ?? 'admin@demo.trends172tech.local';
  const demoPassword = process.env.DEMO_PASSWORD ?? 'Demo123!';

  const bcryptjsModule = (await import('bcryptjs')) as any;
  const bcryptjs = bcryptjsModule.default ?? bcryptjsModule;
  const rootHash = await bcryptjs.hash(rootPassword, 10);
  const demoHash = await bcryptjs.hash(demoPassword, 10);

  const rootUser = await prisma.user.upsert({
    where: { email: rootEmail },
    update: {
      role: UserRole.ROOT,
      passwordHash: rootHash
    },
    create: {
      email: rootEmail,
      name: 'Root Admin',
      role: UserRole.ROOT,
      passwordHash: rootHash
    }
  });

  await prisma.globalSettings.upsert({
    where: { id: 1 },
    update: {
      usdToVesRate: new Prisma.Decimal('36.5'),
      roundingRule: RoundingRule.ONE,
      usdPaymentDiscountPercent: new Prisma.Decimal('5.0'),
      tokenInputUsdPer1M: new Prisma.Decimal('0.40'),
      tokenOutputUsdPer1M: new Prisma.Decimal('1.60'),
      tokenCachedInputUsdPer1M: new Prisma.Decimal('0.10'),
      tokenMarkupPercent: new Prisma.Decimal('30.0'),
      updatedByUserId: rootUser.id
    },
    create: {
      id: 1,
      usdToVesRate: new Prisma.Decimal('36.5'),
      roundingRule: RoundingRule.ONE,
      usdPaymentDiscountPercent: new Prisma.Decimal('5.0'),
      tokenInputUsdPer1M: new Prisma.Decimal('0.40'),
      tokenOutputUsdPer1M: new Prisma.Decimal('1.60'),
      tokenCachedInputUsdPer1M: new Prisma.Decimal('0.10'),
      tokenMarkupPercent: new Prisma.Decimal('30.0'),
      updatedByUserId: rootUser.id
    }
  });

  await prisma.plan.upsert({
    where: { key: 'starter' },
    update: {
      name_es: 'Starter',
      name_en: 'Starter',
      priceUsdMonthly: new Prisma.Decimal('49.00'),
      isActive: true
    },
    create: {
      key: 'starter',
      name_es: 'Starter',
      name_en: 'Starter',
      priceUsdMonthly: new Prisma.Decimal('49.00'),
      isActive: true
    }
  });

  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {
      name: 'Demo Tenant',
      mode: TenantMode.SINGLE,
      status: TenantStatus.ACTIVE
    },
    create: {
      name: 'Demo Tenant',
      slug: 'demo',
      mode: TenantMode.SINGLE,
      status: TenantStatus.ACTIVE
    }
  });

  await prisma.tokenWallet.upsert({
    where: { tenantId: demoTenant.id },
    update: {},
    create: {
      tenantId: demoTenant.id,
      balance: 0
    }
  });

  const existingCreator = await prisma.agentInstance.findFirst({
    where: { tenantId: demoTenant.id, baseAgentKey: 'agent_creator' }
  });
  if (!existingCreator) {
    await prisma.agentInstance.create({
      data: {
        tenantId: demoTenant.id,
        name: 'Creador de agentes',
        baseAgentKey: 'agent_creator',
        languageDefault: 'ES',
        status: 'ACTIVE'
      }
    });
  }

  await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      role: UserRole.TENANT_ADMIN,
      tenantId: demoTenant.id,
      passwordHash: demoHash
    },
    create: {
      email: demoEmail,
      name: 'Demo Admin',
      role: UserRole.TENANT_ADMIN,
      tenantId: demoTenant.id,
      passwordHash: demoHash
    }
  });

  await seedAdminData();
  await seedSkills(prisma);

  console.log('Seed complete.');
  console.log(`ROOT_EMAIL=${rootEmail}`);
  console.log(`ROOT_PASSWORD=${rootPassword}`);
  console.log(`DEMO_EMAIL=${demoEmail}`);
  console.log(`DEMO_PASSWORD=${demoPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
