"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ForgotPasswordFormProps = {
  locale: string;
};

type ForgotCopy = {
  title: string;
  label: string;
  submit: string;
  submitting: string;
  success: string;
  errors: {
    emailRequired: string;
    emailInvalid: string;
    generic: string;
  };
};

type FieldErrors = Partial<Record<"email", string>>;

function getCopy(locale: string): ForgotCopy {
  if (locale.startsWith("es")) {
    return {
      title: "Recuperar contrasena",
      label: "Correo",
      submit: "Enviar enlace",
      submitting: "Enviando...",
      success: "Si el correo existe, enviaremos un enlace de recuperacion.",
      errors: {
        emailRequired: "El correo es obligatorio",
        emailInvalid: "Ingresa un correo valido",
        generic: "No se pudo enviar el enlace"
      }
    };
  }
  return {
    title: "Reset password",
    label: "Email",
    submit: "Send link",
    submitting: "Sending...",
    success: "If the email exists, we will send a reset link.",
    errors: {
      emailRequired: "Email is required",
      emailInvalid: "Enter a valid email",
      generic: "Unable to send reset link"
    }
  };
}

function validateEmail(email: string, copy: ForgotCopy): FieldErrors {
  const errors: FieldErrors = {};
  if (!email.trim()) {
    errors.email = copy.errors.emailRequired;
  } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.email = copy.errors.emailInvalid;
  }
  return errors;
}

export function ForgotPasswordForm({ locale }: ForgotPasswordFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [debugLink, setDebugLink] = useState<string | null>(null);
  const copy = getCopy(locale);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setDebugLink(null);

    const errors = validateEmail(email, copy);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/password-reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, locale })
        });
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
          resetUrl?: string;
        };

        if (!response.ok) {
          setError(payload.error ?? copy.errors.generic);
          return;
        }

        setSuccess(copy.success);
        if (payload.resetUrl) {
          setDebugLink(payload.resetUrl);
        }
        router.refresh();
      } catch (fetchError) {
        console.error("Forgot password failed", fetchError);
        setError(copy.errors.generic);
      }
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
            <Label htmlFor="email">{copy.label}</Label>
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
              aria-describedby={fieldErrors.email ? "forgot-email-error" : undefined}
            />
            {fieldErrors.email ? (
              <p id="forgot-email-error" className="text-xs text-red-500">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {success ? (
            <div className="space-y-2 text-sm text-emerald-500">
              <p>{success}</p>
              {debugLink ? (
                <a className="text-xs underline" href={debugLink}>
                  {debugLink}
                </a>
              ) : null}
            </div>
          ) : null}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? copy.submitting : copy.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
