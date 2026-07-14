import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@trends172tech/db";
import { getLunaPlanSnapshot } from "@/lib/luna-agent/summary";
import { expireRemoteSessions } from "@/lib/luna-agent/runtime";
import { hashRemoteToken } from "@/lib/luna-agent/security";
import { RemoteTaskClient } from "./remote-task-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false, noarchive: true }
};

type RouteParams = {
  locale: string;
  token: string;
};

export default async function LunaRemotePage({
  params
}: {
  params: Promise<RouteParams>;
}) {
  const { locale, token } = await params;
  const isEs = locale.startsWith("es");
  const copy = isEs
    ? {
        title: "Control remoto desde teléfono",
        subtitle: "Crea instrucciones rápidas y envíalas a la cola de ejecución de Luna Code Orchestrator.",
        noProjects: "No hay proyectos activos disponibles para esta sesión.",
        recent: "Actividad reciente",
        recentBody: "Revisa estado, runtime y runner de tus últimas tareas móviles.",
        noTasks: "Aún no hay tareas creadas desde esta sesión.",
        unassigned: "sin asignar",
      }
    : {
        title: "Remote control from your phone",
        subtitle: "Create quick instructions and send them to the Luna Code Orchestrator execution queue.",
        noProjects: "There are no active projects available for this session.",
        recent: "Recent activity",
        recentBody: "Review the status, runtime, and runner for your latest mobile tasks.",
        noTasks: "No tasks have been created from this session yet.",
        unassigned: "unassigned",
      };
  await expireRemoteSessions();

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

  const [projects, recentTasks, plan] = await Promise.all([
    prisma.devProject.findMany({
      where: { tenantId: session.tenantId, isActive: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true }
    }),
    prisma.devTask.findMany({
      where: {
        tenantId: session.tenantId,
        createdByUserId: session.userId
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        queue: {
          include: {
            runner: {
              select: {
                name: true
              }
            }
          }
        }
      }
    }),
    getLunaPlanSnapshot(session.tenantId)
  ]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-2 text-center">
          <div className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Luna Remote
          </div>
          <h1 className="text-3xl font-semibold">{copy.title}</h1>
          <p className="text-sm text-slate-600">
            {copy.subtitle}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {projects.length === 0 ? (
            <p className="text-sm text-slate-500">{copy.noProjects}</p>
          ) : (
            <RemoteTaskClient locale={locale} token={token} projects={projects} plan={plan} />
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{copy.recent}</h2>
            <p className="text-sm text-slate-500">{copy.recentBody}</p>
          </div>
          <div className="mt-4 space-y-3">
            {recentTasks.length === 0 ? (
              <p className="text-sm text-slate-500">{copy.noTasks}</p>
            ) : (
              recentTasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-semibold text-slate-900">{task.title}</div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                      {task.status}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>Queue: {task.queue?.status ?? "none"}</span>
                    <span>Runtime: {task.queue?.runtime ?? "dry-run"}</span>
                    <span>Runner: {task.queue?.runner?.name ?? copy.unassigned}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
