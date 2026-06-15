import { NextRequest, NextResponse } from 'next/server';
import { createOpenAIClient } from '@trends172tech/openai';

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
  let description = '';
  let objectives: string[] = [];

  try {
    const body = await request.json() as { description?: string; objectives?: string[] };
    description = body.description ?? '';
    objectives = body.objectives ?? [];
  } catch {
    return NextResponse.json(fallbackRecommend(objectives));
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(fallbackRecommend(objectives));
  }

  try {
    const openai = createOpenAIClient({ apiKey });
    const prompt = `Based on this company description and goals, suggest:
1. A professional, concise agent name (2-4 words, in the same language as the description)
2. The most relevant skill keys from: customer_support, order_management, price_inquiry, appointment_booking, technical_support, sales, location_info

Description: ${description}
Goals: ${objectives.join(', ')}

Respond ONLY with valid JSON (no markdown, no code blocks): {"suggestedName":"string","skillKeys":["key1","key2"]}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 120,
      temperature: 0.3,
    });

    const text = response.choices[0]?.message?.content?.trim() ?? '';
    const parsed = JSON.parse(text) as { suggestedName: string; skillKeys: string[] };

    if (typeof parsed.suggestedName !== 'string' || !Array.isArray(parsed.skillKeys)) {
      throw new Error('Invalid GPT response shape');
    }

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(fallbackRecommend(objectives));
  }
}
