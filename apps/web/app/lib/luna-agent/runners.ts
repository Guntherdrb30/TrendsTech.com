import {
  DevExecutionRuntime,
  DevQueueStatus,
  DevRunnerStatus,
  DevTaskLogLevel,
  DevTaskStatus,
  Prisma,
  prisma
} from "@trends172tech/db";
import { hashRunnerToken } from "./security";

export async function authenticateRunner(runnerId: string, token: string) {
  const runner = await prisma.devRunner.findFirst({
    where: {
      id: runnerId,
      authTokenHash: hashRunnerToken(token)
    }
  });

  if (!runner) {
    throw new Error("Runner authentication failed.");
  }

  return runner;
}

export async function logRunnerEvent(params: {
  runnerId: string;
  taskId?: string | null;
  type:
    | "HEARTBEAT"
    | "TASK_CLAIMED"
    | "TASK_STARTED"
    | "TASK_PROGRESS"
    | "TASK_COMPLETED"
    | "TASK_FAILED"
    | "TASK_CANCELED";
  message: string;
  payloadJson?: Record<string, unknown>;
}) {
  return prisma.devRunnerEvent.create({
    data: {
      runnerId: params.runnerId,
      taskId: params.taskId ?? null,
      type: params.type,
      message: params.message,
      payloadJson: params.payloadJson as Prisma.InputJsonValue | undefined
    }
  });
}

export async function createTaskLog(taskId: string, level: DevTaskLogLevel, message: string, metadata?: Record<string, unknown>) {
  return prisma.devTaskLog.create({
    data: {
      taskId,
      level,
      message,
      metadata: metadata as Prisma.InputJsonValue | undefined
    }
  });
}

export async function appendTaskFiles(
  taskId: string,
  files: Array<{ filePath: string; changeType: "CREATED" | "UPDATED" | "DELETED"; summary?: string }>
) {
  if (files.length === 0) {
    return;
  }

  await prisma.devTaskFile.createMany({
    data: files.map((file) => ({
      taskId,
      filePath: file.filePath,
      changeType: file.changeType,
      summary: file.summary ?? null
    }))
  });
}

export async function claimNextTaskForRunner(params: {
  runnerId: string;
  tenantId: string;
  runtimes: DevExecutionRuntime[];
}) {
  const queueItem = await prisma.devExecutionQueue.findFirst({
    where: {
      runnerId: null,
      status: DevQueueStatus.PENDING,
      runtime: { in: params.runtimes },
      task: {
        tenantId: params.tenantId,
        status: DevTaskStatus.QUEUED
      }
    },
    orderBy: [{ createdAt: "asc" }],
    include: {
      task: {
        include: {
          project: true
        }
      }
    }
  });

  if (!queueItem) {
    return null;
  }

  return prisma.$transaction(async (tx) => {
    const updatedQueue = await tx.devExecutionQueue.updateMany({
      where: {
        id: queueItem.id,
        runnerId: null,
        status: DevQueueStatus.PENDING
      },
      data: {
        runnerId: params.runnerId,
        status: DevQueueStatus.CLAIMED,
        attemptCount: { increment: 1 }
      }
    });

    if (updatedQueue.count === 0) {
      return null;
    }

    await tx.devTask.update({
      where: { id: queueItem.taskId },
      data: {
        status: DevTaskStatus.RUNNING,
        startedAt: new Date()
      }
    });

    await tx.devRunner.update({
      where: { id: params.runnerId },
      data: {
        status: DevRunnerStatus.BUSY,
        lastHeartbeatAt: new Date()
      }
    });

    return queueItem;
  });
}
