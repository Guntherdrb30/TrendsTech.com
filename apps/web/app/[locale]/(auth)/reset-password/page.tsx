import Link from "next/link";
import { ResetPasswordForm } from "@/components/reset-password-form";

function getResetCopy(locale: string) {
  if (locale.startsWith("es")) {
    return {
      title: "Restablecer contrasena",
      subtitle: "Crea una nueva contrasena para tu cuenta.",
      linkLabel: "Volver al login"
    };
  }
  return {
    title: "Reset password",
    subtitle: "Create a new password for your account.",
    linkLabel: "Back to login"
  };
}

export default async function ResetPasswordPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: { token?: string };
}) {
  const { locale } = await params;
  const copy = getResetCopy(locale);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{copy.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{copy.subtitle}</p>
        <Link className="text-sm text-blue-600 hover:underline" href={`/${locale}/login`}>
          {copy.linkLabel}
        </Link>
      </div>
      <ResetPasswordForm locale={locale} token={searchParams.token} />
    </section>
  );
}
