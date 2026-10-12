import { assertControlPreviewReady, isControlPreviewReady } from '@/lib/luna-ai-control/preview-isolation';
import { requireRootPage } from '@/lib/luna-ai-control/root-page';
import InstallationControls from './installation-controls';
import RequestInstallation from './request-installation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { prisma } from '@trends172tech/db';
import { requireRole } from '@/lib/auth/guards';
import { transitionInstallation, type InstallationAction, type InstallationState } from '@trends172tech/core/src/luna-ai-control/installations';

export const dynamic = 'force-dynamic';

async function changeStatus(formData: FormData) {
  'use server';
  const actor = await requireRole('ROOT');
  assertControlPreviewReady();
  const id = String(formData.get('id') ?? '');
  const action = String(formData.get('action') ?? '') as InstallationAction;
  const reason = String(formData.get('reason') ?? '').trim() || undefined;
  const locale = String(formData.get('locale') ?? 'es');
  if (!/^[a-zA-Z0-9_-]{5,64}$/.test(id)) throw new Error('Invalid installation');
  if (!['approve', 'reject', 'activate', 'suspend', 'resume', 'revoke'].includes(action)) throw new Error('Invalid action');

  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "AiControlInstallation" WHERE "id" = ${id} FOR UPDATE`;
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

const actionLabels: Record<string, string> = { approve: 'Aprobar', reject: 'Rechazar', activate: 'Activar', suspend: 'Suspender', resume: 'Reanudar', revoke: 'Revocar' };
const stateLabels: Record<string, string> = { REQUESTED: 'Pendiente', APPROVED: 'Aprobada', REJECTED: 'Rechazada', ACTIVE: 'Activa', SUSPENDED: 'Suspendida', REVOKED: 'Revocada' };

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
  await requireRootPage(locale);
  if (!isControlPreviewReady()) return <div className="space-y-4 rounded-xl border p-6"><h1 className="text-2xl font-semibold">LUNA AI Control Center — Preview</h1><p>El código está desplegado. La operación con datos espera una base de pruebas aislada; el Preview actual comparte configuración con producción.</p><Link href={`/${locale}/root/luna-ai-control/security`} className="underline">Ver controles de seguridad</Link><br/><Link href={`/${locale}/root/luna-installer`} className="underline">Ver flujo del instalador</Link></div>;
  const [installs, pending, active, suspended, tenants] = await Promise.all([
    prisma.aiControlInstallation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { tenant: { select: { name: true } }, credentials: { select: { id: true, keyPrefix: true, revokedAt: true } }, gatewayPolicy: true, auditEvents: { orderBy: { createdAt: 'desc' }, take: 10 } },
    }),
    prisma.aiControlInstallation.count({ where: { status: 'REQUESTED' } }),
    prisma.aiControlInstallation.count({ where: { status: 'ACTIVE' } }),
    prisma.aiControlInstallation.count({ where: { status: 'SUSPENDED' } }),
    prisma.tenant.findMany({ select: { id: true, name: true }, take: 100, orderBy: { name: 'asc' } }),
  ]);
  return (
    <div className="space-y-6">
      <Link href={`/${locale}/root`} className="text-sm underline">← Administración ROOT</Link>
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">LUNA AI Control Center</h1>
        <p className="text-sm text-muted-foreground">Solicitudes, aprobación ROOT, credenciales, políticas de acceso y telemetría de instalaciones.</p>
      </header>
      <RequestInstallation tenants={tenants} />
      <div className="flex flex-wrap gap-3"><Link href={`/${locale}/root/luna-installer`} className="rounded-lg border px-4 py-2 text-sm">Auto Installer →</Link><Link href={`/${locale}/root/luna-ai-control/security`} className="rounded-lg border px-4 py-2 text-sm">Security Gateway →</Link><Link href={`/${locale}/root/luna-ai-control/activity`} className="rounded-lg border px-4 py-2 text-sm">Actividad e historial →</Link></div>
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
              <span className="rounded-full border px-3 py-1 text-xs">{stateLabels[item.status]}</span>
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
                    <button type="submit" className="rounded-md border px-3 py-2 text-sm hover:bg-muted">{actionLabels[action]}</button>
                  </form>
                ))}
              </div>
            )}
            <InstallationControls id={item.id} credentials={item.credentials.map(c => ({ id: c.id, keyPrefix: c.keyPrefix, revokedAt: !!c.revokedAt }))} policy={item.gatewayPolicy} />
            <details className="text-sm"><summary>Historial de autorización</summary>{item.auditEvents.map(e => <p key={e.id}>{e.createdAt.toISOString()} · {e.action} · {e.nextStatus} · {e.reason}</p>)}</details>
          </article>
        ))}
      </section>
    </div>
  );
}
