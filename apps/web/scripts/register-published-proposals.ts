/** Idempotent catalog registration. Runs only for production deployments. */
import { prisma } from '@trends172tech/db';
import { registerPublishedProposals } from '../app/lib/admin-ai/register-published-proposals';

async function main() {
  if (process.env.VERCEL_ENV !== 'production') {
    console.log('[proposal-catalog] Skipped: not a production deployment.');
    return;
  }
  const records = await prisma.$transaction(registerPublishedProposals, { maxWait: 15000, timeout: 30000 });
  console.log('[proposal-catalog] Verified registrations:', records.join(' | '));
}
main().catch(error => { console.error('[proposal-catalog]', error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
