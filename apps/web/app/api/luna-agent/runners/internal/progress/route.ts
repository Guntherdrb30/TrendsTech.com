import { NextResponse } from "next/server";
import { prisma } from "@trends172tech/db";
import { appendTaskFiles, authenticateRunner, createTaskLog, logRunnerEvent } from "@/lib/luna-agent/runners";
import { runnerProgressSchema } from "@/lib/validators/luna-agent";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = runnerProgressSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const runner = await authenticateRunner(parsed.data.runnerId, parsed.data.token);
    const task = await prisma.devTask.findFirst({
      where: {
        id: parsed.data.taskId,
        tenantId: runner.tenantId
      }
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found for runner." }, { status: 404 });
    }

    await createTaskLog(task.id, parsed.data.level, parsed.data.message, {
      runnerId: runner.id
    });
    await appendTaskFiles(task.id, parsed.data.files);

    if (parsed.data.status) {
      await prisma.devTask.update({
        where: { id: task.id },
        data: { status: parsed.data.status }
      });
    }

    await logRunnerEvent({
      runnerId: runner.id,
      taskId: task.id,
      type: "TASK_PROGRESS",
      message: parsed.data.message,
      payloadJson: {
        fileCount: parsed.data.files.length
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Runner authentication failed." },
      { status: 403 }
    );
  }
}
