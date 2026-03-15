import Link from "next/link";
import { prisma } from "@trends172tech/db";
import { requireRole } from "@/lib/auth/guards";
import { requireTenantId } from "@/lib/tenant";
import { CreateTaskForm } from "./create-task-form";

export const dynamic = "force-dynamic";

export default async function LunaNewTaskPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole("TENANT_OPERATOR");
  const tenantId = await requireTenantId();
  const [projects, providers] = await Promise.all([
    prisma.devProject.findMany({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.devAIProvider.findMany({
      where: { userId: user.id, isActive: true },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        label: true,
        provider: true,
        isDefault: true
      }
    })
  ]);

  return (
    <div className="space-y-6">
      {projects.length === 0 ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Necesitas crear al menos un proyecto antes de registrar tareas.{" "}
          <Link href={`/${locale}/dashboard/agents/luna-code-orchestrator/projects`} className="font-semibold underline">
            Ir a proyectos
          </Link>
        </div>
      ) : null}
      <CreateTaskForm locale={locale} projects={projects} providers={providers} />
    </div>
  );
}
