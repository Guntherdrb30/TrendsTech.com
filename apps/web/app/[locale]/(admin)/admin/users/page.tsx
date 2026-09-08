import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@trends172tech/db';
import { requireRole } from '@/lib/auth/guards';
import { hashPassword } from '@/lib/auth/password';
import { auth } from '@/lib/auth/auth';
import { sendEmail } from '@/lib/email/send';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  role: string;
  createdAt: Date;
  partnerId: string | null;
  companyName: string | null;
  partnerStatus: string | null;
};

const createPartnerUserSchema = z.object({
  locale: z.string().min(1),
  companyName: z.string().min(2).max(160),
  contactName: z.string().min(2).max(120),
  email: z.string().email().max(190),
  temporaryPassword: z.string().min(12).max(128),
  country: z.string().max(80).optional(),
  description: z.string().max(2000).optional()
});

async function resendPartnerVerification(formData: FormData) {
  'use server';
  const locale = String(formData.get('locale') || 'es');
  const userId = String(formData.get('userId') || '');
  if (!userId) return;

  await requireRole('ROOT');

  const rows = await prisma.$queryRaw<Array<{ email: string; emailVerified: boolean; role: string }>>`
    SELECT "email", "emailVerified", "role"::text AS "role"
    FROM "User"
    WHERE "id" = ${userId}
    LIMIT 1
  `;
  const user = rows[0];
  if (!user || user.role !== 'PARTNER' || user.emailVerified) return;

  await auth.api.sendVerificationEmail({
    body: {
      email: user.email,
      callbackURL: `/${locale}/partner`
    }
  });

  revalidatePath(`/${locale}/admin/users`);
  redirect(`/${locale}/admin/users?resent=1`);
}

async function createPartnerUser(formData: FormData) {
  'use server';

  const parsed = createPartnerUserSchema.safeParse({
    locale: formData.get('locale'),
    companyName: formData.get('companyName'),
    contactName: formData.get('contactName'),
    email: formData.get('email'),
    temporaryPassword: formData.get('temporaryPassword'),
    country: formData.get('country') || undefined,
    description: formData.get('description') || undefined
  });

  if (!parsed.success) {
    throw new Error('Datos inválidos. La clave temporal debe tener al menos 12 caracteres.');
  }

  await requireRole('ROOT');

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) throw new Error('Ya existe un usuario con ese correo.');

  const userId = randomUUID();
  const partnerId = randomUUID();
  const accountId = randomUUID();
  const passwordHash = await hashPassword(parsed.data.temporaryPassword);

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      INSERT INTO "User" ("id", "email", "name", "emailVerified", "role", "createdAt", "updatedAt")
      VALUES (${userId}, ${email}, ${parsed.data.contactName.trim()}, false, CAST('PARTNER' AS "UserRole"), NOW(), NOW())
    `;

    await tx.$executeRaw`
      INSERT INTO "AuthAccount" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
      VALUES (${accountId}, ${userId}, 'credential', ${userId}, ${passwordHash}, NOW(), NOW())
    `;

    await tx.$executeRaw`
      INSERT INTO "Partner" ("id", "userId", "companyName", "country", "description", "status", "createdAt", "updatedAt")
      VALUES (${partnerId}, ${userId}, ${parsed.data.companyName.trim()}, ${parsed.data.country?.trim() || null}, ${parsed.data.description?.trim() || null}, 'INVITED', NOW(), NOW())
    `;
  });

  const siteUrl = (process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const loginUrl = `${siteUrl}/${parsed.data.locale}/login`;

  await sendEmail({
    to: email,
    subject: 'Tu acceso al Portal de Aliados de Trends172Tech',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111827;line-height:1.6">
        <h2>Se creó tu usuario de aliado</h2>
        <p>Hola ${parsed.data.contactName.trim()},</p>
        <p>Trends172Tech creó un acceso para <strong>${parsed.data.companyName.trim()}</strong>.</p>
        <p><strong>Usuario:</strong> ${email}<br/><strong>Clave temporal:</strong> ${parsed.data.temporaryPassword}</p>
        <p>Primero verifica tu correo. Después podrás iniciar sesión y cambiar tu clave antes de comenzar a trabajar.</p>
        <p><a href="${loginUrl}" style="display:inline-block;background:#111827;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none">Ir al acceso</a></p>
      </div>
    `,
    text: `Trends172Tech creó tu usuario de aliado. Usuario: ${email}. Clave temporal: ${parsed.data.temporaryPassword}. Verifica tu correo y luego entra en ${loginUrl}.`,
    locale: parsed.data.locale
  });

  await auth.api.sendVerificationEmail({
    body: {
      email,
      callbackURL: `/${parsed.data.locale}/partner`
    }
  });

  revalidatePath(`/${parsed.data.locale}/admin/users`);
  revalidatePath(`/${parsed.data.locale}/admin/partners`);
  redirect(`/${parsed.data.locale}/admin/users?created=1`);
}

