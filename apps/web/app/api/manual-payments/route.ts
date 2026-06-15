import { NextResponse } from 'next/server';
import { prisma, Prisma } from '@trends172tech/db';
import { z } from 'zod';
import { AuthError } from '@/lib/auth/guards';
import { requireTenantId } from '@/lib/tenant';

const numberFromInput = (schema: z.ZodNumber) =>
  z.preprocess((value) => (typeof value === 'string' ? Number(value) : value), schema);

const payloadSchema = z.object({
  amountUsd: numberFromInput(z.number().positive()),
  amountPaid: numberFromInput(z.number().positive()),
  currencyPaid: z.enum(['USD', 'VES']).default('USD'),
  paymentMethod: z.enum(['ZELLE', 'BINANCE', 'PAGO_MOVIL']).default('ZELLE'),
  exchangeRateUsed: numberFromInput(z.number().positive()).optional(),
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

    const d = parsed.data;
    const payment = await prisma.manualPayment.create({
      data: {
        tenantId,
        amountPaid: new Prisma.Decimal(d.amountPaid),
        amountUsd: new Prisma.Decimal(d.amountUsd),
        currencyPaid: d.currencyPaid,
        paymentMethod: d.paymentMethod,
        exchangeRateUsed: d.exchangeRateUsed ? new Prisma.Decimal(d.exchangeRateUsed) : null,
        reference: d.reference.trim(),
        proofUrl: d.proofUrl?.trim() || null,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ data: payment });
  } catch (error) {
    return handleError(error);
  }
}
