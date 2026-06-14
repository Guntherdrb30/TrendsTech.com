import { NextResponse } from "next/server";
import { z } from "zod";
import { createOpenAIClient } from "@trends172tech/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  threadId: z.string().min(1)
});

function formatMessagesAsTxt(
  messages: Array<{ role: string; content: string; createdAt: number }>
): string {
  const header = [
    "=== Sesión de asesoría — Trends172 Tech ===",
    `Fecha: ${new Date().toLocaleString("es-VE", { timeZone: "America/Caracas" })}`,
    "=========================================",
    ""
  ].join("\n");

  const body = messages
    .map((msg) => {
      const roleLabel = msg.role === "user" ? "TÚ" : "ASESOR TRENDS172";
      const time = new Date(msg.createdAt * 1000).toLocaleTimeString("es-VE", {
        timeZone: "America/Caracas",
        hour: "2-digit",
        minute: "2-digit"
      });
      return `[${time}] ${roleLabel}:\n${msg.content}\n`;
    })
    .join("\n---\n\n");

  const footer = [
    "",
    "=========================================",
    "Trends172 Tech — trends172tech.com",
    "WhatsApp: +58 424-526-2306",
    "========================================="
  ].join("\n");

  return `${header}${body}${footer}`;
}

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const client = createOpenAIClient({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
      project: process.env.OPENAI_PROJECT_ID
    });

    const messagesPage = await client.beta.threads.messages.list(body.threadId, {
      limit: 100,
      order: "asc"
    });

    const formatted = messagesPage.data
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .map((msg) => ({
        role: msg.role,
        content: msg.content
          .map((c) => (c.type === "text" ? c.text.value : ""))
          .join("")
          .trim(),
        createdAt: msg.created_at
      }))
      .filter((msg) => msg.content.length > 0);

    if (formatted.length === 0) {
      return NextResponse.json(
        { error: "No hay mensajes en esta sesión." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    const txt = formatMessagesAsTxt(formatted);
    return new Response(txt, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="sesion-trends172-${Date.now()}.txt"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("[chatkit/transcript] error", error);
    return NextResponse.json(
      { error: "No se pudo obtener la sesión. Intenta de nuevo." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
