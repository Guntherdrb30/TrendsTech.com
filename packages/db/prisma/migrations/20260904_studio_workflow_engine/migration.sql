-- Trends Engineering Studio - Workflow Engine + Watchers
-- Additive migration only. Apply only after validation and explicit approval.

CREATE TABLE "StudioWorkflow" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "mode" TEXT NOT NULL DEFAULT 'EVENT',
  "priority" INTEGER NOT NULL DEFAULT 100,
  "stopOnFailure" BOOLEAN NOT NULL DEFAULT true,
  "maxExecutionsPerHour" INTEGER NOT NULL DEFAULT 20,
  "createdByUserId" TEXT,
  "metaJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioWorkflow_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "StudioWorkflowTrigger" (
  "id" TEXT PRIMARY KEY,
  "workflowId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "eventType" TEXT,
  "cronExpression" TEXT,
  "conditionJson" JSONB,
  "isEnabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioWorkflowTrigger_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "StudioWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "StudioWorkflowAction" (
  "id" TEXT PRIMARY KEY,
  "workflowId" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "agentKey" TEXT,
  "configJson" JSONB,
  "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
  "approvalGate" TEXT,
  "isEnabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioWorkflowAction_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "StudioWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StudioWorkflowAction_workflowId_position_key" UNIQUE ("workflowId", "position")
);

CREATE TABLE "StudioWorkflowRun" (
  "id" TEXT PRIMARY KEY,
  "workflowId" TEXT NOT NULL,
  "projectId" TEXT,
  "triggerType" TEXT NOT NULL,
  "triggerEventId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'QUEUED',
  "currentPosition" INTEGER,
  "startedAt" TIMESTAMP(3),
  "finishedAt" TIMESTAMP(3),
  "errorSummary" TEXT,
  "resultJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioWorkflowRun_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "StudioWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StudioWorkflowRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StudioWorkflowRun_triggerEventId_fkey" FOREIGN KEY ("triggerEventId") REFERENCES "StudioEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "StudioWorkflowActionRun" (
  "id" TEXT PRIMARY KEY,
  "workflowRunId" TEXT NOT NULL,
  "workflowActionId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'QUEUED',
  "startedAt" TIMESTAMP(3),
  "finishedAt" TIMESTAMP(3),
  "agentRunId" TEXT,
  "approvalId" TEXT,
  "errorSummary" TEXT,
  "resultJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioWorkflowActionRun_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "StudioWorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StudioWorkflowActionRun_workflowActionId_fkey" FOREIGN KEY ("workflowActionId") REFERENCES "StudioWorkflowAction"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StudioWorkflowActionRun_agentRunId_fkey" FOREIGN KEY ("agentRunId") REFERENCES "StudioAgentRun"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "StudioWorkflowActionRun_approvalId_fkey" FOREIGN KEY ("approvalId") REFERENCES "StudioApproval"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "StudioWatcher" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT,
  "name" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "severity" TEXT NOT NULL DEFAULT 'WARNING',
  "conditionJson" JSONB NOT NULL,
  "cooldownMinutes" INTEGER NOT NULL DEFAULT 60,
  "lastCheckedAt" TIMESTAMP(3),
  "lastTriggeredAt" TIMESTAMP(3),
  "lastState" TEXT,
  "notifyChannel" TEXT NOT NULL DEFAULT 'STUDIO',
  "createdByUserId" TEXT,
  "metaJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioWatcher_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "StudioWorkflow_projectId_status_idx" ON "StudioWorkflow"("projectId", "status");
CREATE INDEX "StudioWorkflowTrigger_type_eventType_idx" ON "StudioWorkflowTrigger"("type", "eventType");
CREATE INDEX "StudioWorkflowAction_workflowId_position_idx" ON "StudioWorkflowAction"("workflowId", "position");
CREATE INDEX "StudioWorkflowRun_projectId_status_idx" ON "StudioWorkflowRun"("projectId", "status");
CREATE INDEX "StudioWorkflowRun_createdAt_idx" ON "StudioWorkflowRun"("createdAt");
CREATE INDEX "StudioWorkflowActionRun_workflowRunId_status_idx" ON "StudioWorkflowActionRun"("workflowRunId", "status");
CREATE INDEX "StudioWatcher_projectId_status_idx" ON "StudioWatcher"("projectId", "status");
CREATE INDEX "StudioWatcher_kind_status_idx" ON "StudioWatcher"("kind", "status");
