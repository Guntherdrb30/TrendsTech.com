import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@trends172tech/db";
import { getToolDefinitions, type ToolContext } from "@trends172tech/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const pingInputSchema = z.object({
  message: z.string()
});

const pingOutputSchema = z.object({
  ok: z.literal(true),
  echo: z.string(),
  ts: z.string()
});

const REQUIRED_CONTEXT_HEADERS = ["x-tenant-id", "x-agent-instance-id", "x-actor-user-id"] as const;

function buildToolContext(headers: Record<string, string | undefined>): ToolContext | null {
  const tenantId = headers["x-tenant-id"];
  const agentInstanceId = headers["x-agent-instance-id"];
  const actorUserId = headers["x-actor-user-id"];
  const sessionId = headers["x-session-id"] ?? headers["mcp-session-id"] ?? "mcp";

  if (!tenantId || !agentInstanceId || !actorUserId) {
    return null;
  }

  return { tenantId, agentInstanceId, actorUserId, sessionId };
}

function secureEqual(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function authorizeMcpRequest(request: Request) {
  const secret = process.env.MCP_API_SECRET;
  if (!secret || secret.length < 32) {
    return { ok: false as const, status: 503, error: "MCP is not configured." };
  }

  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token || !secureEqual(token, secret)) {
    return { ok: false as const, status: 401, error: "Unauthorized." };
  }

  return { ok: true as const };
}

async function validateToolContext(context: ToolContext) {
  const [tenant, agentInstance, actor] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: context.tenantId }, select: { id: true } }),
    prisma.agentInstance.findFirst({
      where: { id: context.agentInstanceId, tenantId: context.tenantId },
      select: { id: true }
    }),
    prisma.user.findUnique({
      where: { id: context.actorUserId },
      select: { id: true, role: true, tenantId: true }
    })
  ]);

  if (!tenant || !agentInstance || !actor) return false;
  return actor.role === "ROOT" || actor.tenantId === context.tenantId;
}

function buildServer() {
  const server = new McpServer(
    {
      name: "Trends172 MCP Server",
      version: "1.0.0"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  server.registerTool(
    "ping",
    {
      description: "Health check tool that echoes a message.",
      inputSchema: pingInputSchema,
      outputSchema: pingOutputSchema
    },
    async ({ message }) => {
      const payload = { ok: true, echo: message, ts: new Date().toISOString() };
      return {
        content: [{ type: "text", text: JSON.stringify(payload) }],
        structuredContent: payload
      };
    }
  );

  const definitions = getToolDefinitions();
  for (const definition of definitions) {
    if (definition.name === "ping") {
      continue;
    }

    server.registerTool(
      definition.name,
      {
        description: definition.description,
        inputSchema: definition.schema
      },
      async (args, extra) => {
        const headers =
          (extra.requestInfo?.headers as Record<string, string | undefined> | undefined) ?? {};
        const context = buildToolContext(headers);

        if (!context) {
          const message = `Missing required headers: ${REQUIRED_CONTEXT_HEADERS.join(", ")}`;
          return {
            content: [{ type: "text", text: message }],
            isError: true
          };
        }

        if (!(await validateToolContext(context))) {
          return {
            content: [{ type: "text", text: "Invalid or unauthorized tool context." }],
            isError: true
          };
        }

        try {
          const result = await definition.execute(args, {
            tenantId: context.tenantId,
            agentInstanceId: context.agentInstanceId,
            actorUserId: context.actorUserId,
            sessionId: context.sessionId ?? "mcp"
          });
          return {
            content: [{ type: "text", text: JSON.stringify(result) }],
            structuredContent: result
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Tool execution failed";
          console.log(`[mcp] tool error (${definition.name}):`, message);
          return {
            content: [{ type: "text", text: message }],
            isError: true
          };
        }
      }
    );
  }

  return server;
}

function withNoStoreHeaders(response: Response) {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function handleMcpRequest(request: Request) {
  const url = new URL(request.url);
  console.log(`[mcp] ${request.method} ${url.pathname}`);

  const authorization = authorizeMcpRequest(request);
  if (!authorization.ok) {
    return NextResponse.json(
      { error: authorization.error },
      {
        status: authorization.status,
        headers: {
          "Cache-Control": "no-store",
          "WWW-Authenticate": 'Bearer realm="Trends172 MCP"'
        }
      }
    );
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });

  const server = buildServer();
  await server.connect(transport);

  const response = await transport.handleRequest(request);
  return withNoStoreHeaders(response);
}

export async function GET(request: Request) {
  return handleMcpRequest(request);
}

export async function POST(request: Request) {
  return handleMcpRequest(request);
}

export async function DELETE(request: Request) {
  return handleMcpRequest(request);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, DELETE, OPTIONS",
      "Cache-Control": "no-store"
    }
  });
}
