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
    <header className="sticky top-0 z-40 border-b border-[#e6d7c8] bg-[#fbf8f2]/88 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/88">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href={base} className="flex items-center gap-3 text-sm font-semibold text-slate-900 dark:text-white">
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#decfbe] bg-white/80 text-slate-700 transition hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:text-white"
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
            <div className="space-y-4 rounded-3xl border border-[#e5d7c8] bg-white/92 px-4 py-4 text-sm text-slate-700 shadow-[0_25px_80px_-60px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200">
              <nav className="flex flex-col gap-2">
                <Link href={base} onClick={() => setMenuOpen(false)}>
                  {labels.home}
                </Link>
                <Link href={`${base}/agents`} onClick={() => setMenuOpen(false)}>
                  {labels.agents}
                </Link>
                <Link href={`${base}/systems`} onClick={() => setMenuOpen(false)}>
                  {labels.systems}
                </Link>
                <Link href={`${base}/projects`} onClick={() => setMenuOpen(false)}>
                  {labels.projects}
                </Link>
                <Link href={`${base}/news`} onClick={() => setMenuOpen(false)}>
                  {labels.news}
                </Link>
                <Link href={`${base}/pricing`} onClick={() => setMenuOpen(false)}>
                  {labels.pricing}
                </Link>
              </nav>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {isAuthenticated ? (
                  <>
                    <Link href={`${base}/dashboard`} onClick={() => setMenuOpen(false)}>
                      {labels.dashboard}
                    </Link>
                    <button type="button" onClick={handleSignOut} className="text-left">
                      {labels.logout}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href={loginHref} onClick={() => setMenuOpen(false)}>
                      {labels.login}
                    </Link>
                    <Link href={registerHref} onClick={() => setMenuOpen(false)}>
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

        <div className="hidden items-center justify-between gap-5 lg:flex">
          <div className="flex min-w-0 items-center gap-4">
            <Link href={base} className="flex items-center gap-3 text-sm font-semibold text-slate-900 dark:text-white">
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
            <nav className="flex items-center gap-2 text-sm whitespace-nowrap text-slate-700 dark:text-slate-200">
              <Link href={base} className="rounded-full px-3 py-2 transition hover:bg-white/90 hover:text-slate-900 dark:hover:bg-slate-900/70">
                {labels.home}
              </Link>
              <Link href={`${base}/agents`} className="rounded-full px-3 py-2 transition hover:bg-white/90 hover:text-slate-900 dark:hover:bg-slate-900/70">
                {labels.agents}
              </Link>
              <Link href={`${base}/systems`} className="rounded-full px-3 py-2 transition hover:bg-white/90 hover:text-slate-900 dark:hover:bg-slate-900/70">
                {labels.systems}
              </Link>
              <Link href={`${base}/projects`} className="rounded-full px-3 py-2 transition hover:bg-white/90 hover:text-slate-900 dark:hover:bg-slate-900/70">
                {labels.projects}
              </Link>
              <Link href={`${base}/news`} className="rounded-full px-3 py-2 transition hover:bg-white/90 hover:text-slate-900 dark:hover:bg-slate-900/70">
                {labels.news}
              </Link>
              <Link href={`${base}/pricing`} className="rounded-full px-3 py-2 transition hover:bg-white/90 hover:text-slate-900 dark:hover:bg-slate-900/70">
                {labels.pricing}
              </Link>
            </nav>
          </div>
          <AgentSearch
            base={base}
            placeholder={labels.searchPlaceholder}
            label={labels.searchLabel}
            options={agentOptions}
            className="min-w-[220px] flex-1 max-w-md"
          />
          <div className="flex items-center gap-3 text-sm whitespace-nowrap text-slate-700 dark:text-slate-200">
            {isAuthenticated ? (
              <>
                <Link href={`${base}/dashboard`} className="rounded-full px-3 py-2 transition hover:bg-white/90 hover:text-slate-900 dark:hover:bg-slate-900/70">
                  {labels.dashboard}
                </Link>
                <button type="button" onClick={handleSignOut}>
                  {labels.logout}
                </button>
              </>
            ) : (
              <>
                <Link href={loginHref} className="rounded-full px-3 py-2 transition hover:bg-white/90 hover:text-slate-900 dark:hover:bg-slate-900/70">
                  {labels.login}
                </Link>
                <Link
                  href={registerHref}
                  className="inline-flex items-center justify-center rounded-full border border-slate-900 px-4 py-2 font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white dark:border-slate-200 dark:text-slate-100 dark:hover:bg-slate-100 dark:hover:text-slate-950"
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
