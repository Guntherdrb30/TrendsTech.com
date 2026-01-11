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
  redirectTo?: string;
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

type RegisterCopy = {
  title: string;
  labels: {
    name: string;
    company: string;
    email: string;
    phone: string;
    password: string;
  };
  actions: {
    submit: string;
    submitting: string;
  };
  hints: {
    phoneExample: string;
    phonePlaceholder: string;
  };
  errors: {
    nameRequired: string;
    companyShort: string;
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordShort: string;
    phoneFormat: string;
    phoneLength: string;
    emailExists: string;
    humanRequired: string;
    invalidForm: string;
    securityConfigMissing: string;
    registrationFailed: string;
    loginAfterRegisterFailed: string;
  };
};

function getRegisterCopy(locale: string): RegisterCopy {
  if (locale.startsWith('es')) {
    return {
      title: 'Crear cuenta',
      labels: {
        name: 'Nombre',
        company: 'Empresa',
        email: 'Correo',
        phone: 'Telefono',
        password: 'Contrasena'
      },
      actions: {
        submit: 'Crear cuenta',
        submitting: 'Creando cuenta...'
      },
      hints: {
        phoneExample: 'Ejemplo: +58 412 123 4567',
        phonePlaceholder: '+58 412 123 4567'
      },
      errors: {
        nameRequired: 'El nombre es obligatorio',
        companyShort: 'La empresa debe tener al menos 2 caracteres',
        emailRequired: 'El correo es obligatorio',
        emailInvalid: 'Ingresa un correo valido',
        passwordRequired: 'La contrasena es obligatoria',
        passwordShort: 'La contrasena debe tener al menos 8 caracteres',
        phoneFormat: 'Usa solo digitos, espacios y + ( ) -',
        phoneLength: 'Ingresa al menos 7 digitos',
        emailExists: 'El correo ya esta registrado',
        humanRequired: 'Verificacion humana requerida',
        invalidForm: 'Revisa los campos y vuelve a intentar',
        securityConfigMissing: 'Falta configurar la verificacion humana',
        registrationFailed: 'No se pudo registrar la cuenta',
        loginAfterRegisterFailed: 'Cuenta creada, pero no se pudo iniciar sesion'
      }
    };
  }

  return {
    title: 'Create account',
    labels: {
      name: 'Name',
      company: 'Company',
      email: 'Email',
      phone: 'Phone',
      password: 'Password'
    },
    actions: {
      submit: 'Create account',
      submitting: 'Creating account...'
    },
    hints: {
      phoneExample: 'Example: +58 412 123 4567',
      phonePlaceholder: '+58 412 123 4567'
    },
    errors: {
      nameRequired: 'Name is required',
      companyShort: 'Company must be at least 2 characters',
      emailRequired: 'Email is required',
      emailInvalid: 'Enter a valid email',
      passwordRequired: 'Password is required',
      passwordShort: 'Password must be at least 8 characters',
      phoneFormat: 'Use only digits, spaces, and + ( ) -',
      phoneLength: 'Enter at least 7 digits',
      emailExists: 'Email already exists',
      humanRequired: 'Human verification required',
      invalidForm: 'Review the fields and try again',
      securityConfigMissing: 'Human verification is not configured',
      registrationFailed: 'Registration failed',
      loginAfterRegisterFailed: 'Account created but sign in failed'
    }
  };
}

function countDigits(value: string) {
  return value.replace(/\D/g, '').length;
}

function validatePhone(value: string, copy: RegisterCopy) {
  if (!value.trim()) {
    return null;
  }
  if (!PHONE_ALLOWED.test(value)) {
    return copy.errors.phoneFormat;
  }
  if (countDigits(value) < 7) {
    return copy.errors.phoneLength;
  }
  return null;
}

