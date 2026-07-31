import { z } from 'zod';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@trends172tech/db';
import { requireRole } from '@/lib/auth/guards';
import { USD_MICROS_PER_DOLLAR } from '@/lib/billing/pricing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RootClient } from './root-client';
import { hashPassword } from '@/lib/auth/password';

export const dynamic = 'force-dynamic';

const editUserSchema = z.object({
  locale: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1).max(120),
  email: z.string().email().max(190),
  role: z.enum(['ROOT', 'TENANT_ADMIN', 'TENANT_OPERATOR', 'TENANT_VIEWER']),
  phone: z.string().min(4).max(40).optional(),
  password: z.string().min(12).max(128).optional()
});

const actionSchema = z.object({
  locale: z.string().min(1),
  userId: z.string().min(1)
});

const paymentActionSchema = z.object({
  locale: z.string().min(1),
  paymentId: z.string().min(1),
  action: z.enum(['APPROVE', 'REJECT'])
});

async function updateUser(formData: FormData) {
  'use server';
  const parsed = editUserSchema.safeParse({
    locale: formData.get('locale'),
    userId: formData.get('userId'),
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
    phone: formData.get('phone') || undefined,
    password: formData.get('password') || undefined
  });

  if (!parsed.success) {
    throw new Error('Invalid user payload.');
  }

  await requireRole('ROOT');
  const email = parsed.data.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== parsed.data.userId) {
    throw new Error('Email already exists.');
  }

  const updateData: {
    name: string;
    email: string;
    role: 'ROOT' | 'TENANT_ADMIN' | 'TENANT_OPERATOR' | 'TENANT_VIEWER';
    phone: string | null;
  } = {
    name: parsed.data.name.trim(),
    email,
    role: parsed.data.role,
    phone: parsed.data.phone?.trim() || null
  };

  const newPasswordHash = parsed.data.password
    ? await hashPassword(parsed.data.password)
    : null;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: parsed.data.userId },
      data: updateData
    });
    if (newPasswordHash) {
      await tx.authAccount.upsert({
        where: {
          providerId_accountId: {
            providerId: 'credential',
            accountId: parsed.data.userId
          }
        },
        create: {
          providerId: 'credential',
          accountId: parsed.data.userId,
          userId: parsed.data.userId,
          password: newPasswordHash
        },
        update: { password: newPasswordHash }
      });
      await tx.authSession.deleteMany({ where: { userId: parsed.data.userId } });
    }
  });

  const path = `/${parsed.data.locale}/root`;
  revalidatePath(path);
  redirect(path);
}

async function suspendUser(formData: FormData) {
  'use server';
  const parsed = actionSchema.safeParse({
    locale: formData.get('locale'),
    userId: formData.get('userId')
  });

  if (!parsed.success) {
    throw new Error('Invalid suspend payload.');
  }

  const currentUser = await requireRole('ROOT');
  if (currentUser.id === parsed.data.userId) {
    throw new Error('Cannot suspend the current user.');
  }

  await prisma.$transaction([
    prisma.authAccount.deleteMany({
      where: { userId: parsed.data.userId, providerId: 'credential' }
    }),
    prisma.authSession.deleteMany({ where: { userId: parsed.data.userId } })
  ]);

  const path = `/${parsed.data.locale}/root`;
  revalidatePath(path);
  redirect(path);
}

async function softDeleteUser(formData: FormData) {
  'use server';
  const parsed = actionSchema.safeParse({
    locale: formData.get('locale'),
    userId: formData.get('userId')
  });

  if (!parsed.success) {
    throw new Error('Invalid delete payload.');
  }

  const currentUser = await requireRole('ROOT');
  if (currentUser.id === parsed.data.userId) {
    throw new Error('Cannot delete the current user.');
  }

  const tombstoneEmail = `deleted+${parsed.data.userId}+${Date.now()}@trends172tech.local`;

  await prisma.$transaction([
    prisma.authAccount.deleteMany({ where: { userId: parsed.data.userId } }),
    prisma.authSession.deleteMany({ where: { userId: parsed.data.userId } }),
    prisma.user.update({
      where: { id: parsed.data.userId },
      data: {
        email: tombstoneEmail,
        name: 'Usuario eliminado',
        phone: null,
        role: 'TENANT_VIEWER',
        passwordHash: null
      }
    })
  ]);

  const path = `/${parsed.data.locale}/root`;
  revalidatePath(path);
  redirect(path);
}

