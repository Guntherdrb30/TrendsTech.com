import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { enforceRequestRateLimit } from '@/lib/security/rate-limit';

const OBJECTIVE_SKILL_MAP: Record<string, string> = {
  'Atender clientes 24/7': 'customer_support',
  'Recibir y gestionar pedidos': 'order_management',
  'Responder preguntas de precios': 'price_inquiry',
  'Agendar citas o reuniones': 'appointment_booking',
  'Soporte técnico': 'technical_support',
  'Ventas y cotizaciones': 'sales',
  'Informar sobre ubicación y horarios': 'location_info',
};

function fallbackRecommend(objectives: string[]): { suggestedName: string; skillKeys: string[] } {
  const skillKeys = objectives
    .map((o) => OBJECTIVE_SKILL_MAP[o])
    .filter(Boolean) as string[];
  return {
    suggestedName: 'Asistente Virtual',
    skillKeys: skillKeys.length > 0 ? skillKeys : ['customer_support'],
  };
}

export async function POST(request: NextRequest) {
  const limited = enforceRequestRateLimit(request, {
    namespace: 'intake-recommend',
    limit: 10,
    windowMs: 10 * 60 * 1000
  });
  if (limited) return limited;

  let description = '';
  let objectives: string[] = [];

  try {
    const body = await request.json() as { description?: string; objectives?: string[] };
    description = body.description ?? '';
    objectives = body.objectives ?? [];
  } catch {
    return NextResponse.json(fallbackRecommend(objectives));
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.includes('REEMPLAZA')) {
    return NextResponse.json(fallbackRecommend(objectives));
  }

  const validKeys = Object.values(OBJECTIVE_SKILL_MAP).join(', ');
  const prompt = `Based on this company description and goals, suggest:
1. A professional agent name (2-4 words, same language as the description)
2. The most relevant skill keys from this list only: ${validKeys}

Company description: ${description}
Goals: ${objectives.join(', ')}

Respond ONLY with valid JSON, no markdown: {"suggestedName":"string","skillKeys":["key1","key2"]}`;

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    });

    const text =
      response.content[0]?.type === 'text' ? response.content[0].text.trim() : '';

    const parsed = JSON.parse(text) as { suggestedName: string; skillKeys: string[] };

    if (typeof parsed.suggestedName !== 'string' || !Array.isArray(parsed.skillKeys)) {
      throw new Error('Invalid response shape');
    }

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(fallbackRecommend(objectives));
  }
}
