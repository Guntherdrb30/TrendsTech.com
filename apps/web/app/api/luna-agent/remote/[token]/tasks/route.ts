import { NextResponse } from "next/server";
import { DevQueueStatus, DevTaskStatus, prisma } from "@trends172tech/db";
import { enforceLunaTaskCreation, incrementLunaMetric } from "@/lib/luna-agent/billing";
import { createRemoteTaskSchema } from "@/lib/validators/luna-agent";
import { hashRemoteToken } from "@/lib/luna-agent/security";

type RouteParams = {
  token: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<RouteParams> }
) {
  const { token } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = createRemoteTaskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const session = await prisma.remoteSession.findFirst({
    where: {
      tokenHash: hashRemoteToken(token),
      status: "ACTIVE",
      expiresAt: { gt: new Date() }
    }
  });

  if (!session) {
    return NextResponse.json({ error: "Remote session not found or expired." }, { status: 404 });
  }

  const project = await prisma.devProject.findFirst({
    where: {
      id: parsed.data.projectId,
      tenantId: session.tenantId,
      isActive: true
    }
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found for remote session." }, { status: 404 });
  }

  await enforceLunaTaskCreation(session.tenantId, session.userId, parsed.data.runtime);

  const task = await prisma.$transaction(async (tx) => {
    const createdTask = await tx.devTask.create({
      data: {
        tenantId: session.tenantId,
        projectId: project.id,
        createdByUserId: session.userId,
        title: parsed.data.title,
        description: parsed.data.description,
        executionMode: parsed.data.executionMode,
        priority: parsed.data.priority,
        prompt: parsed.data.prompt,
        status: DevTaskStatus.QUEUED
      }
    });

    await tx.devExecutionQueue.create({
      data: {
        taskId: createdTask.id,
        status: DevQueueStatus.PENDING,
        runtime: parsed.data.runtime
      }
    });

    await tx.devTaskLog.create({
      data: {
        taskId: createdTask.id,
        level: "INFO",
        message: "Tarea creada desde sesion remota.",
        metadata: {
          remoteSessionId: session.id
        }
      }
    });

    await tx.remoteSession.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() }
    });

    return createdTask;
  });

  await incrementLunaMetric(session.tenantId, "TASKS_CREATED");

  return NextResponse.json({ data: task }, { status: 201 });
}
