import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { z } from 'zod';
import { AuthError, requireRole } from '@/lib/auth/guards';

const numberFromInput = (schema: z.ZodNumber) =>
  z.preprocess((value) => (typeof value === 'string' ? Number(value) : value), schema);

const optionalString = (schema: z.ZodString) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
    schema.nullable().optional()
  );

const globalSettingsSchema = z.object({
  usdToVesRate: numberFromInput(z.number().min(0.0001)),
  usdPaymentDiscountPercent: numberFromInput(z.number().min(0).max(100)),
  roundingRule: z.enum(['ONE', 'FIVE', 'TEN']),
  kbUrlPageLimit: numberFromInput(z.number().int().min(1).max(25)),
  zelleRecipientName: optionalString(z.string().max(120)),
  zelleEmail: optionalString(z.string().email().max(190)),
  zellePhone: optionalString(z.string().max(40))
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
        usdToVesRate: parsed.data.usdToVesRate,
        usdPaymentDiscountPercent: parsed.data.usdPaymentDiscountPercent,
        roundingRule: parsed.data.roundingRule,
        kbUrlPageLimit: parsed.data.kbUrlPageLimit,
        zelleRecipientName: parsed.data.zelleRecipientName ?? null,
        zelleEmail: parsed.data.zelleEmail ?? null,
        zellePhone: parsed.data.zellePhone ?? null,
        updatedByUserId: user.id
      },
      create: {
        id: 1,
        usdToVesRate: parsed.data.usdToVesRate,
        usdPaymentDiscountPercent: parsed.data.usdPaymentDiscountPercent,
        roundingRule: parsed.data.roundingRule,
        kbUrlPageLimit: parsed.data.kbUrlPageLimit,
        zelleRecipientName: parsed.data.zelleRecipientName ?? null,
        zelleEmail: parsed.data.zelleEmail ?? null,
        zellePhone: parsed.data.zellePhone ?? null,
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
          roundingRule: parsed.data.roundingRule,
          kbUrlPageLimit: parsed.data.kbUrlPageLimit,
          zelleRecipientName: parsed.data.zelleRecipientName ?? null,
          zelleEmail: parsed.data.zelleEmail ?? null,
          zellePhone: parsed.data.zellePhone ?? null
        }
      }
    });

    return NextResponse.json({ data: settings });
  } catch (error) {
    return handleError(error);
  }
}
