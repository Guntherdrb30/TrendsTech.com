import { prisma } from "@trends172tech/db";
import { requireRole } from "@/lib/auth/guards";
import { requireTenantId } from "@/lib/tenant";
import { ProjectsClient } from "./projects-client";

export const dynamic = "force-dynamic";

export default async function LunaProjectsPage() {
  await requireRole("TENANT_OPERATOR");
  const tenantId = await requireTenantId();
  const projects = await prisma.devProject.findMany({
    where: { tenantId },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }]
  });

  return <ProjectsClient projects={projects} />;
}
