import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      mcp: "Trends172 Project Orchestrator",
      status: "online",
      tools_endpoint: "/api/mcp/tools"
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "x-mcp-version": "1.0",
        "Cache-Control": "no-store"
      }
    }
  );
}
