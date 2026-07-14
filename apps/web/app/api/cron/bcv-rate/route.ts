import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';

// APIs intentadas en orden — si una falla se prueba la siguiente
const BCV_SOURCES = [
  async () => {
    const r = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      headers: { 'User-Agent': 'trends172tech-bcv-cron/1.0' },
      signal: AbortSignal.timeout(8000)
    });
    if (!r.ok) throw new Error(`dolarapi ${r.status}`);
    const data = (await r.json()) as { promedio?: number; promedio_real?: number };
    const rate = data.promedio_real ?? data.promedio;
    if (!rate || rate <= 0) throw new Error('dolarapi: invalid rate');
    return rate;
  },
  async () => {
    const r = await fetch('https://pydolarve.org/api/v1/dollar?page=bcv&monitor=usd', {
      signal: AbortSignal.timeout(8000)
    });
    if (!r.ok) throw new Error(`pydolarve ${r.status}`);
    const data = (await r.json()) as { price?: number };
    if (!data.price || data.price <= 0) throw new Error('pydolarve: invalid rate');
    return data.price;
  }
];

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Vercel Cron sends Authorization header — verify it
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('BCV cron is missing CRON_SECRET configuration');
    return NextResponse.json({ error: 'Cron is not configured' }, { status: 503 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let rate: number | null = null;
  let source = '';

  for (const [i, fetchRate] of BCV_SOURCES.entries()) {
    try {
      rate = await fetchRate();
      source = i === 0 ? 'dolarapi.com' : 'pydolarve.org';
      break;
    } catch (err) {
      console.warn(`BCV source ${i} failed:`, err);
    }
  }

  if (!rate) {
    console.error('BCV rate: all sources failed');
    return NextResponse.json({ error: 'All BCV sources failed' }, { status: 502 });
  }

  await prisma.globalSettings.update({
    where: { id: 1 },
    data: {
      usdToVesRate: rate,
      bcvRateUpdatedAt: new Date()
    }
  });

  console.log(`BCV rate updated: ${rate} VES/USD via ${source}`);
  return NextResponse.json({ rate, source, updatedAt: new Date().toISOString() });
}
