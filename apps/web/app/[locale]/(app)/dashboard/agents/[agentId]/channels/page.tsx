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
  const user = await requireAuth();
  const tenant = await resolveTenantFromUser(user);

  if (!tenant) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Agent channels</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">No tenant assigned.</p>
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
        <p className="text-sm text-slate-500 dark:text-slate-400">Agent instance not found.</p>
        <Link className="text-sm text-blue-600 hover:underline" href={`/${locale}/dashboard`}>
          Back to dashboard
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

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">WhatsApp channel</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {agentInstance.name} | {agentInstance.baseAgentKey}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Webhook</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <Label htmlFor="webhookUrl">Webhook URL</Label>
          <Input id="webhookUrl" value={webhookUrl} readOnly />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Use this URL in Meta Webhooks. Verify token comes from WHATSAPP_VERIFY_TOKEN.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan limits</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
          <p>WhatsApp enabled: {limits.whatsappEnabled === false ? 'No' : 'Yes'}</p>
          <p>
            Messages last 30 days:{' '}
            {limits.maxWhatsAppMessagesPerMonth
              ? `${usedMessages}/${limits.maxWhatsAppMessagesPerMonth}`
              : `${usedMessages}/unlimited`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Channel configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertChannel} className="space-y-4">
            <input type="hidden" name="agentId" value={agentId} />
            <input type="hidden" name="locale" value={locale} />
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone number ID (Meta)</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="phone_number_id"
                defaultValue={channel?.phoneNumber ?? ''}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <select
                id="provider"
                name="provider"
                defaultValue={channel?.provider ?? 'META'}
                className="w-full rounded border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
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
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={channel?.status ?? 'ACTIVE'}
                className="w-full rounded border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PAUSED">PAUSED</option>
              </select>
            </div>
            <Button type="submit">Save channel</Button>
          </form>
        </CardContent>
      </Card>

      {channel ? (
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>Status: {channel.status}</p>
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
                {channel.status === 'ACTIVE' ? 'Pause channel' : 'Activate channel'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Link className="text-sm text-blue-600 hover:underline" href={`/${locale}/dashboard/agents/${agentId}`}>
        Back to agent
      </Link>
    </section>
  );
}
