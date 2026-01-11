import { NextResponse } from 'next/server';
import { prisma, Prisma } from '@trends172tech/db';
import { z } from 'zod';
import { AuthError } from '@/lib/auth/guards';
import { requireTenantId } from '@/lib/tenant';

const numberFromInput = (schema: z.ZodNumber) =>
  z.preprocess((value) => (typeof value === 'string' ? Number(value) : value), schema);

const payloadSchema = z.object({
  amountUsd: numberFromInput(z.number().positive()),
  reference: z.string().min(3).max(120),
  proofUrl: z.string().url().max(400).optional()
});

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const tenantId = await requireTenantId();
    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const payment = await prisma.manualPayment.create({
      data: {
        tenantId,
        amountPaid: new Prisma.Decimal(parsed.data.amountUsd),
        currencyPaid: 'USD',
        exchangeRateUsed: null,
        reference: parsed.data.reference.trim(),
        proofUrl: parsed.data.proofUrl?.trim() || null,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ data: payment });
  } catch (error) {
    return handleError(error);
  }
}
