import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { prisma } from '@trends172tech/db';
import { runOrchestrator } from '@/lib/orchestrator/engine';

export const runtime = 'nodejs';

const FALLBACK_LIMIT_REPLY =
  'Este canal esta temporalmente inactivo. Deseas que un asesor te contacte?';

type WhatsAppWebhookPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        metadata?: {
          phone_number_id?: string;
          display_phone_number?: string;
        };
        contacts?: Array<{
          wa_id?: string;
          profile?: { name?: string };
        }>;
        messages?: Array<{
          from?: string;
          id?: string;
          timestamp?: string;
          type?: string;
          text?: { body?: string };
        }>;
      };
    }>;
  }>;
};

function getVerifyToken() {
  return process.env.WHATSAPP_VERIFY_TOKEN ?? '';
}

function getAccessToken() {
  return process.env.WHATSAPP_ACCESS_TOKEN ?? '';
}

function getWebhookSecret() {
  return process.env.WHATSAPP_WEBHOOK_SECRET ?? process.env.WHATSAPP_APP_SECRET ?? '';
}

function verifySignature(signature: string | null, secret: string, rawBody: string) {
  if (!signature || !signature.startsWith('sha256=')) {
    return false;
  }

  const hash = createHmac('sha256', secret).update(rawBody).digest('hex');
  const expected = `sha256=${hash}`;
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, signatureBuffer);
}

async function resolveActorUserId(tenantId: string) {
  const tenantUser = await prisma.user.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'asc' },
    select: { id: true }
  });

  if (tenantUser) {
    return tenantUser.id;
  }

  const rootUser = await prisma.user.findFirst({
    where: { role: 'ROOT' },
    orderBy: { createdAt: 'asc' },
    select: { id: true }
  });

  return rootUser?.id ?? null;
}

async function enforceWhatsAppLimits(tenantId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: { tenantId, status: 'ACTIVE' },
    orderBy: { startedAt: 'desc' },
    include: { plan: true }
  });

  if (!subscription?.plan) {
    return { allowed: false, reason: 'No active subscription.' };
  }

  const limits = (subscription.plan.limitsJson ?? {}) as {
    whatsappEnabled?: boolean;
    maxWhatsAppMessagesPerMonth?: number;
  };

  if (limits.whatsappEnabled === false) {
    return { allowed: false, reason: 'WhatsApp disabled for plan.' };
  }

  if (!limits.maxWhatsAppMessagesPerMonth) {
    return { allowed: true };
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const usageLogs = await prisma.auditLog.findMany({
    where: {
      tenantId,
      action: 'whatsapp_usage',
      createdAt: { gte: since }
    },
    select: { metaJson: true }
  });

  let messageCount = 0;
  for (const log of usageLogs) {
    if (!log.metaJson || typeof log.metaJson !== 'object') {
      continue;
    }
    const meta = log.metaJson as { messages?: number };
    messageCount += meta.messages ?? 0;
  }

  if (messageCount >= limits.maxWhatsAppMessagesPerMonth) {
    return { allowed: false, reason: 'WhatsApp message limit reached.' };
  }

  return { allowed: true };
}

async function logWhatsAppUsage({
  actorUserId,
  tenantId,
  channelId,
  sessionId,
  messages,
  blocked
}: {
  actorUserId: string;
  tenantId: string;
  channelId: string;
  sessionId: string;
  messages: number;
  blocked?: boolean;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId,
      tenantId,
      action: 'whatsapp_usage',
      entity: 'whatsapp_channel',
      entityId: channelId,
      metaJson: { sessionId, messages, blocked: blocked ?? false }
    }
  });
}

async function logWhatsAppMessage({
  actorUserId,
  tenantId,
  channelId,
  direction,
  from,
  to,
  message,
  sessionId
}: {
  actorUserId: string;
  tenantId: string;
  channelId: string;
  direction: 'inbound' | 'outbound';
  from: string;
  to: string;
  message: string;
  sessionId: string;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId,
      tenantId,
      action: direction === 'inbound' ? 'whatsapp_inbound' : 'whatsapp_outbound',
      entity: 'whatsapp_channel',
      entityId: channelId,
      metaJson: { sessionId, from, to, message }
    }
  });
}

