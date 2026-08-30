export type LocalizedString = {
  es: string;
  en: string;
};

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'WON' | 'LOST';
export type ProposalStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'MAINTENANCE' | 'COMPLETED' | 'CANCELLED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
export type LicenseStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'CANCELLED';
export type AgentStatus = 'ACTIVE' | 'INACTIVE' | 'TRAINING';

export type AdminClient = {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  industry: LocalizedString;
  activeProjects: number;
  mrr: number;
  openBalance: number;
  health: 'GOOD' | 'WATCH' | 'RISK';
};

export type AdminLead = {
  id: string;
  clientName: string;
  source: string;
  status: LeadStatus;
  value: number;
  nextStep: LocalizedString;
  owner: string;
};

export type AdminProposal = {
  id: string;
  clientId: string;
  title: LocalizedString;
  status: ProposalStatus;
  amount: number;
  sentAt: string;
  validUntil: string;
  probability: number;
};

export type ProjectSystem = {
  name: string;
  stack: string[];
  repositoryUrl: string;
  vercelProject: string;
  domain: string;
  database: string;
};

export type ProjectFinance = {
  soldAmount: number;
  initialBudget: number;
  recurringMonthly: number;
  operationalCosts: number;
  licenseCosts: number;
  estimatedMonthlyProfit: number;
  pendingInvoices: number;
  overduePayments: number;
};

export type ProjectTask = {
  id: string;
  title: LocalizedString;
  status: TaskStatus;
  priority: Priority;
  assignee: string;
  dueDate: string;
};

export type ProjectSprint = {
  id: string;
  name: string;
  status: 'PLANNED' | 'ACTIVE' | 'DONE';
  startsAt: string;
  endsAt: string;
};

export type Deliverable = {
  id: string;
  title: LocalizedString;
  status: 'PENDING' | 'DELIVERED' | 'APPROVED';
  dueDate: string;
};

export type ProjectLicense = {
  id: string;
  projectId: string;
  name: string;
  provider: string;
  status: LicenseStatus;
  monthlyCost: number;
  renewsAt: string;
};

export type ProjectSubscription = {
  id: string;
  projectId: string;
  name: LocalizedString;
  status: SubscriptionStatus;
  monthlyAmount: number;
  nextBillingAt: string;
};

export type ProjectIntegration = {
  id: string;
  projectId: string;
  name: string;
  type: string;
  status: 'CONNECTED' | 'PENDING' | 'ISSUE';
};

export type Invoice = {
  id: string;
  clientId: string;
  projectId: string;
  number: string;
  status: InvoiceStatus;
  amount: number;
  dueDate: string;
};

export type Payment = {
  id: string;
  clientId: string;
  projectId: string;
  invoiceId?: string;
  status: PaymentStatus;
  amount: number;
  paidAt?: string;
};

export type AiAgent = {
  id: string;
  name: string;
  role: LocalizedString;
  status: AgentStatus;
  assignedTasks: number;
  successRate: number;
  monthlyCost: number;
};

export type AgentTask = {
  id: string;
  agentId: string;
  projectId: string;
  title: LocalizedString;
  status: TaskStatus;
  priority: Priority;
};

export type AdminActivity = {
  id: string;
  actor: string;
  action: LocalizedString;
  entity: string;
  occurredAt: string;
};

export type AdminProject = {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  status: ProjectStatus;
  priority: Priority;
  soldAt: string;
  manager: string;
  description: LocalizedString;
  system: ProjectSystem;
  finance: ProjectFinance;
  tasks: ProjectTask[];
  sprints: ProjectSprint[];
  deliverables: Deliverable[];
  licenses: ProjectLicense[];
  subscriptions: ProjectSubscription[];
  integrations: ProjectIntegration[];
  agentIds: string[];
};

export type AdminOverview = {
  monthSales: number;
  budgetsSent: number;
  acceptedProposals: number;
  activeProjects: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  pendingInvoices: number;
  overduePayments: number;
  expiringLicenses: number;
  overdueTasks: number;
  maintenanceProjects: number;
  estimatedMonthlyProfit: number;
};
