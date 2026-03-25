'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ChangePasswordFormProps = {
  locale: string;
};

type ChangePasswordCopy = {
  title: string;
  body: string;
  currentLabel: string;
  nextLabel: string;
  confirmLabel: string;
  submit: string;
  submitting: string;
  success: string;
  help: string;
  errors: {
    required: string;
    mismatch: string;
    tooShort: string;
    generic: string;
  };
};

function getCopy(locale: string): ChangePasswordCopy {
  if (locale.startsWith('es')) {
    return {
      title: 'Seguridad',
      body: 'Cambia tu contrasena desde el panel sin depender del correo.',
      currentLabel: 'Contrasena actual',
      nextLabel: 'Nueva contrasena',
      confirmLabel: 'Confirmar nueva contrasena',
      submit: 'Actualizar contrasena',
      submitting: 'Actualizando...',
      success: 'Contrasena actualizada.',
      help: 'Si olvidaste tu contrasena y no hay correo configurado, un usuario ROOT debe restablecerla.',
      errors: {
        required: 'Todos los campos son obligatorios',
        mismatch: 'La confirmacion no coincide',
        tooShort: 'La contrasena debe tener al menos 8 caracteres',
        generic: 'No se pudo actualizar la contrasena'
      }
    };
  }

  return {
    title: 'Security',
    body: 'Change your password from the dashboard without relying on email.',
    currentLabel: 'Current password',
    nextLabel: 'New password',
    confirmLabel: 'Confirm new password',
    submit: 'Update password',
    submitting: 'Updating...',
    success: 'Password updated.',
    help: 'If you forgot your password and email is not configured, a ROOT user must reset it.',
    errors: {
      required: 'All fields are required',
      mismatch: 'Confirmation does not match',
      tooShort: 'Password must be at least 8 characters',
      generic: 'Unable to update password'
    }
  };
}

export function ChangePasswordForm({ locale }: ChangePasswordFormProps) {
  const copy = getCopy(locale);
  const [isPending, startTransition] = useTransition();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaved(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(copy.errors.required);
      return;
    }

    if (newPassword.length < 8) {
      setError(copy.errors.tooShort);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(copy.errors.mismatch);
      return;
    }

    startTransition(async () => {
      const response = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? copy.errors.generic);
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSaved(true);
    });
  };

  return (
    <Card className="interactive-panel premium-noise">
      <CardHeader className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Security</p>
        <CardTitle>{copy.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">{copy.body}</p>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{copy.currentLabel}</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">{copy.nextLabel}</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{copy.confirmLabel}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{copy.help}</p>
          {error ? (
            <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}
          {saved ? (
            <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {copy.success}
            </div>
          ) : null}
          <Button type="submit" disabled={isPending}>
            {isPending ? copy.submitting : copy.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
