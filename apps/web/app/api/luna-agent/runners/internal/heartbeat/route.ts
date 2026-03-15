import { NextResponse } from "next/server";
import { Prisma, prisma } from "@trends172tech/db";
import { authenticateRunner, logRunnerEvent } from "@/lib/luna-agent/runners";
import { runnerHeartbeatSchema } from "@/lib/validators/luna-agent";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = runnerHeartbeatSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const runner = await authenticateRunner(parsed.data.runnerId, parsed.data.token);
    const updated = await prisma.devRunner.update({
      where: { id: runner.id },
      data: {
        status: parsed.data.status,
        capabilitiesJson:
          (parsed.data.capabilities as Prisma.InputJsonValue | undefined) ??
          (runner.capabilitiesJson as Prisma.InputJsonValue | undefined),
        lastHeartbeatAt: new Date()
      }
    });

    await logRunnerEvent({
      runnerId: runner.id,
      type: "HEARTBEAT",
      message: "Heartbeat recibido.",
      payloadJson: {
        status: updated.status
      }
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Runner authentication failed." },
      { status: 403 }
    );
  }
}
