import { NextResponse } from "next/server";
import { DevRunnerStatus, prisma } from "@trends172tech/db";
import { authenticateRunner, logRunnerEvent } from "@/lib/luna-agent/runners";
import { runnerHandshakeSchema } from "@/lib/validators/luna-agent";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = runnerHandshakeSchema.safeParse(body);

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
        mode: parsed.data.mode,
        host: parsed.data.host ?? runner.host,
        machineLabel: parsed.data.machineLabel ?? runner.machineLabel,
        capabilitiesJson: parsed.data.capabilities,
        status: DevRunnerStatus.ONLINE,
        lastHeartbeatAt: new Date()
      }
    });

    await logRunnerEvent({
      runnerId: runner.id,
      type: "HEARTBEAT",
      message: "Runner emparejado correctamente.",
      payloadJson: {
        mode: updated.mode,
        host: updated.host,
        capabilities: parsed.data.capabilities
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
