'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RootClientProps {
  locale: string;
  usdToVesRate: string;
  usdPaymentDiscountPercent: string;
  tokenInputUsdPer1M: string;
  tokenOutputUsdPer1M: string;
  tokenCachedInputUsdPer1M: string;
  tokenMarkupPercent: string;
  roundingRule: 'ONE' | 'FIVE' | 'TEN';
  kbUrlPageLimit: string;
  zelleRecipientName: string;
  zelleEmail: string;
  zellePhone: string;
  tenantOptions: Array<{ id: string; name: string; slug: string }>;
}

export function RootClient({
  locale,
  usdToVesRate,
  usdPaymentDiscountPercent,
  tokenInputUsdPer1M,
  tokenOutputUsdPer1M,
  tokenCachedInputUsdPer1M,
  tokenMarkupPercent,
  roundingRule,
  kbUrlPageLimit,
  zelleRecipientName,
  zelleEmail,
  zellePhone,
  tenantOptions
}: RootClientProps) {
  const isEs = locale.startsWith('es');
  const tr = (es: string, en: string) => (isEs ? es : en);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [tenantError, setTenantError] = useState<string | null>(null);

  const [rate, setRate] = useState(usdToVesRate);
  const [discount, setDiscount] = useState(usdPaymentDiscountPercent);
  const [tokenInput, setTokenInput] = useState(tokenInputUsdPer1M);
  const [tokenOutput, setTokenOutput] = useState(tokenOutputUsdPer1M);
  const [tokenCachedInput, setTokenCachedInput] = useState(tokenCachedInputUsdPer1M);
  const [tokenMarkup, setTokenMarkup] = useState(tokenMarkupPercent);
  const [rule, setRule] = useState<'ONE' | 'FIVE' | 'TEN'>(roundingRule);
  const [pageLimit, setPageLimit] = useState(kbUrlPageLimit);
  const [zelleName, setZelleName] = useState(zelleRecipientName);
  const [zelleEmailValue, setZelleEmailValue] = useState(zelleEmail);
  const [zellePhoneValue, setZellePhoneValue] = useState(zellePhone);

  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [tenantMode, setTenantMode] = useState<'SINGLE' | 'RESELLER'>('SINGLE');
  const [tokenTenantId, setTokenTenantId] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [tokenSuccess, setTokenSuccess] = useState<string | null>(null);

  const markupValue = Number(tokenMarkup) || 0;
  const inputClient = (Number(tokenInput) || 0) * (1 + markupValue / 100);
  const outputClient = (Number(tokenOutput) || 0) * (1 + markupValue / 100);
  const cachedClient = (Number(tokenCachedInput) || 0) * (1 + markupValue / 100);

  const submitSettings = (event: React.FormEvent) => {
    event.preventDefault();
    setSettingsError(null);

    startTransition(async () => {
      const response = await fetch('/api/global-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usdToVesRate: rate,
          usdPaymentDiscountPercent: discount,
          tokenInputUsdPer1M: tokenInput,
          tokenOutputUsdPer1M: tokenOutput,
          tokenCachedInputUsdPer1M: tokenCachedInput,
          tokenMarkupPercent: tokenMarkup,
          roundingRule: rule,
          kbUrlPageLimit: pageLimit,
          zelleRecipientName: zelleName,
          zelleEmail: zelleEmailValue,
          zellePhone: zellePhoneValue
        })
      });

      if (!response.ok) {
        const result = await response.json();
        setSettingsError(result?.error ?? tr('No se pudieron guardar los ajustes.', 'The settings could not be saved.'));
        return;
      }

      router.refresh();
    });
  };

  const submitTenant = (event: React.FormEvent) => {
    event.preventDefault();
    setTenantError(null);

    startTransition(async () => {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tenantName,
          slug: tenantSlug,
          mode: tenantMode
        })
      });

      if (!response.ok) {
        const result = await response.json();
        setTenantError(result?.error ?? tr('No se pudo crear el tenant.', 'The tenant could not be created.'));
        return;
      }

      setTenantName('');
      setTenantSlug('');
      setTenantMode('SINGLE');
      router.refresh();
    });
  };

  const submitTokens = (event: React.FormEvent) => {
    event.preventDefault();
    setTokenError(null);
    setTokenSuccess(null);

    const amountValue = Number(tokenAmount);
    if (!tokenTenantId) {
      setTokenError(tr('Selecciona un tenant.', 'Select a tenant.'));
      return;
    }
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setTokenError(tr('Ingresa un monto en USD valido.', 'Enter a valid USD amount.'));
      return;
    }

    startTransition(async () => {
      const response = await fetch('/api/token-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tokenTenantId,
          amountUsd: amountValue
        })
      });

      if (!response.ok) {
        const result = await response.json();
        setTokenError(result?.error ?? tr('No se pudo ajustar el saldo de tokens.', 'The token balance could not be adjusted.'));
        return;
      }

      setTokenAmount('');
      setTokenSuccess(tr('Saldo actualizado.', 'Balance updated.'));
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
        <CardTitle>{tr('Configuracion global', 'Global settings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitSettings} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usdToVesRate">{tr('Tasa USD a VES', 'USD to VES rate')}</Label>
              <Input
                id="usdToVesRate"
                value={rate}
                onChange={(event) => setRate(event.target.value)}
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usdPaymentDiscountPercent">{tr('Descuento pago USD %', 'USD payment discount %')}</Label>
              <Input
                id="usdPaymentDiscountPercent"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tokenInputUsdPer1M">{tr('Entrada del proveedor IA / 1M tokens (USD)', 'AI provider input / 1M tokens (USD)')}</Label>
              <Input
                id="tokenInputUsdPer1M"
                value={tokenInput}
                onChange={(event) => setTokenInput(event.target.value)}
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tokenOutputUsdPer1M">{tr('Salida del proveedor IA / 1M tokens (USD)', 'AI provider output / 1M tokens (USD)')}</Label>
              <Input
                id="tokenOutputUsdPer1M"
                value={tokenOutput}
                onChange={(event) => setTokenOutput(event.target.value)}
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tokenCachedInputUsdPer1M">{tr('Entrada en cache / 1M tokens (USD)', 'Cached input / 1M tokens (USD)')}</Label>
              <Input
                id="tokenCachedInputUsdPer1M"
                value={tokenCachedInput}
                onChange={(event) => setTokenCachedInput(event.target.value)}
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tokenMarkupPercent">{tr('Markup % (ganancia)', 'Markup % (profit)')}</Label>
              <Input
                id="tokenMarkupPercent"
                value={tokenMarkup}
                onChange={(event) => setTokenMarkup(event.target.value)}
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roundingRule">{tr('Regla de redondeo', 'Rounding rule')}</Label>
              <select
                id="roundingRule"
                className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={rule}
                onChange={(event) => setRule(event.target.value as 'ONE' | 'FIVE' | 'TEN')}
              >
                <option value="ONE">1</option>
                <option value="FIVE">5</option>
                <option value="TEN">10</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kbUrlPageLimit">{tr('Limite de paginas KB', 'KB page limit')}</Label>
              <Input
                id="kbUrlPageLimit"
                value={pageLimit}
                onChange={(event) => setPageLimit(event.target.value)}
                inputMode="numeric"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zelleRecipientName">{tr('Nombre Zelle', 'Zelle name')}</Label>
              <Input
                id="zelleRecipientName"
                value={zelleName}
                onChange={(event) => setZelleName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zelleEmail">Email Zelle</Label>
              <Input
                id="zelleEmail"
                type="email"
                value={zelleEmailValue}
                onChange={(event) => setZelleEmailValue(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zellePhone">{tr('Telefono Zelle', 'Zelle phone')}</Label>
              <Input
                id="zellePhone"
                value={zellePhoneValue}
                onChange={(event) => setZellePhoneValue(event.target.value)}
              />
            </div>
            {settingsError ? <p className="text-sm text-red-500">{settingsError}</p> : null}
            <Button type="submit" disabled={isPending}>
              {tr('Guardar ajustes', 'Save settings')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tr('Tabla de precios (USD)', 'Pricing table (USD)')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            {tr('Costo del proveedor IA frente al precio al cliente', 'AI provider cost versus customer price')} ({tr('con markup', 'with markup')} {markupValue.toFixed(2)}%).
          </p>
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-semibold">{tr('Concepto', 'Concept')}</th>
                  <th className="px-3 py-2 font-semibold">{tr('Proveedor / 1M', 'Provider / 1M')}</th>
                  <th className="px-3 py-2 font-semibold">{tr('Cliente / 1M', 'Customer / 1M')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr>
                  <td className="px-3 py-2">Input</td>
                  <td className="px-3 py-2">${Number(tokenInput || 0).toFixed(4)}</td>
                  <td className="px-3 py-2">${inputClient.toFixed(4)}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Cached input</td>
                  <td className="px-3 py-2">${Number(tokenCachedInput || 0).toFixed(4)}</td>
                  <td className="px-3 py-2">${cachedClient.toFixed(4)}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Output</td>
                  <td className="px-3 py-2">${Number(tokenOutput || 0).toFixed(4)}</td>
                  <td className="px-3 py-2">${outputClient.toFixed(4)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
        <CardTitle>{tr('Crear tenant', 'Create tenant')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitTenant} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tenantName">{tr('Nombre', 'Name')}</Label>
              <Input
                id="tenantName"
                value={tenantName}
                onChange={(event) => setTenantName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenantSlug">Slug</Label>
              <Input
                id="tenantSlug"
                value={tenantSlug}
                onChange={(event) => setTenantSlug(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenantMode">{tr('Modo', 'Mode')}</Label>
              <select
                id="tenantMode"
                className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={tenantMode}
                onChange={(event) => setTenantMode(event.target.value as 'SINGLE' | 'RESELLER')}
              >
                <option value="SINGLE">{tr('Unico', 'Single')}</option>
                <option value="RESELLER">{tr('Revendedor', 'Reseller')}</option>
              </select>
            </div>
            {tenantError ? <p className="text-sm text-red-500">{tenantError}</p> : null}
            <Button type="submit" disabled={isPending}>
              {tr('Crear tenant', 'Create tenant')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tr('Recargar saldo (USD)', 'Recharge balance (USD)')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitTokens} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tokenTenantId">Tenant</Label>
              <select
                id="tokenTenantId"
                className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={tokenTenantId}
                onChange={(event) => setTokenTenantId(event.target.value)}
                required
              >
                <option value="">{tr('Selecciona un tenant', 'Select a tenant')}</option>
                {tenantOptions.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} ({tenant.slug})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tokenAmount">{tr('Monto USD a agregar', 'USD amount to add')}</Label>
              <Input
                id="tokenAmount"
                value={tokenAmount}
                onChange={(event) => setTokenAmount(event.target.value)}
                inputMode="decimal"
                required
              />
            </div>
            {tokenError ? <p className="text-sm text-red-500">{tokenError}</p> : null}
            {tokenSuccess ? <p className="text-sm text-emerald-500">{tokenSuccess}</p> : null}
            <Button type="submit" disabled={isPending}>
              {tr('Ajustar tokens', 'Adjust tokens')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
