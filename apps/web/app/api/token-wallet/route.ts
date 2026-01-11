import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@trends172tech/db';
import { AuthError, requireRole } from '@/lib/auth/guards';

const payloadSchema = z.object({
  tenantId: z.string().min(1),
  amount: z.number().int().positive()
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

    const wallet = await prisma.tokenWallet.upsert({
      where: { tenantId: parsed.data.tenantId },
      update: {
        balance: {
          increment: parsed.data.amount
        }
      },
      create: {
        tenantId: parsed.data.tenantId,
        balance: parsed.data.amount
      }
    });

    return NextResponse.json({ data: wallet }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
