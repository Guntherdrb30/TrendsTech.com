import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { prisma } from '@trends172tech/db';
import { requireRole } from '@/lib/auth/guards';
import { transitionInstallation, type InstallationAction, type InstallationState } from '@trends172tech/core/src/luna-ai-control/installations';

export const dynamic = 'force-dynamic';

async function changeStatus(formData: FormData) {
  'use server';
  const actor = await requireRole('ROOT');
  const id = String(formData.get('id') ?? '');
  const action = String(formData.get('action') ?? '') as InstallationAction;
  const reason = String(formData.get('reason') ?? '').trim() || undefined;
  const locale = String(formData.get('locale') ?? 'es');
  if (!/^[a-zA-Z0-9_-]{5,64}$/.test(id)) throw new Error('Invalid installation');
  if (!['approve', 'reject', 'activate', 'suspend', 'resume', 'revoke'].includes(action)) throw new Error('Invalid action');

  await prisma.$transaction(async (tx) => {
    const installation = await tx.aiControlInstallation.findUnique({ where: { id } });
    if (!installation) throw new Error('Installation not found');
    const change = transitionInstallation(
      installation.status as InstallationState,
      action,
      { id: actor.id, role: 'ROOT' },
      reason,
    );
    const result = await tx.aiControlInstallation.updateMany({
      where: { id, status: change.previous },
      data: {
        status: change.next,
        reviewedByUserId: actor.id,
        reviewedAt: new Date(change.at),
        reviewReason: change.reason ?? null,
      },
    });
    if (result.count !== 1) throw new Error('Installation state changed; retry');
    await tx.aiControlInstallationAudit.create({
      data: {
        installationId: id, actorUserId: actor.id, action,
        previousStatus: change.previous, nextStatus: change.next, reason: change.reason,
      },
    });
  });
  revalidatePath(`/${locale}/root/luna-ai-control`);
}

const actions: Record<string, InstallationAction[]> = {
  REQUESTED: ['approve', 'reject'],
  APPROVED: ['activate', 'revoke'],
  ACTIVE: ['suspend', 'revoke'],
  SUSPENDED: ['resume', 'revoke'],
  REJECTED: [],
  REVOKED: [],
};

export default async function LunaAiControlRoot({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireRole('ROOT');
  const [installs, pending, active, suspended] = await Promise.all([
    prisma.aiControlInstallation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { tenant: { select: { name: true } } },
    }),
    prisma.aiControlInstallation.count({ where: { status: 'REQUESTED' } }),
    prisma.aiControlInstallation.count({ where: { status: 'ACTIVE' } }),
    prisma.aiControlInstallation.count({ where: { status: 'SUSPENDED' } }),
  ]);
  return (
    <div className="space-y-6">
      <Link href={`/${locale}/root`} className="text-sm underline">← Administración ROOT</Link>
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">LUNA AI Control Center</h1>
        <p className="text-sm text-muted-foreground">Control maestro de instalaciones. Las licencias y credenciales se incorporarán en la siguiente fase.</p>
      </header>
      <div className="flex flex-wrap gap-3"><Link href={`/${locale}/root/luna-ai-control/security`} className="rounded-lg border px-4 py-2 text-sm">Security Gateway →</Link><Link href="/api/luna-ai-control/activity?days=30" className="rounded-lg border px-4 py-2 text-sm">Actividad y consumo (JSON) →</Link></div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[['Pendientes',pending],['Activas',active],['Suspendidas',suspended]].map(([name,value])=>(
          <div key={name} className="rounded-xl border p-4"><p className="text-sm text-muted-foreground">{name}</p><p className="text-3xl font-semibold">{value}</p></div>
        ))}
      </div>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Solicitudes e instalaciones</h2>
        {installs.length === 0 && <p className="rounded-xl border p-5 text-sm">Todavía no hay solicitudes registradas.</p>}
        {installs.map((item)=>(
          <article key={item.id} className="rounded-xl border p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.tenant.name} · {item.applicationKey} · {item.environment}</p>
                {item.domain && <p className="text-xs text-muted-foreground">{item.domain}</p>}
              </div>
              <span className="rounded-full border px-3 py-1 text-xs">{item.status}</span>
            </div>
            {actions[item.status]?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {actions[item.status].map((action)=>(
                  <form action={changeStatus} key={action} className="flex flex-wrap gap-2 items-center">
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="action" value={action} />
                    {['reject','suspend','revoke'].includes(action) && (
                      <input name="reason" required maxLength={1000} placeholder="Motivo obligatorio" aria-label="Motivo" className="rounded-md border bg-transparent px-3 py-2 text-sm" />
                    )}
                    <button type="submit" className="rounded-md border px-3 py-2 text-sm hover:bg-muted">{action}</button>
                  </form>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
