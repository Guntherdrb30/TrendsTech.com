import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { extractDomainFromRequest, isDomainAllowed, normalizeDomain } from '@/lib/installs/domain';

function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin'
  };
}

function mapLanguage(value?: string | null) {
  if (!value) {
    return null;
  }
  return value.toLowerCase() === 'en' ? 'en' : 'es';
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function GET(request: Request) {
  const origin = request.headers.get('origin');
  const headers = corsHeaders(origin);

  try {
    const url = new URL(request.url);
    const installId = url.searchParams.get('installId');
    const domainParam = url.searchParams.get('domain');

    if (!installId) {
      return NextResponse.json({ valid: false, error: 'installId is required' }, { status: 400, headers });
    }

    const install = await prisma.install.findFirst({
      where: { publicKey: installId, status: 'ACTIVE' },
      include: { agentInstance: true }
    });

    if (!install) {
      return NextResponse.json({ valid: false, error: 'Install not found' }, { status: 404, headers });
    }

    const domain = normalizeDomain(domainParam) ?? extractDomainFromRequest(request);
    if (!domain) {
      return NextResponse.json({ valid: false, error: 'Domain is required' }, { status: 400, headers });
    }

    if (!isDomainAllowed(install.allowedDomains, domain)) {
      return NextResponse.json({ valid: false, error: 'Domain not allowed' }, { status: 403, headers });
    }

    return NextResponse.json(
      {
        valid: true,
        branding: (install.agentInstance.brandingJson as Record<string, unknown>) ?? {},
        features: (install.agentInstance.featuresJson as Record<string, unknown>) ?? {},
        language: mapLanguage(install.agentInstance.languageDefault)
      },
      { headers }
    );
  } catch {
    return NextResponse.json({ valid: false, error: 'Unexpected error' }, { status: 500, headers });
  }
}
