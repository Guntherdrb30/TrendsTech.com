import { NextResponse } from "next/server";
import { DevQueueStatus, DevTaskStatus, prisma } from "@trends172tech/db";
import { AuthError, requireRole } from "@/lib/auth/guards";
import { createDevTaskSchema } from "@/lib/validators/luna-agent";
import { requireTenantId } from "@/lib/tenant";

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
}

export async function GET() {
  try {
    await requireRole("TENANT_OPERATOR");
    const tenantId = await requireTenantId();
    const tasks = await prisma.devTask.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      include: {
        project: { select: { id: true, name: true, slug: true } },
        queue: true
      }
    });

    return NextResponse.json({ data: tasks });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole("TENANT_OPERATOR");
    const tenantId = await requireTenantId();
    const body = await request.json();
    const parsed = createDevTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const project = await prisma.devProject.findFirst({
      where: { id: parsed.data.projectId, tenantId, isActive: true }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found for tenant." }, { status: 404 });
    }

    const task = await prisma.$transaction(async (tx) => {
      const createdTask = await tx.devTask.create({
        data: {
          tenantId,
          projectId: project.id,
          createdByUserId: user.id,
          title: parsed.data.title,
          description: parsed.data.description,
          branch: parsed.data.branch,
          executionMode: parsed.data.executionMode,
          aiProvider: parsed.data.aiProvider,
          prompt: parsed.data.prompt,
          priority: parsed.data.priority,
          status: DevTaskStatus.QUEUED
        }
      });

      await tx.devExecutionQueue.create({
        data: {
          taskId: createdTask.id,
          status: DevQueueStatus.PENDING
        }
      });

      await tx.devTaskLog.create({
        data: {
          taskId: createdTask.id,
          level: "INFO",
          message: "Tarea creada y enviada a la cola de ejecucion.",
          metadata: {
            projectId: project.id,
            executionMode: parsed.data.executionMode,
            aiProvider: parsed.data.aiProvider ?? null
          }
        }
      });

      return createdTask;
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        tenantId,
        action: "LUNA_TASK_CREATED",
        entity: "DevTask",
        entityId: task.id,
        metaJson: {
          title: task.title,
          projectId: task.projectId,
          executionMode: task.executionMode,
          priority: task.priority
        }
      }
    });

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
