import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { z } from 'zod';
import { runOrchestrator } from '@/lib/orchestrator/engine';
import { AuthError, requireAuth } from '@/lib/auth/guards';
import { extractDomainFromRequest, isDomainAllowed, normalizeDomain } from '@/lib/installs/domain';

const internalSchema = z.object({
  agentInstanceId: z.string().min(1),
  sessionId: z.string().min(1),
  message: z.string().min(1).max(4000),
  channel: z.string().optional(),
  language: z.enum(['es', 'en']).optional(),
  pageUrl: z.string().url().optional(),
  endUser: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional()
    })
    .optional()
});

const widgetSchema = z.object({
  installId: z.string().min(1),
  sessionId: z.string().min(1),
  message: z.string().min(1).max(4000),
  channel: z.string().optional(),
  language: z.enum(['es', 'en']).optional(),
  pageUrl: z.string().url().optional(),
  endUser: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional()
    })
    .optional()
});

function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin'
  };
}

function handleError(error: unknown, headers?: Record<string, string>) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status, headers });
  }

  return NextResponse.json({ error: 'Unexpected error' }, { status: 500, headers });
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const headers = corsHeaders(origin);

  try {
    const body = await request.json();
    const widgetParsed = widgetSchema.safeParse(body);
    const internalParsed = internalSchema.safeParse(body);

    if (!widgetParsed.success && !internalParsed.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400, headers });
    }

    if (widgetParsed.success) {
      const headers = corsHeaders(origin);
      const domain = normalizeDomain(body?.domain) ?? extractDomainFromRequest(request) ?? normalizeDomain(body?.pageUrl);

      const install = await prisma.install.findFirst({
        where: { publicKey: widgetParsed.data.installId, status: 'ACTIVE' },
        include: { agentInstance: true }
      });

      if (!install) {
        return NextResponse.json({ error: 'Install not found' }, { status: 404, headers });
      }

      if (!domain || !isDomainAllowed(install.allowedDomains, domain)) {
        return NextResponse.json({ error: 'Domain not allowed' }, { status: 403, headers });
      }

      const actorUser = await prisma.user.findFirst({
        where: { tenantId: install.tenantId },
        orderBy: { createdAt: 'asc' },
        select: { id: true }
      });

      if (!actorUser) {
        return NextResponse.json({ error: 'Tenant user not found' }, { status: 404, headers });
      }

      const response = await runOrchestrator(
        {
          agentInstanceId: install.agentInstanceId,
          sessionId: widgetParsed.data.sessionId,
          message: widgetParsed.data.message,
          channel: widgetParsed.data.channel ?? 'web',
          endUser: widgetParsed.data.endUser
        },
        actorUser.id,
        install.tenantId
      );

      return NextResponse.json(response, { headers });
    }

    const user = await requireAuth();
    if (!user.tenantId) {
      return NextResponse.json({ error: 'Tenant required' }, { status: 403, headers });
    }

    if (!internalParsed.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }

    const response = await runOrchestrator(internalParsed.data, user.id, user.tenantId);
    return NextResponse.json(response, { headers });
  } catch (error) {
    return handleError(error, headers);
  }
}
