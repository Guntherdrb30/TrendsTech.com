import { NextResponse } from 'next/server';
import { syncVercelProjects } from '@/lib/engineering-studio/infrastructure-sync';
import { syncGitHubRepositories } from '@/lib/engineering-studio/github-infrastructure-sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({error:'Cron is not configured'},{status:503});
  if (request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({error:'Unauthorized'},{status:401});
  try {
    const [vercel, github] = await Promise.allSettled([
      syncVercelProjects(),
      process.env.GITHUB_STUDIO_TOKEN ? syncGitHubRepositories() : Promise.resolve({ status: 'SKIPPED_CONFIGURATION' }),
    ]);
    const result = {
      vercel: vercel.status === 'fulfilled' ? vercel.value : { status: 'FAILED', error: vercel.reason instanceof Error ? vercel.reason.message : 'Vercel sync failed' },
      github: github.status === 'fulfilled' ? github.value : { status: 'FAILED', error: github.reason instanceof Error ? github.reason.message : 'GitHub sync failed' },
    };
    const failed = vercel.status === 'rejected' || github.status === 'rejected';
    return NextResponse.json(result, { status: failed ? 207 : 200 });
  } catch (error) {
    console.error('Studio infrastructure sync failed',error);
    return NextResponse.json({error:error instanceof Error?error.message:'Infrastructure sync failed'},{status:500});
  }
}
