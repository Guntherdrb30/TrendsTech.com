'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  locale: string;
  zelleEmail: string | null;
  zelleRecipientName: string | null;
  binanceEmail: string | null;
  pagoMovilPhone: string | null;
  pagoMovilBank: string | null;
  pagoMovilCedula: string | null;
  bcvRate: number | null;
  vesMarkupPercent: number;
  bcvUpdatedAt: string | null;
};

type Currency = 'USD' | 'VES';
type Method = 'ZELLE' | 'BINANCE' | 'PAGO_MOVIL';

function fmtDate(iso: string | null, locale: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleString(locale.startsWith('es') ? 'es-VE' : 'en-US', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
}

export function RechargeForm({
  locale,
  zelleEmail,
  zelleRecipientName,
  binanceEmail,
  pagoMovilPhone,
  pagoMovilBank,
  pagoMovilCedula,
  bcvRate,
  vesMarkupPercent,
  bcvUpdatedAt
}: Props) {
  const isEs = locale.startsWith('es');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [method, setMethod] = useState<Method>('ZELLE');
  const [amountUsd, setAmountUsd] = useState('');
  const [reference, setReference] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const numUsd = Number(amountUsd) || 0;
  const vesRate = bcvRate ?? 0;
  const vesMarkupFactor = 1 + vesMarkupPercent / 100;
  const amountVes = vesRate > 0 ? numUsd * vesRate * vesMarkupFactor : 0;

  const c = isEs
    ? {
        currencyLabel: 'Moneda de pago',
        methodLabel: 'Método de pago',
        amountLabel: 'Monto en USD',
        amountHint: 'Ej: 20.00',
        refLabel: 'Referencia / Número de confirmación',
        refHint: 'Ej: ZELLE-123456 o TXN-ABC',
        proofLabel: 'URL del comprobante (opcional)',
        submit: 'Enviar solicitud',
        submitting: 'Enviando...',
        success: 'Solicitud enviada. Revisaremos y acreditaremos tus créditos pronto.',
        errAmount: 'Ingresa un monto válido mayor a 0',
        errRef: 'Ingresa la referencia del pago',
        errFailed: 'No se pudo registrar el pago',
        errNoMethod: 'No hay método de pago configurado. Contacta al soporte.',
        errNoBcv: 'Tasa BCV no disponible. Intenta más tarde o paga en USD.',
        vesNote: (bs: string) => `Pagarás aproximadamente Bs. ${bs} (tasa BCV + ${vesMarkupPercent}% recargo)`,
        bcvUpdated: (d: string) => `Tasa BCV actualizada: ${d}`,
        bcvMissing: 'Tasa BCV no disponible aún',
        recipientLabel: 'Beneficiario',
        emailLabel: 'Correo',
        phoneLabel: 'Teléfono',
        bankLabel: 'Banco',
        cedulaLabel: 'Cédula',
        networkLabel: 'Red',
        sameEmailNote: 'Zelle y Binance usan el mismo correo',
        pagoMovilTitle: 'Datos de Pago Móvil',
        usdTitle: 'Datos de pago USD'
      }
    : {
        currencyLabel: 'Payment currency',
        methodLabel: 'Payment method',
        amountLabel: 'Amount in USD',
        amountHint: 'E.g. 20.00',
        refLabel: 'Reference / Confirmation number',
        refHint: 'E.g. ZELLE-123456 or TXN-ABC',
        proofLabel: 'Proof URL (optional)',
        submit: 'Submit request',
        submitting: 'Submitting...',
        success: 'Request sent. We will review and credit your account soon.',
        errAmount: 'Enter a valid amount greater than 0',
        errRef: 'Enter the payment reference',
        errFailed: 'Failed to register payment',
        errNoMethod: 'No payment method configured. Contact support.',
        errNoBcv: 'BCV rate unavailable. Try later or pay in USD.',
        vesNote: (bs: string) => `You will pay approximately Bs. ${bs} (BCV rate + ${vesMarkupPercent}% surcharge)`,
        bcvUpdated: (d: string) => `BCV rate updated: ${d}`,
        bcvMissing: 'BCV rate not yet available',
        recipientLabel: 'Recipient',
        emailLabel: 'Email',
        phoneLabel: 'Phone',
        bankLabel: 'Bank',
        cedulaLabel: 'ID',
        networkLabel: 'Network',
        sameEmailNote: 'Zelle and Binance use the same email',
        pagoMovilTitle: 'Pago Móvil details',
        usdTitle: 'USD payment details'
      };

  const hasPagoMovil = Boolean(pagoMovilPhone && pagoMovilBank && pagoMovilCedula);
  const hasUsd = Boolean(zelleEmail || binanceEmail);

  // When currency changes, reset method to a valid one
  const onCurrencyChange = (c: Currency) => {
    setCurrency(c);
    if (c === 'VES') setMethod('PAGO_MOVIL');
    else setMethod('ZELLE');
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!numUsd || numUsd <= 0) { setError(c.errAmount); return; }
    if (!reference.trim()) { setError(c.errRef); return; }
    if (currency === 'USD' && !hasUsd) { setError(c.errNoMethod); return; }
    if (currency === 'VES' && !hasPagoMovil) { setError(c.errNoMethod); return; }
    if (currency === 'VES' && !bcvRate) { setError(c.errNoBcv); return; }

    const payload = {
      amountUsd: numUsd,
      amountPaid: currency === 'VES' ? amountVes : numUsd,
      currencyPaid: currency,
      paymentMethod: method,
      exchangeRateUsed: currency === 'VES' ? vesRate : undefined,
      reference: reference.trim(),
      proofUrl: proofUrl.trim() || undefined
    };

    startTransition(async () => {
      try {
        const res = await fetch('/api/manual-payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const r = (await res.json().catch(() => ({}))) as { error?: string };
          setError(r.error ? `${c.errFailed}: ${r.error}` : c.errFailed);
          return;
        }
        setAmountUsd(''); setReference(''); setProofUrl('');
        setSuccess(c.success);
      } catch {
        setError(c.errFailed);
      }
    });
  };

  const cardClass = 'rounded-[24px] border border-black/8 bg-white p-5 shadow-[0_8px_24px_-8px_rgba(15,23,42,0.10)]';
  const tabActive = 'rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white';
  const tabInactive = 'rounded-full border border-black/10 px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50';
  const methodActive = 'rounded-2xl border-2 border-[#00bfa5] bg-[#f0fdf9] p-4 cursor-pointer';
  const methodInactive = 'rounded-2xl border-2 border-transparent bg-slate-50 p-4 cursor-pointer hover:border-slate-200';

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
      {/* Left: form */}
      <div className="space-y-6">
        {/* Currency selector */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{c.currencyLabel}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => onCurrencyChange('USD')} className={currency === 'USD' ? tabActive : tabInactive}>
              USD ($)
            </button>
            <button type="button" onClick={() => onCurrencyChange('VES')} className={currency === 'VES' ? tabActive : tabInactive}>
              Bolívares (Bs.)
            </button>
          </div>
        </div>

        {/* Method selector (only USD shows choice) */}
        {currency === 'USD' && (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{c.methodLabel}</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setMethod('ZELLE')} className={method === 'ZELLE' ? methodActive : methodInactive}>
                <p className="font-semibold text-slate-900">Zelle</p>
                <p className="mt-0.5 text-xs text-slate-500">Transferencia bancaria US</p>
              </button>
              <button type="button" onClick={() => setMethod('BINANCE')} className={method === 'BINANCE' ? methodActive : methodInactive}>
                <p className="font-semibold text-slate-900">Binance Pay</p>
                <p className="mt-0.5 text-xs text-slate-500">Pago cripto en USD</p>
              </button>
            </div>
          </div>
        )}

        {/* BCV rate info for VES */}
        {currency === 'VES' && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            {bcvRate ? (
              <>
                <span className="font-semibold">Tasa BCV: Bs. {bcvRate.toFixed(2)}/USD</span>
                {' · '}
                <span>{vesMarkupPercent}% recargo aplicado</span>
                {bcvUpdatedAt && <span className="ml-2 text-amber-600">· {c.bcvUpdated(fmtDate(bcvUpdatedAt, locale) ?? '')}</span>}
              </>
            ) : (
              <span>{c.bcvMissing}</span>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="amountUsd">{c.amountLabel}</Label>
            <Input
              id="amountUsd"
              value={amountUsd}
              onChange={e => setAmountUsd(e.target.value)}
              inputMode="decimal"
              placeholder={c.amountHint}
            />
            {currency === 'VES' && amountVes > 0 && (
              <p className="text-xs text-amber-700">{c.vesNote(amountVes.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reference">{c.refLabel}</Label>
            <Input id="reference" value={reference} onChange={e => setReference(e.target.value)} placeholder={c.refHint} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="proofUrl">{c.proofLabel}</Label>
            <Input id="proofUrl" type="url" value={proofUrl} onChange={e => setProofUrl(e.target.value)} placeholder="https://..." />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? c.submitting : c.submit}
          </Button>
        </form>
      </div>

      {/* Right: payment details */}
      <div className="space-y-4">
        {currency === 'USD' && (
          <div className={cardClass}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{c.usdTitle}</p>
            <div className="mt-4 space-y-3 text-sm">
              {method === 'ZELLE' ? (
                <>
                  <Row label={c.recipientLabel} value={zelleRecipientName ?? 'Gunther Del Rosario'} />
                  <Row label={c.emailLabel} value={zelleEmail ?? '—'} mono />
                  <Row label="Tipo" value="Zelle (USD)" />
                </>
              ) : (
                <>
                  <Row label={c.emailLabel} value={binanceEmail ?? zelleEmail ?? '—'} mono />
                  <Row label={c.networkLabel} value="Binance Pay" />
                  <Row label="Moneda" value="USDT / USD" />
                </>
              )}
              {(zelleEmail || binanceEmail) && (
                <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                  ℹ {c.sameEmailNote}: <span className="font-semibold text-slate-700">{zelleEmail ?? binanceEmail}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {currency === 'VES' && (
          <div className={cardClass}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{c.pagoMovilTitle}</p>
            <div className="mt-4 space-y-3 text-sm">
              <Row label={c.phoneLabel} value={pagoMovilPhone ?? '—'} mono />
              <Row label={c.bankLabel} value={pagoMovilBank ?? '—'} />
              <Row label={c.cedulaLabel} value={pagoMovilCedula ?? '—'} mono />
              {numUsd > 0 && amountVes > 0 && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-800">
                  <p className="font-semibold">Monto a transferir:</p>
                  <p className="mt-1 text-base font-bold text-amber-900">
                    Bs. {amountVes.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="mt-0.5 text-[11px]">= ${numUsd.toFixed(2)} USD × {vesRate.toFixed(2)} × {vesMarkupFactor.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="rounded-[24px] border border-[#00bfa5]/20 bg-[#f0fdf9] px-5 py-4 text-xs text-[#00897b]">
          <p className="font-semibold">{isEs ? 'Proceso de acreditación' : 'Credit process'}</p>
          <ul className="mt-2 space-y-1">
            {isEs ? (
              <>
                <li>1. Realiza la transferencia con los datos de arriba.</li>
                <li>2. Registra la referencia en el formulario.</li>
                <li>3. Revisamos el pago en menos de 24 horas.</li>
                <li>4. Acreditamos los créditos a tu cuenta.</li>
              </>
            ) : (
              <>
                <li>1. Make the transfer using the details above.</li>
                <li>2. Submit the reference in the form.</li>
                <li>3. We review within 24 hours.</li>
                <li>4. Credits are added to your account.</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold text-slate-900 ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  );
}
