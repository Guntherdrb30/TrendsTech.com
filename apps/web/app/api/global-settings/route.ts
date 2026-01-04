import { NextResponse } from 'next/server';
import { Prisma, prisma } from '@trends172tech/db';
import { z } from 'zod';
import { AuthError, requireRole } from '@/lib/auth/guards';

const numberFromInput = z.preprocess(
  (value) => (typeof value === 'string' ? Number(value) : value),
  z.number()
);

const globalSettingsSchema = z.object({
  usdToVesRate: numberFromInput.min(0.0001),
  usdPaymentDiscountPercent: numberFromInput.min(0).max(100),
  roundingRule: z.enum(['ONE', 'FIVE', 'TEN'])
});

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
}

export async function GET() {
  try {
    await requireRole('ROOT');
    const settings = await prisma.globalSettings.findUnique({
      where: { id: 1 }
    });
    return NextResponse.json({ data: settings });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole('ROOT');
    const body = await request.json();
    const parsed = globalSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const settings = await prisma.globalSettings.upsert({
      where: { id: 1 },
      update: {
        usdToVesRate: new Prisma.Decimal(parsed.data.usdToVesRate),
        usdPaymentDiscountPercent: new Prisma.Decimal(parsed.data.usdPaymentDiscountPercent),
        roundingRule: parsed.data.roundingRule,
        updatedByUserId: user.id
      },
      create: {
        id: 1,
        usdToVesRate: new Prisma.Decimal(parsed.data.usdToVesRate),
        usdPaymentDiscountPercent: new Prisma.Decimal(parsed.data.usdPaymentDiscountPercent),
        roundingRule: parsed.data.roundingRule,
        updatedByUserId: user.id
      }
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: 'GLOBAL_SETTINGS_UPDATED',
        entity: 'GlobalSettings',
        entityId: '1',
        metaJson: {
          usdToVesRate: parsed.data.usdToVesRate,
          usdPaymentDiscountPercent: parsed.data.usdPaymentDiscountPercent,
          roundingRule: parsed.data.roundingRule
        }
      }
    });

    return NextResponse.json({ data: settings });
  } catch (error) {
    return handleError(error);
  }
}
