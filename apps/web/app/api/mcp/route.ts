export const dynamic = "force-dynamic";

export async function GET() {

  const body = JSON.stringify({
    mcp: "Trends172 Project Orchestrator",
    status: "online",
    tools_endpoint: "/api/mcp/tools"
  });

  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "Content-Length": String(Buffer.byteLength(body)),
      "Content-Encoding": "identity",
      "X-MCP-Endpoint": "root"
    }
  });
}
