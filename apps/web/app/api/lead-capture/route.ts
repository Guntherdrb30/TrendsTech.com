import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(4).max(30),
  business: z.string().max(160).optional(),
  notes: z.string().max(2000).optional(),
  transcript: z.string().max(24000).optional(),
  source: z.string().max(80).optional(),
  locale: z.string().max(20).optional(),
  threadId: z.string().max(120).optional()
});

const MAX_MESSAGE_CHARS = 3500;

function getAccessToken() {
  return process.env.WHATSAPP_ACCESS_TOKEN ?? "";
}

function getPhoneNumberId() {
  return (
    process.env.WHATSAPP_LEAD_PHONE_NUMBER_ID ??
    process.env.WHATSAPP_PHONE_NUMBER_ID ??
    ""
  );
}

function getLeadRecipient() {
  return process.env.WHATSAPP_LEAD_NOTIFY_TO ?? "";
}

function chunkText(value: string, maxChars: number) {
  if (value.length <= maxChars) {
    return [value];
  }
  const chunks: string[] = [];
  let offset = 0;
  while (offset < value.length) {
    chunks.push(value.slice(offset, offset + maxChars));
    offset += maxChars;
  }
  return chunks;
}

async function sendWhatsAppMessage({
  phoneNumberId,
  to,
  body
}: {
  phoneNumberId: string;
  to: string;
  body: string;
}) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("WHATSAPP_ACCESS_TOKEN is not configured.");
  }

  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body }
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`WhatsApp send failed: ${response.status} ${text}`);
  }
}

function buildLeadHeader(payload: z.infer<typeof requestSchema>) {
  const lines = [
    "Nuevo lead web",
    payload.name ? `Nombre: ${payload.name}` : null,
    payload.phone ? `Telefono: ${payload.phone}` : null,
    payload.business ? `Negocio: ${payload.business}` : null,
    payload.notes ? `Notas: ${payload.notes}` : null,
    payload.source ? `Fuente: ${payload.source}` : null,
    payload.locale ? `Idioma: ${payload.locale}` : null,
    payload.threadId ? `Thread: ${payload.threadId}` : null
  ].filter(Boolean);

  return lines.join("\n");
}

export async function POST(request: Request) {
  const phoneNumberId = getPhoneNumberId();
  const to = getLeadRecipient();

  if (!phoneNumberId) {
    return NextResponse.json(
      { error: "Missing WhatsApp phone number id." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
  if (!to) {
    return NextResponse.json(
      { error: "Missing WhatsApp lead recipient." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }

  let payload: z.infer<typeof requestSchema>;
  try {
    payload = requestSchema.parse(await request.json());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid payload.";
    return NextResponse.json(
      { error: message },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    await sendWhatsAppMessage({
      phoneNumberId,
      to,
      body: buildLeadHeader(payload)
    });

    if (payload.transcript) {
      const header = "Chat:";
      const text = `${header}\n${payload.transcript}`;
      const chunks = chunkText(text, MAX_MESSAGE_CHARS);
      for (const chunk of chunks) {
        await sendWhatsAppMessage({ phoneNumberId, to, body: chunk });
      }
    }

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "WhatsApp send failed.";
    return NextResponse.json(
      { error: message },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
