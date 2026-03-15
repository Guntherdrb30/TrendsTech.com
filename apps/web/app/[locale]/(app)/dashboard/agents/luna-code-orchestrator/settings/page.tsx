import { prisma } from "@trends172tech/db";
import { requireRole } from "@/lib/auth/guards";
import { getLunaBillingSnapshot } from "@/lib/luna-agent/billing";
import { requireTenantId } from "@/lib/tenant";
import { SettingsClient } from "./settings-client";

export const dynamic = "force-dynamic";

export default async function LunaSettingsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole("TENANT_OPERATOR");
  const tenantId = await requireTenantId();

  const [providers, sessions, snapshot] = await Promise.all([
    prisma.devAIProvider.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
    }),
    prisma.remoteSession.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 10
    }),
    getLunaBillingSnapshot(tenantId)
  ]);

  return (
    <SettingsClient locale={locale} providers={providers} sessions={sessions} snapshot={snapshot} />
  );
}
