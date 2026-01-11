'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RootClientProps {
  usdToVesRate: string;
  usdPaymentDiscountPercent: string;
  roundingRule: 'ONE' | 'FIVE' | 'TEN';
  kbUrlPageLimit: string;
  zelleRecipientName: string;
  zelleEmail: string;
  zellePhone: string;
}

export function RootClient({
  usdToVesRate,
  usdPaymentDiscountPercent,
  roundingRule,
  kbUrlPageLimit,
  zelleRecipientName,
  zelleEmail,
  zellePhone
}: RootClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [tenantError, setTenantError] = useState<string | null>(null);

  const [rate, setRate] = useState(usdToVesRate);
  const [discount, setDiscount] = useState(usdPaymentDiscountPercent);
  const [rule, setRule] = useState<'ONE' | 'FIVE' | 'TEN'>(roundingRule);
  const [pageLimit, setPageLimit] = useState(kbUrlPageLimit);
  const [zelleName, setZelleName] = useState(zelleRecipientName);
  const [zelleEmailValue, setZelleEmailValue] = useState(zelleEmail);
  const [zellePhoneValue, setZellePhoneValue] = useState(zellePhone);

  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [tenantMode, setTenantMode] = useState<'SINGLE' | 'RESELLER'>('SINGLE');

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
          roundingRule: rule,
          kbUrlPageLimit: pageLimit,
          zelleRecipientName: zelleName,
          zelleEmail: zelleEmailValue,
          zellePhone: zellePhoneValue
        })
      });

      if (!response.ok) {
        const result = await response.json();
        setSettingsError(result?.error ?? 'No se pudieron guardar los ajustes.');
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
        setTenantError(result?.error ?? 'No se pudo crear el tenant.');
        return;
      }

      setTenantName('');
      setTenantSlug('');
      setTenantMode('SINGLE');
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
        <CardTitle>Configuracion global</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitSettings} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usdToVesRate">Tasa USD a VES</Label>
              <Input
                id="usdToVesRate"
                value={rate}
                onChange={(event) => setRate(event.target.value)}
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usdPaymentDiscountPercent">Descuento pago USD %</Label>
              <Input
                id="usdPaymentDiscountPercent"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roundingRule">Regla de redondeo</Label>
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
              <Label htmlFor="kbUrlPageLimit">Limite de paginas KB</Label>
              <Input
                id="kbUrlPageLimit"
                value={pageLimit}
                onChange={(event) => setPageLimit(event.target.value)}
                inputMode="numeric"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zelleRecipientName">Nombre Zelle</Label>
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
              <Label htmlFor="zellePhone">Telefono Zelle</Label>
              <Input
                id="zellePhone"
                value={zellePhoneValue}
                onChange={(event) => setZellePhoneValue(event.target.value)}
              />
            </div>
            {settingsError ? <p className="text-sm text-red-500">{settingsError}</p> : null}
            <Button type="submit" disabled={isPending}>
              Guardar ajustes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
        <CardTitle>Crear tenant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitTenant} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tenantName">Nombre</Label>
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
              <Label htmlFor="tenantMode">Modo</Label>
              <select
                id="tenantMode"
                className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={tenantMode}
                onChange={(event) => setTenantMode(event.target.value as 'SINGLE' | 'RESELLER')}
              >
                <option value="SINGLE">Unico</option>
                <option value="RESELLER">Revendedor</option>
              </select>
            </div>
            {tenantError ? <p className="text-sm text-red-500">{tenantError}</p> : null}
            <Button type="submit" disabled={isPending}>
              Crear tenant
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
