import { z } from 'zod';
import { Agent, Runner, tool } from '@trends172tech/openai';
import {
  getAgentRuntimeProfile,
  getMcpServerDescriptor,
  type AgentExecutionContext,
  type RegisteredAgentKey
} from '@trends172tech/core';
import { callMcpTool } from './mcp-gateway';
import { createAgentRunTrace } from './observability';
import type { PilotAgentRequest } from './runtime';

const jsonInputSchema = z.object({ input: z.record(z.unknown()).default({}) });
type RunTrace = ReturnType<typeof createAgentRunTrace>;

function buildRegisteredTools(args: {
  context: AgentExecutionContext;
  runTrace: RunTrace;
  mcpKey: string;
  allowedTools: string[];
}) {
  const server = getMcpServerDescriptor(args.mcpKey);
  const allowed = new Set(args.allowedTools);
  return server.tools
    .filter((descriptor) => allowed.has(descriptor.name) && descriptor.approval !== 'human_required')
    .map((descriptor) => tool({
      name: descriptor.name,
      description: descriptor.description,
      parameters: jsonInputSchema,
      execute: async ({ input }) => {
        const startedAt = Date.now();
        try {
          const result = await callMcpTool({ server, context: args.context, toolName: descriptor.name, input });
          const durationMs = Date.now() - startedAt;
          args.runTrace.addTool({ toolName: descriptor.name, durationMs, status: 'SUCCESS' });
          return JSON.stringify({ toolName: descriptor.name, durationMs, result });
        } catch (error) {
          args.runTrace.addTool({
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

export async function runRegisteredAgent(args: {
  agentKey: RegisteredAgentKey;
  request: PilotAgentRequest;
  context: AgentExecutionContext;
}) {
  const profile = getAgentRuntimeProfile(args.agentKey);
  const model = process.env.AGENT_PLATFORM_MODEL || profile.defaultModel;
  const context: AgentExecutionContext = { ...args.context, deploymentId: profile.deploymentId };
  if (!profile.channels.includes(context.channel)) {
    throw new Error(`Channel ${context.channel} is not allowed for agent ${profile.key}`);
  }

  const runTrace = createAgentRunTrace({ context, mode: 'agent', model });
  const startedAt = Date.now();
  const agent = new Agent({
    name: profile.name,
    model,
    instructions: profile.instructions.join('\n'),
    tools: buildRegisteredTools({
      context,
      runTrace,
      mcpKey: profile.mcpKey,
      allowedTools: profile.allowedTools
    })
  });

  try {
    const runner = new Runner();
    const result = await runner.run(agent, args.request.message, { maxTurns: profile.maxTurns });
    const trace = await runTrace.finishSuccess(result.lastResponseId ?? null);
    return {
      runId: runTrace.runId,
      agentKey: profile.key,
      templateKey: profile.templateKey,
      version: profile.version,
      deploymentId: profile.deploymentId,
      context,
      model,
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
