import { NextResponse } from 'next/server';
import { syncAuthorizedProjectMemories } from '@/lib/engineering-studio/memory-sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: 'Cron no configurado' }, { status: 503 });
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    return NextResponse.json(await syncAuthorizedProjectMemories());
  } catch (error) {
    console.error('[studio-memory-sync]', error);
    return NextResponse.json({ error: 'Error de sincronizacion de memoria' }, { status: 500 });
  }
}
