import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    mcp: "Trends172 Project Orchestrator",
    status: "online",
    tools: [
      { name: "create_project" },
      { name:
