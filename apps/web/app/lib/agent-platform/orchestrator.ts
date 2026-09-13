import { z } from 'zod';
import { Agent, Runner, tool } from '@trends172tech/openai';
import { CARPIHOGAR_MCP, type AgentExecutionContext } from '@trends172tech/core';
import { callMcpTool } from './mcp-gateway';
import { createAgentRunTrace } from './observability';
import type { AgentSdkUsage } from './usage-cost';
import type { PilotAgentRequest } from './runtime';

const MODEL = process.env.AGENT_PLATFORM_MODEL || 'gpt-5-mini';
const jsonInputSchema = z.object({ input: z.record(z.unknown()).default({}) });
type RunTrace = ReturnType<typeof createAgentRunTrace>;

function createMcpAgentTool(context: AgentExecutionContext, runTrace: RunTrace, toolName: string, description: string) {
  return tool({
    name: toolName,
    description,
    parameters: jsonInputSchema,
    execute: async ({ input }) => {
      const startedAt = Date.now();
      try {
        const result = await callMcpTool({ server: CARPIHOGAR_MCP, context, toolName, input });
        const durationMs = Date.now() - startedAt;
        runTrace.addTool({ toolName, durationMs, status: 'SUCCESS' });
        return JSON.stringify({ toolName, durationMs, result });
      } catch (error) {
        runTrace.addTool({ toolName, durationMs: Date.now() - startedAt, status: 'FAILED', error: error instanceof Error ? error.message : String(error) });
        throw error;
      }
    }
  });
}

function buildTools(context: AgentExecutionContext, runTrace: RunTrace) {
  return CARPIHOGAR_MCP.tools
    .filter((descriptor) => descriptor.approval !== 'human_required')
    .map((descriptor) => createMcpAgentTool(context, runTrace, descriptor.name, descriptor.description));
}

function readSdkUsage(result: unknown): AgentSdkUsage | null {
  const candidate = result as {
    state?: { usage?: Partial<AgentSdkUsage> };
    runContext?: { usage?: Partial<AgentSdkUsage> };
  };
  const usage = candidate.state?.usage ?? candidate.runContext?.usage;
  if (!usage) return null;
  const inputTokens = Number(usage.inputTokens ?? 0);
  const outputTokens = Number(usage.outputTokens ?? 0);
  const totalTokens = Number(usage.totalTokens ?? inputTokens + outputTokens);
  if (![inputTokens, outputTokens, totalTokens].every(Number.isFinite)) return null;
  return {
    requests: typeof usage.requests === 'number' ? usage.requests : undefined,
    inputTokens,
    outputTokens,
    totalTokens,
    inputTokensDetails: usage.inputTokensDetails
  };
}

export async function runCarpiHogarAgent(args: { request: PilotAgentRequest; context: AgentExecutionContext }) {
  const startedAt = Date.now();
  const runTrace = createAgentRunTrace({ context: args.context, mode: 'agent', model: MODEL });
  const agent = new Agent({
    name: 'CarpiHogar AI - Trends172 Pilot',
    model: MODEL,
    instructions: [
      'Eres el agente central de CarpiHogar operado por Trends172Tech.',
      'Usa exclusivamente las herramientas proporcionadas para consultar productos, inventario, carrito, diseno, BOM, listas de corte y presupuestos.',
      'Nunca inventes precios, stock, SKU, productos, medidas ni resultados de herramientas.',
      'Para informacion transaccional actual debes usar una herramienta antes de responder.',
      'No afirmes que una accion se completo si la herramienta no lo confirma.',
      'Las acciones que requieren aprobacion humana no estan disponibles y debes explicarlo si son necesarias.',
      'Responde en el idioma del usuario y de forma concisa.'
    ].join('\n'),
    tools: buildTools(args.context, runTrace)
  });
  try {
    const runner = new Runner();
    const result = await runner.run(agent, args.request.message, { maxTurns: 8 });
    const usage = readSdkUsage(result);
    if (usage) runTrace.setUsage(usage);
    const trace = await runTrace.finishSuccess(result.lastResponseId ?? null);
    return {
      runId: runTrace.runId,
      context: args.context,
      model: MODEL,
      durationMs: Date.now() - startedAt,
      output: result.finalOutput ?? '',
      lastResponseId: result.lastResponseId ?? null,
      trace
    };
  } catch (error) {
    await runTrace.finishFailure(error);
    throw error;
  }
}
