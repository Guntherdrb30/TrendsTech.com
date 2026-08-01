import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@trends172tech/db";
import { getToolDefinitions, type ToolContext } from "@trends172tech/openai";
import { oauthResourceClient } from "@/lib/auth/oauth-resource";
import { enforcePersistentRequestRateLimit, getRequestIdentifier } from "@/lib/security/rate-limit";

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

const scopedClientSchema = z.object({
  tokenSha256: z.string().regex(/^[a-f0-9]{64}$/i),
  tenantId: z.string().min(1),
  agentInstanceId: z.string().min(1),
  actorUserId: z.string().min(1),
  allowedTools: z.array(z.string().min(1)).min(1).max(20),
});

const scopedClientsSchema = z.array(scopedClientSchema).max(50);

type ScopedClient = z.infer<typeof scopedClientSchema>;

type McpAuthorization =
  | { ok: false; status: 401 | 503; error: string }
  | { ok: true; mode: "health" }
  | { ok: true; mode: "scoped"; client: ScopedClient }
  | { ok: true; mode: "oauth"; client: ScopedClient | null };

const OAUTH_READ_TOOLS = ["get_pricing_info", "get_token_pricing"];
const OAUTH_WRITE_TOOLS = ["create_lead", "create_appointment", "request_human_contact"];

function secureEqual(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function readScopedClients() {
  const value = process.env.MCP_CLIENTS_JSON;
  if (!value) return [];

  try {
    return scopedClientsSchema.parse(JSON.parse(value));
  } catch {
    console.error("[mcp] MCP_CLIENTS_JSON is invalid.");
    return null;
  }
}

async function authorizeMcpRequest(request: Request): Promise<McpAuthorization> {
  const healthSecret = process.env.MCP_API_SECRET;
  const clients = readScopedClients();
  if (clients === null) {
    return { ok: false, status: 503, error: "MCP is not configured." };
  }

  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) {
    return { ok: false, status: 401, error: "Unauthorized." };
  }

  const tokenSha256 = createHash("sha256").update(token).digest("hex");
  const client = clients.find((candidate) => secureEqual(tokenSha256, candidate.tokenSha256));
  if (client) {
    return { ok: true, mode: "scoped", client };
  }

  if (healthSecret && healthSecret.length >= 32 && secureEqual(token, healthSecret)) {
    return { ok: true, mode: "health" };
  }

  try {
    const payload = await oauthResourceClient.verifyAccessToken(token, {
      verifyOptions: { audience: `${new URL(request.url).origin}/mcp` },
      scopes: ["mcp:read"]
    });
    const actorUserId = typeof payload.sub === "string" ? payload.sub : "";
    if (!actorUserId) return { ok: false, status: 401, error: "Unauthorized." };

    const actor = await prisma.user.findUnique({
      where: { id: actorUserId },
      select: { id: true, tenantId: true, role: true }
    });
    if (!actor) return { ok: false, status: 401, error: "Unauthorized." };

    const scopes = typeof payload.scope === "string" ? payload.scope.split(" ") : [];
    const allowedTools = [
      ...OAUTH_READ_TOOLS,
      ...(scopes.includes("mcp:write") ? OAUTH_WRITE_TOOLS : [])
    ];

    if (!actor.tenantId) {
      return { ok: true, mode: "oauth", client: null };
    }

    const agentInstance = await prisma.agentInstance.findFirst({
      where: { tenantId: actor.tenantId, status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
      select: { id: true }
    });
    if (!agentInstance) {
      return { ok: true, mode: "oauth", client: null };
    }

    return {
      ok: true,
      mode: "oauth",
      client: {
        tokenSha256,
        tenantId: actor.tenantId,
        agentInstanceId: agentInstance.id,
        actorUserId: actor.id,
        allowedTools
      }
    };
  } catch {
    return { ok: false, status: 401, error: "Unauthorized." };
  }
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

function buildServer(authorization: Extract<McpAuthorization, { ok: true }>) {
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
      outputSchema: pingOutputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ message }) => {
      const payload = { ok: true, echo: message, ts: new Date().toISOString() };
      return {
        content: [{ type: "text", text: JSON.stringify(payload) }],
        structuredContent: payload
      };
    }
  );

  const businessClient = authorization.mode === "scoped" || authorization.mode === "oauth"
    ? authorization.client
    : null;
  const definitions = businessClient
    ? getToolDefinitions(businessClient.allowedTools)
    : [];
  for (const definition of definitions) {
    if (definition.name === "ping") {
      continue;
    }

    server.registerTool(
      definition.name,
      {
        description: definition.description,
        inputSchema: definition.schema,
        annotations: definition.annotations,
      },
      async (args) => {
        if (!businessClient) {
          return { content: [{ type: "text", text: "Unauthorized." }], isError: true };
        }

        const context: ToolContext = {
          tenantId: businessClient.tenantId,
          agentInstanceId: businessClient.agentInstanceId,
          actorUserId: businessClient.actorUserId,
          sessionId: `mcp:${businessClient.tokenSha256.slice(0, 16)}`,
        };

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
          const message = error instanceof Error ? error.message : "Unknown tool error";
          console.error(`[mcp] tool error (${definition.name}):`, message);
          return {
            content: [{ type: "text", text: "Tool execution failed." }],
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

  const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const rateLimitIdentifier = bearerToken
    ? createHash("sha256").update(bearerToken).digest("hex").slice(0, 24)
    : getRequestIdentifier(request);
  const limiter = await enforcePersistentRequestRateLimit(
    request,
    { namespace: "mcp", limit: 120, windowMs: 60_000 },
    rateLimitIdentifier
  );
  if (limiter) return limiter;

  const authorization = await authorizeMcpRequest(request);
  if (!authorization.ok) {
    return NextResponse.json(
      { error: authorization.error },
      {
        status: authorization.status,
        headers: {
          "Cache-Control": "no-store",
          "WWW-Authenticate": `Bearer realm="Trends172 MCP", resource_metadata="${url.origin}/.well-known/oauth-protected-resource/mcp", scope="mcp:read"`
        }
      }
    );
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });

  const server = buildServer(authorization);
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
