import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { enforceRequestRateLimit } from '@/lib/security/rate-limit';

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

function buildSystemPrompt(agentName: string, skillKeys: string[], context: string): string {
  const skillList = skillKeys
    .map((k) => `- ${SKILL_DESCRIPTIONS[k] ?? k}`)
    .join('\n');

  return `Eres ${agentName}, un asistente de IA especializado para atender clientes de una empresa.

## Tu conocimiento
${context ? `A continuación está la información de la empresa:\n---\n${context}\n---` : 'No se proporcionó información adicional de la empresa.'}

## Tus capacidades
${skillList || '- Atención al cliente general'}

## Instrucciones
- Responde siempre en el mismo idioma en que te hablen
- Sé conciso, amable y profesional
- Si no tienes información sobre algo, dilo claramente
- Nunca inventes datos que no estén en el conocimiento
- Este es un chat de DEMOSTRACIÓN del agente de la empresa del cliente`;
}

export async function POST(request: NextRequest) {
  const limited = enforceRequestRateLimit(request, {
    namespace: 'agent-preview-chat',
    limit: 20,
    windowMs: 10 * 60 * 1000
  });
  if (limited) return limited;

  let body: {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    context: string;
    agentName: string;
    skillKeys: string[];
  };

  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const { messages, context, agentName, skillKeys } = body;

  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: 'Se requieren mensajes' }, { status: 400 });
  }

  if (messages.length > MAX_MESSAGES) {
    return NextResponse.json(
      { error: 'demo_limit', message: 'Límite de mensajes de demostración alcanzado.' },
      { status: 429 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.includes('REEMPLAZA')) {
    return NextResponse.json(
      { error: 'config', message: 'API key de Claude no configurada.' },
      { status: 503 }
    );
  }

  try {
    const client = new Anthropic({ apiKey });
    const systemPrompt = buildSystemPrompt(agentName, skillKeys, context ?? '');

    const recentMessages = messages.slice(-10) as Array<{
      role: 'user' | 'assistant';
      content: string;
    }>;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: systemPrompt,
      messages: recentMessages,
    });

    const text =
      response.content[0]?.type === 'text' ? response.content[0].text : '';

    return new Response(text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    console.error('[agent-preview/chat] Error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: 'api_error', message: 'Error al conectar con el agente. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
