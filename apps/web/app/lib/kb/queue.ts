import { Queue } from 'bullmq';
import { createRedisConnection, getQueueName } from './queueConfig';
import type { KnowledgeJobPayload } from './jobProcessor';

const DEFAULT_REMOVE_LIMIT = 1000;
type KnowledgeQueue = Queue<
  KnowledgeJobPayload,
  unknown,
  string,
  KnowledgeJobPayload,
  unknown,
  string
>;
let queue: KnowledgeQueue | null = null;

function getQueue(): KnowledgeQueue {
  if (!queue) {
    queue = new Queue<
      KnowledgeJobPayload,
      unknown,
      string,
      KnowledgeJobPayload,
      unknown,
      string
    >(getQueueName(), {
      connection: createRedisConnection()
    });
  }
  return queue;
}

export async function enqueueKnowledgeJob(payload: KnowledgeJobPayload) {
  const knowledgeQueue = getQueue();
  const existing = await knowledgeQueue.getJob(payload.sourceId);
  if (existing) {
    const state = await existing.getState();
    if (['active', 'waiting', 'delayed', 'paused'].includes(state)) {
      return existing;
    }
    await existing.remove();
  }

  return knowledgeQueue.add('knowledge_ingest', payload, {
    jobId: payload.sourceId,
    removeOnComplete: DEFAULT_REMOVE_LIMIT,
    removeOnFail: DEFAULT_REMOVE_LIMIT
  });
}
