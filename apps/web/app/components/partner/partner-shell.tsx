'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type PartnerShellProps = {
  locale: string;
  partnerName: string;
  children: React.ReactNode;
};

const navItems = [
  { label: 'Dashboard', href: '/partner' },
  { label: 'Proyectos y oportunidades', href: '/partner/projects' },
  { label: 'Director B2B', href: '/partner/director' },
  { label: 'Investigación', href: '/partner/research' },
  { label: 'Levantamientos', href: '/partner/discovery' },
  { label: 'Documentos', href: '/partner/documents' },
  { label: 'Propuestas', href: '/partner/proposals' },
  { label: 'Seguimiento', href: '/partner/follow-up' },
  { label: 'Pendientes', href: '/partner/tasks' },
  { label: 'Perfil', href: '/partner/profile' }
] as const;

export function PartnerShell({ locale, partnerName, children }: PartnerShellProps) {
  const pathname = usePathname();
  const base = `/${locale}`;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f8fb_0%,#ffffff_35%,#f8fafc_100%)] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-black/8 bg-white/95 px-4 py-4 dark:border-slate-800 dark:bg-slate-950 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <Link href={`${base}/partner`} className="block">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-red-500 text-lg font-semibold text-red-600">T</span>
              <span>
                <span className="block text-sm font-semibold">Trends172Tech</span>
                <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">Portal de Aliados</span>
              </span>
            </div>
          </Link>

          <div className="mt-6 rounded-xl border border-black/8 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Aliado</p>
            <p className="mt-1 text-sm font-semibold">{partnerName}</p>
          </div>

          <nav className="mt-6 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {navItems.map((item) => {
              const href = `${base}${item.href}`;
              const active = pathname === href || (item.href !== '/partner' && pathname.startsWith(href));
              return (
                <Link
                  key={item.href}
                  href={href}
                  className={cn(
                    'whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium transition lg:w-full',
                    active
                      ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950'
                      : 'border-transparent text-slate-600 hover:border-black/10 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:border-slate-800 dark:hover:bg-slate-900 dark:hover:text-white'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="border-b border-black/8 bg-white/85 px-4 py-5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-2xl font-semibold">Portal de Aliados</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Oportunidades, memoria de proyectos y asistencia B2B en un solo espacio.</p>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
