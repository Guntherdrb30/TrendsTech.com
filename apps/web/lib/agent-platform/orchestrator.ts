import { z } from 'zod';
import { Agent, Runner, tool } from '@trends172tech/openai';
import { CARPIHOGAR_MCP, type AgentExecutionContext } from '@trends172tech/core';
import { callMcpTool } from './mcp-gateway';
import type { PilotAgentRequest } from './runtime';

const MODEL = process.env.AGENT_PLATFORM_MODEL || 'gpt-5-mini';

const jsonInputSchema = z.object({
  input: z.record(z.unknown()).default({})
});

function createMcpAgentTool(context: AgentExecutionContext, toolName: string, description: string) {
  return tool({
    name: toolName,
    description,
    parameters: jsonInputSchema,
    execute: async ({ input }) => {
      const startedAt = Date.now();
      const result = await callMcpTool({
        server: CARPIHOGAR_MCP,
        context,
        toolName,
        input
      });
      return JSON.stringify({
        toolName,
        durationMs: Date.now() - startedAt,
        result
      });
    }
  });
}

function buildTools(context: AgentExecutionContext) {
  return CARPIHOGAR_MCP.tools
    .filter((descriptor) => descriptor.approval !== 'human_required')
    .map((descriptor) => createMcpAgentTool(context, descriptor.name, descriptor.description));
}

export async function runCarpiHogarAgent(args: {
  request: PilotAgentRequest;
  context: AgentExecutionContext;
}) {
  const startedAt = Date.now();
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
    tools: buildTools(args.context)
  });

  const runner = new Runner();
  const result = await runner.run(agent, args.request.message, { maxTurns: 8 });

  return {
    context: args.context,
    model: MODEL,
    durationMs: Date.now() - startedAt,
    output: result.finalOutput ?? '',
    lastResponseId: result.lastResponseId ?? null
  };
}
