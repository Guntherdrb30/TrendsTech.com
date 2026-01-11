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
  const user = await requireAuth();
  const tenant = await resolveTenantFromUser(user);

  if (user.role === 'ROOT' && !tenant) {
    redirect(`/${locale}/root`);
  }

  if (!tenant) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Agentes</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">No tenant assigned.</p>
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Agentes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Listado de agentes configurados para este tenant.
          </p>
        </div>
        <Link className="text-sm text-blue-600 hover:underline" href={`/${locale}/dashboard`}>
          Configurar nuevo agente
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agentes configurados</CardTitle>
        </CardHeader>
        <CardContent>
          {agentInstances.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sin agentes configurados. Crea uno desde el dashboard.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Base key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>End customer</TableHead>
                  <TableHead>Actions</TableHead>
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
                        className="text-sm text-blue-600 hover:underline"
                        href={`/${locale}/dashboard/agents/${agent.id}`}
                      >
                        Ver detalle
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
