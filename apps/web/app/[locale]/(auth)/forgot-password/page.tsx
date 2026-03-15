import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

function getForgotCopy(locale: string) {
  if (locale.startsWith("es")) {
    return {
      title: "Recuperar contrasena",
      subtitle: "Te enviaremos un enlace para restablecer tu contrasena.",
      linkLabel: "Volver al login"
    };
  }
  return {
    title: "Reset password",
    subtitle: "We will send you a link to reset your password.",
    linkLabel: "Back to login"
  };
}

export default async function ForgotPasswordPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = getForgotCopy(locale);
  const emailConfigured = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{copy.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{copy.subtitle}</p>
        {!emailConfigured ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {locale.startsWith("es")
              ? "El correo de recuperacion no esta configurado. Si tienes una sesion activa, cambia tu contrasena desde Perfil. Si no, solicita a un ROOT que la restablezca."
              : "Password recovery email is not configured. If you still have an active session, change your password from Profile. Otherwise, ask a ROOT user to reset it."}
          </p>
        ) : null}
        <Link className="text-sm text-blue-600 hover:underline" href={`/${locale}/login`}>
          {copy.linkLabel}
        </Link>
      </div>
      <ForgotPasswordForm locale={locale} />
    </section>
  );
}
