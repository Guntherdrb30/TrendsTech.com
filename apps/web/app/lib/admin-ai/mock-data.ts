import type {
  AdminActivity,
  AdminClient,
  AdminLead,
  AdminOverview,
  AdminProject,
  AdminProposal,
  AgentTask,
  AiAgent,
  Invoice,
  Payment,
  ProjectLicense,
  ProjectSubscription
} from './types';

export const adminOverview: AdminOverview = {
  monthSales: 48200,
  budgetsSent: 14,
  acceptedProposals: 6,
  activeProjects: 8,
  activeSubscriptions: 11,
  monthlyRecurringRevenue: 8750,
  pendingInvoices: 5,
  overduePayments: 2,
  expiringLicenses: 4,
  overdueTasks: 7,
  maintenanceProjects: 3,
  estimatedMonthlyProfit: 5220
};

export const adminClients: AdminClient[] = [
  {
    id: 'client-carpihogar',
    name: 'Carpihogar',
    contactName: 'Andrea Morales',
    email: 'andrea@carpihogar.example',
    phone: '+58 412 000 1144',
    country: 'VE',
    industry: { es: 'Retail y construccion', en: 'Retail and construction' },
    activeProjects: 2,
    mrr: 1450,
    openBalance: 0,
    health: 'GOOD'
  },
  {
    id: 'client-cosentino',
    name: 'Cosentino LATAM',
    contactName: 'Daniel Ruiz',
    email: 'daniel@cosentino.example',
    phone: '+1 305 000 2201',
    country: 'US',
    industry: { es: 'Distribucion premium', en: 'Premium distribution' },
    activeProjects: 1,
    mrr: 2600,
    openBalance: 1200,
    health: 'WATCH'
  },
  {
    id: 'client-catemar',
    name: 'Catemar',
    contactName: 'Sofia Paredes',
    email: 'sofia@catemar.example',
    phone: '+58 414 000 3001',
    country: 'VE',
    industry: { es: 'Servicios y operaciones', en: 'Services and operations' },
    activeProjects: 1,
    mrr: 900,
    openBalance: 580,
    health: 'RISK'
  }
];

export const adminLeads: AdminLead[] = [
  {
    id: 'lead-001',
    clientName: 'Grupo Alianza Medica',
    source: 'Website',
    status: 'QUALIFIED',
    value: 9200,
    nextStep: { es: 'Enviar propuesta de agente de citas', en: 'Send appointment agent proposal' },
    owner: 'Gunther'
  },
  {
    id: 'lead-002',
    clientName: 'Moda Norte',
    source: 'WhatsApp',
    status: 'PROPOSAL_SENT',
    value: 6800,
    nextStep: { es: 'Reunion de cierre comercial', en: 'Commercial closing meeting' },
    owner: 'Sales AI'
  }
];

export const adminProposals: AdminProposal[] = [
  {
    id: 'prop-luna-carpihogar',
    clientId: 'client-carpihogar',
    title: { es: 'Expansion LUNA operaciones y aliados', en: 'LUNA operations and allies expansion' },
    status: 'ACCEPTED',
    amount: 18500,
    sentAt: '2026-04-08',
    validUntil: '2026-05-08',
    probability: 100
  },
  {
    id: 'prop-ai-clinic',
    clientId: 'client-cosentino',
    title: { es: 'Agentes IA para ventas B2B', en: 'AI agents for B2B sales' },
    status: 'SENT',
    amount: 12400,
    sentAt: '2026-04-22',
    validUntil: '2026-05-22',
    probability: 72
  },
  {
    id: 'prop-maintenance-suite',
    clientId: 'client-catemar',
    title: { es: 'Mantenimiento mensual y soporte ejecutivo', en: 'Monthly maintenance and executive support' },
    status: 'DRAFT',
    amount: 4200,
    sentAt: '2026-05-02',
    validUntil: '2026-06-02',
    probability: 48
  }
];

export const adminAiAgents: AiAgent[] = [
  {
    id: 'agent-sales-ops',
    name: 'LUNA Sales Ops',
    role: { es: 'Seguimiento comercial y CRM', en: 'Sales follow-up and CRM' },
    status: 'ACTIVE',
    assignedTasks: 12,
    successRate: 91,
    monthlyCost: 180
  },
  {
    id: 'agent-delivery-pm',
    name: 'Delivery PM AI',
    role: { es: 'Control de tareas, sprints y entregables', en: 'Tasks, sprints, and deliverables control' },
    status: 'TRAINING',
    assignedTasks: 8,
    successRate: 78,
    monthlyCost: 140
  },
  {
    id: 'agent-finance-watch',
    name: 'Finance Watch',
    role: { es: 'Alertas de facturas, pagos y licencias', en: 'Invoice, payment, and license alerts' },
    status: 'ACTIVE',
    assignedTasks: 6,
    successRate: 88,
    monthlyCost: 120
  }
];

