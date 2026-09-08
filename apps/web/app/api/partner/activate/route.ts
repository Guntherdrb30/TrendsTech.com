import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@trends172tech/db';
import { auth } from '@/lib/auth/auth';
import { AuthError, requireAuth } from '@/lib/auth/guards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  currentPassword: z.string().min(12).max(128),
  newPassword: z.string().min(12).max(128)
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== 'PARTNER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (!user.emailVerified) return NextResponse.json({ error: 'Debes verificar tu correo primero.' }, { status: 403 });

    const payload = schema.parse(await request.json());
    if (payload.currentPassword === payload.newPassword) return NextResponse.json({ error: 'La nueva clave debe ser diferente.' }, { status: 400 });

    const rows = await prisma.$queryRaw<Array<{ id: string; status: string }>>`
      SELECT "id", "status" FROM "Partner" WHERE "userId" = ${user.id} LIMIT 1
    `;
    const partner = rows[0];
    if (!partner) return NextResponse.json({ error: 'Perfil de aliado no encontrado.' }, { status: 404 });
    if (partner.status === 'SUSPENDED') return NextResponse.json({ error: 'Acceso suspendido.' }, { status: 403 });

    await auth.api.changePassword({
      body: { currentPassword: payload.currentPassword, newPassword: payload.newPassword, revokeOtherSessions: true },
      headers: request.headers
    });

    await prisma.$executeRaw`
      UPDATE "Partner" SET "status" = 'ACTIVE', "updatedAt" = NOW()
      WHERE "id" = ${partner.id} AND "userId" = ${user.id}
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'La clave debe tener entre 12 y 128 caracteres.' }, { status: 400 });
    return NextResponse.json({ error: 'No fue posible activar el acceso.' }, { status: 500 });
  }
}
