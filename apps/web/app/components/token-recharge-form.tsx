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
}

type RechargeCopy = {
  title: string;
  subtitle: string;
  paymentTitle: string;
  paymentNote: string;
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
  errors: {
    amountRequired: string;
    amountInvalid: string;
    referenceRequired: string;
    zelleMissing: string;
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
      errors: {
        amountRequired: 'Ingresa el monto en USD',
        amountInvalid: 'El monto debe ser mayor a 0',
        referenceRequired: 'Ingresa la referencia del pago',
        zelleMissing: 'Faltan datos de Zelle. Contacta al equipo.',
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
    errors: {
      amountRequired: 'Enter the amount in USD',
      amountInvalid: 'Amount must be greater than 0',
      referenceRequired: 'Enter the payment reference',
      zelleMissing: 'Zelle details are missing. Contact support.',
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

export function TokenRechargeForm({
  locale,
  zelleRecipientName,
  zelleEmail,
  zellePhone
}: TokenRechargeFormProps) {
  const copy = getRechargeCopy(locale);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasZelleInfo = Boolean(zelleRecipientName || zelleEmail || zellePhone);

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
    if (!hasZelleInfo) {
      setError(copy.errors.zelleMissing);
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
            <Button type="submit" disabled={isPending || !hasZelleInfo} className="w-full">
              {isPending ? copy.actions.submitting : copy.actions.submit}
            </Button>
          </form>
        </CardContent>
      </Card>

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
          {!hasZelleInfo ? (
            <p className="text-xs text-red-500">{copy.errors.zelleMissing}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
