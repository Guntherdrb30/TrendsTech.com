import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { hashInstallationCredential, verifyInstallationCredential } from '@/lib/luna-ai-control/credentials';
import { readBoundedJson, usageEventSchema } from '@/lib/luna-ai-control/usage-validation';

export const runtime = 'nodejs';

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
    const body = await readBoundedJson(request);
    if (!body.ok) return NextResponse.json({ error: body.error }, { status: body.status });
    const parsed = usageEventSchema.safeParse(body.data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    const e = parsed.data;
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
