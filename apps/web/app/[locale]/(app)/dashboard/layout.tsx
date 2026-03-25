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
  const isEs = locale.startsWith('es');
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
  const navItemClass =
    'interactive-chip rounded-[22px] border border-black/6 bg-white/88 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200';

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr] xl:gap-8">
      <aside className="space-y-6">
        <div className="interactive-panel premium-noise overflow-hidden rounded-[32px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-[0_35px_100px_-70px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[18px] bg-slate-950 text-sm font-semibold text-white shadow-[0_20px_45px_-24px_rgba(15,23,42,0.5)]">
              {profile?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatarUrl} alt={isEs ? 'Perfil' : 'Profile'} className="h-full w-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div>
              <p className="text-base font-semibold tracking-[-0.02em] text-slate-900 dark:text-white">
                {profile?.name ?? (isEs ? 'Usuario' : 'User')}
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{profile?.role}</p>
            </div>
          </div>
          <div className="mt-5 space-y-2 rounded-[24px] border border-black/6 bg-white/88 px-4 py-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300">
            <p>
              <span className="font-semibold text-slate-900 dark:text-white">{isEs ? 'Correo' : 'Email'}:</span>{' '}
              {profile?.email}
            </p>
            <p>
              <span className="font-semibold text-slate-900 dark:text-white">{isEs ? 'Telefono' : 'Phone'}:</span>{' '}
              {profile?.phone ?? (isEs ? 'Sin configurar' : 'Not set')}
            </p>
          </div>
          <Link
            href={`/${locale}/dashboard/profile`}
            className="interactive-chip mt-5 inline-flex rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-semibold text-slate-900 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/60 dark:text-white"
          >
            {isEs ? 'Editar perfil' : 'Edit profile'}
          </Link>
        </div>

        <div className="interactive-panel rounded-[32px] border border-black/8 bg-white/92 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.32)] dark:border-slate-800 dark:bg-slate-950/70">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {isEs ? 'Navegacion' : 'Navigation'}
          </p>
          <nav className="mt-4 flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
            <Link href={`/${locale}/dashboard`} className={navItemClass}>
              {isEs ? 'Resumen' : 'Overview'}
            </Link>
            {(profile?.role === 'TENANT_ADMIN' || profile?.role === 'ROOT') && (
              <Link href={`/${locale}/dashboard/users`} className={navItemClass}>
                {isEs ? 'Usuarios' : 'Users'}
              </Link>
            )}
            {(profile?.role === 'TENANT_ADMIN' || profile?.role === 'ROOT') && (
              <Link href={`/${locale}/dashboard/site-media`} className={navItemClass}>
                {isEs ? 'Media del sitio' : 'Site media'}
              </Link>
            )}
            <Link href={`/${locale}/dashboard/agents/luna-code-orchestrator`} className={navItemClass}>
              Luna Code
            </Link>
            <Link href={`/${locale}/dashboard/installs`} className={navItemClass}>
              {isEs ? 'Instalaciones' : 'Installs'}
            </Link>
          </nav>
        </div>

        <div className="interactive-panel rounded-[32px] border border-black/8 bg-white/92 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.32)] dark:border-slate-800 dark:bg-slate-950/70">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {isEs ? 'Agentes contratados' : 'Contracted agents'}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">
            {activeAgents.length} activos
          </p>
          <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {activeAgents.length === 0 ? (
              <p>{isEs ? 'No hay agentes activos todavia.' : 'No active agents yet.'}</p>
            ) : (
              activeAgents.slice(0, 5).map((agent) => (
                <div
                  key={agent.id}
                  className="interactive-panel flex items-center justify-between rounded-[20px] border border-black/6 bg-white/88 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/50"
                >
                  <span>{agent.name}</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    {isEs ? 'ACTIVO' : 'ACTIVE'}
                  </span>
                </div>
              ))
            )}
            {activeAgents.length > 5 ? (
              <p className="text-[11px] text-slate-400">+{activeAgents.length - 5} {isEs ? 'mas' : 'more'}</p>
            ) : null}
          </div>
        </div>

        {tenant ? (
          <div className="interactive-panel rounded-[32px] border border-black/8 bg-slate-950 p-6 text-xs text-slate-300 shadow-[0_30px_80px_-52px_rgba(15,23,42,0.55)] dark:border-slate-700">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Tenant</p>
            <p className="mt-3 text-lg font-semibold text-white">{tenant.name}</p>
            <p className="mt-2 text-slate-300">{isEs ? 'Modo' : 'Mode'}: {tenant.mode}</p>
          </div>
        ) : null}
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
