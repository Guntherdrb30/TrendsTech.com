import { NextResponse } from "next/server";
import { z } from "zod";
import * as cheerio from "cheerio";

import { normalizeWhitespace } from "@/lib/kb/text";
import { createOpenAIClient, getOpenAIRequestId } from "@trends172tech/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  message: z.string().min(1).max(4000),
  sessionId: z.string().optional(),
  threadId: z.string().optional(),
  url: z.string().url().optional(),
  description: z.string().max(4000).optional(),
  fileText: z.string().max(8000).optional()
});

type UrlSnapshot = {
  title: string;
  description: string;
  highlights: string;
};

const RUN_POLL_INTERVAL_MS = 900;
const RUN_TIMEOUT_MS = 25000;

async function fetchUrlSnapshot(targetUrl: string): Promise<UrlSnapshot | null> {
  try {
    const response = await fetch(targetUrl, {
      headers: { "user-agent": "trends172tech-discovery-bot" }
    });
    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    $("script, style, noscript").remove();

    const title = normalizeWhitespace($("title").first().text() || "Sitio");
    const description = normalizeWhitespace($("meta[name=\"description\"]").attr("content") || "");

    const headings = $("h1, h2")
      .map((_, element) => $(element).text().trim())
      .get()
      .filter(Boolean)
      .slice(0, 8);

    const paragraphs = $("p")
      .map((_, element) => $(element).text().trim())
      .get()
      .filter(Boolean)
      .slice(0, 10);

    const rawHighlights = [...headings, ...paragraphs].join(" ");
    const highlights = normalizeWhitespace(rawHighlights).slice(0, 1600);

    return {
      title: title || "Sitio web",
      description,
      highlights
    };
  } catch {
    return null;
  }
}

function buildContextBlock({
  url,
  snapshot,
  description,
  fileText
}: {
  url?: string;
  snapshot?: UrlSnapshot | null;
  description?: string;
  fileText?: string;
}) {
  const blocks: string[] = [];
  if (url) {
    const summary = snapshot
      ? [
          `Titulo: ${snapshot.title}`,
          snapshot.description ? `Descripcion: ${snapshot.description}` : null,
          snapshot.highlights ? `Extracto: ${snapshot.highlights}` : null
        ]
          .filter(Boolean)
          .join("\n")
      : "No se pudo leer contenido del sitio.";
    blocks.push(`Contexto del sitio (${url}):\n${summary}`);
  }
  if (description) {
    blocks.push(`Descripcion provista por el cliente:\n${description}`);
  }
  if (fileText) {
    blocks.push(`Archivo adjunto (texto):\n${fileText}`);
  }

  return blocks.length > 0 ? `\n\n---\n${blocks.join("\n\n")}` : "";
}

async function waitForRunCompletion(client: ReturnType<typeof createOpenAIClient>, threadId: string, runId: string) {
  const deadline = Date.now() + RUN_TIMEOUT_MS;
  let run = await client.beta.threads.runs.retrieve(threadId, runId);

  while (
    ["queued", "in_progress", "cancelling"].includes(run.status) &&
    Date.now() < deadline
  ) {
    await new Promise((resolve) => setTimeout(resolve, RUN_POLL_INTERVAL_MS));
    run = await client.beta.threads.runs.retrieve(threadId, runId);
  }

  return run;
}

function extractAssistantText(message: {
  content: Array<{ type: string; text?: { value?: string } }>;
}) {
  return message.content
    .map((item) => (item.type === "text" ? item.text?.value ?? "" : ""))
    .join("\n")
    .trim();
}

export async function POST(request: Request) {
  const assistantId = process.env.OPENAI_PUBLIC_ASSISTANT_ID;
  if (!assistantId) {
    return NextResponse.json(
      { error: "OPENAI_PUBLIC_ASSISTANT_ID is not configured." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const payload = requestSchema.parse(await request.json());
    const client = createOpenAIClient({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
      project: process.env.OPENAI_PROJECT_ID
    });

    const snapshot = payload.url ? await fetchUrlSnapshot(payload.url) : null;
    const contextBlock = buildContextBlock({
      url: payload.url,
      snapshot,
      description: payload.description,
      fileText: payload.fileText
    });
    const userMessage = `${payload.message}${contextBlock}`;

    let threadId = payload.threadId;
    if (!threadId) {
      const thread = await client.beta.threads.create({
        messages: [{ role: "user", content: userMessage }],
        metadata: {
          session_id: payload.sessionId ?? "",
          source: "public_home"
        }
      });
      threadId = thread.id;
    } else {
      await client.beta.threads.messages.create(threadId, {
        role: "user",
        content: userMessage
      });
    }

    const run = await client.beta.threads.runs.create(threadId, {
      assistant_id: assistantId
    });
    console.log("[public-agent] run started", { threadId, runId: run.id });

    const completed = await waitForRunCompletion(client, threadId, run.id);
    if (completed.status !== "completed") {
      return NextResponse.json(
        {
          error: `Run did not complete (${completed.status}).`,
          threadId
        },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    const messages = await client.beta.threads.messages.list(threadId, {
      limit: 6,
      order: "desc"
    });
    const assistantMessage = messages.data.find((message) => message.role === "assistant");
    const reply = assistantMessage ? extractAssistantText(assistantMessage) : "";

    return NextResponse.json(
      { reply: reply || "Gracias. Estoy revisando la informacion.", threadId },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const requestId = getOpenAIRequestId(error);
    console.error("[public-agent] error", requestId ?? "", error);
    return NextResponse.json(
      { error: "Unexpected error. Please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
