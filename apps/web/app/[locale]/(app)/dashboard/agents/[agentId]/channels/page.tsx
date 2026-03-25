import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@trends172tech/db';
import { requireAuth } from '@/lib/auth/guards';
import { resolveTenantFromUser } from '@/lib/tenant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const dynamic = 'force-dynamic';

type PageParams = {
  locale: string;
  agentId: string;
};

const channelSchema = z.object({
  agentId: z.string().min(1),
  locale: z.string().min(1),
  phoneNumber: z.string().min(3),
  provider: z.enum(['META', 'BSP']),
  webhookSecret: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED']).optional()
});

const toggleSchema = z.object({
  channelId: z.string().min(1),
  agentId: z.string().min(1),
  locale: z.string().min(1),
  status: z.enum(['ACTIVE', 'PAUSED'])
});

function resolveBaseUrl() {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) {
    return explicit;
  }
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }
  return 'http://localhost:3000';
}

async function upsertChannel(formData: FormData) {
  'use server';
  const parsed = channelSchema.safeParse({
    agentId: formData.get('agentId'),
    locale: formData.get('locale'),
    phoneNumber: formData.get('phoneNumber'),
    provider: formData.get('provider'),
    webhookSecret: formData.get('webhookSecret') || undefined,
    status: formData.get('status') || undefined
  });

  if (!parsed.success) {
    throw new Error('Invalid channel payload.');
  }

  const user = await requireAuth();
  const tenant = await resolveTenantFromUser(user);
  if (!tenant) {
    throw new Error('Tenant required.');
  }

  const agent = await prisma.agentInstance.findFirst({
    where: { id: parsed.data.agentId, tenantId: tenant.id }
  });
  if (!agent) {
    throw new Error('Agent instance not found.');
  }

  const channel = await prisma.whatsAppChannel.upsert({
    where: { agentInstanceId: agent.id },
    update: {
      phoneNumber: parsed.data.phoneNumber.trim(),
      provider: parsed.data.provider,
      status: parsed.data.status ?? 'ACTIVE',
      webhookSecret: parsed.data.webhookSecret?.trim() || null
    },
    create: {
      tenantId: tenant.id,
      agentInstanceId: agent.id,
      phoneNumber: parsed.data.phoneNumber.trim(),
      provider: parsed.data.provider,
      status: parsed.data.status ?? 'ACTIVE',
      webhookSecret: parsed.data.webhookSecret?.trim() || null
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      tenantId: tenant.id,
      action: 'whatsapp_channel_upserted',
      entity: 'whatsapp_channel',
      entityId: channel.id,
      metaJson: {
        agentInstanceId: agent.id,
        status: channel.status,
        provider: channel.provider
      }
    }
  });

  const path = `/${parsed.data.locale}/dashboard/agents/${parsed.data.agentId}/channels`;
  revalidatePath(path);
  redirect(path);
}

async function toggleChannel(formData: FormData) {
  'use server';
  const parsed = toggleSchema.safeParse({
    channelId: formData.get('channelId'),
    agentId: formData.get('agentId'),
    locale: formData.get('locale'),
    status: formData.get('status')
  });

  if (!parsed.success) {
    throw new Error('Invalid channel toggle.');
  }

  const user = await requireAuth();
  const tenant = await resolveTenantFromUser(user);
  if (!tenant) {
    throw new Error('Tenant required.');
  }

  const channel = await prisma.whatsAppChannel.findFirst({
    where: { id: parsed.data.channelId, tenantId: tenant.id }
  });

  if (!channel) {
    throw new Error('Channel not found.');
  }

  const updated = await prisma.whatsAppChannel.update({
    where: { id: channel.id },
    data: { status: parsed.data.status }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      tenantId: tenant.id,
      action: 'whatsapp_channel_status',
      entity: 'whatsapp_channel',
      entityId: updated.id,
      metaJson: { status: updated.status }
    }
  });

  const path = `/${parsed.data.locale}/dashboard/agents/${parsed.data.agentId}/channels`;
  revalidatePath(path);
  redirect(path);
}