export const adminProjects: AdminProject[] = [
  {
    id: 'project-luna-carpihogar',
    clientId: 'client-carpihogar',
    name: 'LUNA Carpihogar Commerce',
    status: 'ACTIVE',
    priority: 'HIGH',
    soldAt: '2026-03-18',
    manager: 'Gunther Del Rosario',
    description: {
      es: 'Sistema comercial PWA con ventas, inventario, cobros, clientes, despachos y paneles por rol.',
      en: 'Commercial PWA system with sales, inventory, payments, customers, dispatches, and role panels.'
    },
    system: {
      name: 'LUNA Commerce Suite',
      stack: ['Next.js', 'Postgres', 'Prisma', 'Vercel', 'Blob'],
      repositoryUrl: 'https://github.com/Guntherdrb30/TrendsTech.com',
      vercelProject: 'trends172tech',
      domain: 'carpihogar.example',
      database: 'Neon Postgres'
    },
    finance: {
      soldAmount: 18500,
      initialBudget: 16200,
      recurringMonthly: 1450,
      operationalCosts: 610,
      licenseCosts: 240,
      estimatedMonthlyProfit: 600,
      pendingInvoices: 1,
      overduePayments: 0
    },
    tasks: [
      {
        id: 'task-carp-001',
        title: { es: 'Cerrar tablero de aliados', en: 'Finish allies dashboard' },
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignee: 'Delivery PM AI',
        dueDate: '2026-05-14'
      },
      {
        id: 'task-carp-002',
        title: { es: 'Validar flujo de cobros', en: 'Validate payment workflow' },
        status: 'REVIEW',
        priority: 'MEDIUM',
        assignee: 'Gunther',
        dueDate: '2026-05-16'
      },
      {
        id: 'task-carp-003',
        title: { es: 'Documentar instalacion PWA', en: 'Document PWA install' },
        status: 'TODO',
        priority: 'LOW',
        assignee: 'Support AI',
        dueDate: '2026-05-18'
      }
    ],
    sprints: [
      { id: 'sprint-carp-01', name: 'Delivery 01', status: 'DONE', startsAt: '2026-04-01', endsAt: '2026-04-15' },
      { id: 'sprint-carp-02', name: 'Delivery 02', status: 'ACTIVE', startsAt: '2026-05-01', endsAt: '2026-05-20' }
    ],
    deliverables: [
      {
        id: 'del-carp-01',
        title: { es: 'Panel administrativo inicial', en: 'Initial admin panel' },
        status: 'APPROVED',
        dueDate: '2026-04-12'
      },
      {
        id: 'del-carp-02',
        title: { es: 'Modulo de despachos', en: 'Dispatch module' },
        status: 'DELIVERED',
        dueDate: '2026-05-15'
      }
    ],
    licenses: [
      {
        id: 'lic-carp-vercel',
        projectId: 'project-luna-carpihogar',
        name: 'Vercel Pro',
        provider: 'Vercel',
        status: 'ACTIVE',
        monthlyCost: 20,
        renewsAt: '2026-06-01'
      },
      {
        id: 'lic-carp-openai',
        projectId: 'project-luna-carpihogar',
        name: 'OpenAI API',
        provider: 'OpenAI',
        status: 'EXPIRING_SOON',
        monthlyCost: 220,
        renewsAt: '2026-05-18'
      }
    ],
    subscriptions: [
      {
        id: 'sub-carp-maint',
        projectId: 'project-luna-carpihogar',
        name: { es: 'Mantenimiento LUNA', en: 'LUNA maintenance' },
        status: 'ACTIVE',
        monthlyAmount: 1450,
        nextBillingAt: '2026-06-01'
      }
    ],
    integrations: [
      { id: 'int-carp-github', projectId: 'project-luna-carpihogar', name: 'GitHub', type: 'Repository', status: 'CONNECTED' },
      { id: 'int-carp-vercel', projectId: 'project-luna-carpihogar', name: 'Vercel', type: 'Deployment', status: 'CONNECTED' },
      { id: 'int-carp-whatsapp', projectId: 'project-luna-carpihogar', name: 'WhatsApp Business', type: 'Messaging', status: 'PENDING' }
    ],
    agentIds: ['agent-delivery-pm', 'agent-finance-watch']
  },
  {
    id: 'project-cosentino-b2b',
    clientId: 'client-cosentino',
    name: 'Cosentino B2B AI Desk',
    status: 'PLANNING',
    priority: 'MEDIUM',
    soldAt: '2026-04-24',
    manager: 'Sales AI',
    description: {
      es: 'Agentes IA para calificacion, seguimiento de leads y soporte comercial B2B.',
      en: 'AI agents for qualification, lead follow-up, and B2B sales support.'
    },
    system: {
      name: 'AI Sales Desk',
      stack: ['Next.js', 'OpenAI', 'Postgres'],
      repositoryUrl: 'https://github.com/Guntherdrb30/cosentino-ai-desk',
      vercelProject: 'cosentino-ai-desk',
      domain: 'ai.cosentino.example',
      database: 'Supabase Postgres'
    },
    finance: {
      soldAmount: 12400,
      initialBudget: 10800,
      recurringMonthly: 2600,
      operationalCosts: 780,
      licenseCosts: 410,
      estimatedMonthlyProfit: 1410,
      pendingInvoices: 2,
      overduePayments: 1
    },
    tasks: [
      {
        id: 'task-cos-001',
        title: { es: 'Preparar intake comercial', en: 'Prepare commercial intake' },
        status: 'TODO',
        priority: 'HIGH',
        assignee: 'LUNA Sales Ops',
        dueDate: '2026-05-12'
      }
    ],
    sprints: [
      { id: 'sprint-cos-01', name: 'Discovery', status: 'PLANNED', startsAt: '2026-05-13', endsAt: '2026-05-24' }
    ],
    deliverables: [
      {
        id: 'del-cos-01',
        title: { es: 'Mapa de agentes B2B', en: 'B2B agent map' },
        status: 'PENDING',
        dueDate: '2026-05-24'
      }
    ],
    licenses: [
      {
        id: 'lic-cos-openai',
        projectId: 'project-cosentino-b2b',
        name: 'OpenAI API',
        provider: 'OpenAI',
        status: 'ACTIVE',
        monthlyCost: 410,
        renewsAt: '2026-06-10'
      }
    ],
    subscriptions: [
      {
        id: 'sub-cos-ai',
        projectId: 'project-cosentino-b2b',
        name: { es: 'Operacion IA B2B', en: 'B2B AI operations' },
        status: 'ACTIVE',
        monthlyAmount: 2600,
        nextBillingAt: '2026-06-05'
      }
    ],
    integrations: [
      { id: 'int-cos-crm', projectId: 'project-cosentino-b2b', name: 'CRM', type: 'Sales', status: 'ISSUE' }
    ],
    agentIds: ['agent-sales-ops']
  },
  {
    id: 'project-catemar-maintenance',
    clientId: 'client-catemar',
    name: 'Catemar Maintenance Desk',
    status: 'MAINTENANCE',
    priority: 'URGENT',
    soldAt: '2026-02-04',
    manager: 'Gunther Del Rosario',
    description: {
      es: 'Mesa de soporte y mantenimiento para sistema operativo interno.',
      en: 'Support and maintenance desk for internal operations system.'
    },
    system: {
      name: 'Operations Desk',
      stack: ['Next.js', 'Prisma', 'Postgres'],
      repositoryUrl: 'https://github.com/Guntherdrb30/catemar-ops',
      vercelProject: 'catemar-ops',
      domain: 'ops.catemar.example',
      database: 'Neon Postgres'
    },
    finance: {
      soldAmount: 7800,
      initialBudget: 7200,
      recurringMonthly: 900,
      operationalCosts: 520,
      licenseCosts: 160,
      estimatedMonthlyProfit: 220,
      pendingInvoices: 2,
      overduePayments: 1
    },
    tasks: [
      {
        id: 'task-cat-001',
        title: { es: 'Resolver alerta de dominio', en: 'Resolve domain alert' },
        status: 'BLOCKED',
        priority: 'URGENT',
        assignee: 'Finance Watch',
        dueDate: '2026-05-09'
      }
    ],
    sprints: [
      { id: 'sprint-cat-01', name: 'Maintenance May', status: 'ACTIVE', startsAt: '2026-05-01', endsAt: '2026-05-31' }
    ],
    deliverables: [
      {
        id: 'del-cat-01',
        title: { es: 'Reporte mensual de soporte', en: 'Monthly support report' },
        status: 'PENDING',
        dueDate: '2026-05-31'
      }
    ],
    licenses: [
      {
        id: 'lic-cat-domain',
        projectId: 'project-catemar-maintenance',
        name: 'Dominio ops.catemar',
        provider: 'Registrar',
        status: 'EXPIRING_SOON',
        monthlyCost: 12,
        renewsAt: '2026-05-20'
      }
    ],
    subscriptions: [
      {
        id: 'sub-cat-maint',
        projectId: 'project-catemar-maintenance',
        name: { es: 'Soporte mensual', en: 'Monthly support' },
        status: 'ACTIVE',
        monthlyAmount: 900,
        nextBillingAt: '2026-05-28'
      }
    ],
    integrations: [
      { id: 'int-cat-vercel', projectId: 'project-catemar-maintenance', name: 'Vercel', type: 'Deployment', status: 'CONNECTED' }
    ],
    agentIds: ['agent-finance-watch']
  }
];

