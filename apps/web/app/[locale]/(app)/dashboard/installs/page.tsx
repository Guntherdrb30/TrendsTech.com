import { prisma } from '@trends172tech/db';
import { requireAuth } from '@/lib/auth/guards';
import { resolveTenantFromUser } from '@/lib/tenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InstallsClient } from './installs-client';

export const dynamic = 'force-dynamic';

export default async function InstallsPage() {
  const user = await requireAuth();
  const tenant = await resolveTenantFromUser(user);

  if (!tenant) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Installs</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">No tenant assigned.</p>
      </section>
    );
  }

  const [installs, agentInstances] = await Promise.all([
    prisma.install.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' },
      include: { agentInstance: true }
    }),
    prisma.agentInstance.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true }
    })
  ]);

  const widgetScriptUrl =
    process.env.NEXT_PUBLIC_WIDGET_SCRIPT_URL ?? 'https://cdn.trends172tech.com/widget.js';

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Installs</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Gestiona dominios permitidos y el script de instalacion del widget.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Widgets activos</CardTitle>
        </CardHeader>
        <CardContent>
          <InstallsClient
            installs={installs}
            agentInstances={agentInstances}
            widgetScriptUrl={widgetScriptUrl}
          />
        </CardContent>
      </Card>
    </section>
  );
}