export default async function AgentChannelsPage({ params }: { params: Promise<PageParams> }) {
  const { locale, agentId } = await params;
  const isEs = locale.startsWith('es');
  const user = await requireAuth();
  const tenant = await resolveTenantFromUser(user);

  if (!tenant) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Agent channels</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{isEs ? 'No hay tenant asignado.' : 'No tenant assigned.'}</p>
      </section>
    );
  }

  const agentInstance = await prisma.agentInstance.findFirst({
    where: { id: agentId, tenantId: tenant.id }
  });

  if (!agentInstance) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Agent channels</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{isEs ? 'Instancia de agente no encontrada.' : 'Agent instance not found.'}</p>
        <Link className="text-sm text-blue-600 hover:underline" href={`/${locale}/dashboard`}>
          {isEs ? 'Volver al panel' : 'Back to dashboard'}
        </Link>
      </section>
    );
  }

  const channel = await prisma.whatsAppChannel.findFirst({
    where: { tenantId: tenant.id, agentInstanceId: agentInstance.id }
  });

  const subscription = await prisma.subscription.findFirst({
    where: { tenantId: tenant.id, status: 'ACTIVE' },
    orderBy: { startedAt: 'desc' },
    include: { plan: true }
  });

  const limits = (subscription?.plan?.limitsJson ?? {}) as {
    whatsappEnabled?: boolean;
    maxWhatsAppMessagesPerMonth?: number;
  };

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const usageLogs = await prisma.auditLog.findMany({
    where: {
      tenantId: tenant.id,
      action: 'whatsapp_usage',
      createdAt: { gte: since }
    },
    select: { metaJson: true }
  });

  let usedMessages = 0;
  for (const log of usageLogs) {
    if (!log.metaJson || typeof log.metaJson !== 'object') {
      continue;
    }
    const meta = log.metaJson as { messages?: number };
    usedMessages += meta.messages ?? 0;
  }

  const baseUrl = resolveBaseUrl();
  const webhookUrl = `${baseUrl}/api/orchestrator/webhooks/whatsapp`;
  const selectClassName =
    'interactive-field h-11 w-full rounded-2xl border border-slate-200 bg-white/96 px-4 text-sm text-slate-900 shadow-[0_14px_35px_-28px_rgba(15,23,42,0.35)] outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200';

  return (
    <section className="space-y-6">
      <div className="interactive-panel premium-noise overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-7 shadow-[0_35px_100px_-72px_rgba(15,23,42,0.35)] sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              {isEs ? 'Entrega de canal' : 'Channel delivery'}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">WhatsApp channel</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {agentInstance.name} | {agentInstance.baseAgentKey}
              </p>
            </div>
          </div>
          <Link
            className="interactive-chip inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
            href={`/${locale}/dashboard/agents/${agentId}`}
          >
            {isEs ? 'Volver al agente' : 'Back to agent'}
          </Link>
        </div>
      </div>

      <Card className="interactive-panel">
        <CardHeader className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{isEs ? 'Endpoint webhook' : 'Webhook endpoint'}</p>
          <CardTitle>Webhook</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <Label htmlFor="webhookUrl">{isEs ? 'URL del webhook' : 'Webhook URL'}</Label>
          <Input id="webhookUrl" value={webhookUrl} readOnly />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isEs ? 'Usa esta URL en Meta Webhooks. El token de verificacion sale de WHATSAPP_VERIFY_TOKEN.' : 'Use this URL in Meta Webhooks. Verify token comes from WHATSAPP_VERIFY_TOKEN.'}
          </p>
        </CardContent>
      </Card>

      <Card className="interactive-panel">
        <CardHeader className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{isEs ? 'Uso del plan' : 'Plan usage'}</p>
          <CardTitle>{isEs ? 'Limites del plan' : 'Plan limits'}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
          <p>{isEs ? 'WhatsApp habilitado' : 'WhatsApp enabled'}: {limits.whatsappEnabled === false ? 'No' : isEs ? 'Si' : 'Yes'}</p>
          <p>
            {isEs ? 'Mensajes ultimos 30 dias' : 'Messages last 30 days'}:{' '}
            {limits.maxWhatsAppMessagesPerMonth
              ? `${usedMessages}/${limits.maxWhatsAppMessagesPerMonth}`
              : `${usedMessages}/unlimited`}
          </p>
        </CardContent>
      </Card>

      <Card className="interactive-panel">
        <CardHeader className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{isEs ? 'Configuracion del proveedor' : 'Provider setup'}</p>
          <CardTitle>Channel configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertChannel} className="space-y-4">
            <input type="hidden" name="agentId" value={agentId} />
            <input type="hidden" name="locale" value={locale} />
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">{isEs ? 'ID del numero telefonico (Meta)' : 'Phone number ID (Meta)'}</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="phone_number_id"
                defaultValue={channel?.phoneNumber ?? ''}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">{isEs ? 'Proveedor' : 'Provider'}</Label>
              <select
                id="provider"
                name="provider"
                defaultValue={channel?.provider ?? 'META'}
                className={selectClassName}
              >
                <option value="META">META</option>
                <option value="BSP">BSP</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhookSecret">Webhook secret (optional)</Label>
              <Input
                id="webhookSecret"
                name="webhookSecret"
                placeholder="signature secret"
                defaultValue={channel?.webhookSecret ?? ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">{isEs ? 'Estado' : 'Status'}</Label>
              <select
                id="status"
                name="status"
                defaultValue={channel?.status ?? 'ACTIVE'}
                className={selectClassName}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PAUSED">PAUSED</option>
              </select>
            </div>
            <Button type="submit">{isEs ? 'Guardar canal' : 'Save channel'}</Button>
          </form>
        </CardContent>
      </Card>

      {channel ? (
        <Card className="interactive-panel">
          <CardHeader className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{isEs ? 'Estado del canal' : 'Channel state'}</p>
            <CardTitle>{isEs ? 'Acciones rapidas' : 'Quick actions'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>{isEs ? 'Estado' : 'Status'}: {channel.status}</p>
            <form action={toggleChannel} className="flex items-center gap-3">
              <input type="hidden" name="channelId" value={channel.id} />
              <input type="hidden" name="agentId" value={agentId} />
              <input type="hidden" name="locale" value={locale} />
              <input
                type="hidden"
                name="status"
                value={channel.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'}
              />
              <Button type="submit" variant="outline">
                {channel.status === 'ACTIVE' ? (isEs ? 'Pausar canal' : 'Pause channel') : (isEs ? 'Activar canal' : 'Activate channel')}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Link
        className="interactive-chip inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
        href={`/${locale}/dashboard/agents/${agentId}`}
      >
        {isEs ? 'Volver al agente' : 'Back to agent'}
      </Link>
    </section>
  );
}
