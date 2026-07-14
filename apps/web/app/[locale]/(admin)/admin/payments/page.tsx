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

export default async function AdminPaymentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isEs = locale.startsWith('es');
  const tr = (es: string, en: string) => (isEs ? es : en);
  const statusLabel: Record<string, string> = {
    PENDING: tr('Pendiente', 'Pending'),
    REVIEWING: tr('Revisando', 'Reviewing'),
    APPROVED: tr('Aprobado', 'Approved'),
    REJECTED: tr('Rechazado', 'Rejected'),
  };
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
        <h2 className="text-xl font-semibold text-slate-950">{tr('Revisión de pagos', 'Payment review')}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {tr('Aprueba o rechaza los pagos para acreditar créditos a las cuentas de los clientes.', 'Approve or reject payments to credit customer accounts.')}
        </p>
      </div>

      {/* Pending */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
          {tr('Por revisar', 'To review')} ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-400">{tr('No hay pagos pendientes.', 'There are no pending payments.')}</p>
        ) : (
          <div className="space-y-3">
            {pending.map(p => (
              <div key={p.id} className="rounded-[20px] border border-black/8 bg-white p-5 shadow-[0_4px_16px_-8px_rgba(15,23,42,0.08)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[p.status]}`}>
                        {statusLabel[p.status]}
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
                        {tr('Tasa BCV usada', 'BCV rate used')}: {Number(p.exchangeRateUsed).toFixed(2)} Bs./USD
                      </p>
                    )}
                    {p.proofUrl && (
                      <a href={p.proofUrl} target="_blank" rel="noreferrer" className="text-xs text-[#00bfa5] hover:underline">
                        {tr('Ver comprobante', 'View receipt')} →
                      </a>
                    )}
                    <p className="text-[11px] text-slate-400">
                      {new Date(p.createdAt).toLocaleString(isEs ? 'es-VE' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <PaymentActions locale={locale} paymentId={p.id} status={p.status as 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED'} />
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
            {tr('Historial', 'History')} ({resolved.length})
          </h3>
          <div className="overflow-x-auto rounded-[20px] border border-black/8 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  <th className="px-5 py-3 text-left">{tr('Cliente', 'Customer')}</th>
                  <th className="px-5 py-3 text-left">{tr('Monto', 'Amount')}</th>
                  <th className="px-5 py-3 text-left">{tr('Método', 'Method')}</th>
                  <th className="px-5 py-3 text-left">{tr('Referencia', 'Reference')}</th>
                  <th className="px-5 py-3 text-left">{tr('Estado', 'Status')}</th>
                  <th className="px-5 py-3 text-left">{tr('Revisado por', 'Reviewed by')}</th>
                  <th className="px-5 py-3 text-left">{tr('Fecha', 'Date')}</th>
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
                        {statusLabel[p.status]}
                      </span>
                      {p.reviewNotes && (
                        <p className="mt-0.5 text-[11px] text-slate-400">{p.reviewNotes}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {p.reviewedBy?.name ?? p.reviewedBy?.email ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-400">
                      {p.reviewedAt ? new Date(p.reviewedAt).toLocaleDateString(isEs ? 'es-VE' : 'en-US') : '—'}
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
