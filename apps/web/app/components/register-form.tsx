'use client';

import { useMemo, useState, useTransition } from 'react';
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
  phone: string;
};

type FieldErrors = Partial<Record<keyof RegisterPayload, string>>;

const PHONE_ALLOWED = /^[0-9+()\-\s]+$/;
const PHONE_EXAMPLE = '+58 412 123 4567';

function countDigits(value: string) {
  return value.replace(/\D/g, '').length;
}

function validatePhone(value: string) {
  if (!value.trim()) {
    return null;
  }
  if (!PHONE_ALLOWED.test(value)) {
    return 'Use only digits, spaces, and + ( ) -';
  }
  if (countDigits(value) < 7) {
    return 'Enter at least 7 digits';
  }
  return null;
}

function validatePayload(payload: RegisterPayload): FieldErrors {
  const errors: FieldErrors = {};
  if (!payload.name.trim()) {
    errors.name = 'Name is required';
  }
  if (!payload.company.trim() || payload.company.trim().length < 2) {
    errors.company = 'Company name must be at least 2 characters';
  }
  if (!payload.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(payload.email.trim())) {
    errors.email = 'Enter a valid email';
  }
  if (!payload.password) {
    errors.password = 'Password is required';
  } else if (payload.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  const phoneError = validatePhone(payload.phone);
  if (phoneError) {
    errors.phone = phoneError;
  }
  return errors;
}

export function RegisterForm({ locale }: RegisterFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [payload, setPayload] = useState<RegisterPayload>({
    name: '',
    email: '',
    password: '',
    company: '',
    phone: ''
  });

  const phoneHint = useMemo(() => `Example: ${PHONE_EXAMPLE}`, []);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const errors = validatePayload(payload);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    startTransition(async () => {
      const normalized = {
        ...payload,
        phone: payload.phone.trim() || undefined
      };
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized)
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
              onChange={(event) => {
                const value = event.target.value;
                setPayload((prev) => ({ ...prev, name: value }));
                if (fieldErrors.name) {
                  setFieldErrors((prev) => ({ ...prev, name: value.trim() ? undefined : prev.name }));
                }
              }}
              autoComplete="name"
              required
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? 'name-error' : undefined}
            />
            {fieldErrors.name ? (
              <p id="name-error" className="text-xs text-red-500">
                {fieldErrors.name}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={payload.company}
              onChange={(event) => {
                const value = event.target.value;
                setPayload((prev) => ({ ...prev, company: value }));
                if (fieldErrors.company) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    company: value.trim().length >= 2 ? undefined : prev.company
                  }));
                }
              }}
              autoComplete="organization"
              required
              aria-invalid={Boolean(fieldErrors.company)}
              aria-describedby={fieldErrors.company ? 'company-error' : undefined}
            />
            {fieldErrors.company ? (
              <p id="company-error" className="text-xs text-red-500">
                {fieldErrors.company}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={payload.email}
              onChange={(event) => {
                const value = event.target.value;
                setPayload((prev) => ({ ...prev, email: value }));
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    email: /^\S+@\S+\.\S+$/.test(value.trim()) ? undefined : prev.email
                  }));
                }
              }}
              autoComplete="email"
              required
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldErrors.email ? (
              <p id="email-error" className="text-xs text-red-500">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={payload.phone}
              inputMode="tel"
              placeholder={PHONE_EXAMPLE}
              onChange={(event) => {
                const value = event.target.value;
                setPayload((prev) => ({ ...prev, phone: value }));
                if (fieldErrors.phone) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    phone: validatePhone(value) ? prev.phone : undefined
                  }));
                }
              }}
              autoComplete="tel"
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? 'phone-hint phone-error' : 'phone-hint'}
            />
            <p id="phone-hint" className="text-xs text-slate-500">
              {phoneHint}
            </p>
            {fieldErrors.phone ? (
              <p id="phone-error" className="text-xs text-red-500">
                {fieldErrors.phone}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={payload.password}
              onChange={(event) => {
                const value = event.target.value;
                setPayload((prev) => ({ ...prev, password: value }));
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    password: value.length >= 8 ? undefined : prev.password
                  }));
                }
              }}
              autoComplete="new-password"
              required
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            />
            {fieldErrors.password ? (
              <p id="password-error" className="text-xs text-red-500">
                {fieldErrors.password}
              </p>
            ) : null}
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
