import { Worker } from 'bullmq';
import { prisma } from '@trends172tech/db';
import { createKnowledgeLogger } from '../app/lib/kb/logs';
import { processKnowledgeJob, type KnowledgeJobPayload } from '../app/lib/kb/jobProcessor';
import { createRedisConnection, getQueueConcurrency, getQueueName } from '../app/lib/kb/queueConfig';

const connection = createRedisConnection();
const queueName = getQueueName();

const worker = new Worker<KnowledgeJobPayload>(
  queueName,
  async (job) => {
    await processKnowledgeJob(job.data);
  },
  {
    connection,
    concurrency: getQueueConcurrency()
  }
);

worker.on('failed', async (job, error) => {
  if (!job) {
    return;
  }

  const message = error instanceof Error ? error.message : 'Knowledge job failed';

  try {
    const source = await prisma.knowledgeSource.findFirst({
      where: { id: job.data.sourceId, tenantId: job.data.tenantId }
    });

    if (!source) {
      return;
    }

    await prisma.knowledgeSource.update({
      where: { id: source.id },
      data: { status: 'FAILED' }
    });

    const logger = createKnowledgeLogger({
      tenantId: job.data.tenantId,
      actorUserId: job.data.actorUserId,
      sourceId: source.id,
      agentInstanceId: source.agentInstanceId,
      sourceType: source.type
    });

    await logger({
      message,
      progress: 100,
      status: 'FAILED',
      stage: 'error',
      error: message
    });
  } catch (logError) {
    console.error('Failed to record knowledge job failure', logError);
  }
});

async function shutdown() {
  await worker.close();
  await connection.quit();
  await prisma.$disconnect();
}

process.on('SIGINT', () => {
  void shutdown().then(() => process.exit(0));
});

process.on('SIGTERM', () => {
  void shutdown().then(() => process.exit(0));
});
