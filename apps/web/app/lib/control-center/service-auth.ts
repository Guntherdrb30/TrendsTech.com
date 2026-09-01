import { createHash, timingSafeEqual } from 'node:crypto';
import { prisma } from '@trends172tech/db';

export class ControlClientAuthError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}

export function hashControlClientToken(token: string) {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

function tokenParts(token: string) {
  const match = /^trc_([a-zA-Z0-9_-]{6,32})\.([a-zA-Z0-9_-]{24,})$/.exec(token);
  if (!match) return null;
  return { prefix: match[1], token };
}

export async function requireControlClient(request: Request, requiredScope: string) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  const parsed = tokenParts(token);
  if (!parsed) throw new ControlClientAuthError(401, 'Invalid service credential');

  const client = await prisma.controlServiceClient.findUnique({
    where: { keyPrefix: parsed.prefix },
    include: { implementation: { include: { product: true } } }
  });
  if (!client || !client.isActive) throw new ControlClientAuthError(401, 'Invalid service credential');
  if (client.expiresAt && client.expiresAt <= new Date()) {
    throw new ControlClientAuthError(401, 'Service credential expired');
  }

  const suppliedHash = Buffer.from(hashControlClientToken(parsed.token), 'hex');
  const storedHash = Buffer.from(client.secretHash, 'hex');
  if (suppliedHash.length !== storedHash.length || !timingSafeEqual(suppliedHash, storedHash)) {
    throw new ControlClientAuthError(401, 'Invalid service credential');
  }
  if (!client.scopes.includes(requiredScope)) throw new ControlClientAuthError(403, 'Insufficient scope');

  await prisma.controlServiceClient.update({ where: { id: client.id }, data: { lastUsedAt: new Date() } });
  return client;
}
