import { prisma } from '@trends172tech/db';
import { requireRole } from '@/lib/auth/guards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RootClient } from './root-client';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  await requireRole('ROOT');

  type TenantRow = {
    id: string;
    name: string;
    slug: string;
    mode: string;
    status: string;
  };

  const settings = await prisma.globalSettings.findUnique({ where: { id: 1 } });
  const tenants = (await prisma.tenant.findMany({
    orderBy: { createdAt: 'desc' }
  })) as TenantRow[];

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Root control</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage global settings and tenants.</p>
      </div>

      <RootClient
        usdToVesRate={settings?.usdToVesRate?.toString() ?? '0'}
        usdPaymentDiscountPercent={settings?.usdPaymentDiscountPercent?.toString() ?? '0'}
        roundingRule={(settings?.roundingRule ?? 'ONE') as 'ONE' | 'FIVE' | 'TEN'}
      />

      <Card>
        <CardHeader>
          <CardTitle>Tenants</CardTitle>
        </CardHeader>
        <CardContent>
          {tenants.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No tenants yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>{tenant.name}</TableCell>
                    <TableCell>{tenant.slug}</TableCell>
                    <TableCell>{tenant.mode}</TableCell>
                    <TableCell>{tenant.status}</TableCell>
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
