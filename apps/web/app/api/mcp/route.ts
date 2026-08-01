import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error: "Legacy MCP discovery endpoint retired. Use the authenticated /mcp endpoint."
    },
    {
      status: 410,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    }
  );
}
