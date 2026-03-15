import { NextResponse } from "next/server";
import { DevQueueStatus, prisma } from "@trends172tech/db";
import { authenticateRunner, claimNextTaskForRunner, createTaskLog, logRunnerEvent } from "@/lib/luna-agent/runners";
import { runnerClaimSchema } from "@/lib/validators/luna-agent";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = runnerClaimSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const runner = await authenticateRunner(parsed.data.runnerId, parsed.data.token);
    const queueItem = await claimNextTaskForRunner({
      runnerId: runner.id,
      tenantId: runner.tenantId,
      runtimes: parsed.data.runtimes
    });

    if (!queueItem) {
      return NextResponse.json({ data: null });
    }

    await prisma.devExecutionQueue.update({
      where: { id: queueItem.id },
      data: {
        status: DevQueueStatus.PROCESSING,
        startedAt: new Date()
      }
    });

    await createTaskLog(queueItem.taskId, "INFO", "Runner reclamo la tarea y comenzo la ejecucion.", {
      runnerId: runner.id
    });
    await logRunnerEvent({
      runnerId: runner.id,
      taskId: queueItem.taskId,
      type: "TASK_CLAIMED",
      message: "Runner reclamo la tarea.",
      payloadJson: {
        queueId: queueItem.id,
        runtime: queueItem.runtime
      }
    });

    return NextResponse.json({
      data: {
        queueId: queueItem.id,
        runtime: queueItem.runtime,
        task: {
          id: queueItem.task.id,
          title: queueItem.task.title,
          description: queueItem.task.description,
          prompt: queueItem.task.prompt,
          branch: queueItem.task.branch,
          priority: queueItem.task.priority,
          executionMode: queueItem.task.executionMode,
          project: {
            id: queueItem.task.project.id,
            name: queueItem.task.project.name,
            repositoryUrl: queueItem.task.project.repositoryUrl,
            localPath: queueItem.task.project.localPath,
            defaultBranch: queueItem.task.project.defaultBranch
          }
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Runner authentication failed." },
      { status: 403 }
    );
  }
}
