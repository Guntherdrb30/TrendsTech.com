import { NextResponse } from "next/server";
import { prisma } from "@trends172tech/db";
import { AuthError, requireRole } from "@/lib/auth/guards";
import { createRemoteToken, hashRemoteToken } from "@/lib/luna-agent/security";
import { createRemoteSessionSchema } from "@/lib/validators/luna-agent";
import { requireTenantId } from "@/lib/tenant";

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
}

export async function GET() {
  try {
    const user = await requireRole("TENANT_OPERATOR");
    const tenantId = await requireTenantId();
    const sessions = await prisma.remoteSession.findMany({
      where: { tenantId, userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ data: sessions });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole("TENANT_OPERATOR");
    const tenantId = await requireTenantId();
    const body = await request.json().catch(() => ({}));
    const parsed = createRemoteSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const token = createRemoteToken();
    const expiresAt = new Date(Date.now() + parsed.data.expiresInMinutes * 60 * 1000);
    const session = await prisma.remoteSession.create({
      data: {
        tenantId,
        userId: user.id,
        tokenHash: hashRemoteToken(token),
        expiresAt
      }
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        tenantId,
        action: "LUNA_REMOTE_SESSION_CREATED",
        entity: "RemoteSession",
        entityId: session.id,
        metaJson: {
          expiresAt: session.expiresAt.toISOString()
        }
      }
    });

    return NextResponse.json({
      data: {
        session,
        token,
        mobilePathTemplate: "/[locale]/remote/luna-code-orchestrator/[token]"
      }
    });
  } catch (error) {
    return handleError(error);
  }
}
