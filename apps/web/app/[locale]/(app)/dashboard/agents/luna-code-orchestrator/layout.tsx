import Link from 'next/link';
import { requireRole } from '@/lib/auth/guards';

export default async function LunaCodeOrchestratorLayout({
  children: _children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireRole('TENANT_OPERATOR');
  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-950">
      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-600">Sistema retirado</p>
      <h1 className="mt-3 text-2xl font-semibold">Luna Code Orchestrator fue reemplazado por Engineering Studio</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        La creación y ejecución de agentes de desarrollo se centraliza en Engineering Studio.
        Los registros históricos se conservan durante la transición.
      </p>
      <Link href={`/${locale}/admin/programming`} className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
        Ir a Engineering Studio
      </Link>
      <p className="mt-3 text-xs text-slate-500">El acceso a Engineering Studio requiere permisos administrativos.</p>
    </section>
  );
}