export const adminInvoices: Invoice[] = [
  {
    id: 'inv-001',
    clientId: 'client-carpihogar',
    projectId: 'project-luna-carpihogar',
    number: 'T172-2026-001',
    status: 'SENT',
    amount: 1450,
    dueDate: '2026-06-01'
  },
  {
    id: 'inv-002',
    clientId: 'client-cosentino',
    projectId: 'project-cosentino-b2b',
    number: 'T172-2026-002',
    status: 'OVERDUE',
    amount: 1200,
    dueDate: '2026-05-04'
  }
];

export const adminPayments: Payment[] = [
  {
    id: 'pay-001',
    clientId: 'client-carpihogar',
    projectId: 'project-luna-carpihogar',
    invoiceId: 'inv-001',
    status: 'PENDING',
    amount: 1450
  },
  {
    id: 'pay-002',
    clientId: 'client-cosentino',
    projectId: 'project-cosentino-b2b',
    invoiceId: 'inv-002',
    status: 'PENDING',
    amount: 1200
  }
];

export const adminActivity: AdminActivity[] = [
  {
    id: 'act-001',
    actor: 'LUNA Sales Ops',
    action: { es: 'marco una propuesta como aceptada', en: 'marked a proposal as accepted' },
    entity: 'Carpihogar',
    occurredAt: '2026-05-10T14:20:00.000Z'
  },
  {
    id: 'act-002',
    actor: 'Finance Watch',
    action: { es: 'detecto una licencia por vencer', en: 'detected an expiring license' },
    entity: 'Catemar Maintenance Desk',
    occurredAt: '2026-05-10T12:05:00.000Z'
  },
  {
    id: 'act-003',
    actor: 'Gunther',
    action: { es: 'actualizo el sprint activo', en: 'updated the active sprint' },
    entity: 'LUNA Carpihogar Commerce',
    occurredAt: '2026-05-09T21:40:00.000Z'
  }
];

