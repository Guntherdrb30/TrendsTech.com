import { prisma } from '@trends172tech/db';
import { PaymentActions } from './payment-actions-client';

export const dynamic = 'force-dynamic';

const METHOD_LABEL: Record<string, string> = {
  ZELLE: 'Zelle',
  BINANCE: 'Binance Pay',
  PAGO_MOVIL: 'Pago Móvil'
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  REVIEWING: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-600'
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  REVIEWING: 'Revisando',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado'
};

export default async function AdminPaymentsPage() {
  const payments = await prisma.manualPayment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      tenant: { select: { name: true } },
      reviewedBy: { select: { name: true, email: true } }
    }
  });

  const pending = payments.filter(p => p.status === 'PENDING' || p.status === 'REVIEWING');
  const resolved = payments.filter(p => p.status === 'APPROVED' || p.status === 'REJECTED');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">Revisión de Pagos</h2>
        <p className="mt-1 text-sm text-slate-500">
          Aprueba o rechaza los pagos para acreditar créditos a las cuentas de los clientes.
        </p>
      </div>

      {/* Pending */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
          Por revisar ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-400">No hay pagos pendientes.</p>
        ) : (
          <div className="space-y-3">
            {pending.map(p => (
              <div key={p.id} className="rounded-[20px] border border-black/8 bg-white p-5 shadow-[0_4px_16px_-8px_rgba(15,23,42,0.08)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                      <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                        {METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod}
                      </span>
                      <span className="text-[11px] text-slate-400">{p.currencyPaid}</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-950">
                      {p.currencyPaid === 'VES'
                        ? `Bs. ${Number(p.amountPaid).toLocaleString('es-VE', { minimumFractionDigits: 2 })}`
                        : `$${Number(p.amountPaid).toFixed(2)} USD`}
                      {p.amountUsd && p.currencyPaid === 'VES' && (
                        <span className="ml-2 text-sm font-normal text-slate-500">
                          (≈ ${Number(p.amountUsd).toFixed(2)} USD)
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">{p.tenant.name}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Ref: <span className="font-mono font-medium text-slate-700">{p.reference}</span>
                    </p>
                    {p.exchangeRateUsed && (
                      <p className="text-[11px] text-slate-400">
                        Tasa BCV usada: {Number(p.exchangeRateUsed).toFixed(2)} Bs./USD
                      </p>
                    )}
                    {p.proofUrl && (
                      <a href={p.proofUrl} target="_blank" rel="noreferrer" className="text-xs text-[#00bfa5] hover:underline">
                        Ver comprobante →
                      </a>
                    )}
                    <p className="text-[11px] text-slate-400">
                      {new Date(p.createdAt).toLocaleString('es-VE', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <PaymentActions paymentId={p.id} status={p.status as 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED'} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Resolved */}
      {resolved.length > 0 && (
        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
            Historial ({resolved.length})
          </h3>
          <div className="overflow-x-auto rounded-[20px] border border-black/8 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  <th className="px-5 py-3 text-left">Cliente</th>
                  <th className="px-5 py-3 text-left">Monto</th>
                  <th className="px-5 py-3 text-left">Método</th>
                  <th className="px-5 py-3 text-left">Referencia</th>
                  <th className="px-5 py-3 text-left">Estado</th>
                  <th className="px-5 py-3 text-left">Revisado por</th>
                  <th className="px-5 py-3 text-left">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {resolved.map(p => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-medium text-slate-900">{p.tenant.name}</td>
                    <td className="px-5 py-3 text-slate-700">
                      {p.currencyPaid === 'VES'
                        ? `Bs. ${Number(p.amountPaid).toLocaleString('es-VE', { minimumFractionDigits: 2 })}`
                        : `$${Number(p.amountPaid).toFixed(2)}`}
                      {p.amountUsd && p.currencyPaid === 'VES' && (
                        <span className="ml-1 text-[11px] text-slate-400">(${Number(p.amountUsd).toFixed(2)})</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-700">{p.reference}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                      {p.reviewNotes && (
                        <p className="mt-0.5 text-[11px] text-slate-400">{p.reviewNotes}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {p.reviewedBy?.name ?? p.reviewedBy?.email ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-400">
                      {p.reviewedAt ? new Date(p.reviewedAt).toLocaleDateString('es-VE') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
