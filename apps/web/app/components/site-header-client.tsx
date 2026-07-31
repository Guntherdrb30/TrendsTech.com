'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams, type ReadonlyURLSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth/client';
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
    lunaFootball: string;
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
    void authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = base;
        }
      }
    });
  };

  const navLinks = [
    { href: base, label: labels.home, desktopHidden: true },
    { href: `${base}/agents`, label: labels.agents },
    { href: `${base}/systems`, label: labels.systems },
    { href: `${base}/projects`, label: labels.projects },
    { href: `${base}/projects/luna-football`, label: labels.lunaFootball, featured: true },
    { href: `${base}/news`, label: labels.news },
    { href: `${base}/pricing`, label: labels.pricing },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-black/6 bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.06)] backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto w-full max-w-[1760px] px-4 sm:px-6 lg:px-8 xl:px-10">

        {/* ── Mobile header ── */}
        <div className="flex items-center justify-between gap-3 py-3 min-[1440px]:hidden">
          <Link
            href={base}
            className="flex items-center gap-2.5 text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:text-white"
          >
            <Image
              src="/branding/ttech-logo.svg"
              alt="Trends172 Tech"
              width={32}
              height={32}
              className="h-8 w-8"
              priority
            />
            <span className="hidden sm:inline">Trends172 Tech</span>
          </Link>

          <div className="flex items-center gap-2">
            <AgentSearch
              base={base}
              placeholder={labels.searchPlaceholder}
              label={labels.searchLabel}
              options={agentOptions}
              className="w-40 sm:w-56"
            />
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? labels.menuClose : labels.menuOpen}
            >
              <MenuIcon open={menuOpen} />
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {menuOpen ? (
          <div className="border-t border-black/6 py-4 min-[1440px]:hidden dark:border-slate-800">
            <nav className="flex flex-col gap-0.5 text-sm text-slate-700 dark:text-slate-200">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-xl px-3 py-2.5 font-medium transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:hover:bg-slate-900/70 ${
                    link.featured ? 'text-orange-600 dark:text-orange-300' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-black/6 pt-4 dark:border-slate-800">
              {isAuthenticated ? (
                <>
                  <Link
                    href={`${base}/dashboard`}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    {labels.dashboard}
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-400"
                  >
                    {labels.logout}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={loginHref}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300"
                  >
                    {labels.login}
                  </Link>
                  <Link
                    href={registerHref}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
                  >
                    {labels.register}
                  </Link>
                </>
              )}
              <div className="ml-auto flex items-center gap-2">
                <LocaleSwitcher />
                <ThemeToggle />
              </div>
            </div>
          </div>
        ) : null}

        {/* ── Desktop header — single row ── */}
        <div className="hidden items-center gap-4 py-3 min-[1440px]:flex">

          {/* Logo */}
          <Link
            href={base}
            className="flex shrink-0 items-center gap-2.5 text-sm font-semibold text-slate-900 transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:text-white"
          >
            <Image
              src="/branding/ttech-logo.svg"
              alt="Trends172 Tech"
              width={32}
              height={32}
              className="h-9 w-9"
              priority
            />
            <span className="whitespace-nowrap xl:inline">Trends172 Tech</span>
          </Link>

          {/* Divider */}
          <div className="h-5 w-px shrink-0 bg-black/10 dark:bg-white/10" aria-hidden="true" />

          {/* Nav links */}
          <nav className="flex min-w-0 flex-1 items-center gap-0.5 text-sm text-slate-600 dark:text-slate-300">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-2.5 py-2 font-medium transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:hover:bg-slate-800/70 dark:hover:text-white xl:px-3 ${
                  link.featured
                    ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/20'
                    : ''
                } ${link.desktopHidden ? 'min-[1440px]:hidden' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex shrink-0 items-center gap-2">
            <AgentSearch
              base={base}
              placeholder={labels.searchPlaceholder}
              label={labels.searchLabel}
              options={agentOptions}
              className="w-44 xl:w-56"
            />

            <div className="mx-1 h-5 w-px bg-black/10 dark:bg-white/10" aria-hidden="true" />

            {isAuthenticated ? (
              <>
                <Link
                  href={`${base}/dashboard`}
                  className="whitespace-nowrap rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-px hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {labels.dashboard}
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  {labels.logout}
                </button>
              </>
            ) : (
              <>
                <Link
                  href={loginHref}
                  className="whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  {labels.login}
                </Link>
                <Link
                  href={registerHref}
                  className="whitespace-nowrap rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-slate-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
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