function validatePayload(payload: RegisterPayload, copy: RegisterCopy): FieldErrors {
  const errors: FieldErrors = {};
  if (!payload.name.trim()) {
    errors.name = copy.errors.nameRequired;
  }
  if (!payload.company.trim() || payload.company.trim().length < 2) {
    errors.company = copy.errors.companyShort;
  }
  if (!payload.email.trim()) {
    errors.email = copy.errors.emailRequired;
  } else if (!/^\S+@\S+\.\S+$/.test(payload.email.trim())) {
    errors.email = copy.errors.emailInvalid;
  }
  if (!payload.password) {
    errors.password = copy.errors.passwordRequired;
  } else if (payload.password.length < 8) {
    errors.password = copy.errors.passwordShort;
  }
  const phoneError = validatePhone(payload.phone, copy);
  if (phoneError) {
    errors.phone = phoneError;
  }
  return errors;
}

function mapRegisterError(status: number, serverMessage: string | null, copy: RegisterCopy) {
  if (serverMessage) {
    const normalized = serverMessage.toLowerCase();
    if (normalized.includes('email') && normalized.includes('exist')) {
      return copy.errors.emailExists;
    }
    if (normalized.includes('human verification')) {
      return copy.errors.humanRequired;
    }
    if (normalized.includes('invalid payload')) {
      return copy.errors.invalidForm;
    }
    if (normalized.includes('missing turnstile_secret_key')) {
      return copy.errors.securityConfigMissing;
    }
  }
  switch (status) {
    case 403:
      return copy.errors.humanRequired;
    case 409:
      return copy.errors.emailExists;
    case 400:
      return copy.errors.invalidForm;
    default:
      return serverMessage ? `${copy.errors.registrationFailed}: ${serverMessage}` : copy.errors.registrationFailed;
  }
}

function resolveRedirect(locale: string, redirectTo?: string) {
  if (!redirectTo || !redirectTo.startsWith('/')) {
    return `/${locale}/dashboard`;
  }
  if (!redirectTo.startsWith(`/${locale}/`)) {
    return `/${locale}/dashboard`;
  }
  return redirectTo;
}

export function RegisterForm({ locale, redirectTo }: RegisterFormProps) {
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
  const copy = getRegisterCopy(locale);
  const destination = resolveRedirect(locale, redirectTo);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const errors = validatePayload(payload, copy);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    startTransition(async () => {
      const normalized = {
        ...payload,
        phone: payload.phone.trim() || undefined
      };

      let response: Response;
      try {
        response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(normalized)
        });
      } catch (fetchError) {
        console.error('Registration failed', fetchError);
        setError(copy.errors.registrationFailed);
        return;
      }
      if (!response.ok) {
        const result = (await response.json().catch(() => ({}))) as { error?: string };
        const serverMessage = typeof result.error === 'string' ? result.error : null;
        setError(mapRegisterError(response.status, serverMessage, copy));
        return;
      }

      const signInResult = await signIn('credentials', {
        email: payload.email,
        password: payload.password,
        redirect: false
      });

      if (!signInResult || signInResult.error || signInResult.ok === false) {
        setError(copy.errors.loginAfterRegisterFailed);
        return;
      }

      router.push(destination);
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
            <Label htmlFor="name">{copy.labels.name}</Label>
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
            <Label htmlFor="company">{copy.labels.company}</Label>
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
            <Label htmlFor="email">{copy.labels.email}</Label>
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
            <Label htmlFor="phone">{copy.labels.phone}</Label>
            <Input
              id="phone"
              value={payload.phone}
              inputMode="tel"
              placeholder={copy.hints.phonePlaceholder}
              onChange={(event) => {
                const value = event.target.value;
                setPayload((prev) => ({ ...prev, phone: value }));
                if (fieldErrors.phone) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    phone: validatePhone(value, copy) ? prev.phone : undefined
                  }));
                }
              }}
              autoComplete="tel"
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? 'phone-hint phone-error' : 'phone-hint'}
            />
            <p id="phone-hint" className="text-xs text-slate-500">
              {copy.hints.phoneExample}
            </p>
            {fieldErrors.phone ? (
              <p id="phone-error" className="text-xs text-red-500">
                {fieldErrors.phone}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{copy.labels.password}</Label>
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
            {isPending ? copy.actions.submitting : copy.actions.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
