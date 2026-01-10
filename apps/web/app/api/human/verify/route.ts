import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const requestSchema = z.object({
  token: z.string().min(1)
});

function isProd() {
  return (process.env.NODE_ENV ?? '').toLowerCase() === 'production';
}

export async function POST(request: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: 'Missing TURNSTILE_SECRET_KEY.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }

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

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const form = new URLSearchParams();
  form.set('secret', secret);
  form.set('response', payload.token);
  if (ip) {
    form.set('remoteip', ip);
  }

  const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString()
  });

  const verifyPayload = (await verifyResponse.json().catch(() => ({}))) as {
    success?: boolean;
  };

  if (!verifyResponse.ok || !verifyPayload.success) {
    return NextResponse.json(
      { error: 'Human verification failed.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const response = NextResponse.json(
    { ok: true },
    { headers: { 'Cache-Control': 'no-store' } }
  );
  response.cookies.set('human_verified', '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd(),
    maxAge: 60 * 60 * 24,
    path: '/'
  });
  return response;
}
