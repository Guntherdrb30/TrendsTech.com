"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ResetPasswordFormProps = {
  locale: string;
  token?: string;
};

type ResetCopy = {
  title: string;
  labels: {
    password: string;
    confirm: string;
  };
  actions: {
    submit: string;
    submitting: string;
  };
  success: string;
  loginLabel: string;
  errors: {
    missingToken: string;
    passwordRequired: string;
    passwordShort: string;
    confirmRequired: string;
    confirmMismatch: string;
    invalidToken: string;
    generic: string;
  };
};

type FieldErrors = Partial<Record<"password" | "confirm", string>>;

function getCopy(locale: string): ResetCopy {
  if (locale.startsWith("es")) {
    return {
      title: "Restablecer contrasena",
      labels: {
        password: "Nueva contrasena",
        confirm: "Confirmar contrasena"
      },
      actions: {
        submit: "Actualizar contrasena",
        submitting: "Actualizando..."
      },
      success: "Contrasena actualizada. Ya puedes iniciar sesion.",
      loginLabel: "Ir al login",
      errors: {
        missingToken: "Falta el token de recuperacion.",
        passwordRequired: "La contrasena es obligatoria",
        passwordShort: "La contrasena debe tener al menos 8 caracteres",
        confirmRequired: "Confirma tu contrasena",
        confirmMismatch: "Las contrasenas no coinciden",
        invalidToken: "Token invalido o expirado",
        generic: "No se pudo actualizar la contrasena"
      }
    };
  }
  return {
    title: "Reset password",
    labels: {
      password: "New password",
      confirm: "Confirm password"
    },
    actions: {
      submit: "Update password",
      submitting: "Updating..."
    },
    success: "Password updated. You can sign in now.",
    loginLabel: "Go to login",
    errors: {
      missingToken: "Missing reset token.",
      passwordRequired: "Password is required",
      passwordShort: "Password must be at least 8 characters",
      confirmRequired: "Confirm your password",
      confirmMismatch: "Passwords do not match",
      invalidToken: "Invalid or expired token",
      generic: "Unable to update password"
    }
  };
}

function validate(password: string, confirm: string, copy: ResetCopy): FieldErrors {
  const errors: FieldErrors = {};
  if (!password) {
    errors.password = copy.errors.passwordRequired;
  } else if (password.length < 8) {
    errors.password = copy.errors.passwordShort;
  }
  if (!confirm) {
    errors.confirm = copy.errors.confirmRequired;
  } else if (confirm !== password) {
    errors.confirm = copy.errors.confirmMismatch;
  }
  return errors;
}

export function ResetPasswordForm({ locale, token }: ResetPasswordFormProps) {
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const copy = getCopy(locale);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError(copy.errors.missingToken);
      return;
    }

    const errors = validate(password, confirm, copy);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/password-reset/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password })
        });
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) {
          const message = payload.error?.toLowerCase().includes("token")
            ? copy.errors.invalidToken
            : copy.errors.generic;
          setError(message);
          return;
        }
        setSuccess(copy.success);
      } catch (fetchError) {
        console.error("Reset password failed", fetchError);
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
                    password: value.length >= 8 ? undefined : prev.password
                  }));
                }
              }}
              autoComplete="new-password"
              required
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "reset-password-error" : undefined}
            />
            {fieldErrors.password ? (
              <p id="reset-password-error" className="text-xs text-red-500">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">{copy.labels.confirm}</Label>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(event) => {
                const value = event.target.value;
                setConfirm(value);
                if (fieldErrors.confirm) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    confirm: value === password ? undefined : prev.confirm
                  }));
                }
              }}
              autoComplete="new-password"
              required
              aria-invalid={Boolean(fieldErrors.confirm)}
              aria-describedby={fieldErrors.confirm ? "reset-confirm-error" : undefined}
            />
            {fieldErrors.confirm ? (
              <p id="reset-confirm-error" className="text-xs text-red-500">
                {fieldErrors.confirm}
              </p>
            ) : null}
          </div>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {success ? (
            <div className="space-y-2 text-sm text-emerald-500">
              <p>{success}</p>
              <Link className="text-xs underline" href={`/${locale}/login`}>
                {copy.loginLabel}
              </Link>
            </div>
          ) : null}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? copy.actions.submitting : copy.actions.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
