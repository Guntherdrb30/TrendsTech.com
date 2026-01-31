import { NextResponse } from 'next/server';

import { prisma } from '@trends172tech/db';
import { matchAllowedDomains, normalizeDomain } from '@/lib/domains';

const CHANNEL = 'widget';
const EVENT = 'widget_bootstrap';

function resolveDomain(request: Request) {
  const origin = request.headers.get('origin');
  if (origin) {
    return normalizeDomain(origin);
  }
  const host = request.headers.get('host');
  if (host) {
    return normalizeDomain(host);
  }
  const referer = request.headers.get('referer');
  if (referer) {
    return normalizeDomain(referer);
  }
  return null;
}

function buildError(code: string, message: string, status = 400) {
  return NextResponse.json(
    { ok: false, code, error: message },
    {
      status,
      headers: {
        'Cache-Control': 'no-store'
      }
    }
  );
}

async function logBootstrap({
  tenantId,
  agentInstanceId,
  agentAccessId,
  domain,
  meta,
  status
}: {
  tenantId: string;
  agentInstanceId: string;
  agentAccessId: string;
  domain: string | null;
  meta: Record<string, unknown>;
  status: 'ok' | 'denied';
}) {
  await prisma.accessLog.create({
    data: {
      tenantId,
      agentInstanceId,
      agentAccessId,
      domain,
      channel: CHANNEL,
      event: EVENT,
      status,
      metaJson: meta
    }
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const installId = url.searchParams.get('installId')?.trim();
  if (!installId) {
    return buildError('missing_install_id', 'installId query parameter is required', 400);
  }

  const domain = resolveDomain(request);
  if (!domain) {
    return buildError('missing_domain', 'Origin, host or referer header required', 400);
  }

  const install = await prisma.install.findFirst({
    where: {
      publicKey: installId,
      status: 'ACTIVE'
    },
    include: {
      agentInstance: {
        select: {
          id: true,
          tenantId: true
        }
      }
    }
  });

  if (!install || !install.agentInstance) {
    return buildError('install_not_found', 'Install not found', 404);
  }

  const accesses = await prisma.agentAccess.findMany({
    where: {
      agentId: install.agentInstance.id,
      isActive: true
    }
  });

  const access = accesses.find((item) => matchAllowedDomains(domain, item.allowedDomains));
  if (!access) {
    return buildError('domain_not_allowed', 'Domain is not allowed for this widget', 403);
  }

  await logBootstrap({
    tenantId: install.agentInstance.tenantId,
    agentInstanceId: install.agentInstance.id,
    agentAccessId: access.id,
    domain,
    status: 'ok',
    meta: { installId }
  });

  return NextResponse.json({
    ok: true,
    channel: CHANNEL,
    accessId: access.id,
    agentId: access.agentId
  });
}
