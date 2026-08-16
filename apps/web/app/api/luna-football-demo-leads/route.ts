import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { z } from 'zod';
import { enforceRequestRateLimit } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const leadSchema = z.object({
  schoolName: z.string().min(2).max(160),
  contactName: z.string().min(2).max(120),
  phone: z.string().min(6).max(40),
  email: z.string().email().optional().or(z.literal('')),
  city: z.string().max(80).optional(),
  country: z.string().max(80).optional(),
  institutionType: z.string().max(120).optional(),
  playerCount: z.coerce.number().int().min(1).max(5000),
  categoryCount: z.coerce.number().int().min(1).max(50),
  monthlyFee: z.coerce.number().min(0).max(10000).optional(),
  primaryColor: z.string().max(32).optional(),
  secondaryColor: z.string().max(32).optional(),
  instagram: z.string().max(120).optional(),
  whatsapp: z.string().max(40).optional(),
  modules: z.array(z.string().max(80)).default([]),
  notes: z.string().max(2000).optional(),
  source: z.string().max(120).default('luna-football-demo')
});

function implementationRate(playerCount: number) {
  if (playerCount > 500) return 5;
  if (playerCount >= 250) return 6;
  return 8;
}

function optionalString(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export async function POST(request: Request) {
  const limited = enforceRequestRateLimit(request, {
    namespace: 'luna-football-demo-leads',
    limit: 8,
    windowMs: 10 * 60 * 1000
  });
  if (limited) return limited;

  let payload: z.infer<typeof leadSchema>;
  try {
    payload = leadSchema.parse(await request.json());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid payload.';
    return NextResponse.json({ error: message }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }

  const rate = implementationRate(payload.playerCount);
  const estimatedValue = payload.playerCount * rate;
  const monthlyRecurring = payload.playerCount;
  const notes = [
    payload.notes,
    `Solicitud generada desde demo LUNA Football.`,
    `Tipo: ${payload.institutionType ?? 'No indicado'}.`,
    `Jugadores estimados: ${payload.playerCount}.`,
    `Categorias: ${payload.categoryCount}.`,
    `Implementacion estimada: $${rate} por jugador = $${estimatedValue}.`,
    `Primer mes incluido en la implementacion.`,
    `Mensualidad estimada desde segundo mes: $${monthlyRecurring} ($1 por jugador/mes).`,
    `Colores: ${payload.primaryColor ?? 'N/A'} / ${payload.secondaryColor ?? 'N/A'}.`,
    `Instagram: ${payload.instagram ?? 'N/A'}.`,
    payload.modules.length ? `Modulos: ${payload.modules.join(', ')}.` : null
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const client = await prisma.adminClient.create({
      data: {
        name: payload.schoolName.trim(),
        contactName: payload.contactName.trim(),
        email: optionalString(payload.email),
        phone: optionalString(payload.phone),
        country: optionalString(payload.country),
        industry: 'LUNA Football',
        notes
      }
    });

    const lead = await prisma.adminLead.create({
      data: {
        clientId: client.id,
        clientName: payload.schoolName.trim(),
        source: payload.source,
        estimatedValue,
        owner: 'Trends172Tech',
        nextStep: `Contactar a ${payload.contactName} por ${payload.phone}. Preparar propuesta LUNA Football para ${payload.playerCount} jugadores. Implementacion: $${rate}/jugador. Primer mes incluido. Mensualidad desde segundo mes: $${monthlyRecurring}/mes.`
      }
    });

    return NextResponse.json(
      { ok: true, leadId: lead.id, clientId: client.id, estimatedValue, monthlyRecurring, implementationRate: rate },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save implementation lead.';
    return NextResponse.json({ error: message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
