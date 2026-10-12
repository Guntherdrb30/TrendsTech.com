import { assertControlPreviewReady } from './preview-isolation';
import { prisma, type Prisma } from '@trends172tech/db';
import { AuthError } from '@/lib/auth/guards';
import { hashInstallationCredential, verifyInstallationCredential } from './credentials';

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const configuredOrigins = [process.env.BETTER_AUTH_URL];
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) {
    configuredOrigins.push(`https://${process.env.VERCEL_URL}`);
  }
  const expectedOrigins = new Set(configuredOrigins.filter(Boolean).map(value => new URL(value!).origin));
  if (!expectedOrigins.size) expectedOrigins.add(new URL(request.url).origin);
  if (!origin || !expectedOrigins.has(origin) || request.headers.get('sec-fetch-site') === 'cross-site') {
    throw new AuthError(403, 'Same-origin request required');
  }
}

export async function authenticateInstallation(request: Request, db: Prisma.TransactionClient = prisma) {
  const header = request.headers.get('authorization') ?? '';
  const secret = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!/^luna_live_[A-Za-z0-9_-]{43}$/.test(secret)) throw new AuthError(401, 'Unauthorized');
  assertControlPreviewReady();
  const credential = await db.aiControlCredential.findUnique({
    where: { secretHash: hashInstallationCredential(secret) },
    include: { installation: true },
  });
  if (!credential || credential.revokedAt || credential.installation.status !== 'ACTIVE' ||
      !verifyInstallationCredential(secret, credential.secretHash)) throw new AuthError(401, 'Unauthorized');
  return credential;
}
