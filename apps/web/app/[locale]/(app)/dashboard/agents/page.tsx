import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@trends172tech/db';
import { requireAuth } from '@/lib/auth/guards';
import { resolveTenantFromUser } from '@/lib/tenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

type PageParams = {
  locale: string;
};

export default async function AgentsPage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  const isEs = locale.startsWith('es');
  const user = await requireAuth();
  const tenant = await resolveTenantFromUser(user);

  if (user.role === 'ROOT' && !tenant) {
    redirect(`/${locale}/root`);
  }

  if (!tenant) {
    return (
      <section className="space-y-6">
        <div className="interactive-panel premium-noise overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-7 shadow-[0_35px_100px_-72px_rgba(15,23,42,0.35)] sm:px-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">{isEs ? 'Agentes' : 'Agents'}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{isEs ? 'No hay tenant asignado.' : 'No tenant assigned.'}</p>
          </div>
        </div>
      </section>
    );
  }

  const agentInstances = await prisma.agentInstance.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: 'desc' },
    include: { endCustomer: true }
  });

  return (
    <section className="space-y-6">
      <div className="interactive-panel premium-noise overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-7 shadow-[0_35px_100px_-72px_rgba(15,23,42,0.35)] sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              {isEs ? 'Inventario de agentes' : 'Agent inventory'}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">{isEs ? 'Agentes' : 'Agents'}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isEs ? 'Listado de agentes configurados para este tenant.' : 'Agents configured for this tenant.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="interactive-chip inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
              href={`/${locale}/dashboard/agents/luna-code-orchestrator`}
            >
              {isEs ? 'Abrir Luna Code' : 'Open Luna Code'}
            </Link>
            <Link
              className="interactive-chip inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
              href={`/${locale}/dashboard`}
            >
              {isEs ? 'Configurar nuevo agente' : 'Configure new agent'}
            </Link>
          </div>
        </div>
      </div>

      <Card className="interactive-panel">
        <CardHeader className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{isEs ? 'Lista del workspace' : 'Workspace list'}</p>
          <CardTitle>{isEs ? 'Agentes configurados' : 'Configured agents'}</CardTitle>
        </CardHeader>
        <CardContent>
          {agentInstances.length === 0 ? (
            <div className="interactive-panel rounded-[24px] border border-dashed border-black/10 bg-slate-50/80 px-5 py-6 text-sm text-slate-500">
              {isEs ? 'Sin agentes configurados. Crea uno desde el dashboard.' : 'No agents configured. Create one from the dashboard.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isEs ? 'Nombre' : 'Name'}</TableHead>
                  <TableHead>{isEs ? 'Clave base' : 'Base key'}</TableHead>
                  <TableHead>{isEs ? 'Estado' : 'Status'}</TableHead>
                  <TableHead>{isEs ? 'Cliente final' : 'End customer'}</TableHead>
                  <TableHead>{isEs ? 'Acciones' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agentInstances.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>{agent.name}</TableCell>
                    <TableCell>{agent.baseAgentKey}</TableCell>
                    <TableCell>{agent.status}</TableCell>
                    <TableCell>{agent.endCustomer?.name ?? '-'}</TableCell>
                    <TableCell>
                      <Link
                        className="interactive-chip inline-flex rounded-full border border-black/8 bg-white/90 px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
                        href={`/${locale}/dashboard/agents/${agent.id}`}
                      >
                        {isEs ? 'Ver detalle' : 'View detail'}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
