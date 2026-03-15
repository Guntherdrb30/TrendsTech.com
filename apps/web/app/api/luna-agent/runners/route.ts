import { NextResponse } from "next/server";
import { prisma } from "@trends172tech/db";
import { AuthError, requireRole } from "@/lib/auth/guards";
import { enforceLunaRunnerCreation, incrementLunaMetric } from "@/lib/luna-agent/billing";
import { syncRunnerHealth } from "@/lib/luna-agent/runtime";
import { createRunnerToken, hashRunnerToken } from "@/lib/luna-agent/security";
import { createRunnerSchema } from "@/lib/validators/luna-agent";
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
    await syncRunnerHealth(tenantId);
    const runners = await prisma.devRunner.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ data: runners });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole("TENANT_ADMIN");
    const tenantId = await requireTenantId();
    const body = await request.json();
    const parsed = createRunnerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await enforceLunaRunnerCreation(tenantId, user.id);

    const token = createRunnerToken();
    const runner = await prisma.devRunner.create({
      data: {
        tenantId,
        createdByUserId: user.id,
        name: parsed.data.name,
        slug: parsed.data.slug,
        mode: parsed.data.mode,
        host: parsed.data.host,
        machineLabel: parsed.data.machineLabel,
        authTokenHash: hashRunnerToken(token)
      }
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        tenantId,
        action: "LUNA_RUNNER_CREATED",
        entity: "DevRunner",
        entityId: runner.id,
        metaJson: {
          slug: runner.slug,
          mode: runner.mode
        }
      }
    });

    await incrementLunaMetric(tenantId, "RUNNERS_REGISTERED");

    return NextResponse.json({ data: runner, token }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
