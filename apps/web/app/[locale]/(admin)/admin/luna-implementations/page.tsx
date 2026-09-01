import { prisma } from '@trends172tech/db';
import { AdminDataTable, TableCell, TableRow } from '@/components/admin/admin-data-table';
import { MetricCard } from '@/components/admin/metric-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { requireRole } from '@/lib/auth/guards';

function money(value: unknown) {
  return `$${Number(value ?? 0).toLocaleString('en-US')}`;
}

function date(value: Date) {
  return new Intl.DateTimeFormat('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(value);
}

type LunaImplementationLead = {
  id: string;
  clientName: string;
  source: string | null;
  status: string;
  estimatedValue: unknown;
  nextStep: string | null;
  owner: string | null;
  createdAt: Date;
  client: {
    contactName: string | null;
    email: string | null;
    phone: string | null;
    country: string | null;
    notes: string | null;
  } | null;
};

async function getLunaImplementationLeads(): Promise<LunaImplementationLead[]> {
  try {
    return await prisma.adminLead.findMany({
      where: {
        source: { contains: 'luna-football', mode: 'insensitive' }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            contactName: true,
            email: true,
            phone: true,
            country: true,
            notes: true
          }
        }
      }
    });
  } catch {
    return [];
  }
}

export default async function LunaImplementationsPage() {
  await requireRole('ROOT');
  const leads = await getLunaImplementationLeads();
  const totalEstimated = leads.reduce((sum, lead) => sum + Number(lead.estimatedValue ?? 0), 0);
  const newLeads = leads.filter((lead) => lead.status === 'NEW').length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">LUNA Fútbol</p>
        <h2 className="mt-1 text-xl font-semibold">Solicitudes LUNA Fútbol</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Prospectos que generaron una demo personalizada y solicitaron una instalación de LUNA Fútbol, producto independiente de LUNA.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Solicitudes" value={String(leads.length)} />
        <MetricCard label="Nuevas" value={String(newLeads)} accent="emerald" />
        <MetricCard label="Implementación estimada" value={money(totalEstimated)} accent="amber" />
      </div>

      <AdminDataTable
        title="Solicitudes desde demos"
        columns={['Escuela', 'Contacto', 'Teléfono', 'Valor', 'Estado', 'Próximo paso']}
        rows={leads}
        emptyLabel="Todavía no hay solicitudes de LUNA Fútbol."
        renderRow={(lead) => (
          <TableRow key={lead.id}>
            <TableCell>
              <div className="font-semibold text-slate-950 dark:text-white">{lead.clientName}</div>
              <div className="text-xs text-slate-500">{lead.client?.country ?? 'País no indicado'} · {date(lead.createdAt)}</div>
            </TableCell>
            <TableCell>
              <div>{lead.client?.contactName ?? 'Sin contacto'}</div>
              <div className="text-xs text-slate-500">{lead.client?.email ?? 'Sin email'}</div>
            </TableCell>
            <TableCell>{lead.client?.phone ?? 'Sin teléfono'}</TableCell>
            <TableCell>{money(lead.estimatedValue)}</TableCell>
            <TableCell>
              <StatusBadge label={lead.status} tone={lead.status === 'NEW' ? 'warning' : 'success'} />
            </TableCell>
            <TableCell>
              <div className="max-w-xl text-sm text-slate-600 dark:text-slate-300">{lead.nextStep}</div>
              {lead.client?.notes ? <details className="mt-2 text-xs text-slate-500"><summary>Ver datos de la demo</summary><pre className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-100 p-3 dark:bg-slate-900">{lead.client.notes}</pre></details> : null}
            </TableCell>
          </TableRow>
        )}
      />
    </div>
  );
}