export default async function AdminUsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireRole('ROOT');

  const users = await prisma.$queryRaw<UserRow[]>`
    SELECT
      u."id", u."name", u."email", u."emailVerified", u."role"::text AS "role", u."createdAt",
      p."id" AS "partnerId", p."companyName", p."status" AS "partnerStatus"
    FROM "User" u
    LEFT JOIN "Partner" p ON p."userId" = u."id"
    ORDER BY u."createdAt" DESC
    LIMIT 250
  `;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Control ROOT</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight">Usuarios</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">Desde aquí el administrador ROOT crea y controla los accesos. Los aliados pendientes aparecen como no verificados y puedes reenviarles el correo de verificación cuando sea necesario.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
        <Card>
          <CardHeader><CardTitle>Crear usuario aliado</CardTitle></CardHeader>
          <CardContent>
            <form action={createPartnerUser} className="space-y-4">
              <input type="hidden" name="locale" value={locale} />
              <div className="space-y-2"><Label htmlFor="companyName">Empresa aliada</Label><Input id="companyName" name="companyName" required /></div>
              <div className="space-y-2"><Label htmlFor="contactName">Nombre de la persona</Label><Input id="contactName" name="contactName" required /></div>
              <div className="space-y-2"><Label htmlFor="email">Correo de acceso</Label><Input id="email" name="email" type="email" required /></div>
              <div className="space-y-2"><Label htmlFor="temporaryPassword">Clave temporal</Label><PasswordInput id="temporaryPassword" name="temporaryPassword" minLength={12} required /><p className="text-xs text-slate-500">La defines tú. El aliado la recibe por correo y deberá cambiarla después de verificar su cuenta.</p></div>
              <div className="space-y-2"><Label htmlFor="country">País</Label><Input id="country" name="country" /></div>
              <div className="space-y-2"><Label htmlFor="description">Contexto / descripción</Label><textarea id="description" name="description" rows={4} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950" /></div>
              <Button type="submit" className="w-full">Crear usuario y enviar correo</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Usuarios registrados</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Usuario</TableHead><TableHead>Tipo</TableHead><TableHead>Empresa</TableHead><TableHead>Correo</TableHead><TableHead>Verificación</TableHead><TableHead>Estado</TableHead><TableHead>Acción</TableHead></TableRow></TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name || '-'}</TableCell>
                      <TableCell>{user.role === 'PARTNER' ? 'Aliado' : user.role}</TableCell>
                      <TableCell>{user.companyName || '-'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell><span className={user.emailVerified ? 'text-emerald-600' : 'text-amber-600'}>{user.emailVerified ? 'Verificado' : 'Pendiente'}</span></TableCell>
                      <TableCell>{user.partnerStatus || 'Activo'}</TableCell>
                      <TableCell>
                        {user.role === 'PARTNER' && !user.emailVerified ? (
                          <form action={resendPartnerVerification}>
                            <input type="hidden" name="locale" value={locale} />
                            <input type="hidden" name="userId" value={user.id} />
                            <Button type="submit" size="sm" variant="outline">Reenviar verificación</Button>
                          </form>
                        ) : <span className="text-xs text-slate-400">—</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