async function sendWhatsAppMessage({
  phoneNumberId,
  to,
  body
}: {
  phoneNumberId: string;
  to: string;
  body: string;
}) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('WHATSAPP_ACCESS_TOKEN is not configured.');
  }

  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body }
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`WhatsApp send failed: ${response.status} ${text}`);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token && token === getVerifyToken()) {
    return new NextResponse(challenge ?? '', { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
  const signature = request.headers.get('x-hub-signature-256');
  const rawBody = await request.text();

  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WhatsAppWebhookPayload;
  } catch (error) {
    console.error('WhatsApp webhook invalid JSON', error);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const entry = payload.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const metadata = value?.metadata;
  const phoneNumberId = metadata?.phone_number_id ?? null;
  const displayPhoneNumber = metadata?.display_phone_number ?? null;

  if (!phoneNumberId && !displayPhoneNumber) {
    return NextResponse.json({ ok: true });
  }

  const channel = await prisma.whatsAppChannel.findFirst({
    where: {
      OR: [
        phoneNumberId ? { phoneNumber: phoneNumberId } : undefined,
        displayPhoneNumber ? { phoneNumber: displayPhoneNumber } : undefined
      ].filter(Boolean) as { phoneNumber: string }[]
    },
    include: { agentInstance: true }
  });

  if (!channel) {
    return NextResponse.json({ ok: true });
  }

  const secret = channel.webhookSecret || getWebhookSecret();
  if (!secret || !verifySignature(signature, secret, rawBody)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (channel.status !== 'ACTIVE') {
    return NextResponse.json({ ok: true });
  }

  const actorUserId = await resolveActorUserId(channel.tenantId);
  if (!actorUserId) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const messages = value?.messages ?? [];
  const contacts = value?.contacts ?? [];
  const contact = contacts[0];

  for (const message of messages) {
    if (!message?.text?.body || message.type !== 'text') {
      continue;
    }

    const from = message.from ?? '';
    if (!from) {
      continue;
    }

    const normalizedPhone = from.startsWith('+') ? from : `+${from}`;
    const sessionId = `wa_${normalizedPhone}`;
    const messageText = message.text.body.trim();

    await logWhatsAppMessage({
      actorUserId,
      tenantId: channel.tenantId,
      channelId: channel.id,
      direction: 'inbound',
      from: normalizedPhone,
      to: phoneNumberId ?? displayPhoneNumber ?? channel.phoneNumber,
      message: messageText,
      sessionId
    });

    const limitCheck = await enforceWhatsAppLimits(channel.tenantId);
    if (!limitCheck.allowed) {
      await logWhatsAppUsage({
        actorUserId,
        tenantId: channel.tenantId,
        channelId: channel.id,
        sessionId,
        messages: 1,
        blocked: true
      });

      try {
        await sendWhatsAppMessage({
          phoneNumberId: channel.phoneNumber,
          to: normalizedPhone,
          body: FALLBACK_LIMIT_REPLY
        });
        await logWhatsAppMessage({
          actorUserId,
          tenantId: channel.tenantId,
          channelId: channel.id,
          direction: 'outbound',
          from: channel.phoneNumber,
          to: normalizedPhone,
          message: FALLBACK_LIMIT_REPLY,
          sessionId
        });
      } catch (error) {
        console.error('WhatsApp fallback send failed', error);
      }
      continue;
    }

    const response = await runOrchestrator(
      {
        agentInstanceId: channel.agentInstanceId,
        sessionId,
        message: messageText,
        channel: 'whatsapp',
        endUser: {
          phone: normalizedPhone,
          name: contact?.profile?.name
        }
      },
      actorUserId,
      channel.tenantId
    );

    await logWhatsAppUsage({
      actorUserId,
      tenantId: channel.tenantId,
      channelId: channel.id,
      sessionId,
      messages: 1
    });

    try {
      await sendWhatsAppMessage({
        phoneNumberId: channel.phoneNumber,
        to: normalizedPhone,
        body: response.reply
      });
      await logWhatsAppMessage({
        actorUserId,
        tenantId: channel.tenantId,
        channelId: channel.id,
        direction: 'outbound',
        from: channel.phoneNumber,
        to: normalizedPhone,
        message: response.reply,
        sessionId
      });
    } catch (error) {
      console.error('WhatsApp send failed', error);
    }
  }

  return NextResponse.json({ ok: true });
}
