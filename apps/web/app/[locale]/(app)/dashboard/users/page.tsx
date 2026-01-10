import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import { prisma } from '@trends172tech/db';
import { requireRole } from '@/lib/auth/guards';
import { requireTenantId } from '@/lib/tenant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

type PageParams = {
  locale: string;
};

const createSchema = z.object({
  locale: z.string().min(1),
  name: z.string().min(1).max(120),
  email: z.string().email().max(190),
  password: z.string().min(8).max(72),
  role: z.enum(['TENANT_ADMIN', 'TENANT_OPERATOR', 'TENANT_VIEWER'])
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
    role: formData.get('role')
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

  const passwordHash = await hash(parsed.data.password, 10);

  await prisma.user.create({
    data: {
      tenantId,
      name: parsed.data.name.trim(),
      email,
      role: parsed.data.role,
      passwordHash
    }
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
  await requireRole('TENANT_ADMIN');
  const tenantId = await requireTenantId();

  const users = await prisma.user.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage team access for this tenant.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create user</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createUser} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="locale" value={locale} />
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                defaultValue="TENANT_VIEWER"
                className="w-full rounded border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
              >
                <option value="TENANT_ADMIN">Tenant admin</option>
                <option value="TENANT_OPERATOR">Tenant operator</option>
                <option value="TENANT_VIEWER">Tenant viewer</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Create user</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing users</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No users yet.</p>
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
                          className="rounded border border-slate-300 bg-transparent px-2 py-1 text-xs dark:border-slate-700"
                        >
                          <option value="TENANT_ADMIN">Tenant admin</option>
                          <option value="TENANT_OPERATOR">Tenant operator</option>
                          <option value="TENANT_VIEWER">Tenant viewer</option>
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
