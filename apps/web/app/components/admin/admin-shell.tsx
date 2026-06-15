'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type AdminShellProps = {
  locale: string;
  children: React.ReactNode;
  labels: {
    title: string;
    subtitle: string;
    navigation: string;
    dashboard: string;
    clients: string;
    projects: string;
    proposals: string;
    licenses: string;
    aiAgents: string;
    payments: string;
    backToSite: string;
  };
};

const navItems = [
  { key: 'dashboard', href: '/admin' },
  { key: 'payments', href: '/admin/payments' },
  { key: 'clients', href: '/admin/clients' },
  { key: 'projects', href: '/admin/projects' },
  { key: 'proposals', href: '/admin/proposals' },
  { key: 'licenses', href: '/admin/licenses' },
  { key: 'aiAgents', href: '/admin/ai-agents' }
] as const;

export function AdminShell({ locale, children, labels }: AdminShellProps) {
  const pathname = usePathname();
  const base = `/${locale}`;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f8fb_0%,#ffffff_30%,#f8fafc_100%)] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-black/8 bg-white/90 px-4 py-4 dark:border-slate-800 dark:bg-slate-950 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <div className="flex items-center justify-between gap-3 lg:block">
            <Link href={`${base}/admin`} className="block">
              <div className="text-sm font-semibold text-slate-950 dark:text-white">Trends172Tech</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{labels.title}</div>
            </Link>
            <Link
              href={base}
              className="rounded-full border border-black/10 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900 lg:mt-6 lg:inline-flex"
            >
              {labels.backToSite}
            </Link>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
              {labels.navigation}
            </p>
            <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {navItems.map((item) => {
                const href = `${base}${item.href}`;
                const active = pathname === href || (item.href !== '/admin' && pathname.startsWith(href));
                return (
                  <Link
                    key={item.key}
                    href={href}
                    className={cn(
                      'whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium transition lg:w-full',
                      active
                        ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950'
                        : 'border-transparent text-slate-600 hover:border-black/10 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:border-slate-800 dark:hover:bg-slate-900 dark:hover:text-white'
                    )}
                  >
                    {labels[item.key]}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="border-b border-black/8 bg-white/80 px-4 py-5 dark:border-slate-800 dark:bg-slate-950/80 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">{labels.title}</h1>
                <p className="mt-1 max-w-3xl text-sm text-slate-500 dark:text-slate-400">{labels.subtitle}</p>
              </div>
              <div className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300">
                ROOT
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
