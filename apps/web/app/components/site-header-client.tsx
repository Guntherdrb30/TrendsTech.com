'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams, type ReadonlyURLSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { AgentSearch } from './agent-search';
import { LocaleSwitcher } from './locale-switcher';
import { ThemeToggle } from './theme-toggle';

type AgentOption = {
  key: string;
  label: string;
};

type SiteHeaderClientProps = {
  base: string;
  isAuthenticated: boolean;
  labels: {
    home: string;
    agents: string;
    systems: string;
    projects: string;
    news: string;
    pricing: string;
    login: string;
    register: string;
    dashboard: string;
    logout: string;
    searchPlaceholder: string;
    searchLabel: string;
    menuOpen: string;
    menuClose: string;
  };
  agentOptions: AgentOption[];
};

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </>
      )}
    </svg>
  );
}

function buildRedirectTarget(base: string, pathname: string, searchParams: ReadonlyURLSearchParams) {
  const authPaths = [`${base}/login`, `${base}/register`, `${base}/forgot-password`, `${base}/reset-password`];
  if (authPaths.some((path) => pathname.startsWith(path))) {
    return null;
  }
  const search = searchParams.toString();
  return search ? `${pathname}?${search}` : pathname;
}

export function SiteHeaderClient({ base, isAuthenticated, labels, agentOptions }: SiteHeaderClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectTarget = buildRedirectTarget(base, pathname, searchParams);
  const loginHref = redirectTarget ? `${base}/login?redirectTo=${encodeURIComponent(redirectTarget)}` : `${base}/login`;
  const registerHref = redirectTarget
    ? `${base}/register?redirectTo=${encodeURIComponent(redirectTarget)}`
    : `${base}/register`;

  const handleSignOut = () => {
    setMenuOpen(false);
    void signOut({ callbackUrl: base });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.88)_100%)] shadow-[0_18px_60px_-42px_rgba(15,23,42,0.34)] backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-950/88">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_transparent_70%)]"
        aria-hidden="true"
      />
      <div className="relative w-full px-4 py-3 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
        <div className="premium-spotlight flex flex-col gap-3 rounded-[28px] border border-black/8 bg-white/76 px-4 py-3 shadow-[0_22px_55px_-38px_rgba(15,23,42,0.34)] backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={base}
              className="interactive-chip flex items-center gap-3 rounded-full border border-black/8 bg-white/86 px-3 py-2 text-sm font-semibold text-slate-900 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-white dark:focus-visible:ring-slate-600 dark:focus-visible:ring-offset-slate-950"
            >
              <Image
                src="/branding/ttech-logo.svg"
                alt="Trends172 Tech"
                width={36}
                height={36}
                className="h-10 w-10"
                priority
              />
              <span className="hidden sm:inline">Trends172 Tech</span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="interactive-chip inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/8 bg-white/88 text-slate-700 shadow-[0_16px_35px_-28px_rgba(15,23,42,0.3)] transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:text-white dark:focus-visible:ring-slate-600 dark:focus-visible:ring-offset-slate-950"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? labels.menuClose : labels.menuOpen}
            >
              <MenuIcon open={menuOpen} />
            </button>
          </div>

          <AgentSearch
            base={base}
            placeholder={labels.searchPlaceholder}
            label={labels.searchLabel}
            options={agentOptions}
            className="w-full"
          />

          {menuOpen ? (
            <div className="premium-spotlight space-y-4 rounded-[28px] border border-black/8 bg-white/94 px-4 py-4 text-sm text-slate-700 shadow-[0_32px_90px_-58px_rgba(15,23,42,0.42)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200">
              <nav className="flex flex-col gap-2">
                <Link href={base} onClick={() => setMenuOpen(false)} className="interactive-chip rounded-2xl px-3 py-2 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200">
                  {labels.home}
                </Link>
                <Link href={`${base}/agents`} onClick={() => setMenuOpen(false)} className="interactive-chip rounded-2xl px-3 py-2 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200">
                  {labels.agents}
                </Link>
                <Link href={`${base}/systems`} onClick={() => setMenuOpen(false)} className="interactive-chip rounded-2xl px-3 py-2 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200">
                  {labels.systems}
                </Link>
                <Link href={`${base}/projects`} onClick={() => setMenuOpen(false)} className="interactive-chip rounded-2xl px-3 py-2 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200">
                  {labels.projects}
                </Link>
                <Link href={`${base}/news`} onClick={() => setMenuOpen(false)} className="interactive-chip rounded-2xl px-3 py-2 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200">
                  {labels.news}
                </Link>
                <Link href={`${base}/pricing`} onClick={() => setMenuOpen(false)} className="interactive-chip rounded-2xl px-3 py-2 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200">
                  {labels.pricing}
                </Link>
              </nav>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {isAuthenticated ? (
                  <>
                    <Link href={`${base}/dashboard`} onClick={() => setMenuOpen(false)} className="interactive-chip rounded-full border border-black/8 px-3 py-2 font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200">
                      {labels.dashboard}
                    </Link>
                    <button type="button" onClick={handleSignOut} className="interactive-chip rounded-full border border-black/8 px-3 py-2 text-left font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200">
                      {labels.logout}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href={loginHref} onClick={() => setMenuOpen(false)} className="interactive-chip rounded-full border border-black/8 px-3 py-2 font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200">
                      {labels.login}
                    </Link>
                    <Link href={registerHref} onClick={() => setMenuOpen(false)} className="interactive-chip rounded-full bg-slate-950 px-3 py-2 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300">
                      {labels.register}
                    </Link>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <LocaleSwitcher />
                <ThemeToggle />
              </div>
            </div>
          ) : null}
        </div>

        <div className="premium-spotlight hidden items-center justify-between gap-5 rounded-[34px] border border-black/8 bg-white/78 px-5 py-3 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.36)] backdrop-blur-2xl lg:flex">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href={base}
              className="interactive-chip flex items-center gap-3 rounded-full border border-black/8 bg-white/88 px-3.5 py-2 text-sm font-semibold text-slate-900 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-white dark:focus-visible:ring-slate-600 dark:focus-visible:ring-offset-slate-950"
            >
              <Image
                src="/branding/ttech-logo.svg"
                alt="Trends172 Tech"
                width={36}
                height={36}
                className="h-10 w-10"
                priority
              />
              <span className="whitespace-nowrap">Trends172 Tech</span>
            </Link>
            <nav className="flex items-center gap-2 text-sm whitespace-nowrap rounded-full border border-black/6 bg-white/86 p-1.5 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_40px_-30px_rgba(15,23,42,0.28)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-200">
              <Link href={base} className="interactive-chip rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:hover:bg-slate-900/70">
                {labels.home}
              </Link>
              <Link href={`${base}/agents`} className="interactive-chip rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:hover:bg-slate-900/70">
                {labels.agents}
              </Link>
              <Link href={`${base}/systems`} className="interactive-chip rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:hover:bg-slate-900/70">
                {labels.systems}
              </Link>
              <Link href={`${base}/projects`} className="interactive-chip rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:hover:bg-slate-900/70">
                {labels.projects}
              </Link>
              <Link href={`${base}/news`} className="interactive-chip rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:hover:bg-slate-900/70">
                {labels.news}
              </Link>
              <Link href={`${base}/pricing`} className="interactive-chip rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:hover:bg-slate-900/70">
                {labels.pricing}
              </Link>
            </nav>
          </div>
          <AgentSearch
            base={base}
            placeholder={labels.searchPlaceholder}
            label={labels.searchLabel}
            options={agentOptions}
            className="min-w-[260px] max-w-xl flex-1"
          />
          <div className="flex items-center gap-3 text-sm whitespace-nowrap text-slate-700 dark:text-slate-200">
            {isAuthenticated ? (
              <>
                <Link href={`${base}/dashboard`} className="interactive-chip rounded-full border border-black/8 bg-white/84 px-4 py-2 font-semibold text-slate-900 shadow-[0_16px_35px_-28px_rgba(15,23,42,0.3)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-800 dark:bg-slate-950/70 dark:focus-visible:ring-slate-600 dark:focus-visible:ring-offset-slate-950">
                  {labels.dashboard}
                </Link>
                <button type="button" onClick={handleSignOut} className="interactive-chip rounded-full px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:hover:bg-slate-900/70 dark:hover:text-white dark:focus-visible:ring-slate-700/40">
                  {labels.logout}
                </button>
              </>
            ) : (
              <>
                <Link href={loginHref} className="interactive-chip rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:hover:bg-slate-900/70">
                  {labels.login}
                </Link>
                <Link
                  href={registerHref}
                  className="interactive-chip inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 font-semibold text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white dark:focus-visible:ring-slate-600 dark:focus-visible:ring-offset-slate-950"
                >
                  {labels.register}
                </Link>
              </>
            )}
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
