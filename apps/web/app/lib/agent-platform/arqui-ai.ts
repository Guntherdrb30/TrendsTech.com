import { z } from 'zod';
import { Agent, Runner, tool } from '@trends172tech/openai';
import { CARPIHOGAR_MCP, type AgentExecutionContext } from '@trends172tech/core';
import { callMcpTool } from './mcp-gateway';
import { createAgentRunTrace } from './observability';
import type { PilotAgentRequest } from './runtime';

const MODEL = process.env.ARQUI_AI_MODEL || process.env.AGENT_PLATFORM_MODEL || 'gpt-5-mini';
export const ARQUI_AI_DEPLOYMENT_ID = 'pilot:carpihogar:arqui-ai:v1';

const ARQUI_TOOL_NAMES = new Set([
  'get_capabilities',
  'search_products',
  'get_product',
  'analyze_design_request',
  'analyze_project_document',
  'generate_bom',
  'validate_bom_stock',
  'create_carpentry_estimate',
  'generate_cut_list'
]);

const jsonInputSchema = z.object({ input: z.record(z.unknown()).default({}) });
type RunTrace = ReturnType<typeof createAgentRunTrace>;

function buildArquiTools(context: AgentExecutionContext, runTrace: RunTrace) {
  return CARPIHOGAR_MCP.tools
    .filter((descriptor) => ARQUI_TOOL_NAMES.has(descriptor.name) && descriptor.approval !== 'human_required')
    .map((descriptor) => tool({
      name: descriptor.name,
      description: descriptor.description,
      parameters: jsonInputSchema,
      execute: async ({ input }) => {
        const startedAt = Date.now();
        try {
          const result = await callMcpTool({
            server: CARPIHOGAR_MCP,
            context,
            toolName: descriptor.name,
            input
          });
          const durationMs = Date.now() - startedAt;
          runTrace.addTool({ toolName: descriptor.name, durationMs, status: 'SUCCESS' });
          return JSON.stringify({ toolName: descriptor.name, durationMs, result });
        } catch (error) {
          runTrace.addTool({
            toolName: descriptor.name,
            durationMs: Date.now() - startedAt,
            status: 'FAILED',
            error: error instanceof Error ? error.message : String(error)
          });
          throw error;
        }
      }
    }));
}

export async function runArquiAi(args: { request: PilotAgentRequest; context: AgentExecutionContext }) {
  const startedAt = Date.now();
  const arquiContext: AgentExecutionContext = { ...args.context, deploymentId: ARQUI_AI_DEPLOYMENT_ID };
  const runTrace = createAgentRunTrace({ context: arquiContext, mode: 'agent', model: MODEL });

  const agent = new Agent({
    name: 'Arqui AI - CarpiHogar',
    model: MODEL,
    instructions: [
      'Eres Arqui AI, especialista de diseno, carpinteria y especificacion tecnica de CarpiHogar, operado centralmente por Trends172Tech.',
      'Tu funcion es convertir necesidades, medidas, planos o documentos de proyecto en una propuesta tecnica verificable.',
      'Usa las herramientas MCP disponibles para analizar solicitudes, consultar productos reales, generar BOM, validar stock, crear presupuestos y listas de corte.',
      'Nunca inventes productos, SKU, precios, stock, medidas ni datos faltantes.',
      'Distingue claramente medidas confirmadas, supuestos y datos pendientes.',
      'Cuando falten medidas esenciales, solicita solo la informacion minima necesaria antes de cerrar un BOM o presupuesto.',
      'No agregues proyectos al carrito ni ejecutes compras. Esa accion requiere aprobacion humana y otro flujo.',
      'Para datos comerciales o de inventario actuales, consulta siempre las herramientas antes de responder.',
      'Responde en el idioma del usuario con estructura clara y profesional.'
    ].join('\n'),
    tools: buildArquiTools(arquiContext, runTrace)
  });

  try {
    const runner = new Runner();
    const result = await runner.run(agent, args.request.message, { maxTurns: 10 });
    const trace = await runTrace.finishSuccess(result.lastResponseId ?? null);
    return {
      runId: runTrace.runId,
      deploymentId: ARQUI_AI_DEPLOYMENT_ID,
      context: arquiContext,
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
