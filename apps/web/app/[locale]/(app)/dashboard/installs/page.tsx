import { prisma } from '@trends172tech/db';
import { requireAuth } from '@/lib/auth/guards';
import { resolveTenantFromUser } from '@/lib/tenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InstallsClient } from './installs-client';

export const dynamic = 'force-dynamic';

export default async function InstallsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireAuth();
  const tenant = await resolveTenantFromUser(user);
  const isEs = locale.startsWith('es');

  if (!tenant) {
    return (
      <section className="space-y-6">
        <div className="interactive-panel premium-noise overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-7 shadow-[0_35px_100px_-72px_rgba(15,23,42,0.35)] sm:px-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">{isEs ? 'Instalaciones' : 'Installs'}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{isEs ? 'No hay tenant asignado.' : 'No tenant assigned.'}</p>
          </div>
        </div>
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
      <div className="interactive-panel premium-noise overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-7 shadow-[0_35px_100px_-72px_rgba(15,23,42,0.35)] sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              {isEs ? 'Entrega de widgets' : 'Widget delivery'}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">{isEs ? 'Instalaciones' : 'Installs'}</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Gestiona dominios permitidos, keys y el script de instalacion del widget.
              </p>
            </div>
          </div>
          <div className="interactive-panel rounded-[24px] border border-black/8 bg-white/92 px-5 py-4 shadow-[0_18px_45px_-36px_rgba(15,23,42,0.24)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{isEs ? 'Instalaciones activas' : 'Active installs'}</div>
            <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{installs.length}</div>
          </div>
        </div>
      </div>

      <Card className="interactive-panel">
        <CardHeader className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Distribution</p>
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