async function updateManualPayment(formData: FormData) {
  'use server';
  const parsed = paymentActionSchema.safeParse({
    locale: formData.get('locale'),
    paymentId: formData.get('paymentId'),
    action: formData.get('action')
  });

  if (!parsed.success) {
    throw new Error('Invalid payment action payload.');
  }

  const reviewer = await requireRole('ROOT');

  await prisma.$transaction(async (tx) => {
    const payment = await tx.manualPayment.findUnique({
      where: { id: parsed.data.paymentId }
    });

    if (!payment) {
      throw new Error('Payment not found.');
    }

    if (payment.status !== 'PENDING') {
      return;
    }

    if (parsed.data.action === 'REJECT') {
      await tx.manualPayment.update({
        where: { id: payment.id },
        data: {
          status: 'REJECTED',
          reviewedByUserId: reviewer.id,
          reviewedAt: new Date()
        }
      });
      return;
    }

    const amountUsd = Number(payment.amountPaid);
    const amountMicros = Math.round(amountUsd * USD_MICROS_PER_DOLLAR);

    await tx.manualPayment.update({
      where: { id: payment.id },
      data: {
        status: 'APPROVED',
        reviewedByUserId: reviewer.id,
        reviewedAt: new Date()
      }
    });

    await tx.tokenWallet.upsert({
      where: { tenantId: payment.tenantId },
      update: { balance: { increment: amountMicros } },
      create: {
        tenantId: payment.tenantId,
        balance: amountMicros
      }
    });
  });

  const path = `/${parsed.data.locale}/root`;
  revalidatePath(path);
  redirect(path);
}

function formatDate(value?: Date | null) {
  if (!value) {
    return '-';
  }
  return value.toISOString().split('T')[0];
}

