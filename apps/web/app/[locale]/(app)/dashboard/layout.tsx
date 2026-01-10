import Link from 'next/link';
import { prisma } from '@trends172tech/db';
import { requireAuth } from '@/lib/auth/guards';
import { resolveTenantFromUser } from '@/lib/tenant';

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || '';
  if (!source) {
    return 'U';
  }
  const parts = source.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join('');
}

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireAuth();
  const tenant = await resolveTenantFromUser(user);

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      role: true
    }
  });

  const agentInstances = tenant
    ? await prisma.agentInstance.findMany({
        where: { tenantId: tenant.id },
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, status: true }
      })
    : [];

  const activeAgents = agentInstances.filter((agent) => agent.status === 'ACTIVE');
  const initials = getInitials(profile?.name, profile?.email);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-sm font-semibold text-white">
              {profile?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {profile?.name ?? 'User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{profile?.role}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <p>
              <span className="font-semibold text-slate-900 dark:text-white">Email:</span>{' '}
              {profile?.email}
            </p>
            <p>
              <span className="font-semibold text-slate-900 dark:text-white">Phone:</span>{' '}
              {profile?.phone ?? 'Not set'}
            </p>
          </div>
          <Link
            href={`/${locale}/dashboard/profile`}
            className="mt-4 inline-flex text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
          >
            Edit profile
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Navigation
          </p>
          <nav className="mt-3 flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Link href={`/${locale}/dashboard`} className="hover:text-slate-900 dark:hover:text-white">
              Overview
            </Link>
            {(profile?.role === 'TENANT_ADMIN' || profile?.role === 'ROOT') && (
              <Link
                href={`/${locale}/dashboard/users`}
                className="hover:text-slate-900 dark:hover:text-white"
              >
                Users
              </Link>
            )}
            <Link
              href={`/${locale}/dashboard/installs`}
              className="hover:text-slate-900 dark:hover:text-white"
            >
              Installs
            </Link>
          </nav>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Agentes contratados
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
            {activeAgents.length} activos
          </p>
          <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {activeAgents.length === 0 ? (
              <p>No active agents yet.</p>
            ) : (
              activeAgents.slice(0, 5).map((agent) => (
                <div key={agent.id} className="flex items-center justify-between">
                  <span>{agent.name}</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    ACTIVE
                  </span>
                </div>
              ))
            )}
            {activeAgents.length > 5 ? (
              <p className="text-[11px] text-slate-400">+{activeAgents.length - 5} more</p>
            ) : null}
          </div>
        </div>

        {tenant ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 text-xs text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">{tenant.name}</p>
            <p className="mt-2">Mode: {tenant.mode}</p>
          </div>
        ) : null}
      </aside>

      <div>{children}</div>
    </div>
  );
}
