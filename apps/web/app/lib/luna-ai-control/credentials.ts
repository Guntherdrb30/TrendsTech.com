import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export function issueInstallationCredential() {
  const secret = `luna_live_${randomBytes(32).toString('base64url')}`;
  return { secret, prefix: secret.slice(0, 17), hash: hashInstallationCredential(secret) };
}

export function hashInstallationCredential(secret: string) {
  return createHash('sha256').update(secret, 'utf8').digest('hex');
}

export function verifyInstallationCredential(secret: string, expectedHash: string) {
  if (!/^luna_live_[A-Za-z0-9_-]{43}$/.test(secret) || !/^[a-f0-9]{64}$/.test(expectedHash)) return false;
  const actual = Buffer.from(hashInstallationCredential(secret), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return timingSafeEqual(actual, expected);
}
