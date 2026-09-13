import { prisma, Prisma } from '@trends172tech/db';
import type { AgentExecutionContext } from '@trends172tech/core';
import { calculateUsageCost, DEFAULT_TOKEN_PRICING, type AgentSdkUsage, type TokenPricing } from './usage-cost';

export type AgentToolTrace = {
  toolName: string;
  durationMs: number;
  status: 'SUCCESS' | 'FAILED';
  error?: string;
};

export type AgentRunStatus = 'SUCCESS' | 'FAILED';

export type AgentRunSummary = {
  id: string;
  createdAt: Date;
  tenantId: string | null;
  actorUserId: string;
  status: AgentRunStatus;
  mode: 'agent' | 'deterministic';
  deploymentId: string;
  agentInstanceId: string;
  sessionId: string;
  channel: string;
  model: string | null;
  durationMs: number;
  toolCount: number;
  tools: AgentToolTrace[];
  tokensIn: number | null;
  tokensOut: number | null;
  totalTokens: number | null;
  costUsdMicros: number | null;
  responseId: string | null;
  error: string | null;
};

type RunMeta = Omit<AgentRunSummary, 'id' | 'createdAt' | 'tenantId' | 'actorUserId'> & { runId: string };

function safeError(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 1000);
  return String(error).slice(0, 1000);
}

function toNumber(value: Prisma.Decimal | number | null | undefined, fallback: number) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (!value) return fallback;
  const numeric = Number(value.toString());
  return Number.isFinite(numeric) ? numeric : fallback;
}

async function resolveTokenPricing(): Promise<TokenPricing> {
  const settings = await prisma.globalSettings.findUnique({ where: { id: 1 } });
  if (!settings) return DEFAULT_TOKEN_PRICING;
  return {
    inputUsdPer1M: toNumber(settings.tokenInputUsdPer1M, DEFAULT_TOKEN_PRICING.inputUsdPer1M),
    cachedInputUsdPer1M: toNumber(settings.tokenCachedInputUsdPer1M, DEFAULT_TOKEN_PRICING.cachedInputUsdPer1M),
    outputUsdPer1M: toNumber(settings.tokenOutputUsdPer1M, DEFAULT_TOKEN_PRICING.outputUsdPer1M),
    markupPercent: toNumber(settings.tokenMarkupPercent, DEFAULT_TOKEN_PRICING.markupPercent)
  };
}

export function createAgentRunTrace(args: {
  context: AgentExecutionContext;
  mode: 'agent' | 'deterministic';
  model?: string | null;
}) {
  if (!args.context.userId) throw new Error('Authenticated userId is required for agent observability');

  const runId = crypto.randomUUID();
  const startedAt = new Date();
  const tools: AgentToolTrace[] = [];
  let nativeUsage: AgentSdkUsage | null = null;

  async function persistNativeUsage() {
    if (!nativeUsage || nativeUsage.totalTokens <= 0) return;
    const pricing = await resolveTokenPricing();
    const cost = calculateUsageCost(nativeUsage, pricing);
    await prisma.tokenUsageLog.create({
      data: {
        tenantId: args.context.tenantId,
        agentInstanceId: args.context.agentInstanceId,
        sessionId: args.context.sessionId,
        tokensIn: nativeUsage.inputTokens,
        tokensOut: nativeUsage.outputTokens,
        totalTokens: nativeUsage.totalTokens,
        costUsdMicros: cost.billableCostUsdMicros,
        model: args.model ?? null
      }
    });
  }

  async function usage() {
    const rows = await prisma.tokenUsageLog.findMany({
      where: {
        tenantId: args.context.tenantId,
        agentInstanceId: args.context.agentInstanceId,
        sessionId: args.context.sessionId,
        createdAt: { gte: startedAt }
      },
      select: { tokensIn: true, tokensOut: true, totalTokens: true, costUsdMicros: true }
    });
    if (rows.length === 0) return { tokensIn: null, tokensOut: null, totalTokens: null, costUsdMicros: null };
    return rows.reduce(
      (acc, row) => ({
        tokensIn: (acc.tokensIn ?? 0) + (row.tokensIn ?? 0),
        tokensOut: (acc.tokensOut ?? 0) + (row.tokensOut ?? 0),
        totalTokens: (acc.totalTokens ?? 0) + row.totalTokens,
        costUsdMicros: (acc.costUsdMicros ?? 0) + (row.costUsdMicros ?? 0)
      }),
      { tokensIn: 0 as number | null, tokensOut: 0 as number | null, totalTokens: 0 as number | null, costUsdMicros: 0 as number | null }
    );
  }

  async function finish(status: AgentRunStatus, extra?: { responseId?: string | null; error?: unknown }) {
    await persistNativeUsage();
    const measuredUsage = await usage();
    const meta: RunMeta = {
      runId,
      status,
      mode: args.mode,
      deploymentId: args.context.deploymentId,
      agentInstanceId: args.context.agentInstanceId,
      sessionId: args.context.sessionId,
      channel: args.context.channel,
      model: args.model ?? null,
      durationMs: Date.now() - startedAt.getTime(),
      toolCount: tools.length,
      tools,
      ...measuredUsage,
      responseId: extra?.responseId ?? null,
      error: extra?.error ? safeError(extra.error) : null
    };
    await prisma.auditLog.create({
      data: {
        actorUserId: args.context.userId!,
        tenantId: args.context.tenantId,
        action: status === 'SUCCESS' ? 'agent.run.completed' : 'agent.run.failed',
        entity: 'agent_run',
        entityId: runId,
        metaJson: meta
      }
    });
    return meta;
  }

  return {
    runId,
    addTool(trace: AgentToolTrace) { tools.push(trace); },
    setUsage(usageValue: AgentSdkUsage) { nativeUsage = usageValue; },
    finishSuccess(responseId?: string | null) { return finish('SUCCESS', { responseId }); },
    finishFailure(error: unknown) { return finish('FAILED', { error }); }
  };
}

