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

type PartnerRow = {
  id: string;
  userId: string;
  companyName: string;
  legalName: string | null;
  country: string | null;
  website: string | null;
  description: string | null;
  status: string;
  createdAt: Date;
  userName: string | null;
  email: string;
  emailVerified: boolean;
  phone: string | null;
};

const createPartnerSchema = z.object({
  locale: z.string().min(1),
  companyName: z.string().min(2).max(160),
  legalName: z.string().max(180).optional(),
  contactName: z.string().min(2).max(120),
  email: z.string().email().max(190),
  phone: z.string().max(40).optional(),
  country: z.string().max(80).optional(),
  website: z.string().max(220).optional(),
  description: z.string().max(2000).optional(),
  temporaryPassword: z.string().min(12).max(128)
});

async function createPartner(formData: FormData) {
  'use server';

  const parsed = createPartnerSchema.safeParse({
    locale: formData.get('locale'),
    companyName: formData.get('companyName'),
    legalName: formData.get('legalName') || undefined,
    contactName: formData.get('contactName'),
    email: formData.get('email'),
    phone: formData.get('phone') || undefined,
    country: formData.get('country') || undefined,
    website: formData.get('website') || undefined,
    description: formData.get('description') || undefined,
    temporaryPassword: formData.get('temporaryPassword')
  });

  if (!parsed.success) {
    throw new Error('Datos de aliado inválidos. Revisa especialmente el email y que la clave temporal tenga al menos 12 caracteres.');
  }

  await requireRole('ROOT');

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    throw new Error('Ya existe un usuario con ese correo.');
  }

  const userId = randomUUID();
  const partnerId = randomUUID();
  const accountId = randomUUID();
  const passwordHash = await hashPassword(parsed.data.temporaryPassword);

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      INSERT INTO "User" ("id", "email", "name", "emailVerified", "phone", "role", "createdAt", "updatedAt")
      VALUES (${userId}, ${email}, ${parsed.data.contactName.trim()}, false, ${parsed.data.phone?.trim() || null}, CAST('PARTNER' AS "UserRole"), NOW(), NOW())
    `;

    await tx.$executeRaw`
      INSERT INTO "AuthAccount" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
      VALUES (${accountId}, ${userId}, 'credential', ${userId}, ${passwordHash}, NOW(), NOW())
    `;

    await tx.$executeRaw`
      INSERT INTO "Partner" ("id", "userId", "companyName", "legalName", "country", "website", "description", "status", "createdAt", "updatedAt")
      VALUES (
        ${partnerId},
        ${userId},
        ${parsed.data.companyName.trim()},
        ${parsed.data.legalName?.trim() || null},
        ${parsed.data.country?.trim() || null},
        ${parsed.data.website?.trim() || null},
        ${parsed.data.description?.trim() || null},
        'INVITED',
        NOW(),
        NOW()
      )
    `;
  });

  const siteUrl = (process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const loginUrl = `${siteUrl}/${parsed.data.locale}/login`;

  await sendEmail({
    to: email,
    subject: 'Invitación al Portal de Aliados de Trends172Tech',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111827;line-height:1.6">
        <h2 style="margin-bottom:8px">Bienvenido al Portal de Aliados de Trends172Tech</h2>
        <p>Hola ${parsed.data.contactName.trim()},</p>
        <p>Se creó tu acceso como aliado para <strong>${parsed.data.companyName.trim()}</strong>.</p>
        <p><strong>Usuario:</strong> ${email}<br/><strong>Clave temporal:</strong> ${parsed.data.temporaryPassword}</p>
        <p>Por seguridad, primero debes verificar tu correo y luego iniciar sesión. Al ingresar por primera vez, el sistema te solicitará reemplazar la clave temporal.</p>
        <p><a href="${loginUrl}" style="display:inline-block;background:#111827;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Ir al Portal de Aliados</a></p>
        <p style="font-size:13px;color:#6b7280">Si no reconoces esta invitación, no utilices estas credenciales y contacta a Trends172Tech.</p>
      </div>
    `,
    text: `Bienvenido al Portal de Aliados de Trends172Tech. Usuario: ${email}. Clave temporal: ${parsed.data.temporaryPassword}. Verifica tu correo antes de iniciar sesión: ${loginUrl}`,
    locale: parsed.data.locale
  });

  await auth.api.sendVerificationEmail({
    body: {
      email,
      callbackURL: `/${parsed.data.locale}/partner`
    }
  });

  revalidatePath(`/${parsed.data.locale}/admin/partners`);
  redirect(`/${parsed.data.locale}/admin/partners?created=1`);
}

