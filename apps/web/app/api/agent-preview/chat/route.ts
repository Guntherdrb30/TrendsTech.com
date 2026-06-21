import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const MAX_MESSAGES = 10;

const SKILL_DESCRIPTIONS: Record<string, string> = {
  customer_support: 'atender consultas generales y brindar soporte al cliente',
  order_management: 'gestionar pedidos, confirmar compras y hacer seguimiento',
  price_inquiry: 'informar precios, descuentos y condiciones de pago',
  appointment_booking: 'agendar, confirmar y recordar citas o reuniones',
  technical_support: 'resolver problemas técnicos y guiar paso a paso',
  sales: 'asesorar en compras, generar cotizaciones y cerrar ventas',
  location_info: 'informar ubicación, horarios, métodos de pago y datos de contacto',
};

function buildSystemPrompt(
  agentName: string,
  skillKeys: string[],
  context: string
): string {
  const skillList = skillKeys
    .map((k) => `- ${SKILL_DESCRIPTIONS[k] ?? k}`)
    .join('\n');

  return `Eres ${agentName}, un asistente de IA especializado para atender clientes de una empresa.

## Tu conocimiento
A continuación está la información de la empresa que debes usar para responder:
---
${context || 'No se proporcionó información adicional de la empresa.'}
---

## Tus capacidades (skills activadas)
${skillList || '- Atención al cliente general'}

## Instrucciones
- Responde siempre en el mismo idioma en que te hablen
- Sé conciso, amable y profesional
- Si no tienes información sobre algo, dilo claramente y ofrece ayuda alternativa
- Nunca inventes datos de contacto, precios ni disponibilidad que no estén en el conocimiento
- Este es un chat de DEMOSTRACIÓN — si el usuario pregunta sobre precios del servicio de Trends172Tech, no respondas eso; solo responde como agente de la empresa del cliente
- Mantén un tono natural y humano, no robótico`;
}

export async function POST(request: NextRequest) {
  let body: {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    context: string;
    agentName: string;
    skillKeys: string[];
  };

  try {
    body = await request.json() as typeof body;
  } catch {
    return new Response('Body inválido', { status: 400 });
  }

  const { messages, context, agentName, skillKeys } = body;

  if (!messages || messages.length === 0) {
    return new Response('Se requieren mensajes', { status: 400 });
  }

  // Limitar mensajes para evitar abuso
  if (messages.length > MAX_MESSAGES) {
    return new Response(
      JSON.stringify({ error: 'demo_limit', message: 'Límite de mensajes de demostración alcanzado.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.startsWith('sk-ant-REEMPLAZA')) {
    return new Response(
      JSON.stringify({ error: 'config', message: 'API key de Claude no configurada.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const client = new Anthropic({ apiKey });
  const systemPrompt = buildSystemPrompt(agentName, skillKeys, context);

  // Solo pasar los últimos 10 mensajes para no exceder contexto
  const recentMessages = messages.slice(-10) as Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;

  const stream = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    system: systemPrompt,
    messages: recentMessages,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        console.error('[agent-preview/chat]', err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}
