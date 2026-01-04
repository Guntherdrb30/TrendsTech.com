import { prisma } from '@trends172tech/db';
import { requireAuth } from '@/lib/auth/guards';
import { resolveTenantFromUser } from '@/lib/tenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DashboardClient } from './dashboard-client';

export default async function DashboardPage() {
  const user = await requireAuth();
  const tenant = await resolveTenantFromUser(user);

  if (!tenant) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">No tenant assigned.</p>
      </section>
    );
  }

  const [endCustomers, agentInstances] = await Promise.all([
    prisma.endCustomer.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true }
    }),
    prisma.agentInstance.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' },
      include: { endCustomer: true }
    })
  ]);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Tenant dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {tenant.name} · {tenant.mode} · role: {user.role}
        </p>
      </div>

      <DashboardClient tenantMode={tenant.mode} endCustomers={endCustomers} />

      <Card>
        <CardHeader>
          <CardTitle>Agent instances</CardTitle>
        </CardHeader>
        <CardContent>
          {agentInstances.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No agent instances yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Base key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>End customer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agentInstances.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>{agent.name}</TableCell>
                    <TableCell>{agent.baseAgentKey}</TableCell>
                    <TableCell>{agent.status}</TableCell>
                    <TableCell>{agent.endCustomer?.name ?? '-'}</TableCell>
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
