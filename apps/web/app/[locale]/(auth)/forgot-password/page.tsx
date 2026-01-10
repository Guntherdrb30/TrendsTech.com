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

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{copy.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{copy.subtitle}</p>
        <Link className="text-sm text-blue-600 hover:underline" href={`/${locale}/login`}>
          {copy.linkLabel}
        </Link>
      </div>
      <ForgotPasswordForm locale={locale} />
    </section>
  );
}
