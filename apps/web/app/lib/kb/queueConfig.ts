import type { ConnectionOptions } from 'bullmq';

const QUEUE_NAME = process.env.KB_QUEUE_NAME ?? 'knowledge-ingest';
const QUEUE_CONCURRENCY = Number(process.env.KB_QUEUE_CONCURRENCY ?? 2);
const REDIS_URL = process.env.KB_QUEUE_REDIS_URL ?? process.env.REDIS_URL;

export function getQueueName() {
  return QUEUE_NAME;
}

export function getQueueConcurrency() {
  if (!Number.isFinite(QUEUE_CONCURRENCY) || QUEUE_CONCURRENCY <= 0) {
    return 1;
  }
  return Math.floor(QUEUE_CONCURRENCY);
}

export function createRedisConnection(): ConnectionOptions {
  if (!REDIS_URL) {
    throw new Error('KB queue Redis URL is not configured');
  }

  return {
    url: REDIS_URL,
    maxRetriesPerRequest: null
  };
}
