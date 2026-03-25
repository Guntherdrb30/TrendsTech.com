'use client';

import { useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ProfileFormProps = {
  initialName: string;
  email: string;
  initialPhone: string;
  initialAvatarUrl: string;
};

export function ProfileForm({
  initialName,
  email,
  initialPhone,
  initialAvatarUrl
}: ProfileFormProps) {
  const locale = useLocale();
  const isEs = locale.startsWith('es');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const normalized = {
        name: name.trim(),
        phone: phone.trim() || null,
        avatarUrl: avatarUrl.trim() || null
      };
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...normalized
        })
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? (isEs ? 'No se pudo actualizar el perfil.' : 'Failed to update profile.'));
        return;
      }

      setSaved(true);
    });
  };

  return (
    <Card className="interactive-panel premium-noise">
      <CardHeader className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{isEs ? 'Identidad' : 'Identity'}</p>
        <CardTitle>{isEs ? 'Perfil' : 'Profile'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">{isEs ? 'Nombre' : 'Name'}</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{isEs ? 'Correo' : 'Email'}</Label>
            <Input id="email" value={email} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{isEs ? 'Telefono' : 'Phone'}</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatarUrl">{isEs ? 'URL del avatar' : 'Avatar URL'}</Label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://..."
            />
          </div>
          {error ? (
            <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}
          {saved ? (
            <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {isEs ? 'Guardado.' : 'Saved.'}
            </div>
          ) : null}
          <Button type="submit" disabled={isPending}>
            {isPending ? (isEs ? 'Guardando...' : 'Saving...') : (isEs ? 'Guardar perfil' : 'Save profile')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
