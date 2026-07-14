'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EndCustomerOption {
  id: string;
  name: string;
}

interface DashboardClientProps {
  tenantMode: 'SINGLE' | 'RESELLER';
  endCustomers: EndCustomerOption[];
  profilePhone?: string | null;
}

export function DashboardClient({ tenantMode, endCustomers, profilePhone }: DashboardClientProps) {
  const locale = useLocale();
  const isEs = locale.startsWith('es');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [endCustomerError, setEndCustomerError] = useState<string | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);

  const [endCustomerName, setEndCustomerName] = useState('');
  const [endCustomerEmail, setEndCustomerEmail] = useState('');
  const [endCustomerPhone, setEndCustomerPhone] = useState('');

  const [agentName, setAgentName] = useState('');
  const [baseAgentKey, setBaseAgentKey] = useState<'marketing' | 'sales' | 'appointments' | 'support' | 'public_voice'>('marketing');
  const [languageDefault, setLanguageDefault] = useState<'ES' | 'EN'>('ES');
  const [status, setStatus] = useState<'DRAFT' | 'ACTIVE' | 'PAUSED'>('DRAFT');
  const [endCustomerId, setEndCustomerId] = useState('');
  const [useProfilePhone, setUseProfilePhone] = useState(Boolean(profilePhone));
  const [agentPhone, setAgentPhone] = useState('');
  const selectClassName =
    'interactive-field h-11 w-full rounded-2xl border border-slate-200 bg-white/96 px-4 text-sm text-slate-900 shadow-[0_14px_35px_-28px_rgba(15,23,42,0.35)] outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-700/40';

  const submitEndCustomer = (event: React.FormEvent) => {
    event.preventDefault();
    setEndCustomerError(null);

    startTransition(async () => {
      const response = await fetch('/api/end-customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: endCustomerName,
          email: endCustomerEmail,
          phone: endCustomerPhone
        })
      });

      if (!response.ok) {
        const result = await response.json();
        setEndCustomerError(result?.error ?? (isEs ? 'No se pudo crear el cliente final.' : 'Failed to create end customer.'));
        return;
      }

      setEndCustomerName('');
      setEndCustomerEmail('');
      setEndCustomerPhone('');
      router.refresh();
    });
  };

  const submitAgent = (event: React.FormEvent) => {
    event.preventDefault();
    setAgentError(null);

    startTransition(async () => {
      const contactPhone = useProfilePhone ? profilePhone : agentPhone;
      const response = await fetch('/api/agent-instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agentName,
          baseAgentKey,
          languageDefault,
          status,
          endCustomerId: endCustomerId || null,
          contactPhone: contactPhone || null
        })
      });

      if (!response.ok) {
        const result = await response.json();
        setAgentError(result?.error ?? (isEs ? 'No se pudo crear la instancia del agente.' : 'Failed to create agent instance.'));
        return;
      }

      setAgentName('');
      setBaseAgentKey('marketing');
      setEndCustomerId('');
      setAgentPhone('');
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {tenantMode === 'RESELLER' ? (
        <Card className="interactive-panel premium-noise">
          <CardHeader className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              {isEs ? 'Workspace reseller' : 'Reseller workspace'}
            </p>
            <CardTitle className="text-2xl">{isEs ? 'Crear cliente final' : 'Create end customer'}</CardTitle>
            <p className="text-sm text-slate-500">
              {isEs
                ? 'Registra nuevos clientes finales con una captura limpia y lista para operacion.'
                : 'Register end customers with a clear, production-ready setup.'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitEndCustomer} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="endCustomerName">{isEs ? 'Nombre' : 'Name'}</Label>
                <Input
                  id="endCustomerName"
                  value={endCustomerName}
                  onChange={(event) => setEndCustomerName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endCustomerEmail">{isEs ? 'Correo' : 'Email'}</Label>
                <Input
                  id="endCustomerEmail"
                  type="email"
                  value={endCustomerEmail}
                  onChange={(event) => setEndCustomerEmail(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endCustomerPhone">{isEs ? 'Telefono' : 'Phone'}</Label>
                <Input
                  id="endCustomerPhone"
                  value={endCustomerPhone}
                  onChange={(event) => setEndCustomerPhone(event.target.value)}
                />
              </div>
              {endCustomerError ? <p className="text-sm text-red-500">{endCustomerError}</p> : null}
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                {isEs ? 'Crear cliente final' : 'Create end customer'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card className="interactive-panel premium-noise">
        <CardHeader className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            {isEs ? 'Estudio de agentes' : 'Agent studio'}
          </p>
          <CardTitle className="text-2xl">{isEs ? 'Configurar agente' : 'Configure agent'}</CardTitle>
          <p className="text-sm text-slate-500">
            {isEs
              ? 'Define canal, idioma y contacto operativo con un setup mas claro para produccion.'
              : 'Define the channel, language and operational contact with a clearer production setup.'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitAgent} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="agentName">{isEs ? 'Nombre del agente' : 'Agent name'}</Label>
              <Input
                id="agentName"
                value={agentName}
                onChange={(event) => setAgentName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseAgentKey">{isEs ? 'Tipo de agente' : 'Agent type'}</Label>
              <select
                id="baseAgentKey"
                className={selectClassName}
                value={baseAgentKey}
                onChange={(event) =>
                  setBaseAgentKey(
                    event.target.value as 'marketing' | 'sales' | 'appointments' | 'support' | 'public_voice'
                  )
                }
              >
                <option value="marketing">Marketing</option>
                <option value="sales">{isEs ? 'Ventas' : 'Sales'}</option>
                <option value="appointments">{isEs ? 'Citas' : 'Appointments'}</option>
                <option value="support">{isEs ? 'Soporte' : 'Support'}</option>
                <option value="public_voice">{isEs ? 'Voz publica' : 'Public voice'}</option>
              </select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="languageDefault">{isEs ? 'Idioma' : 'Language'}</Label>
                <select
                  id="languageDefault"
                  className={selectClassName}
                  value={languageDefault}
                  onChange={(event) => setLanguageDefault(event.target.value as 'ES' | 'EN')}
                >
                  <option value="ES">ES</option>
                  <option value="EN">EN</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">{isEs ? 'Estado' : 'Status'}</Label>
                <select
                  id="status"
                  className={selectClassName}
                  value={status}
                  onChange={(event) => setStatus(event.target.value as 'DRAFT' | 'ACTIVE' | 'PAUSED')}
                >
                  <option value="DRAFT">{isEs ? 'Borrador' : 'Draft'}</option>
                  <option value="ACTIVE">{isEs ? 'Activo' : 'Active'}</option>
                  <option value="PAUSED">{isEs ? 'Pausado' : 'Paused'}</option>
                </select>
              </div>
            </div>
            {tenantMode === 'RESELLER' ? (
              <div className="space-y-2">
                <Label htmlFor="endCustomerId">{isEs ? 'Cliente final' : 'End customer'}</Label>
                <select
                  id="endCustomerId"
                  className={selectClassName}
                  value={endCustomerId}
                  onChange={(event) => setEndCustomerId(event.target.value)}
                >
                  <option value="">{isEs ? 'Sin cliente final' : 'No end customer'}</option>
                  {endCustomers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {profilePhone ? (
              <div className="interactive-panel space-y-2 rounded-[22px] border border-black/8 bg-slate-50/90 px-4 py-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={useProfilePhone}
                    onChange={(event) => setUseProfilePhone(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
                  />
                  {isEs ? 'Usar telefono del perfil' : 'Use profile phone'} ({profilePhone})
                </label>
              </div>
            ) : null}
            {!useProfilePhone ? (
              <div className="space-y-2">
                <Label htmlFor="agentPhone">{isEs ? 'Telefono del agente' : 'Agent phone'}</Label>
                <Input
                  id="agentPhone"
                  value={agentPhone}
                  onChange={(event) => setAgentPhone(event.target.value)}
                  placeholder={isEs ? 'Opcional' : 'Optional'}
                />
              </div>
            ) : null}
            {agentError ? <p className="text-sm text-red-500">{agentError}</p> : null}
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isEs ? 'Guardar configuracion' : 'Save configuration'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
