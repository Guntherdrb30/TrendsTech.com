import { Queue } from 'bullmq';
import { createRedisConnection, getQueueName } from './queueConfig';
import type { KnowledgeJobPayload } from './jobProcessor';

const DEFAULT_REMOVE_LIMIT = 1000;
let queue: Queue<KnowledgeJobPayload> | null = null;

function getQueue() {
  if (!queue) {
    queue = new Queue<KnowledgeJobPayload>(getQueueName(), {
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
