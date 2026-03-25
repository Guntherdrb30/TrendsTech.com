import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getPageImageAdminPages } from "@/lib/page-images";
import { PageImageManagerClient } from "./page-image-manager-client";

export const dynamic = "force-dynamic";

export default async function RootSiteMediaPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEs = locale.startsWith("es");
  await requireRole("ROOT");
  const pages = await getPageImageAdminPages(locale);

  return (
    <section className="space-y-6">
      <div className="interactive-panel premium-noise overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-7 shadow-[0_35px_100px_-72px_rgba(15,23,42,0.35)] sm:px-8">
        <div className="space-y-3">
          <div className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            {isEs ? "Root media" : "Root media"}
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-slate-900">
                {isEs ? "Gestor de imagenes por pagina" : "Page image manager"}
              </h1>
              <p className="max-w-3xl text-sm text-slate-500">
                {isEs
                  ? "Organiza las imagenes del sitio por pagina y por slot visual. Cada cambio se sube a Vercel Blob y queda listo para publicarse desde root."
                  : "Organize site imagery by page and visual slot. Each change is uploaded to Vercel Blob and managed from root."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/root`}
                className="interactive-chip inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                {isEs ? "Volver a root" : "Back to root"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <PageImageManagerClient locale={locale} initialPages={pages} />
    </section>
  );
}
