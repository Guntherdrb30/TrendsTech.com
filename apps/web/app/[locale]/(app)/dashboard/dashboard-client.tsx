'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [endCustomerError, setEndCustomerError] = useState<string | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);

  const [endCustomerName, setEndCustomerName] = useState('');
  const [endCustomerEmail, setEndCustomerEmail] = useState('');
  const [endCustomerPhone, setEndCustomerPhone] = useState('');

  const [agentName, setAgentName] = useState('');
  const [baseAgentKey, setBaseAgentKey] = useState('');
  const [languageDefault, setLanguageDefault] = useState<'ES' | 'EN'>('ES');
  const [status, setStatus] = useState<'DRAFT' | 'ACTIVE' | 'PAUSED'>('DRAFT');
  const [endCustomerId, setEndCustomerId] = useState('');
  const [useProfilePhone, setUseProfilePhone] = useState(Boolean(profilePhone));
  const [agentPhone, setAgentPhone] = useState('');

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
        setEndCustomerError(result?.error ?? 'Failed to create end customer.');
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
        setAgentError(result?.error ?? 'Failed to create agent instance.');
        return;
      }

      setAgentName('');
      setBaseAgentKey('');
      setEndCustomerId('');
      setAgentPhone('');
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {tenantMode === 'RESELLER' ? (
        <Card>
          <CardHeader>
            <CardTitle>Create End Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitEndCustomer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="endCustomerName">Name</Label>
                <Input
                  id="endCustomerName"
                  value={endCustomerName}
                  onChange={(event) => setEndCustomerName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endCustomerEmail">Email</Label>
                <Input
                  id="endCustomerEmail"
                  type="email"
                  value={endCustomerEmail}
                  onChange={(event) => setEndCustomerEmail(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endCustomerPhone">Phone</Label>
                <Input
                  id="endCustomerPhone"
                  value={endCustomerPhone}
                  onChange={(event) => setEndCustomerPhone(event.target.value)}
                />
              </div>
              {endCustomerError ? <p className="text-sm text-red-500">{endCustomerError}</p> : null}
              <Button type="submit" disabled={isPending}>
                Create end customer
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Create Agent Instance</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitAgent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agentName">Name</Label>
              <Input
                id="agentName"
                value={agentName}
                onChange={(event) => setAgentName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseAgentKey">Base agent key</Label>
              <Input
                id="baseAgentKey"
                value={baseAgentKey}
                onChange={(event) => setBaseAgentKey(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="languageDefault">Language</Label>
                <select
                  id="languageDefault"
                  className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                  value={languageDefault}
                  onChange={(event) => setLanguageDefault(event.target.value as 'ES' | 'EN')}
                >
                  <option value="ES">ES</option>
                  <option value="EN">EN</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as 'DRAFT' | 'ACTIVE' | 'PAUSED')}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                </select>
              </div>
            </div>
            {tenantMode === 'RESELLER' ? (
              <div className="space-y-2">
                <Label htmlFor="endCustomerId">End customer</Label>
                <select
                  id="endCustomerId"
                  className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                  value={endCustomerId}
                  onChange={(event) => setEndCustomerId(event.target.value)}
                >
                  <option value="">None</option>
                  {endCustomers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {profilePhone ? (
              <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={useProfilePhone}
                    onChange={(event) => setUseProfilePhone(event.target.checked)}
                  />
                  Use profile phone ({profilePhone})
                </label>
              </div>
            ) : null}
            {!useProfilePhone ? (
              <div className="space-y-2">
                <Label htmlFor="agentPhone">Agent phone</Label>
                <Input
                  id="agentPhone"
                  value={agentPhone}
                  onChange={(event) => setAgentPhone(event.target.value)}
                  placeholder="Optional"
                />
              </div>
            ) : null}
            {agentError ? <p className="text-sm text-red-500">{agentError}</p> : null}
            <Button type="submit" disabled={isPending}>
              Create agent instance
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
