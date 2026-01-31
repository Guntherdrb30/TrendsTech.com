import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@trends172tech/db';
import { requireAuth } from '@/lib/auth/guards';
import { resolveTenantFromUser } from '@/lib/tenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DashboardClient } from './dashboard-client';
import { formatUsdFromMicros } from '@/lib/billing/pricing';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireAuth();
  const tenant = await resolveTenantFromUser(user);
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { phone: true }
  });

  if (user.role === 'ROOT' && !tenant) {
    redirect(`/${locale}/root`);
  }

  if (!tenant) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">No tenant assigned.</p>
      </section>
    );
  }

  type EndCustomerOption = { id: string; name: string };
  type AgentWithEndCustomer = {
    id: string;
    name: string;
    baseAgentKey: string;
    status: string;
    endCustomer: { name: string | null } | null;
  };

  const [endCustomers, agentInstances] = (await Promise.all([
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
  ])) as [EndCustomerOption[], AgentWithEndCustomer[]];

  const tokenWallet = await prisma.tokenWallet.findUnique({
    where: { tenantId: tenant.id },
    select: { balance: true }
  });
  const tokenBalance = tokenWallet?.balance ?? 0;
  const tokenBalanceLabel = `$${formatUsdFromMicros(tokenBalance)}`;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Tenant dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {tenant.name} | {tenant.mode} | role: {user.role}
        </p>
      </div>

      <DashboardClient
        tenantMode={tenant.mode}
        endCustomers={endCustomers}
        profilePhone={profile?.phone ?? null}
      />

      <Card>
        <CardHeader>
          <CardTitle>Tokens disponibles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-3xl font-semibold">{tokenBalanceLabel}</p>
          <Link className="text-sm text-blue-600 hover:underline" href={`/${locale}/recharge`}>
            Recargar tokens
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agentes configurados</CardTitle>
        </CardHeader>
        <CardContent>
          {agentInstances.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Sin agentes configurados.</p>
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
                        View detail
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Widget installs</CardTitle>
        </CardHeader>
        <CardContent>
          <Link className="text-sm text-blue-600 hover:underline" href={`/${locale}/dashboard/installs`}>
            Manage installs and domains
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Widget access</CardTitle>
        </CardHeader>
        <CardContent>
          <Link className="text-sm text-blue-600 hover:underline" href={`/${locale}/dashboard/access`}>
            Manage embedded agent access
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User management</CardTitle>
        </CardHeader>
        <CardContent>
          <Link className="text-sm text-blue-600 hover:underline" href={`/${locale}/dashboard/users`}>
            Manage team access
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