export const adminAgentTasks: AgentTask[] = [
  {
    id: 'agent-task-001',
    agentId: 'agent-sales-ops',
    projectId: 'project-cosentino-b2b',
    title: { es: 'Preparar follow-up de propuesta', en: 'Prepare proposal follow-up' },
    status: 'TODO',
    priority: 'HIGH'
  },
  {
    id: 'agent-task-002',
    agentId: 'agent-finance-watch',
    projectId: 'project-catemar-maintenance',
    title: { es: 'Alertar pago vencido', en: 'Alert overdue payment' },
    status: 'IN_PROGRESS',
    priority: 'URGENT'
  }
];

export function getLocalizedValue(value: { es: string; en: string }, locale: string) {
  return locale.startsWith('es') ? value.es : value.en;
}

export function getClientById(id: string) {
  return adminClients.find((client) => client.id === id) ?? null;
}

export function getProjectById(id: string) {
  return adminProjects.find((project) => project.id === id) ?? null;
}

export function getProjectLicenses(): ProjectLicense[] {
  return adminProjects.flatMap((project) => project.licenses);
}

export function getProjectSubscriptions(): ProjectSubscription[] {
  return adminProjects.flatMap((project) => project.subscriptions);
}

export function getAllProjectTasks() {
  return adminProjects.flatMap((project) =>
    project.tasks.map((task) => ({
      ...task,
      projectId: project.id,
      projectName: project.name,
      clientId: project.clientId
    }))
  );
}
