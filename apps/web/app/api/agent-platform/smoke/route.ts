import { NextResponse } from 'next/server';
import { CARPIHOGAR_MCP } from '@trends172tech/core';
import { callMcpTool, discoverMcpTools } from '@/lib/agent-platform/mcp-gateway';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.VERCEL_ENV !== 'preview') {
    return NextResponse.json({ error: 'Not available outside preview' }, { status: 404 });
  }

  const startedAt = Date.now();
  try {
    const tools = await discoverMcpTools(CARPIHOGAR_MCP);
    const capabilityResult = await callMcpTool({
      server: CARPIHOGAR_MCP,
      context: {
        tenantId: 'smoke-test',
        deploymentId: 'smoke-test:carpihogar',
        agentInstanceId: 'smoke-test-agent',
        sessionId: crypto.randomUUID(),
        channel: 'api'
      },
      toolName: 'get_capabilities',
      input: {}
    });

    return NextResponse.json({
      ok: true,
      mcp: CARPIHOGAR_MCP.key,
      discoveredToolCount: tools.length,
      discoveredTools: tools.map((tool) => tool.name),
      getCapabilities: capabilityResult,
      durationMs: Date.now() - startedAt
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startedAt
    }, { status: 500 });
  }
}
