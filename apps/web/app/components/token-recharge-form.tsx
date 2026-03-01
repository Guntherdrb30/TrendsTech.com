'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TokenRechargeFormProps {
  locale: string;
  zelleRecipientName?: string | null;
  zelleEmail?: string | null;
  zellePhone?: string | null;
  paymentButtonUrl?: string | null;
  paymentAmountParam?: string | null;
}

type RechargeCopy = {
  title: string;
  subtitle: string;
  paymentTitle: string;
  paymentNote: string;
  checkoutTitle: string;
  checkoutBody: string;
  fields: {
    amount: string;
    reference: string;
    proofUrl: string;
  };
  hints: {
    amount: string;
    reference: string;
    proofUrl: string;
  };
  actions: {
    submit: string;
    submitting: string;
  };
  checkout: {
    button: string;
    secureNote: string;
    ctaLead: string;
  };
  errors: {
    amountRequired: string;
    amountInvalid: string;
    referenceRequired: string;
    paymentConfigMissing: string;
    requestFailed: string;
  };
  success: string;
  zelleLabels: {
    recipient: string;
    email: string;
    phone: string;
    currency: string;
    method: string;
  };
};

function getRechargeCopy(locale: string): RechargeCopy {
  if (locale.startsWith('es')) {
    return {
      title: 'Recargar tokens',
      subtitle: 'Confirma tu pago en USD para recargar los tokens de tu cuenta.',
      paymentTitle: 'Datos de pago (USD)',
      paymentNote: 'Metodo de pago: Zelle. Usa la referencia del envio.',
      checkoutTitle: 'Checkout',
      checkoutBody: 'Realiza tu pago y luego registra aqui la referencia para validarlo.',
      fields: {
        amount: 'Monto en USD',
        reference: 'Referencia de pago',
        proofUrl: 'URL del comprobante (opcional)'
      },
      hints: {
        amount: 'Ejemplo: 50.00',
        reference: 'Ejemplo: ZELLE-123456',
        proofUrl: 'Pega el enlace del comprobante si lo tienes.'
      },
      actions: {
        submit: 'Enviar solicitud',
        submitting: 'Enviando...'
      },
      checkout: {
        button: 'Pagar ahora',
        secureNote: 'Se abre una pagina externa de pago en una nueva pestana.',
        ctaLead: 'Paga de forma segura con trends172 Pay'
      },
      errors: {
        amountRequired: 'Ingresa el monto en USD',
        amountInvalid: 'El monto debe ser mayor a 0',
        referenceRequired: 'Ingresa la referencia del pago',
        paymentConfigMissing: 'No hay metodo de pago configurado. Contacta al equipo.',
        requestFailed: 'No se pudo registrar el pago'
      },
      success: 'Solicitud enviada. Te contactaremos para validar el pago.',
      zelleLabels: {
        recipient: 'Receptor',
        email: 'Correo',
        phone: 'Telefono',
        currency: 'Moneda',
        method: 'Metodo'
      }
    };
  }

  return {
    title: 'Recharge tokens',
    subtitle: 'Confirm your USD payment to top up your account tokens.',
    paymentTitle: 'Payment details (USD)',
    paymentNote: 'Payment method: Zelle. Use your transfer reference.',
    checkoutTitle: 'Checkout',
    checkoutBody: 'Complete your payment and then submit the transfer reference here for validation.',
    fields: {
      amount: 'Amount in USD',
      reference: 'Payment reference',
      proofUrl: 'Proof URL (optional)'
    },
    hints: {
      amount: 'Example: 50.00',
      reference: 'Example: ZELLE-123456',
      proofUrl: 'Paste the receipt URL if you have one.'
    },
    actions: {
      submit: 'Submit request',
      submitting: 'Submitting...'
    },
    checkout: {
      button: 'Pay now',
      secureNote: 'An external payment page opens in a new tab.',
      ctaLead: 'Pay securely with trends172 Pay'
    },
    errors: {
      amountRequired: 'Enter the amount in USD',
      amountInvalid: 'Amount must be greater than 0',
      referenceRequired: 'Enter the payment reference',
      paymentConfigMissing: 'No payment method is configured. Contact support.',
      requestFailed: 'Payment request failed'
    },
    success: 'Request sent. We will contact you to validate the payment.',
    zelleLabels: {
      recipient: 'Recipient',
      email: 'Email',
      phone: 'Phone',
      currency: 'Currency',
      method: 'Method'
    }
  };
}

