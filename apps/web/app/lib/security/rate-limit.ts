import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';

import { prisma } from '@trends172tech/db';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  namespace: string;
  limit: number;
  windowMs: number;
};

type PersistentRateLimitRow = {
  count: number;
  lastRequest: bigint;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __trendsRateLimitStore?: Map<string, RateLimitEntry>;
};

function getStore() {
  if (!globalForRateLimit.__trendsRateLimitStore) {
    globalForRateLimit.__trendsRateLimitStore = new Map();
  }
  return globalForRateLimit.__trendsRateLimitStore;
}

export function getRequestIdentifier(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return (
    forwarded ||
    request.headers.get('x-real-ip')?.trim() ||
    request.headers.get('x-vercel-forwarded-for')?.trim() ||
    'unknown'
  );
}

export function checkRateLimit(identifier: string, options: RateLimitOptions, now = Date.now()) {
  const store = getStore();

  if (store.size > 10_000) {
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }

  const key = `${options.namespace}:${identifier}`;
  const current = store.get(key);
  const entry = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + options.windowMs }
    : current;

  entry.count += 1;
  store.set(key, entry);

  return {
    allowed: entry.count <= options.limit,
    limit: options.limit,
    remaining: Math.max(0, options.limit - entry.count),
    resetAt: entry.resetAt
  };
}

export function enforceRequestRateLimit(request: Request, options: RateLimitOptions) {
  const result = checkRateLimit(getRequestIdentifier(request), options);
  if (result.allowed) return null;

  const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Cache-Control': 'no-store',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000))
      }
    }
  );
}

export async function checkPersistentRateLimit(
  identifier: string,
  options: RateLimitOptions,
  now = Date.now()
) {
  const key = `api:${options.namespace}:${identifier}`;
  const resetBoundary = BigInt(now - options.windowMs);
  const timestamp = BigInt(now);
  const rows = await prisma.$queryRaw<PersistentRateLimitRow[]>`
    INSERT INTO "rateLimit" ("id", "key", "count", "lastRequest")
    VALUES (${randomUUID()}, ${key}, 1, ${timestamp})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "rateLimit"."lastRequest" <= ${resetBoundary} THEN 1
        ELSE "rateLimit"."count" + 1
      END,
      "lastRequest" = CASE
        WHEN "rateLimit"."lastRequest" <= ${resetBoundary} THEN ${timestamp}
        ELSE "rateLimit"."lastRequest"
      END
    RETURNING "count", "lastRequest"
  `;
  const entry = rows[0];
  const count = entry?.count ?? options.limit + 1;
  const startedAt = Number(entry?.lastRequest ?? timestamp);

  return {
    allowed: count <= options.limit,
    limit: options.limit,
    remaining: Math.max(0, options.limit - count),
    resetAt: startedAt + options.windowMs
  };
}

export async function enforcePersistentRequestRateLimit(
  request: Request,
  options: RateLimitOptions,
  identifier = getRequestIdentifier(request)
) {
  const result = await checkPersistentRateLimit(identifier, options);
  if (result.allowed) return null;

  const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Cache-Control': 'no-store',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000))
      }
    }
  );
}

export function resetRateLimitStoreForTests() {
  getStore().clear();
}
