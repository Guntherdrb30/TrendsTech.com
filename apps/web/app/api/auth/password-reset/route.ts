import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@trends172tech/db';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email/reset';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const requestSchema = z.object({
  email: z.string().email().max(190),
  locale: z.string().optional()
});

const TOKEN_TTL_MS = 60 * 60 * 1000;

function getBaseUrl(request: Request) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  const protocol = request.headers.get('x-forwarded-proto') ?? 'https';
  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? 'localhost:3000';
  return `${protocol}://${host}`;
}

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

  const email = payload.email.toLowerCase().trim();
  const locale = payload.locale ?? 'es';
  const tokenSecret = getTokenSecret();
  if (!tokenSecret) {
    return NextResponse.json(
      { error: 'Missing reset token secret.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  }

  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() }
  });

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(`${token}${tokenSecret}`).digest('hex');
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt
    }
  });

  const baseUrl = getBaseUrl(request);
  const resetUrl = `${baseUrl}/${locale}/reset-password?token=${token}`;
  const emailResult = await sendPasswordResetEmail({
    to: email,
    resetUrl,
    locale
  });

  if (!emailResult.ok) {
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        { ok: true, resetUrl, warning: emailResult.error },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }
    return NextResponse.json(
      { error: emailResult.error ?? 'Failed to send reset email.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
