import { NextResponse } from "next/server";
import { isLegacyLunaExecutionDisabled, LEGACY_LUNA_RETIRED_RESPONSE } from "@/lib/luna-agent/retirement";
import { prisma } from "@trends172tech/db";
import { AuthError, requireRole } from "@/lib/auth/guards";
import { enforceLunaProjectCreation } from "@/lib/luna-agent/billing";
import { createDevProjectSchema } from "@/lib/validators/luna-agent";
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
    const projects = await prisma.devProject.findMany({
      where: { tenantId },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }]
    });

    return NextResponse.json({ data: projects });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  if (isLegacyLunaExecutionDisabled()) return NextResponse.json(LEGACY_LUNA_RETIRED_RESPONSE, { status: 410 });
  try {
    const user = await requireRole("TENANT_OPERATOR");
    const tenantId = await requireTenantId();
    const body = await request.json();
    const parsed = createDevProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await enforceLunaProjectCreation(tenantId, user.id);

    const project = await prisma.devProject.create({
      data: {
        tenantId,
        createdByUserId: user.id,
        ...parsed.data
      }
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        tenantId,
        action: "LUNA_PROJECT_CREATED",
        entity: "DevProject",
        entityId: project.id,
        metaJson: {
          name: project.name,
          slug: project.slug,
          executionMode: project.executionMode
        }
      }
    });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
