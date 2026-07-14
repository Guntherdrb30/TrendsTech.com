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
  const isEs = locale.startsWith('es');
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
        <p className="text-sm text-slate-500 dark:text-slate-400">{isEs ? 'No hay tenant asignado.' : 'No tenant assigned.'}</p>
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
  const activeAgentCount = agentInstances.filter((agent) => agent.status === 'ACTIVE').length;
  const linkClass =
    'interactive-chip text-sm font-semibold text-slate-900 transition hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2';

  return (
    <section className="space-y-6">
      <div className="interactive-panel premium-noise overflow-hidden rounded-[36px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-7 shadow-[0_40px_110px_-78px_rgba(15,23,42,0.42)] sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              {isEs ? 'Centro de control del tenant' : 'Tenant control center'}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                {isEs ? 'Panel del tenant' : 'Tenant dashboard'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {tenant.name} | {tenant.mode} | {isEs ? 'rol' : 'role'}: {user.role}
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="interactive-panel rounded-[24px] border border-black/8 bg-white/92 px-5 py-4 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.3)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {isEs ? 'Saldo' : 'Balance'}
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                {tokenBalanceLabel}
              </div>
            </div>
            <div className="interactive-panel rounded-[24px] border border-black/8 bg-white/92 px-5 py-4 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.3)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {isEs ? 'Agentes activos' : 'Active agents'}
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                {activeAgentCount}
              </div>
            </div>
            <div className="interactive-panel rounded-[24px] border border-black/8 bg-white/92 px-5 py-4 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.3)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {isEs ? 'Clientes finales' : 'End customers'}
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                {endCustomers.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DashboardClient
        tenantMode={tenant.mode}
        endCustomers={endCustomers}
        profilePhone={profile?.phone ?? null}
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="interactive-panel overflow-hidden">
          <CardHeader className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              {isEs ? 'Libro operativo' : 'Operations ledger'}
            </p>
            <CardTitle className="text-2xl">{isEs ? 'Agentes configurados' : 'Configured agents'}</CardTitle>
            <p className="text-sm text-slate-500">
              {isEs
                ? 'Vista rapida del inventario operativo de agentes activos y en preparacion.'
                : 'Quick view of active agents and agents being prepared.'}
            </p>
          </CardHeader>
          <CardContent>
            {agentInstances.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{isEs ? 'Sin agentes configurados.' : 'No agents configured.'}</p>
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
                      <TableCell className="font-medium text-slate-900">{agent.name}</TableCell>
                      <TableCell>{agent.baseAgentKey}</TableCell>
                      <TableCell>{agent.status}</TableCell>
                      <TableCell>{agent.endCustomer?.name ?? '-'}</TableCell>
                      <TableCell>
                        <Link className={linkClass} href={`/${locale}/dashboard/agents/${agent.id}`}>
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

        <div className="grid gap-6">
          <Card className="interactive-panel">
            <CardHeader className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                {isEs ? 'Finanzas' : 'Finance'}
              </p>
              <CardTitle className="text-2xl">{isEs ? 'Tokens disponibles' : 'Available tokens'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-4xl font-semibold tracking-[-0.04em]">{tokenBalanceLabel}</p>
              <Link className={linkClass} href={`/${locale}/recharge`}>
                {isEs ? 'Recargar tokens' : 'Recharge tokens'}
              </Link>
            </CardContent>
          </Card>

          <Card className="interactive-panel bg-slate-950 text-white">
            <CardHeader className="space-y-2 border-white/10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                {isEs ? 'Desarrollo avanzado' : 'Advanced development'}
              </p>
              <CardTitle className="text-2xl text-white">Luna Code Orchestrator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-300">
                {isEs
                  ? 'Gestiona proyectos, tareas, proveedores IA y control remoto QR para desarrollo asistido.'
                  : 'Manage projects, tasks, AI providers and QR remote control for assisted development.'}
              </p>
              <Link
                className="interactive-chip inline-flex rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                href={`/${locale}/dashboard/agents/luna-code-orchestrator`}
              >
                {isEs ? 'Abrir agente' : 'Open agent'}
              </Link>
            </CardContent>
          </Card>

          <Card className="interactive-panel">
            <CardHeader className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                {isEs ? 'Accesos administrativos' : 'Admin shortcuts'}
              </p>
              <CardTitle className="text-2xl">{isEs ? 'Gestion rapida' : 'Quick management'}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="interactive-panel rounded-[24px] border border-black/8 bg-slate-50/90 px-4 py-4">
                <div className="text-sm font-semibold text-slate-900">{isEs ? 'Instalaciones del widget' : 'Widget installs'}</div>
                <Link className={`${linkClass} mt-2 inline-flex`} href={`/${locale}/dashboard/installs`}>
                  {isEs ? 'Gestionar instalaciones y dominios' : 'Manage installs and domains'}
                </Link>
              </div>
              <div className="interactive-panel rounded-[24px] border border-black/8 bg-slate-50/90 px-4 py-4">
                <div className="text-sm font-semibold text-slate-900">{isEs ? 'Acceso del widget' : 'Widget access'}</div>
                <Link className={`${linkClass} mt-2 inline-flex`} href={`/${locale}/dashboard/access`}>
                  {isEs ? 'Gestionar acceso embebido del agente' : 'Manage embedded agent access'}
                </Link>
              </div>
              <div className="interactive-panel rounded-[24px] border border-black/8 bg-slate-50/90 px-4 py-4">
                <div className="text-sm font-semibold text-slate-900">{isEs ? 'Gestion de usuarios' : 'User management'}</div>
                <Link className={`${linkClass} mt-2 inline-flex`} href={`/${locale}/dashboard/users`}>
                  {isEs ? 'Gestionar acceso del equipo' : 'Manage team access'}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
