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
  { label: 'Dashboard', href: '/partner', index: '01' },
  { label: 'Proyectos y oportunidades', href: '/partner/projects', index: '02' },
  { label: 'Director B2B', href: '/partner/director', index: '03' },
  { label: 'Investigación', href: '/partner/research', index: '04' },
  { label: 'Levantamientos', href: '/partner/discovery', index: '05' },
  { label: 'Documentos', href: '/partner/documents', index: '06' },
  { label: 'Propuestas', href: '/partner/proposals', index: '07' },
  { label: 'Seguimiento', href: '/partner/follow-up', index: '08' },
  { label: 'Pendientes', href: '/partner/tasks', index: '09' },
  { label: 'Perfil', href: '/partner/profile', index: '10' }
] as const;

export function PartnerShell({ locale, partnerName, children }: PartnerShellProps) {
  const pathname = usePathname();
  const base = `/${locale}`;
  const currentSection = navItems.find((item) => {
    const href = `${base}${item.href}`;
    return pathname === href || (item.href !== '/partner' && pathname.startsWith(href));
  })?.label ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-[#f7faf9] text-[#111418]">
      <div className="grid min-h-screen lg:grid-cols-[286px_1fr]">
        <aside className="border-b border-black/[.07] bg-white px-4 py-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <Link href={`${base}/partner`} className="flex items-center gap-3 px-2">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-[#00c7ca] bg-[#effcfa] text-base font-semibold text-[#009fa4]">T</span>
            <span>
              <span className="block text-sm font-semibold tracking-[-.02em]">Trends172Tech</span>
              <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[.12em] text-[#00aeb3]">Portal de Aliados</span>
            </span>
          </Link>

          <div className="mt-6 rounded-2xl border border-black/[.06] bg-[linear-gradient(145deg,#f8fbfa,#effaf8)] px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-xs font-semibold text-[#00aeb3] shadow-sm">{partnerName.slice(0, 2).toUpperCase()}</span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#78828b]">Organización aliada</p>
                <p className="mt-1 truncate text-sm font-semibold">{partnerName}</p>
              </div>
            </div>
          </div>

          <p className="mt-7 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#98a0a8]">Workspace B2B</p>
          <nav className="mt-2 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {navItems.map((item) => {
              const href = `${base}${item.href}`;
              const active = pathname === href || (item.href !== '/partner' && pathname.startsWith(href));
              return (
                <Link
                  key={item.href}
                  href={href}
                  className={cn(
                    'group flex min-h-10 whitespace-nowrap rounded-xl border px-3 py-2.5 text-[13px] font-medium transition lg:w-full lg:items-center lg:gap-3',
                    active
                      ? 'border-[#bcebed] bg-[#effbfa] text-[#111418] shadow-[0_10px_28px_-22px_rgba(0,174,179,.7)]'
                      : 'border-transparent text-[#65707a] hover:border-black/[.05] hover:bg-[#f7faf9] hover:text-[#111418]'
                  )}
                >
                  <span className={cn('hidden w-5 text-[9px] font-semibold tracking-wider lg:block', active ? 'text-[#00aeb3]' : 'text-[#b0b7bd] group-hover:text-[#00aeb3]')}>{item.index}</span>
                  <span className="flex-1">{item.label}</span>
                  {active ? <span className="hidden h-1.5 w-1.5 rounded-full bg-[#00c7ca] lg:block" /> : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto hidden rounded-2xl border border-black/[.06] bg-[#fbfcfb] p-4 lg:block">
            <p className="text-xs font-semibold">Expediente empresarial</p>
            <p className="mt-1.5 text-[11px] leading-5 text-[#7a848c]">Cada proyecto mantiene su memoria, documentos y decisiones de forma independiente.</p>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-black/[.06] bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-7 lg:px-10">
            <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between gap-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#00aeb3]">Portal de Aliados / {currentSection}</p>
                <h1 className="mt-1 font-[var(--font-display)] text-xl font-semibold tracking-[-.035em]">Inteligencia empresarial aplicada</h1>
              </div>
              <div className="hidden items-center gap-3 sm:flex">
                <span className="inline-flex items-center gap-2 rounded-full border border-black/[.06] bg-[#f7faf9] px-3 py-2 text-[11px] font-medium text-[#68717b]"><span className="h-1.5 w-1.5 rounded-full bg-[#00c7ca]" />Workspace activo</span>
                <Link href={`${base}`} className="rounded-full border border-black/[.08] bg-white px-4 py-2 text-xs font-semibold transition hover:border-[#92dfe1] hover:text-[#009fa4]">Ir a Trends172Tech ↗</Link>
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1480px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
