import { NextResponse } from 'next/server';
import { syncVercelProjects } from '@/lib/engineering-studio/infrastructure-sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({error:'Cron is not configured'},{status:503});
  if (request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({error:'Unauthorized'},{status:401});
  try {
    const result = await syncVercelProjects();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Studio infrastructure sync failed',error);
    return NextResponse.json({error:error instanceof Error?error.message:'Infrastructure sync failed'},{status:500});
  }
}
