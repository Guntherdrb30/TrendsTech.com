import { NextRequest, NextResponse } from 'next/server';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createTrendsMcpServer } from '../../lib/engineering-studio/mcp-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authenticate(request: NextRequest) {
  const configuredToken = process.env.TRENDS_MCP_TOKEN;
  if (!configuredToken) return { ok: false as const, status: 503, message: 'TRENDS_MCP_TOKEN no configurado.' };
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return { ok: false as const, status: 401, message: 'Bearer token requerido.' };
  const supplied = header.slice(7).trim();
  if (supplied !== configuredToken) return { ok: false as const, status: 403, message: 'Token MCP inválido.' };
  return { ok: true as const, actorRef: 'chatgpt-mcp' };
}

async function handler(request: NextRequest) {
  const auth = authenticate(request);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const server = createTrendsMcpServer(auth.actorRef);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });

  await server.connect(transport);
  return transport.handleRequest(request);
}

export const GET = handler;
export const POST = handler;
export const DELETE = handler;
