import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import { prisma } from '@trends172tech/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const requestSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(190),
  password: z.string().min(8).max(72),
  company: z.string().min(2).max(120),
  phone: z.string().min(4).max(40).optional()
});

function slugify(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return normalized || 'tenant';
}

async function ensureUniqueSlug(base: string) {
  let slug = base;
  let suffix = 1;
  while (await prisma.tenant.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}

export async function POST(request: Request) {
  const requireHumanCheck = Boolean(process.env.TURNSTILE_SECRET_KEY);
  if (requireHumanCheck) {
    const humanCookie = request.headers.get('cookie') ?? '';
    if (!humanCookie.includes('human_verified=1')) {
      return NextResponse.json(
        { error: 'Human verification required.' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      );
    }
  }

  let payload: z.infer<typeof requestSchema>;
  try {
    payload = requestSchema.parse(await request.json());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid payload.';
    return NextResponse.json(
      { error: message },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const email = payload.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: 'Email already exists.' },
      { status: 409, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const passwordHash = await hash(payload.password, 10);
  const baseSlug = slugify(payload.company);
  const slug = await ensureUniqueSlug(baseSlug);

  await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: payload.company.trim(),
        slug
      }
    });

    await tx.tokenWallet.create({
      data: {
        tenantId: tenant.id,
        balance: 0
      }
    });

    await tx.agentInstance.create({
      data: {
        tenantId: tenant.id,
        name: 'Creador de agentes',
        baseAgentKey: 'agent_creator',
        languageDefault: 'ES',
        status: 'ACTIVE'
      }
    });

    await tx.user.create({
      data: {
        tenantId: tenant.id,
        name: payload.name.trim(),
        email,
        role: 'TENANT_ADMIN',
        passwordHash,
        phone: payload.phone?.trim() || null
      }
    });
  });

  return NextResponse.json(
    { ok: true },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
