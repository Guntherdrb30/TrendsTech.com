import { NextResponse } from "next/server";
import { prisma } from "@trends172tech/db";
import { AuthError, requireRole } from "@/lib/auth/guards";
import { encryptSecret } from "@/lib/luna-agent/security";
import { createAiProviderSchema } from "@/lib/validators/luna-agent";

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
}

export async function GET() {
  try {
    const user = await requireRole("TENANT_OPERATOR");
    const providers = await prisma.devAIProvider.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
    });

    return NextResponse.json({
      data: providers.map((provider) => ({
        ...provider,
        apiKeyEncrypted: "configured"
      }))
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole("TENANT_OPERATOR");
    const body = await request.json();
    const parsed = createAiProviderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (parsed.data.isDefault) {
      await prisma.devAIProvider.updateMany({
        where: { userId: user.id },
        data: { isDefault: false }
      });
    }

    const provider = await prisma.devAIProvider.create({
      data: {
        userId: user.id,
        provider: parsed.data.provider,
        label: parsed.data.label,
        apiKeyEncrypted: encryptSecret(parsed.data.apiKey),
        baseUrl: parsed.data.baseUrl,
        isActive: true,
        isDefault: parsed.data.isDefault
      }
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        tenantId: user.tenantId ?? undefined,
        action: "LUNA_PROVIDER_SAVED",
        entity: "DevAIProvider",
        entityId: provider.id,
        metaJson: {
          provider: provider.provider,
          label: provider.label,
          isDefault: provider.isDefault
        }
      }
    });

    return NextResponse.json(
      {
        data: {
          ...provider,
          apiKeyEncrypted: "configured"
        }
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
