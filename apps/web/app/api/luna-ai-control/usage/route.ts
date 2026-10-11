import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@trends172tech/db';
import { hashInstallationCredential, verifyInstallationCredential } from '@/lib/luna-ai-control/credentials';

export const runtime = 'nodejs';

const nonnegative = z.number().int().nonnegative().optional();
const eventSchema = z.object({
  operationId: z.string().min(1).max(120),
  platform: z.string().min(1).max(80),
  module: z.string().min(1).max(80),
  action: z.string().min(1).max(80),
  provider: z.string().min(1).max(80),
  model: z.string().max(120).optional(),
  environment: z.enum(['production', 'preview', 'test']),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
  durationMs: z.number().int().nonnegative().max(86400000),
  status: z.enum(['success', 'error']),
  inputTokens: nonnegative,
  outputTokens: nonnegative,
  imageCount: nonnegative,
  videoCount: nonnegative,
  documentCount: nonnegative,
  audioSeconds: z.number().nonnegative().optional(),
  errorCode: z.string().max(120).optional(),
}).strict();

export async function POST(request: Request) {
  const header = request.headers.get('authorization') ?? '';
  const secret = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!/^luna_live_[A-Za-z0-9_-]{43}$/.test(secret)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const credential = await prisma.aiControlCredential.findUnique({
      where: { secretHash: hashInstallationCredential(secret) },
      include: { installation: { select: { id: true, status: true } } },
    });
    if (!credential || credential.revokedAt || !verifyInstallationCredential(secret, credential.secretHash) || credential.installation.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const raw = await request.text();
    if (raw.length > 16384) return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    let json: unknown;
    try { json = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
    const parsed = eventSchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    const e = parsed.data;
    if (new Date(e.completedAt).getTime() < new Date(e.startedAt).getTime()) return NextResponse.json({ error: 'Invalid timestamps' }, { status: 400 });
    const result = await prisma.aiControlUsageEvent.createMany({
      data: [{
        installationId: credential.installation.id,
        operationId: e.operationId,
        platform: e.platform, module: e.module, action: e.action, provider: e.provider,
        model: e.model, environment: e.environment, startedAt: new Date(e.startedAt),
        completedAt: new Date(e.completedAt), durationMs: e.durationMs, status: e.status,
        inputTokens: e.inputTokens, outputTokens: e.outputTokens,
        imageCount: e.imageCount, videoCount: e.videoCount, documentCount: e.documentCount,
        audioSeconds: e.audioSeconds, errorCode: e.errorCode,
      }],
      skipDuplicates: true,
    });
    return NextResponse.json({ accepted: result.count === 1, duplicate: result.count === 0 }, { status: 202 });
  } catch {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
