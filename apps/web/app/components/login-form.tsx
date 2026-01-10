'use client';

import { useState, useTransition } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginFormProps {
  locale: string;
}

type LoginCopy = {
  title: string;
  labels: {
    email: string;
    password: string;
  };
  actions: {
    submit: string;
    submitting: string;
  };
  errors: {
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    invalidCredentials: string;
    generic: string;
  };
};

type LoginFieldErrors = Partial<Record<'email' | 'password', string>>;

function getLoginCopy(locale: string): LoginCopy {
  if (locale.startsWith('es')) {
    return {
      title: 'Iniciar sesion',
      labels: {
        email: 'Correo',
        password: 'Contrasena'
      },
      actions: {
        submit: 'Iniciar sesion',
        submitting: 'Ingresando...'
      },
      errors: {
        emailRequired: 'El correo es obligatorio',
        emailInvalid: 'Ingresa un correo valido',
        passwordRequired: 'La contrasena es obligatoria',
        invalidCredentials: 'Credenciales invalidas',
        generic: 'No se pudo iniciar sesion'
      }
    };
  }

  return {
    title: 'Sign in',
    labels: {
      email: 'Email',
      password: 'Password'
    },
    actions: {
      submit: 'Sign in',
      submitting: 'Signing in...'
    },
    errors: {
      emailRequired: 'Email is required',
      emailInvalid: 'Enter a valid email',
      passwordRequired: 'Password is required',
      invalidCredentials: 'Invalid credentials',
      generic: 'Unable to sign in'
    }
  };
}

function validateLogin(email: string, password: string, copy: LoginCopy): LoginFieldErrors {
  const errors: LoginFieldErrors = {};
  if (!email.trim()) {
    errors.email = copy.errors.emailRequired;
  } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.email = copy.errors.emailInvalid;
  }
  if (!password) {
    errors.password = copy.errors.passwordRequired;
  }
  return errors;
}

export function LoginForm({ locale }: LoginFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const copy = getLoginCopy(locale);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const errors = validateLogin(email, password, copy);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    startTransition(async () => {
      let result: Awaited<ReturnType<typeof signIn>> | undefined;
      try {
        result = await signIn('credentials', {
          email,
          password,
          redirect: false
        });
      } catch (fetchError) {
        console.error('Login failed', fetchError);
        setError(copy.errors.generic);
        return;
      }

      if (!result || result.error || result.ok === false) {
        const isCredentialError = result?.error === 'CredentialsSignin';
        setError(isCredentialError ? copy.errors.invalidCredentials : copy.errors.generic);
        return;
      }

      router.push(`/${locale}/dashboard`);
      router.refresh();
    });
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{copy.labels.email}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => {
                const value = event.target.value;
                setEmail(value);
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
              aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
            />
            {fieldErrors.email ? (
              <p id="login-email-error" className="text-xs text-red-500">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{copy.labels.password}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => {
                const value = event.target.value;
                setPassword(value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    password: value ? undefined : prev.password
                  }));
                }
              }}
              autoComplete="current-password"
              required
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
            />
            {fieldErrors.password ? (
              <p id="login-password-error" className="text-xs text-red-500">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? copy.actions.submitting : copy.actions.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
