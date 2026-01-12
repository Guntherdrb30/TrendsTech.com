import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@trends172tech/db';
import { USD_MICROS_PER_DOLLAR } from '@/lib/billing/pricing';
import { AuthError, requireRole } from '@/lib/auth/guards';

const payloadSchema = z.object({
  tenantId: z.string().min(1),
  amountUsd: z.number().positive()
});

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    await requireRole('ROOT');
    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const amountMicros = Math.round(parsed.data.amountUsd * USD_MICROS_PER_DOLLAR);

    const wallet = await prisma.tokenWallet.upsert({
      where: { tenantId: parsed.data.tenantId },
      update: {
        balance: {
          increment: amountMicros
        }
      },
      create: {
        tenantId: parsed.data.tenantId,
        balance: amountMicros
      }
    });

    return NextResponse.json({ data: wallet }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