function buildCheckoutUrl({
  baseUrl,
  amount,
  amountParam
}: {
  baseUrl: string;
  amount: string;
  amountParam?: string | null;
}) {
  const trimmedAmount = amount.trim();
  const numericAmount = Number(trimmedAmount);
  if (Number.isNaN(numericAmount) || numericAmount <= 0) {
    return baseUrl;
  }

  const normalizedAmount = numericAmount.toFixed(2);
  if (baseUrl.includes('{amount}')) {
    return baseUrl.replaceAll('{amount}', encodeURIComponent(normalizedAmount));
  }

  const paramName = amountParam?.trim() || 'amount';
  try {
    const url = new URL(baseUrl);
    url.searchParams.set(paramName, normalizedAmount);
    return url.toString();
  } catch {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${encodeURIComponent(paramName)}=${encodeURIComponent(normalizedAmount)}`;
  }
}

export function TokenRechargeForm({
  locale,
  zelleRecipientName,
  zelleEmail,
  zellePhone,
  paymentButtonUrl,
  paymentAmountParam
}: TokenRechargeFormProps) {
  const copy = getRechargeCopy(locale);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasZelleInfo = Boolean(zelleRecipientName || zelleEmail || zellePhone);
  const hasPaymentButton = Boolean(paymentButtonUrl);
  const hasPaymentMethod = hasZelleInfo || hasPaymentButton;
  const checkoutUrl = hasPaymentButton
    ? buildCheckoutUrl({
        baseUrl: paymentButtonUrl ?? '',
        amount,
        amountParam: paymentAmountParam
      })
    : '#';

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!amount.trim()) {
      setError(copy.errors.amountRequired);
      return;
    }
    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError(copy.errors.amountInvalid);
      return;
    }
    if (!reference.trim()) {
      setError(copy.errors.referenceRequired);
      return;
    }
    if (!hasPaymentMethod) {
      setError(copy.errors.paymentConfigMissing);
      return;
    }

    startTransition(async () => {
      let response: Response;
      try {
        response = await fetch('/api/manual-payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amountUsd: amount,
            reference: reference.trim(),
            proofUrl: proofUrl.trim() || undefined
          })
        });
      } catch (fetchError) {
        console.error('Manual payment failed', fetchError);
        setError(copy.errors.requestFailed);
        return;
      }

      if (!response.ok) {
        const result = (await response.json().catch(() => ({}))) as { error?: string };
        setError(result?.error ? `${copy.errors.requestFailed}: ${result.error}` : copy.errors.requestFailed);
        return;
      }

      setAmount('');
      setReference('');
      setProofUrl('');
      setSuccess(copy.success);
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">{copy.subtitle}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amountUsd">{copy.fields.amount}</Label>
              <Input
                id="amountUsd"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                inputMode="decimal"
                placeholder={copy.hints.amount}
                required
              />
              <p className="text-xs text-slate-500">{copy.hints.amount}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">{copy.fields.reference}</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder={copy.hints.reference}
                required
              />
              <p className="text-xs text-slate-500">{copy.hints.reference}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proofUrl">{copy.fields.proofUrl}</Label>
              <Input
                id="proofUrl"
                type="url"
                value={proofUrl}
                onChange={(event) => setProofUrl(event.target.value)}
                placeholder={copy.hints.proofUrl}
              />
              <p className="text-xs text-slate-500">{copy.hints.proofUrl}</p>
            </div>
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-500">{success}</p> : null}
            <Button type="submit" disabled={isPending || !hasPaymentMethod} className="w-full">
              {isPending ? copy.actions.submitting : copy.actions.submit}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {hasPaymentButton ? (
          <Card>
            <CardHeader>
              <CardTitle>{copy.checkoutTitle}</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">{copy.checkoutBody}</p>
            </CardHeader>
            <CardContent>
              <section
                id="trends172-pay-cta"
                style={{
                  marginTop: '24px',
                  padding: '16px',
                  border: '1px solid #1f2937',
                  borderRadius: '12px',
                  background: '#0b1220'
                }}
              >
                <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#cbd5e1' }}>{copy.checkout.ctaLead}</p>
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    background: '#06b6d4',
                    color: '#0b1220',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontFamily: 'system-ui'
                  }}
                >
                  {copy.checkout.button}
                </a>
              </section>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{copy.checkout.secureNote}</p>
            </CardContent>
          </Card>
        ) : null}

        <Card>
        <CardHeader>
          <CardTitle>{copy.paymentTitle}</CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">{copy.paymentNote}</p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 dark:text-white">{copy.zelleLabels.method}</span>
            <span>Zelle</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 dark:text-white">{copy.zelleLabels.currency}</span>
            <span>USD</span>
          </div>
          <div className="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs dark:border-slate-800 dark:bg-slate-950/50">
            <div className="flex items-center justify-between">
              <span>{copy.zelleLabels.recipient}</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {zelleRecipientName || '---'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>{copy.zelleLabels.email}</span>
              <span className="font-semibold text-slate-900 dark:text-white">{zelleEmail || '---'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{copy.zelleLabels.phone}</span>
              <span className="font-semibold text-slate-900 dark:text-white">{zellePhone || '---'}</span>
            </div>
          </div>
          {!hasPaymentMethod ? (
            <p className="text-xs text-red-500">{copy.errors.paymentConfigMissing}</p>
          ) : null}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