function formatNumber(value: number) {
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export default async function RootPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isEs = locale.startsWith('es');
  const tr = (es: string, en: string) => (isEs ? es : en);
  const currentUser = await requireRole('ROOT');
  const usageWindow = new Date();
  usageWindow.setDate(usageWindow.getDate() - 30);

  const [
    settings,
    tenantCount,
    userCount,
    paymentCount,
    pendingPaymentCount,
    activeSubscriptionCount,
    approvedUsdTotal,
    users,
    subscriptions,
    manualPayments,
    agentInstances,
    tenants,
    topAgents,
    activityLeaders,
    paymentLeaders
  ] = await Promise.all([
    prisma.globalSettings.findUnique({ where: { id: 1 } }),
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.manualPayment.count(),
    prisma.manualPayment.count({ where: { status: 'PENDING' } }),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.manualPayment.aggregate({
      _sum: { amountPaid: true },
      where: { currencyPaid: 'USD', status: 'APPROVED' }
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        tenantId: true,
        authAccounts: {
          where: { providerId: 'credential' },
          select: { id: true },
          take: 1
        },
        createdAt: true,
        tenant: { select: { name: true, status: true } }
      }
    }),
    prisma.subscription.findMany({
      orderBy: { startedAt: 'desc' },
      select: { tenantId: true, status: true, startedAt: true }
    }),
    prisma.manualPayment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { tenant: { select: { id: true, name: true } } }
    }),
    prisma.agentInstance.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: { select: { name: true } },
        whatsappChannel: { select: { provider: true, status: true } },
        _count: { select: { installs: true, knowledge: true, knowledgeChunks: true } }
      }
    }),
    prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' }
    }),
    prisma.agentInstance.findMany({
      orderBy: { installs: { _count: 'desc' } },
      take: 5,
      include: {
        tenant: { select: { name: true } },
        _count: { select: { installs: true } }
      }
    }),
    prisma.auditLog.groupBy({
      by: ['actorUserId'],
      where: { createdAt: { gte: usageWindow } },
      _count: { _all: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    }),
    prisma.manualPayment.groupBy({
      by: ['tenantId'],
      where: { status: 'APPROVED', currencyPaid: 'USD' },
      _sum: { amountPaid: true },
      orderBy: { _sum: { amountPaid: 'desc' } },
      take: 5
    })
  ]);

  const agentIds = agentInstances.map((agent) => agent.id);
  const userIds = users.map((user) => user.id);

  const agentUsage30d =
    agentIds.length === 0
      ? []
      : await prisma.auditLog.groupBy({
          by: ['entityId'],
          where: {
            entityId: { in: agentIds },
            action: 'openai_message',
            entity: 'agent_instance',
            createdAt: { gte: usageWindow }
          },
          _count: { _all: true },
          _max: { createdAt: true }
        });

  const agentUsageAll =
    agentIds.length === 0
      ? []
      : await prisma.auditLog.groupBy({
          by: ['entityId'],
          where: {
            entityId: { in: agentIds },
            action: 'openai_message',
            entity: 'agent_instance'
          },
          _max: { createdAt: true }
        });

  const userActivity =
    userIds.length === 0
      ? []
      : await prisma.auditLog.groupBy({
          by: ['actorUserId'],
          where: { actorUserId: { in: userIds } },
          _max: { createdAt: true }
        });

  const subscriptionByTenant = new Map<string, { status: string; startedAt: Date }>();
  for (const subscription of subscriptions) {
    if (!subscriptionByTenant.has(subscription.tenantId)) {
      subscriptionByTenant.set(subscription.tenantId, subscription);
    }
  }

  const rechargeByTenant = new Map<
    string,
    {
      tenantId: string;
      tenantName: string;
      totalUsd: number;
      totalVes: number;
      lastPayment: Date | null;
      payments: number;
    }
  >();

  for (const payment of manualPayments) {
    const tenantId = payment.tenantId;
    const tenantName = payment.tenant?.name ?? 'N/A';
    const entry = rechargeByTenant.get(tenantId) ?? {
      tenantId,
      tenantName,
      totalUsd: 0,
      totalVes: 0,
      lastPayment: null,
      payments: 0
    };
    entry.payments += 1;
    if (payment.currencyPaid === 'USD') {
      entry.totalUsd += Number(payment.amountPaid);
    } else {
      entry.totalVes += Number(payment.amountPaid);
    }
    if (!entry.lastPayment || payment.createdAt > entry.lastPayment) {
      entry.lastPayment = payment.createdAt;
    }
    rechargeByTenant.set(tenantId, entry);
  }

  const rechargeRows = Array.from(rechargeByTenant.values()).sort((a, b) => {
    if (!a.lastPayment && !b.lastPayment) {
      return 0;
    }
    if (!a.lastPayment) {
      return 1;
    }
    if (!b.lastPayment) {
      return -1;
    }
    return b.lastPayment.getTime() - a.lastPayment.getTime();
  });

  const agentUsageMap = new Map(
    agentUsage30d.map((entry) => [
      entry.entityId,
      { count: entry._count._all, lastAt: entry._max.createdAt }
    ])
  );
  const agentLastMap = new Map(
    agentUsageAll.map((entry) => [entry.entityId, entry._max.createdAt])
  );
  const userActivityMap = new Map(
    userActivity.map((entry) => [entry.actorUserId, entry._max.createdAt])
  );
  const activeUsageCount = agentUsage30d.length;

  const apiUsage = new Map<string, number>();
  for (const agent of agentInstances) {
    const usageCount = agentUsageMap.get(agent.id)?.count ?? 0;
    const provider = agent.whatsappChannel?.provider ?? 'Sin API';
    apiUsage.set(provider, (apiUsage.get(provider) ?? 0) + usageCount);
  }
  const apiUsageRows = Array.from(apiUsage.entries())
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  const activityUserIds = activityLeaders.map((item) => item.actorUserId);
  const activityUsers = activityUserIds.length
    ? await prisma.user.findMany({
        where: { id: { in: activityUserIds } },
        select: { id: true, name: true, email: true, tenant: { select: { name: true } } }
      })
    : [];
  const activityUserMap = new Map(activityUsers.map((user) => [user.id, user]));
  const activityRows = activityLeaders.map((leader) => ({
    user: activityUserMap.get(leader.actorUserId),
    total: leader._count._all,
    lastActivity: userActivityMap.get(leader.actorUserId) ?? null
  }));

  const paymentTenantIds = paymentLeaders.map((item) => item.tenantId);
  const paymentTenants = paymentTenantIds.length
    ? await prisma.tenant.findMany({
        where: { id: { in: paymentTenantIds } },
        select: { id: true, name: true }
      })
    : [];
  const paymentTenantMap = new Map(paymentTenants.map((tenant) => [tenant.id, tenant]));

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{tr('Administracion del sistema', 'System administration')}</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {tr(
                'Control de usuarios, recargas, agentes, tenants y configuracion global.',
                'Control users, recharges, agents, tenants, and global settings.'
              )}
            </p>
          </div>
          <Button asChild>
            <Link href={`/${locale}/admin`}>
              {tr('Abrir centro operativo', 'Open operations center')}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Barra de control
          </p>
          <nav className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Link
              href={`/${locale}/admin`}
              className="mb-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2.5 font-semibold text-cyan-800 transition hover:bg-cyan-100 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-200"
            >
              {tr('Centro operativo de proyectos', 'Project operations center')}
            </Link>
            <a href="#resumen" className="hover:text-slate-900 dark:hover:text-white">
              Resumen
            </a>
            <a href="#usuarios" className="hover:text-slate-900 dark:hover:text-white">
              Manejo de usuarios
            </a>
            <a href="#recargas" className="hover:text-slate-900 dark:hover:text-white">
              Control de recargas
            </a>
            <a href="#agentes" className="hover:text-slate-900 dark:hover:text-white">
              Agentes
            </a>
            <a href="#reportes" className="hover:text-slate-900 dark:hover:text-white">
              Reportes
            </a>
            <Link href={`/${locale}/root/news`} className="hover:text-slate-900 dark:hover:text-white">
              {tr('Novedades', 'News')}
            </Link>
            <Link
              href={`/${locale}/root/luna-code-orchestrator`}
              className="hover:text-slate-900 dark:hover:text-white"
            >
              Luna Orchestrator
            </Link>
            <Link
              href={`/${locale}/root/site-media`}
              className="hover:text-slate-900 dark:hover:text-white"
            >
              Media del sitio
            </Link>
            <a href="#ajustes" className="hover:text-slate-900 dark:hover:text-white">
              Ajustes globales
            </a>
            <a href="#tenants" className="hover:text-slate-900 dark:hover:text-white">
              Tenants
            </a>
          </nav>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">{tr('Indicadores clave', 'Key indicators')}</p>
            <div className="mt-2 grid gap-1">
              <div>Tenants: {tenantCount}</div>
              <div>{tr('Usuarios', 'Users')}: {userCount}</div>
              <div>{tr('Agentes con uso (30d)', 'Agents with usage (30d)')}: {activeUsageCount}</div>
              <div>{tr('Recargas pendientes', 'Pending recharges')}: {pendingPaymentCount}</div>
            </div>
          </div>
        </aside>

        <div className="space-y-10">
          <section id="resumen" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tenants</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-semibold">{tenantCount}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{tr('Usuarios', 'Users')}</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-semibold">{userCount}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{tr('Agentes con uso (30d)', 'Agents with usage (30d)')}</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-semibold">{activeUsageCount}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{tr('Recargas pendientes', 'Pending recharges')}</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-semibold">{pendingPaymentCount}</CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>{tr('Pagos totales', 'Total payments')}</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold">{paymentCount}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{tr('USD aprobados', 'Approved USD')}</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold">
                  {formatNumber(Number(approvedUsdTotal._sum.amountPaid ?? 0))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{tr('Suscripciones activas', 'Active subscriptions')}</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold">{activeSubscriptionCount}</CardContent>
              </Card>
            </div>
          </section>
          <section id="usuarios" className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{tr('Manejo de usuarios', 'User management')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Gestiona accesos, roles, estado y contrasenas desde un solo lugar.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>{tr('Usuarios del sistema', 'System users')}</CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">{tr('Sin usuarios registrados.', 'No registered users.')}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tr('Usuario', 'User')}</TableHead>
                        <TableHead>{tr('Rol', 'Role')}</TableHead>
                        <TableHead>Tenant</TableHead>
                        <TableHead>{tr('Estado', 'Status')}</TableHead>
                        <TableHead>{tr('Ultima actividad', 'Last activity')}</TableHead>
                        <TableHead>{tr('Acciones', 'Actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => {
                        const hasAccess = user.authAccounts.length > 0;
                        const lastActivity = userActivityMap.get(user.id) ?? null;
                        const isActive =
                          hasAccess && Boolean(lastActivity && lastActivity >= usageWindow);
                        const statusLabel = !hasAccess
                          ? 'Suspendido'
                          : isActive
                            ? 'Activo'
                            : 'Inactivo';
                        const lastActivityLabel = lastActivity ? formatDate(lastActivity) : '-';
                        const isSelf = user.id === currentUser.id;
                        const canManage = !isSelf && user.role !== 'ROOT';

                        return (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                {user.name ?? 'Sin nombre'}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {user.email}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {user.phone ?? 'Sin telefono'}
                              </div>
                            </TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>{user.tenant?.name ?? 'Sistema'}</TableCell>
                            <TableCell>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  isActive
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : statusLabel === 'Suspendido'
                                      ? 'bg-rose-100 text-rose-700'
                                      : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {statusLabel}
                              </span>
                            </TableCell>
                            <TableCell>{lastActivityLabel}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                <form action={suspendUser}>
                                  <input type="hidden" name="locale" value={locale} />
                                  <input type="hidden" name="userId" value={user.id} />
                                  <Button type="submit" size="sm" variant="outline" disabled={!canManage}>
                                    {tr('Pausar', 'Pause')}
                                  </Button>
                                </form>
                                <form action={softDeleteUser}>
                                  <input type="hidden" name="locale" value={locale} />
                                  <input type="hidden" name="userId" value={user.id} />
                                  <Button type="submit" size="sm" variant="outline" disabled={!canManage}>
                                    {tr('Eliminar', 'Delete')}
                                  </Button>
                                </form>
                                <details className="w-full rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-800">
                                  <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Editar acceso
                                  </summary>
                                  <form action={updateUser} className="mt-3 grid gap-3">
                                    <input type="hidden" name="locale" value={locale} />
                                    <input type="hidden" name="userId" value={user.id} />
                                    <div className="grid gap-2">
                                      <Label htmlFor={`name-${user.id}`}>{tr('Nombre', 'Name')}</Label>
                                      <Input id={`name-${user.id}`} name="name" defaultValue={user.name ?? ''} />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor={`email-${user.id}`}>{tr('Correo', 'Email')}</Label>
                                      <Input
                                        id={`email-${user.id}`}
                                        name="email"
                                        type="email"
                                        defaultValue={user.email}
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor={`phone-${user.id}`}>{tr('Telefono', 'Phone')}</Label>
                                      <Input id={`phone-${user.id}`} name="phone" defaultValue={user.phone ?? ''} />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor={`role-${user.id}`}>{tr('Rol', 'Role')}</Label>
                                      <select
                                        id={`role-${user.id}`}
                                        name="role"
                                        defaultValue={user.role}
                                        className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                                      >
                                        <option value="ROOT">ROOT</option>
                                        <option value="TENANT_ADMIN">Admin tenant</option>
                                        <option value="TENANT_OPERATOR">Operador tenant</option>
                                        <option value="TENANT_VIEWER">Vista tenant</option>
                                      </select>
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor={`password-${user.id}`}>{tr('Nueva contrasena', 'New password')}</Label>
                                      <Input id={`password-${user.id}`} name="password" type="password" />
                                    </div>
                                    <Button type="submit" size="sm" disabled={!canManage}>
                                      {tr('Guardar cambios', 'Save changes')}
                                    </Button>
                                  </form>
                                </details>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </section>
          <section id="recargas" className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{tr('Control de recargas', 'Recharge control')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Usuarios con recargas, estado activo e historial de pagos.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>{tr('Recargas por tenant', 'Recharges by tenant')}</CardTitle>
              </CardHeader>
              <CardContent>
                {rechargeRows.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">{tr('Sin recargas registradas.', 'No recorded recharges.')}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tenant</TableHead>
                        <TableHead>{tr('Ultima recarga', 'Last recharge')}</TableHead>
                        <TableHead>USD</TableHead>
                        <TableHead>VES</TableHead>
                        <TableHead>{tr('Estado', 'Status')}</TableHead>
                        <TableHead>{tr('Pagos', 'Payments')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rechargeRows.map((row) => {
                        const subscription = subscriptionByTenant.get(row.tenantId);
                        const isActive = subscription?.status === 'ACTIVE';

                        return (
                          <TableRow key={row.tenantId}>
                            <TableCell>{row.tenantName}</TableCell>
                            <TableCell>{formatDate(row.lastPayment)}</TableCell>
                            <TableCell>{formatNumber(row.totalUsd)}</TableCell>
                            <TableCell>{formatNumber(row.totalVes)}</TableCell>
                            <TableCell>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  isActive
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {isActive ? 'Activo' : 'Inactivo'}
                              </span>
                            </TableCell>
                            <TableCell>{row.payments}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{tr('Pagos recientes', 'Recent payments')}</CardTitle>
              </CardHeader>
              <CardContent>
                {manualPayments.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">{tr('Sin pagos registrados.', 'No recorded payments.')}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tenant</TableHead>
                        <TableHead>{tr('Monto', 'Amount')}</TableHead>
                        <TableHead>{tr('Moneda', 'Currency')}</TableHead>
                        <TableHead>{tr('Referencia', 'Reference')}</TableHead>
                        <TableHead>{tr('Estado', 'Status')}</TableHead>
                        <TableHead>{tr('Acciones', 'Actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {manualPayments.slice(0, 10).map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.tenant?.name ?? 'N/A'}</TableCell>
                          <TableCell>{payment.amountPaid.toString()}</TableCell>
                          <TableCell>{payment.currencyPaid}</TableCell>
                          <TableCell>{payment.reference}</TableCell>
                          <TableCell>{payment.status}</TableCell>
                          <TableCell>
                            {payment.status === 'PENDING' ? (
                              <div className="flex flex-wrap gap-2">
                                <form action={updateManualPayment}>
                                  <input type="hidden" name="locale" value={locale} />
                                  <input type="hidden" name="paymentId" value={payment.id} />
                                  <input type="hidden" name="action" value="APPROVE" />
                                  <Button type="submit" size="sm">
                                    {tr('Aprobar', 'Approve')}
                                  </Button>
                                </form>
                                <form action={updateManualPayment}>
                                  <input type="hidden" name="locale" value={locale} />
                                  <input type="hidden" name="paymentId" value={payment.id} />
                                  <input type="hidden" name="action" value="REJECT" />
                                  <Button type="submit" size="sm" variant="outline">
                                    {tr('Rechazar', 'Reject')}
                                  </Button>
                                </form>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 dark:text-slate-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </section>
          <section id="agentes" className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{tr('Agentes y operaciones', 'Agents and operations')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Consumo real, conexiones y control de configuracion por agente.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>{tr('Agentes activos y configuraciones', 'Active agents and configurations')}</CardTitle>
              </CardHeader>
              <CardContent>
                {agentInstances.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">{tr('Sin agentes registrados.', 'No registered agents.')}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tr('Agente', 'Agent')}</TableHead>
                        <TableHead>Tenant</TableHead>
                        <TableHead>{tr('Estado', 'Status')}</TableHead>
                        <TableHead>{tr('Estado uso', 'Usage status')}</TableHead>
                        <TableHead>{tr('Instalaciones', 'Installs')}</TableHead>
                        <TableHead>{tr('Fuentes', 'Sources')}</TableHead>
                        <TableHead>{tr('Consumo IA (30d)', 'AI usage (30d)')}</TableHead>
                        <TableHead>{tr('Ultimo uso', 'Last usage')}</TableHead>
                        <TableHead>API</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agentInstances.map((agent) => {
                        const usage = agentUsageMap.get(agent.id)?.count ?? 0;
                        const lastUsage = agentLastMap.get(agent.id) ?? null;
                        const usageActive = Boolean(lastUsage && lastUsage >= usageWindow);
                        const apiLabel = agent.whatsappChannel
                          ? `${agent.whatsappChannel.provider} ${agent.whatsappChannel.status}`
                          : 'Sin API';

                        return (
                          <TableRow key={agent.id}>
                            <TableCell>
                              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                {agent.name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {agent.baseAgentKey}
                              </div>
                            </TableCell>
                            <TableCell>{agent.tenant?.name ?? 'N/A'}</TableCell>
                            <TableCell>{agent.status}</TableCell>
                            <TableCell>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  usageActive
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {usageActive ? 'Activo' : 'Inactivo'}
                              </span>
                            </TableCell>
                            <TableCell>{agent._count.installs}</TableCell>
                            <TableCell>{agent._count.knowledge}</TableCell>
                            <TableCell>{usage}</TableCell>
                            <TableCell>{lastUsage ? formatDate(lastUsage) : '-'}</TableCell>
                            <TableCell>{apiLabel}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </section>
          <section id="reportes" className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{tr('Reportes estrategicos', 'Strategic reports')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Seguimiento a agentes mas vendidos y usuarios con mayor uso.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle>{tr('Agentes mas vendidos', 'Best-selling agents')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {topAgents.length === 0 ? (
                    <p>{tr('Sin datos de instalaciones.', 'No installation data.')}</p>
                  ) : (
                    topAgents.map((agent) => {
                      const usage = agentUsageMap.get(agent.id)?.count ?? 0;
                      return (
                        <div key={agent.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{agent.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {agent.tenant?.name ?? 'N/A'}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Uso 30d: {usage}
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">
                            {agent._count.installs} instalaciones
                          </span>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{tr('Usuarios mas activos (30d)', 'Most active users (30d)')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {activityRows.length === 0 ? (
                    <p>{tr('Sin actividad registrada.', 'No recorded activity.')}</p>
                  ) : (
                    activityRows.map((row) => (
                      <div key={row.user?.id ?? row.total} className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {row.user?.name ?? row.user?.email ?? 'Usuario'}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {row.user?.tenant?.name ?? 'Sistema'}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Ultima: {row.lastActivity ? formatDate(row.lastActivity) : '-'}
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">
                          {row.total} acciones
                        </span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{tr('Clientes con mayor recarga', 'Customers with highest recharges')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {paymentLeaders.length === 0 ? (
                    <p>{tr('Sin recargas aprobadas.', 'No approved recharges.')}</p>
                  ) : (
                    paymentLeaders.map((leader) => (
                      <div key={leader.tenantId} className="flex items-center justify-between">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {paymentTenantMap.get(leader.tenantId)?.name ?? 'Tenant'}
                        </div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">
                          {formatNumber(Number(leader._sum.amountPaid ?? 0))} USD
                        </span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{tr('Consumo por API', 'Usage by API')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {apiUsageRows.length === 0 ? (
                    <p>{tr('Sin consumo registrado.', 'No recorded usage.')}</p>
                  ) : (
                    apiUsageRows.map(([provider, count]) => (
                      <div key={provider} className="flex items-center justify-between">
                        <div className="font-semibold text-slate-900 dark:text-white">{provider}</div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">
                          {count}
                        </span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
          <section id="ajustes" className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{tr('Ajustes globales', 'Global settings')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Configura tasas, limites y datos de pago.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>{tr('Control visual del sitio', 'Site visual controls')}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Administra el hero principal, tarjetas comerciales e imagenes del sitio desde el
                  nuevo centro de media.
                </p>
                <Button asChild>
                  <Link href={`/${locale}/root/site-media`}>{tr('Abrir media del sitio', 'Open site media')}</Link>
                </Button>
              </CardContent>
            </Card>
            <RootClient
              locale={locale}
              usdToVesRate={settings?.usdToVesRate?.toString() ?? '0'}
              usdPaymentDiscountPercent={settings?.usdPaymentDiscountPercent?.toString() ?? '0'}
              tokenInputUsdPer1M={settings?.tokenInputUsdPer1M?.toString() ?? '0.40'}
              tokenOutputUsdPer1M={settings?.tokenOutputUsdPer1M?.toString() ?? '1.60'}
              tokenCachedInputUsdPer1M={settings?.tokenCachedInputUsdPer1M?.toString() ?? '0.10'}
              tokenMarkupPercent={settings?.tokenMarkupPercent?.toString() ?? '30'}
              roundingRule={(settings?.roundingRule ?? 'ONE') as 'ONE' | 'FIVE' | 'TEN'}
              kbUrlPageLimit={(settings?.kbUrlPageLimit ?? 5).toString()}
              zelleRecipientName={settings?.zelleRecipientName ?? ''}
              zelleEmail={settings?.zelleEmail ?? ''}
              zellePhone={settings?.zellePhone ?? ''}
              tenantOptions={tenants.map((tenant) => ({
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug
              }))}
            />
          </section>

          <section id="tenants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tenants</CardTitle>
              </CardHeader>
              <CardContent>
                {tenants.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">{tr('Sin tenants.', 'No tenants.')}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tr('Nombre', 'Name')}</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>{tr('Modo', 'Mode')}</TableHead>
                        <TableHead>{tr('Estado', 'Status')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenants.map((tenant) => (
                        <TableRow key={tenant.id}>
                          <TableCell>{tenant.name}</TableCell>
                          <TableCell>{tenant.slug}</TableCell>
                          <TableCell>{tenant.mode}</TableCell>
                          <TableCell>{tenant.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </section>
  );
}