export default async function PartnersAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireRole('ROOT');

  const partners = await prisma.$queryRaw<PartnerRow[]>`
    SELECT
      p."id",
      p."userId",
      p."companyName",
      p."legalName",
      p."country",
      p."website",
      p."description",
      p."status",
      p."createdAt",
      u."name" AS "userName",
      u."email",
      u."emailVerified",
      u."phone"
    FROM "Partner" p
    INNER JOIN "User" u ON u."id" = p."userId"
    ORDER BY p."createdAt" DESC
  `;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">Portal B2B</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight">Gestión de aliados</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">Crea accesos PARTNER, controla la verificación del correo y administra las organizaciones que podrán trabajar oportunidades con Trends172Tech.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader><CardTitle>Crear aliado</CardTitle></CardHeader>
          <CardContent>
            <form action={createPartner} className="space-y-4">
              <input type="hidden" name="locale" value={locale} />
              <div className="space-y-2"><Label htmlFor="companyName">Empresa</Label><Input id="companyName" name="companyName" required /></div>
              <div className="space-y-2"><Label htmlFor="legalName">Razón social</Label><Input id="legalName" name="legalName" /></div>
              <div className="space-y-2"><Label htmlFor="contactName">Nombre del contacto</Label><Input id="contactName" name="contactName" required /></div>
              <div className="space-y-2"><Label htmlFor="email">Correo</Label><Input id="email" name="email" type="email" required /></div>
              <div className="space-y-2"><Label htmlFor="phone">Teléfono</Label><Input id="phone" name="phone" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label htmlFor="country">País</Label><Input id="country" name="country" /></div>
                <div className="space-y-2"><Label htmlFor="website">Sitio web</Label><Input id="website" name="website" placeholder="https://" /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="description">Descripción / contexto del aliado</Label><textarea id="description" name="description" rows={4} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900 dark:border-slate-800 dark:bg-slate-950" /></div>
              <div className="space-y-2"><Label htmlFor="temporaryPassword">Clave temporal</Label><PasswordInput id="temporaryPassword" name="temporaryPassword" minLength={12} required /><p className="text-xs text-slate-500">Mínimo 12 caracteres. Se enviará al aliado y deberá cambiarse en el primer acceso.</p></div>
              <Button type="submit" className="w-full">Crear aliado y enviar invitación</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Aliados registrados</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Empresa</TableHead><TableHead>Contacto</TableHead><TableHead>Correo</TableHead><TableHead>Verificación</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
                <TableBody>
                  {partners.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="py-8 text-center text-slate-500">Todavía no hay aliados registrados.</TableCell></TableRow>
                  ) : partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell><div className="font-medium">{partner.companyName}</div><div className="text-xs text-slate-500">{partner.country || 'País no indicado'}</div></TableCell>
                      <TableCell>{partner.userName || '-'}</TableCell>
                      <TableCell>{partner.email}</TableCell>
                      <TableCell><span className={partner.emailVerified ? 'text-emerald-600' : 'text-amber-600'}>{partner.emailVerified ? 'Verificado' : 'Pendiente'}</span></TableCell>
                      <TableCell>{partner.status}</TableCell>
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
