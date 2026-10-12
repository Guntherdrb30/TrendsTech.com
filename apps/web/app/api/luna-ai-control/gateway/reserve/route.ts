import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthError } from '@/lib/auth/guards';
import { reserveGateway } from '@/lib/luna-ai-control/gateway';
import { readBoundedJson } from '@/lib/luna-ai-control/usage-validation';
export const runtime = 'nodejs';
const schema = z.object({ agent: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/), operationId: z.string().min(1).max(120) }).strict();
export async function POST(request: Request) {
  try {
    const body = await readBoundedJson(request);
    if (!body.ok) return NextResponse.json({ error: body.error }, { status: body.status });
    const parsed = schema.safeParse(body.data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    return NextResponse.json(await reserveGateway(request, parsed.data), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error instanceof AuthError ? error.status : 503;
    return NextResponse.json({ error: error instanceof AuthError ? error.message : 'Gateway unavailable' },
      { status, headers: { 'Cache-Control': 'no-store', ...(status === 429 ? { 'Retry-After': '60' } : {}) } });
  }
}
