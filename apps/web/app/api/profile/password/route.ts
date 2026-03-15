import { NextResponse } from 'next/server';
import { z } from 'zod';
import { compare, hash } from 'bcryptjs';
import { prisma } from '@trends172tech/db';
import { AuthError, requireAuth } from '@/lib/auth/guards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const passwordSchema = z.object({
  currentPassword: z.string().min(8).max(72),
  newPassword: z.string().min(8).max(72)
});

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const payload = passwordSchema.parse(await request.json());

    if (payload.currentPassword === payload.newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password.' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, passwordHash: true }
    });

    if (!existing || !existing.passwordHash) {
      return NextResponse.json(
        { error: 'Current user does not have a password configured.' },
        { status: 400 }
      );
    }

    const isValid = await compare(payload.currentPassword, existing.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    }

    const passwordHash = await hash(payload.newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      }),
      prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() }
      })
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
