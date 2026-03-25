import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getEditableSiteAssets } from "@/lib/site-assets";
import { SiteMediaClient } from "./site-media-client";

export const dynamic = "force-dynamic";

export default async function DashboardSiteMediaPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole("TENANT_ADMIN");
  const assets = await getEditableSiteAssets();

  return (
    <section className="space-y-6">
      <div className="interactive-panel premium-noise overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-7 shadow-[0_35px_100px_-72px_rgba(15,23,42,0.35)] sm:px-8">
        <div className="space-y-3">
          <div className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">
            Media del sitio
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
                Ajustes visuales del hero y bloques comerciales
              </h1>
              <p className="max-w-3xl text-sm text-slate-500 dark:text-slate-400">
                Administra las imagenes, mensajes y llamadas a la accion del sitio corporativo. El
                hero principal ahora usa estas piezas como carrusel de pantalla completa.
                Acceso disponible para {user.role === "ROOT" ? "ROOT" : "TENANT_ADMIN"}.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}`}
              className="interactive-chip inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
            >
              Ver home publica
            </Link>
            {user.role === "ROOT" ? (
              <Link
                href={`/${locale}/root`}
                className="interactive-chip inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
              >
                Volver a root
              </Link>
            ) : null}
            </div>
          </div>
        </div>
      </div>

      <SiteMediaClient initialAssets={assets} />
    </section>
  );
}
