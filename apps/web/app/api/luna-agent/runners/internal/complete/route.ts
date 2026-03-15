import { NextResponse } from "next/server";
import { DevQueueStatus, DevRunnerStatus, DevTaskStatus, prisma } from "@trends172tech/db";
import {
  appendTaskFiles,
  authenticateRunner,
  createTaskLog,
  logRunnerEvent
} from "@/lib/luna-agent/runners";
import { incrementLunaMetric } from "@/lib/luna-agent/billing";
import { runnerCompleteSchema } from "@/lib/validators/luna-agent";

const completionMap = {
  DONE: {
    queueStatus: DevQueueStatus.COMPLETED,
    taskStatus: DevTaskStatus.DONE,
    eventType: "TASK_COMPLETED" as const,
    level: "SUCCESS" as const,
    message: "Runner completo la tarea correctamente."
  },
  FAILED: {
    queueStatus: DevQueueStatus.FAILED,
    taskStatus: DevTaskStatus.FAILED,
    eventType: "TASK_FAILED" as const,
    level: "ERROR" as const,
    message: "Runner marco la tarea como fallida."
  },
  CANCELED: {
    queueStatus: DevQueueStatus.CANCELED,
    taskStatus: DevTaskStatus.FAILED,
    eventType: "TASK_CANCELED" as const,
    level: "WARNING" as const,
    message: "Runner cancelo la tarea."
  }
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = runnerCompleteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const runner = await authenticateRunner(parsed.data.runnerId, parsed.data.token);
    const queue = await prisma.devExecutionQueue.findFirst({
      where: {
        taskId: parsed.data.taskId,
        runnerId: runner.id,
        task: { tenantId: runner.tenantId }
      },
      include: {
        task: true
      }
    });

    if (!queue) {
      return NextResponse.json({ error: "Queue item not found for runner." }, { status: 404 });
    }

    const completion = completionMap[parsed.data.status];
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.devExecutionQueue.update({
        where: { id: queue.id },
        data: {
          status: completion.queueStatus,
          finishedAt: now,
          lastError: parsed.data.lastError ?? null
        }
      });

      await tx.devTask.update({
        where: { id: queue.taskId },
        data: {
          status: completion.taskStatus,
          resultSummary: parsed.data.resultSummary ?? queue.task.resultSummary,
          completedAt: now
        }
      });

      await tx.devRunner.update({
        where: { id: runner.id },
        data: {
          status: DevRunnerStatus.ONLINE,
          lastHeartbeatAt: now
        }
      });
    });

    await appendTaskFiles(queue.taskId, parsed.data.files);
    await createTaskLog(queue.taskId, completion.level, parsed.data.lastError ?? completion.message, {
      runnerId: runner.id,
      resultSummary: parsed.data.resultSummary ?? null
    });
    await logRunnerEvent({
      runnerId: runner.id,
      taskId: queue.taskId,
      type: completion.eventType,
      message: parsed.data.resultSummary ?? completion.message,
      payloadJson: {
        queueId: queue.id,
        lastError: parsed.data.lastError ?? null,
        fileCount: parsed.data.files.length
      }
    });

    if (parsed.data.status === "DONE") {
      await incrementLunaMetric(runner.tenantId, "TASKS_EXECUTED");
    }

    if (parsed.data.status === "FAILED") {
      await incrementLunaMetric(runner.tenantId, "TASKS_FAILED");
    }

    return NextResponse.json({
      data: {
        queueId: queue.id,
        status: completion.queueStatus,
        taskStatus: completion.taskStatus
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Runner authentication failed." },
      { status: 403 }
    );
  }
}
