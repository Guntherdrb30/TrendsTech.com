import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@trends172tech/db';
import { requireRole } from '@/lib/auth/guards';
import { requireTenantId } from '@/lib/tenant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { hashPassword } from '@/lib/auth/password';

export const dynamic = 'force-dynamic';

type PageParams = {
  locale: string;
};

const createSchema = z.object({
  locale: z.string().min(1),
  name: z.string().min(1).max(120),
  email: z.string().email().max(190),
  password: z.string().min(12).max(128),
  role: z.enum(['TENANT_ADMIN', 'TENANT_OPERATOR', 'TENANT_VIEWER']),
  phone: z.string().min(4).max(40).optional()
});

const updateSchema = z.object({
  locale: z.string().min(1),
  userId: z.string().min(1),
  role: z.enum(['TENANT_ADMIN', 'TENANT_OPERATOR', 'TENANT_VIEWER'])
});

async function createUser(formData: FormData) {
  'use server';
  const parsed = createSchema.safeParse({
    locale: formData.get('locale'),
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
    phone: formData.get('phone') || undefined
  });

  if (!parsed.success) {
    throw new Error('Invalid user payload.');
  }

  await requireRole('TENANT_ADMIN');
  const tenantId = await requireTenantId();
  const email = parsed.data.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Email already exists.');
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        tenantId,
        name: parsed.data.name.trim(),
        email,
        role: parsed.data.role,
        emailVerified: true,
        passwordHash: null,
        phone: parsed.data.phone?.trim() || null
      }
    });
    await tx.authAccount.create({
      data: {
        providerId: 'credential',
        accountId: user.id,
        userId: user.id,
        password: passwordHash
      }
    });
  });

  const path = `/${parsed.data.locale}/dashboard/users`;
  revalidatePath(path);
  redirect(path);
}

async function updateUserRole(formData: FormData) {
  'use server';
  const parsed = updateSchema.safeParse({
    locale: formData.get('locale'),
    userId: formData.get('userId'),
    role: formData.get('role')
  });

  if (!parsed.success) {
    throw new Error('Invalid role payload.');
  }

  await requireRole('TENANT_ADMIN');
  const tenantId = await requireTenantId();

  const user = await prisma.user.findFirst({
    where: { id: parsed.data.userId, tenantId }
  });

  if (!user) {
    throw new Error('User not found.');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: parsed.data.role }
  });

  const path = `/${parsed.data.locale}/dashboard/users`;
  revalidatePath(path);
  redirect(path);
}

export default async function UsersPage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  const isEs = locale.startsWith('es');
  await requireRole('TENANT_ADMIN');
  const tenantId = await requireTenantId();
  const selectClassName =
    'interactive-field h-11 w-full rounded-2xl border border-slate-200 bg-white/96 px-4 text-sm text-slate-900 shadow-[0_14px_35px_-28px_rgba(15,23,42,0.35)] outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200';

  const users = await prisma.user.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <section className="space-y-6">
      <div className="interactive-panel premium-noise overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-7 shadow-[0_35px_100px_-72px_rgba(15,23,42,0.35)] sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              {isEs ? 'Administracion del equipo' : 'Team administration'}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">{isEs ? 'Usuarios' : 'Users'}</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-500">
                {isEs ? 'Gestiona accesos del equipo, roles operativos y permisos del workspace para este tenant.' : 'Manage team access, operational roles, and workspace permissions for this tenant.'}
              </p>
            </div>
          </div>
          <div className="interactive-panel rounded-[24px] border border-black/8 bg-white/92 px-5 py-4 shadow-[0_18px_45px_-36px_rgba(15,23,42,0.24)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{isEs ? 'Usuarios del workspace' : 'Workspace users'}</div>
            <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{users.length}</div>
          </div>
        </div>
      </div>

      <Card className="interactive-panel">
        <CardHeader className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{isEs ? 'Provisioning' : 'Provisioning'}</p>
          <CardTitle>{isEs ? 'Crear usuario' : 'Create user'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createUser} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="locale" value={locale} />
            <div className="space-y-2">
              <Label htmlFor="name">{isEs ? 'Nombre' : 'Name'}</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{isEs ? 'Correo' : 'Email'}</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{isEs ? 'Contrasena' : 'Password'}</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{isEs ? 'Telefono' : 'Phone'}</Label>
              <Input id="phone" name="phone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{isEs ? 'Rol' : 'Role'}</Label>
              <select
                id="role"
                name="role"
                defaultValue="TENANT_VIEWER"
                className={selectClassName}
              >
                <option value="TENANT_ADMIN">{isEs ? 'Admin tenant' : 'Tenant admin'}</option>
                <option value="TENANT_OPERATOR">{isEs ? 'Operador tenant' : 'Tenant operator'}</option>
                <option value="TENANT_VIEWER">{isEs ? 'Visualizador tenant' : 'Tenant viewer'}</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Button type="submit">{isEs ? 'Crear usuario' : 'Create user'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="interactive-panel">
        <CardHeader className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{isEs ? 'Directorio' : 'Directory'}</p>
          <CardTitle>{isEs ? 'Usuarios existentes' : 'Existing users'}</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="interactive-panel rounded-[24px] border border-dashed border-black/10 bg-slate-50/80 px-5 py-6 text-sm text-slate-500">
              {isEs ? 'Aun no hay usuarios. Crea la primera cuenta para empezar a asignar roles.' : 'No users yet. Create the first account to start assigning roles.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name ?? '-'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <form action={updateUserRole} className="flex flex-wrap items-center gap-2">
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="userId" value={user.id} />
                        <select
                          name="role"
                          defaultValue={user.role}
                          className="interactive-field rounded-xl border border-slate-200 bg-white/96 px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                        >
                          <option value="TENANT_ADMIN">{isEs ? 'Admin tenant' : 'Tenant admin'}</option>
                          <option value="TENANT_OPERATOR">{isEs ? 'Operador tenant' : 'Tenant operator'}</option>
                          <option value="TENANT_VIEWER">{isEs ? 'Visualizador tenant' : 'Tenant viewer'}</option>
                        </select>
                        <Button type="submit" size="sm" variant="outline">
                          Save
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
