'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PartnerActivationForm({ locale }: { locale: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!currentPassword || !newPassword || !confirmPassword) return setError('Completa todos los campos.');
    if (newPassword.length < 12) return setError('La nueva clave debe tener al menos 12 caracteres.');
    if (newPassword !== confirmPassword) return setError('La confirmación no coincide.');
    if (currentPassword === newPassword) return setError('La nueva clave debe ser diferente a la temporal.');

    startTransition(async () => {
      const response = await fetch('/api/partner/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) return setError(payload.error || 'No fue posible activar el acceso.');
      router.replace(`/${locale}/partner`);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader><CardTitle>Cambiar clave temporal</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2"><Label htmlFor="currentPassword">Clave temporal</Label><Input id="currentPassword" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="newPassword">Nueva clave</Label><Input id="newPassword" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="confirmPassword">Confirmar nueva clave</Label><Input id="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
          <p className="text-xs text-slate-500">Mínimo 12 caracteres. Al guardar se revocarán las demás sesiones y el aliado quedará activo.</p>
          {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
          <Button type="submit" disabled={pending} className="w-full">{pending ? 'Activando…' : 'Cambiar clave y entrar al portal'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
