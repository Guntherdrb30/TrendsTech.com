import { assertControlPreviewReady } from '@/lib/luna-ai-control/preview-isolation';
import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { AuthError, requireRole } from '@/lib/auth/guards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** ROOT-only reporting. The installer sends events through /api/luna-ai-control/usage. */
export async function GET(request: Request) {
  try {
    await requireRole('ROOT');
    assertControlPreviewReady();
    const url = new URL(request.url);
    const daysRaw = Number(url.searchParams.get('days') ?? '30');
    if (!Number.isInteger(daysRaw) || daysRaw < 1 || daysRaw > 90) {
      return NextResponse.json({ error: 'days must be between 1 and 90' }, { status: 400 });
    }
    const since = new Date(Date.now() - daysRaw * 86400000);
    const events = await prisma.aiControlUsageEvent.findMany({
      where: { startedAt: { gte: since } },
      select: {
        id: true, installationId: true, operationId: true, platform: true,
        module: true, action: true, provider: true, model: true, status: true,
        startedAt: true, inputTokens: true, outputTokens: true,
        durationMs: true, installation: { select: { name: true, applicationKey: true } },
      },
      orderBy: { startedAt: 'desc' },
      take: 20000,
    });
    const daily = new Map<string, {
      day: string; installationId: string; project: string; requests: number;
      toolCalls: number; apiCalls: number; failures: number;
      inputTokens: number; outputTokens: number;
    }>();
    for (const e of events) {
      const day = e.startedAt.toISOString().slice(0, 10);
      const key = JSON.stringify([day, e.installationId]);
      let row = daily.get(key);
      if (!row) {
        row = { day, installationId: e.installationId, project: e.installation.name,
          requests: 0, toolCalls: 0, apiCalls: 0, failures: 0, inputTokens: 0, outputTokens: 0 };
        daily.set(key, row);
      }
      if (e.module === 'request') row.requests++;
      else if (e.module === 'tool_call') row.toolCalls++;
      else if (e.module === 'api_call') row.apiCalls++;
      if (e.status === 'error') row.failures++;
      row.inputTokens += e.inputTokens ?? 0;
      row.outputTokens += e.outputTokens ?? 0;
    }
    return NextResponse.json({
      periodDays: daysRaw,
      scannedEvents: events.length,
      truncated: events.length === 20000,
      daily: [...daily.values()].sort((a, b) => b.day.localeCompare(a.day)),
      recent: events.slice(0, 100),
      note: 'Cost is not recorded by the current usage schema; no monetary estimates are implied.',
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