function parseRun(log: { id: string; actorUserId: string; tenantId: string | null; createdAt: Date; metaJson: unknown }): AgentRunSummary | null {
  if (!log.metaJson || typeof log.metaJson !== 'object' || Array.isArray(log.metaJson)) return null;
  const meta = log.metaJson as Record<string, unknown>;
  if (typeof meta.runId !== 'string' || typeof meta.agentInstanceId !== 'string' || typeof meta.sessionId !== 'string') return null;
  const tools = Array.isArray(meta.tools) ? (meta.tools as AgentToolTrace[]) : [];
  return {
    id: String(meta.runId), createdAt: log.createdAt, tenantId: log.tenantId, actorUserId: log.actorUserId,
    status: meta.status === 'FAILED' ? 'FAILED' : 'SUCCESS', mode: meta.mode === 'deterministic' ? 'deterministic' : 'agent',
    deploymentId: String(meta.deploymentId ?? ''), agentInstanceId: String(meta.agentInstanceId), sessionId: String(meta.sessionId),
    channel: String(meta.channel ?? 'api'), model: typeof meta.model === 'string' ? meta.model : null,
    durationMs: Number(meta.durationMs ?? 0), toolCount: Number(meta.toolCount ?? tools.length), tools,
    tokensIn: typeof meta.tokensIn === 'number' ? meta.tokensIn : null, tokensOut: typeof meta.tokensOut === 'number' ? meta.tokensOut : null,
    totalTokens: typeof meta.totalTokens === 'number' ? meta.totalTokens : null, costUsdMicros: typeof meta.costUsdMicros === 'number' ? meta.costUsdMicros : null,
    responseId: typeof meta.responseId === 'string' ? meta.responseId : null, error: typeof meta.error === 'string' ? meta.error : null
  };
}

export async function getRecentAgentRuns(args?: { tenantId?: string; limit?: number }) {
  const logs = await prisma.auditLog.findMany({
    where: { ...(args?.tenantId ? { tenantId: args.tenantId } : {}), entity: 'agent_run', action: { in: ['agent.run.completed', 'agent.run.failed'] } },
    orderBy: { createdAt: 'desc' }, take: Math.min(Math.max(args?.limit ?? 50, 1), 200),
    select: { id: true, actorUserId: true, tenantId: true, createdAt: true, metaJson: true }
  });
  return logs.map(parseRun).filter((run): run is AgentRunSummary => Boolean(run));
}
