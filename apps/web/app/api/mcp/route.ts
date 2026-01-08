import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      mcp: "Trends172 Project Orchestrator",
      status: "online",
      version: "1.0",
      tools_endpoint: "/api/mcp/tools"
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    }
  );
}
