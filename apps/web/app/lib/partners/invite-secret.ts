import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from 'node:crypto';
import { prisma } from '@trends172tech/db';

const PREFIX = 'partner-invite-secret:';

function key() {
  const secret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret) throw new Error('Missing auth secret for partner invitation encryption.');
  return createHash('sha256').update(secret).digest();
}

function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ['v1', iv.toString('base64url'), tag.toString('base64url'), encrypted.toString('base64url')].join('.');
}

function decrypt(value: string) {
  const [version, ivRaw, tagRaw, payloadRaw] = value.split('.');
  if (version !== 'v1' || !ivRaw || !tagRaw || !payloadRaw) return null;
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(ivRaw, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagRaw, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(payloadRaw, 'base64url')), decipher.final()]).toString('utf8');
}

export async function storePartnerInviteSecret(userId: string, temporaryPassword: string) {
  const identifier = `${PREFIX}${userId}`;
  const encrypted = encrypt(temporaryPassword);
  await prisma.$executeRaw`
    DELETE FROM "AuthVerification"
    WHERE "identifier" = ${identifier}
  `;
  await prisma.$executeRaw`
    INSERT INTO "AuthVerification" ("id", "identifier", "value", "expiresAt", "createdAt", "updatedAt")
    VALUES (${randomUUID()}, ${identifier}, ${encrypted}, NOW() + INTERVAL '1 hour', NOW(), NOW())
  `;
}

export async function readPartnerInviteSecret(userId: string) {
  const identifier = `${PREFIX}${userId}`;
  const rows = await prisma.$queryRaw<Array<{ value: string }>>`
    SELECT "value"
    FROM "AuthVerification"
    WHERE "identifier" = ${identifier} AND "expiresAt" > NOW()
    ORDER BY "createdAt" DESC
    LIMIT 1
  `;
  const encrypted = rows[0]?.value;
  if (!encrypted) return null;
  try {
    return decrypt(encrypted);
  } catch {
    return null;
  }
}

export async function clearPartnerInviteSecret(userId: string) {
  const identifier = `${PREFIX}${userId}`;
  await prisma.$executeRaw`
    DELETE FROM "AuthVerification"
    WHERE "identifier" = ${identifier}
  `;
}
