import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { runLunaRoot } from '@trends172tech/openai';
import { z } from 'zod';
import { AuthError, requireRole } from '@/lib/auth/guards';
import { enforceRequestRateLimit } from '@/lib/security/rate-limit';

export const runtime = 'nodejs';

const requestSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  sessionId: z.string().uuid(),
  previousResponseId: z.string().startsWith('resp_').max(200).optional(),
  locale: z.enum(['es', 'en']).default('es')
});

export async function POST(request: Request) {
  try {
    const user = await requireRole('ROOT');
    const limited = enforceRequestRateLimit(request, {
      namespace: `luna-root:${user.id}`,
      limit: 30,
      windowMs: 60_000
    });
    if (limited) return limited;

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Solicitud no valida.' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_LUNA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'LUNA aun no esta configurada en este entorno.' }, { status: 503 });
    }

    const result = await runLunaRoot({ ...parsed.data, apiKey });

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: 'LUNA_ROOT_QUERY',
        entity: 'LunaRootSession',
        entityId: parsed.data.sessionId,
        metaJson: {
          locale: parsed.data.locale,
          mode: 'READ_ONLY',
          responseId: result.responseId
        }
      }
    });

    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('LUNA ROOT request failed', error);
    return NextResponse.json(
      { error: 'LUNA no pudo responder en este momento. Intenta nuevamente.' },
      { status: 500 }
    );
  }
}
