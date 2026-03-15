import { notFound } from "next/navigation";
import { prisma } from "@trends172tech/db";
import { hashRemoteToken } from "@/lib/luna-agent/security";
import { RemoteTaskClient } from "./remote-task-client";

export const dynamic = "force-dynamic";

type RouteParams = {
  token: string;
};

export default async function LunaRemotePage({
  params
}: {
  params: Promise<RouteParams>;
}) {
  const { token } = await params;

  const session = await prisma.remoteSession.findFirst({
    where: {
      tokenHash: hashRemoteToken(token),
      status: "ACTIVE",
      expiresAt: { gt: new Date() }
    }
  });

  if (!session) {
    notFound();
  }

  const projects = await prisma.devProject.findMany({
    where: { tenantId: session.tenantId, isActive: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true }
  });

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-2 text-center">
          <div className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Luna Remote
          </div>
          <h1 className="text-3xl font-semibold">Control remoto desde telefono</h1>
          <p className="text-sm text-slate-600">
            Crea instrucciones rapidas y envialas a la cola de ejecucion de Luna Code Orchestrator.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {projects.length === 0 ? (
            <p className="text-sm text-slate-500">No hay proyectos activos disponibles para esta sesion.</p>
          ) : (
            <RemoteTaskClient token={token} projects={projects} />
          )}
        </div>
      </div>
    </div>
  );
}
