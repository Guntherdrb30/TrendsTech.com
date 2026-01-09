import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_CHATKIT_BASE = "https://api.openai.com";
const SESSION_COOKIE_NAME = "chatkit_session_id";
const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

type JsonPayload = Record<string, unknown>;

async function readJsonBody(request: Request): Promise<JsonPayload> {
  try {
    const parsed = (await request.json()) as JsonPayload;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function resolveWorkflowId(body: JsonPayload): string | null {
  const workflow =
    typeof body.workflow === "object" && body.workflow !== null
      ? (body.workflow as JsonPayload)
      : null;
  const workflowId =
    (workflow?.id as string | undefined) ??
    (body.workflowId as string | undefined) ??
    process.env.CHATKIT_WORKFLOW_ID ??
    process.env.OPENAI_PUBLIC_WORKFLOW_ID;

  return workflowId && workflowId.trim() ? workflowId.trim() : null;
}

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return null;
  }
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

function resolveUserId(request: Request) {
  const existing = getCookieValue(request.headers.get("cookie"), SESSION_COOKIE_NAME);
  if (existing) {
    return { userId: existing, setCookie: false };
  }
  return { userId: crypto.randomUUID(), setCookie: true };
}

function isProd() {
  return (process.env.NODE_ENV ?? "").toLowerCase() === "production";
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY environment variable." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  const body = await readJsonBody(request);
  const workflowId = resolveWorkflowId(body);
  if (!workflowId) {
    return NextResponse.json(
      { error: "Missing workflow id." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { userId, setCookie } = resolveUserId(request);
  const apiBase = process.env.CHATKIT_API_BASE || DEFAULT_CHATKIT_BASE;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "OpenAI-Beta": "chatkit_beta=v1",
    "Content-Type": "application/json"
  };
  const organization = process.env.OPENAI_ORG_ID;
  const project = process.env.OPENAI_PROJECT_ID;
  if (organization) {
    headers["OpenAI-Organization"] = organization;
  }
  if (project) {
    headers["OpenAI-Project"] = project;
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${apiBase}/v1/chatkit/sessions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        workflow: { id: workflowId },
        user: userId
      })
    });
  } catch {
    const response = NextResponse.json(
      { error: "Failed to reach ChatKit API." },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
    if (setCookie) {
      response.cookies.set(SESSION_COOKIE_NAME, userId, {
        httpOnly: true,
        sameSite: "lax",
        secure: isProd(),
        maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
        path: "/"
      });
    }
    return response;
  }

  let payload: JsonPayload = {};
  try {
    payload = (await upstream.json()) as JsonPayload;
  } catch {
    payload = {};
  }

  if (!upstream.ok) {
    const response = NextResponse.json(
      { error: payload.error ?? upstream.statusText },
      { status: upstream.status, headers: { "Cache-Control": "no-store" } }
    );
    if (setCookie) {
      response.cookies.set(SESSION_COOKIE_NAME, userId, {
        httpOnly: true,
        sameSite: "lax",
        secure: isProd(),
        maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
        path: "/"
      });
    }
    return response;
  }

  const clientSecret = payload.client_secret as string | undefined;
  const expiresAfter = payload.expires_after as number | undefined;
  if (!clientSecret) {
    return NextResponse.json(
      { error: "Missing client secret in response." },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }

  const response = NextResponse.json(
    { client_secret: clientSecret, expires_after: expiresAfter },
    { headers: { "Cache-Control": "no-store" } }
  );
  if (setCookie) {
    response.cookies.set(SESSION_COOKIE_NAME, userId, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd(),
      maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
      path: "/"
    });
  }
  return response;
}
