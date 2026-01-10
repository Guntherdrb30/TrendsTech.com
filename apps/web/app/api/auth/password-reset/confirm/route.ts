import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import { prisma } from '@trends172tech/db';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const requestSchema = z.object({
  token: z.string().min(16),
  password: z.string().min(8).max(72)
});

function getTokenSecret() {
  return process.env.RESET_TOKEN_SECRET ?? process.env.AUTH_SECRET ?? null;
}

export async function POST(request: Request) {
  let payload: z.infer<typeof requestSchema>;
  try {
    payload = requestSchema.parse(await request.json());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid payload.';
    return NextResponse.json(
      { error: message },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const tokenSecret = getTokenSecret();
  if (!tokenSecret) {
    return NextResponse.json(
      { error: 'Missing reset token secret.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const tokenHash = crypto
    .createHash('sha256')
    .update(`${payload.token}${tokenSecret}`)
    .digest('hex');

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() }
    }
  });

  if (!resetToken) {
    return NextResponse.json(
      { error: 'Token invalid or expired.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const passwordHash = await hash(payload.password, 10);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash }
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() }
    }),
    prisma.passwordResetToken.updateMany({
      where: { userId: resetToken.userId, usedAt: null },
      data: { usedAt: new Date() }
    })
  ]);

  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
