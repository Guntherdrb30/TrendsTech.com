-- CreateEnum
CREATE TYPE "AdminLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "AdminBudgetStatus" AS ENUM ('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AdminProposalStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AdminContractStatus" AS ENUM ('DRAFT', 'SENT', 'SIGNED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AdminSaleStatus" AS ENUM ('PENDING', 'WON', 'LOST', 'REFUNDED');

-- CreateEnum
CREATE TYPE "AdminProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'PAUSED', 'MAINTENANCE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AdminTaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "AdminInvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AdminPaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "AdminSubscriptionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AdminLicenseStatus" AS ENUM ('ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AdminAiAgentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TRAINING');

-- CreateEnum
CREATE TYPE "AdminPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "AdminClient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "industry" TEXT,
    "health" TEXT NOT NULL DEFAULT 'GOOD',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminLead" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "clientName" TEXT NOT NULL,
    "source" TEXT,
    "status" "AdminLeadStatus" NOT NULL DEFAULT 'NEW',
    "estimatedValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "nextStep" TEXT,
    "owner" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSale" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "proposalId" TEXT,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "status" "AdminSaleStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(12,2) NOT NULL,
    "paymentMethod" TEXT,
    "wonAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminBudget" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "proposalId" TEXT,
    "title" TEXT NOT NULL,
    "status" "AdminBudgetStatus" NOT NULL DEFAULT 'DRAFT',
    "amount" DECIMAL(12,2) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminBudget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminProposal" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "status" "AdminProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "amount" DECIMAL(12,2) NOT NULL,
    "probability" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminContract" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "proposalId" TEXT,
    "title" TEXT NOT NULL,
    "status" "AdminContractStatus" NOT NULL DEFAULT 'DRAFT',
    "contractUrl" TEXT,
    "signedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminProject" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "proposalId" TEXT,
    "contractId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "AdminProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "priority" "AdminPriority" NOT NULL DEFAULT 'MEDIUM',
    "soldAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paymentMethod" TEXT,
    "monthlyRetainer" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "manager" TEXT,
    "soldAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminProjectSystem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stackJson" JSONB,
    "repositoryUrl" TEXT,
    "vercelProject" TEXT,
    "domain" TEXT,
    "databaseName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProjectSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminProjectFinance" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "initialBudget" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "soldAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "recurringMonthly" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "operationalCostsMonthly" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "licenseCostsMonthly" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estimatedMonthlyProfit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProjectFinance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminProjectCost" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "incurredAt" TIMESTAMP(3),
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProjectCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminProjectRevenue" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "receivedAt" TIMESTAMP(3),
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProjectRevenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminProjectLicense" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT,
    "status" "AdminLicenseStatus" NOT NULL DEFAULT 'ACTIVE',
    "monthlyCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "renewsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProjectLicense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminProjectSubscription" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "AdminSubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "monthlyAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "nextBillingAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProjectSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminProjectMaintenance" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProjectMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminProjectIntegration" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "configJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProjectIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSprint" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminSprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminTask" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sprintId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "AdminTaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "AdminPriority" NOT NULL DEFAULT 'MEDIUM',
    "assignee" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminDeliverable" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sprintId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminDeliverable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminInvoice" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT,
    "number" TEXT NOT NULL,
    "status" "AdminInvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "amount" DECIMAL(12,2) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "issuedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminPayment" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "projectId" TEXT,
    "invoiceId" TEXT,
    "status" "AdminPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(12,2) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAiAgent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "status" "AdminAiAgentStatus" NOT NULL DEFAULT 'ACTIVE',
    "monthlyCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "successRate" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminAiAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAgentTask" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "taskId" TEXT,
    "title" TEXT NOT NULL,
    "status" "AdminTaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "AdminPriority" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminAgentTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminActivityLog" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "projectId" TEXT,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metaJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAttachment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminNote" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "author" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminClient_name_idx" ON "AdminClient"("name");

-- CreateIndex
CREATE INDEX "AdminClient_email_idx" ON "AdminClient"("email");

-- CreateIndex
CREATE INDEX "AdminClient_createdAt_idx" ON "AdminClient"("createdAt");

-- CreateIndex
CREATE INDEX "AdminLead_clientId_idx" ON "AdminLead"("clientId");

-- CreateIndex
CREATE INDEX "AdminLead_status_idx" ON "AdminLead"("status");

-- CreateIndex
CREATE INDEX "AdminLead_createdAt_idx" ON "AdminLead"("createdAt");

-- CreateIndex
CREATE INDEX "AdminSale_clientId_idx" ON "AdminSale"("clientId");

-- CreateIndex
CREATE INDEX "AdminSale_proposalId_idx" ON "AdminSale"("proposalId");

-- CreateIndex
CREATE INDEX "AdminSale_projectId_idx" ON "AdminSale"("projectId");

-- CreateIndex
CREATE INDEX "AdminSale_status_idx" ON "AdminSale"("status");

-- CreateIndex
CREATE INDEX "AdminBudget_clientId_idx" ON "AdminBudget"("clientId");

-- CreateIndex
CREATE INDEX "AdminBudget_proposalId_idx" ON "AdminBudget"("proposalId");

-- CreateIndex
CREATE INDEX "AdminBudget_status_idx" ON "AdminBudget"("status");

-- CreateIndex
CREATE INDEX "AdminProposal_clientId_idx" ON "AdminProposal"("clientId");

-- CreateIndex
CREATE INDEX "AdminProposal_status_idx" ON "AdminProposal"("status");

-- CreateIndex
CREATE INDEX "AdminProposal_validUntil_idx" ON "AdminProposal"("validUntil");

-- CreateIndex
CREATE INDEX "AdminContract_clientId_idx" ON "AdminContract"("clientId");

-- CreateIndex
CREATE INDEX "AdminContract_proposalId_idx" ON "AdminContract"("proposalId");

-- CreateIndex
CREATE INDEX "AdminContract_status_idx" ON "AdminContract"("status");

-- CreateIndex
CREATE INDEX "AdminProject_clientId_idx" ON "AdminProject"("clientId");

-- CreateIndex
CREATE INDEX "AdminProject_proposalId_idx" ON "AdminProject"("proposalId");

-- CreateIndex
CREATE INDEX "AdminProject_contractId_idx" ON "AdminProject"("contractId");

-- CreateIndex
CREATE INDEX "AdminProject_status_idx" ON "AdminProject"("status");

-- CreateIndex
CREATE INDEX "AdminProject_priority_idx" ON "AdminProject"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "AdminProjectSystem_projectId_key" ON "AdminProjectSystem"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminProjectFinance_projectId_key" ON "AdminProjectFinance"("projectId");

-- CreateIndex
CREATE INDEX "AdminProjectCost_projectId_idx" ON "AdminProjectCost"("projectId");

-- CreateIndex
CREATE INDEX "AdminProjectCost_category_idx" ON "AdminProjectCost"("category");

-- CreateIndex
CREATE INDEX "AdminProjectRevenue_projectId_idx" ON "AdminProjectRevenue"("projectId");

-- CreateIndex
CREATE INDEX "AdminProjectRevenue_receivedAt_idx" ON "AdminProjectRevenue"("receivedAt");

-- CreateIndex
CREATE INDEX "AdminProjectLicense_projectId_idx" ON "AdminProjectLicense"("projectId");

-- CreateIndex
CREATE INDEX "AdminProjectLicense_status_idx" ON "AdminProjectLicense"("status");

-- CreateIndex
CREATE INDEX "AdminProjectLicense_renewsAt_idx" ON "AdminProjectLicense"("renewsAt");

-- CreateIndex
CREATE INDEX "AdminProjectSubscription_projectId_idx" ON "AdminProjectSubscription"("projectId");

-- CreateIndex
CREATE INDEX "AdminProjectSubscription_status_idx" ON "AdminProjectSubscription"("status");

-- CreateIndex
CREATE INDEX "AdminProjectSubscription_nextBillingAt_idx" ON "AdminProjectSubscription"("nextBillingAt");

-- CreateIndex
CREATE INDEX "AdminProjectMaintenance_projectId_idx" ON "AdminProjectMaintenance"("projectId");

-- CreateIndex
CREATE INDEX "AdminProjectMaintenance_status_idx" ON "AdminProjectMaintenance"("status");

-- CreateIndex
CREATE INDEX "AdminProjectIntegration_projectId_idx" ON "AdminProjectIntegration"("projectId");

-- CreateIndex
CREATE INDEX "AdminProjectIntegration_status_idx" ON "AdminProjectIntegration"("status");

-- CreateIndex
CREATE INDEX "AdminSprint_projectId_idx" ON "AdminSprint"("projectId");

-- CreateIndex
CREATE INDEX "AdminSprint_status_idx" ON "AdminSprint"("status");

-- CreateIndex
CREATE INDEX "AdminTask_projectId_idx" ON "AdminTask"("projectId");

-- CreateIndex
CREATE INDEX "AdminTask_sprintId_idx" ON "AdminTask"("sprintId");

-- CreateIndex
CREATE INDEX "AdminTask_status_idx" ON "AdminTask"("status");

-- CreateIndex
CREATE INDEX "AdminTask_priority_idx" ON "AdminTask"("priority");

-- CreateIndex
CREATE INDEX "AdminTask_dueDate_idx" ON "AdminTask"("dueDate");

-- CreateIndex
CREATE INDEX "AdminDeliverable_projectId_idx" ON "AdminDeliverable"("projectId");

-- CreateIndex
CREATE INDEX "AdminDeliverable_sprintId_idx" ON "AdminDeliverable"("sprintId");

-- CreateIndex
CREATE INDEX "AdminDeliverable_status_idx" ON "AdminDeliverable"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AdminInvoice_number_key" ON "AdminInvoice"("number");

-- CreateIndex
CREATE INDEX "AdminInvoice_clientId_idx" ON "AdminInvoice"("clientId");

-- CreateIndex
CREATE INDEX "AdminInvoice_projectId_idx" ON "AdminInvoice"("projectId");

-- CreateIndex
CREATE INDEX "AdminInvoice_status_idx" ON "AdminInvoice"("status");

-- CreateIndex
CREATE INDEX "AdminInvoice_dueDate_idx" ON "AdminInvoice"("dueDate");

-- CreateIndex
CREATE INDEX "AdminPayment_clientId_idx" ON "AdminPayment"("clientId");

-- CreateIndex
CREATE INDEX "AdminPayment_projectId_idx" ON "AdminPayment"("projectId");

-- CreateIndex
CREATE INDEX "AdminPayment_invoiceId_idx" ON "AdminPayment"("invoiceId");

-- CreateIndex
CREATE INDEX "AdminPayment_status_idx" ON "AdminPayment"("status");

-- CreateIndex
CREATE INDEX "AdminAiAgent_status_idx" ON "AdminAiAgent"("status");

-- CreateIndex
CREATE INDEX "AdminAgentTask_agentId_idx" ON "AdminAgentTask"("agentId");

-- CreateIndex
CREATE INDEX "AdminAgentTask_projectId_idx" ON "AdminAgentTask"("projectId");

-- CreateIndex
CREATE INDEX "AdminAgentTask_taskId_idx" ON "AdminAgentTask"("taskId");

-- CreateIndex
CREATE INDEX "AdminAgentTask_status_idx" ON "AdminAgentTask"("status");

-- CreateIndex
CREATE INDEX "AdminActivityLog_clientId_idx" ON "AdminActivityLog"("clientId");

-- CreateIndex
CREATE INDEX "AdminActivityLog_projectId_idx" ON "AdminActivityLog"("projectId");

-- CreateIndex
CREATE INDEX "AdminActivityLog_entity_entityId_idx" ON "AdminActivityLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AdminActivityLog_createdAt_idx" ON "AdminActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "AdminAttachment_projectId_idx" ON "AdminAttachment"("projectId");

-- CreateIndex
CREATE INDEX "AdminAttachment_entityType_entityId_idx" ON "AdminAttachment"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AdminNote_projectId_idx" ON "AdminNote"("projectId");

-- CreateIndex
CREATE INDEX "AdminNote_createdAt_idx" ON "AdminNote"("createdAt");

-- AddForeignKey
ALTER TABLE "AdminLead" ADD CONSTRAINT "AdminLead_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "AdminClient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminSale" ADD CONSTRAINT "AdminSale_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "AdminClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminSale" ADD CONSTRAINT "AdminSale_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "AdminProposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminSale" ADD CONSTRAINT "AdminSale_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AdminProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminBudget" ADD CONSTRAINT "AdminBudget_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "AdminClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminBudget" ADD CONSTRAINT "AdminBudget_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "AdminProposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProposal" ADD CONSTRAINT "AdminProposal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "AdminClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminContract" ADD CONSTRAINT "AdminContract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "AdminClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminContract" ADD CONSTRAINT "AdminContract_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "AdminProposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProject" ADD CONSTRAINT "AdminProject_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "AdminClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProject" ADD CONSTRAINT "AdminProject_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "AdminProposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProject" ADD CONSTRAINT "AdminProject_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "AdminContract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProjectSystem" ADD CONSTRAINT "AdminProjectSystem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AdminProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProjectFinance" ADD CONSTRAINT "AdminProjectFinance_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AdminProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProjectCost" ADD CONSTRAINT "AdminProjectCost_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AdminProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProjectRevenue" ADD CONSTRAINT "AdminProjectRevenue_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AdminProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProjectLicense" ADD CONSTRAINT "AdminProjectLicense_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AdminProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProjectSubscription" ADD CONSTRAINT "AdminProjectSubscription_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AdminProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProjectMaintenance" ADD CONSTRAINT "AdminProjectMaintenance_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AdminProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProjectIntegration" ADD CONSTRAINT "AdminProjectIntegration_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AdminProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminSprint" ADD CONSTRAINT "AdminSprint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AdminProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminTask" ADD CONSTRAINT "AdminTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AdminProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminTask" ADD CONSTRAINT "AdminTask_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "AdminSprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminDeliverable" ADD CONSTRAINT "AdminDeliverable_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AdminProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminDeliverable" ADD CONSTRAINT "AdminDeliverable_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "AdminSprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminInvoice" ADD CONSTRAINT "AdminInvoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "AdminClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminInvoice" ADD CONSTRAINT "AdminInvoice_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AdminProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminPayment" ADD CONSTRAINT "AdminPayment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "AdminClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminPayment" ADD CONSTRAINT "AdminPayment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AdminProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminPayment" ADD CONSTRAINT "AdminPayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "AdminInvoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAgentTask" ADD CONSTRAINT "AdminAgentTask_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AdminAiAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAgentTask" ADD CONSTRAINT "AdminAgentTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AdminProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAgentTask" ADD CONSTRAINT "AdminAgentTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "AdminTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActivityLog" ADD CONSTRAINT "AdminActivityLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "AdminClient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActivityLog" ADD CONSTRAINT "AdminActivityLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AdminProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAttachment" ADD CONSTRAINT "AdminAttachment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AdminProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminNote" ADD CONSTRAINT "AdminNote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AdminProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

