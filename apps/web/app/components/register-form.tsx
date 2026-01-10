'use client';

import { useState, useTransition } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RegisterFormProps {
  locale: string;
}

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  company: string;
};

export function RegisterForm({ locale }: RegisterFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<RegisterPayload>({
    name: '',
    email: '',
    password: '',
    company: ''
  });

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? 'Registration failed.');
        return;
      }

      const signInResult = await signIn('credentials', {
        email: payload.email,
        password: payload.password,
        redirect: false
      });

      if (signInResult?.error) {
        setError('Account created but sign in failed.');
        return;
      }

      router.push(`/${locale}/dashboard`);
      router.refresh();
    });
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={payload.name}
              onChange={(event) => setPayload((prev) => ({ ...prev, name: event.target.value }))}
              autoComplete="name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={payload.company}
              onChange={(event) => setPayload((prev) => ({ ...prev, company: event.target.value }))}
              autoComplete="organization"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={payload.email}
              onChange={(event) => setPayload((prev) => ({ ...prev, email: event.target.value }))}
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={payload.password}
              onChange={(event) => setPayload((prev) => ({ ...prev, password: event.target.value }))}
              autoComplete="new-password"
              required
            />
          </div>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
