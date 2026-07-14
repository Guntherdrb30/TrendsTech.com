import { NextResponse } from 'next/server';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  namespace: string;
  limit: number;
  windowMs: number;
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

export function resetRateLimitStoreForTests() {
  getStore().clear();
}
