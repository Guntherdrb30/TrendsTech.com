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
    systemsOverview: string;
    systemsOverviewDescription: string;
    lunaSystem: string;
    lunaSystemDescription: string;
    carpihogarSystem: string;
    carpihogarSystemDescription: string;
    projects: string;
    lunaFootball: string;
    lunaFootballDescription: string;
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

function ChevronIcon() {
  return (
    <svg
      className="h-4 w-4 transition-transform duration-200 group-open:rotate-180"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
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

  const leadingNavLinks = [
    { href: base, label: labels.home, desktopHidden: true },
    { href: `${base}/agents`, label: labels.agents },
  ];
  const trailingNavLinks = [
    { href: `${base}/projects`, label: labels.projects },
    { href: `${base}/news`, label: labels.news },
    { href: `${base}/pricing`, label: labels.pricing },
  ];
  const systemLinks = [
    {
      href: `${base}/systems`,
      label: labels.systemsOverview,
      description: labels.systemsOverviewDescription,
    },
    {
      href: `${base}/systems/luna`,
      label: labels.lunaSystem,
      description: labels.lunaSystemDescription,
    },
    {
      href: `${base}/projects/carpihogar`,
      label: labels.carpihogarSystem,
      description: labels.carpihogarSystemDescription,
    },
    {
      href: `${base}/projects/luna-football`,
      label: labels.lunaFootball,
      description: labels.lunaFootballDescription,
    },
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
              {leadingNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 font-medium transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:hover:bg-slate-900/70"
                >
                  {link.label}
                </Link>
              ))}
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-3 py-2.5 font-medium transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:hover:bg-slate-900/70 [&::-webkit-details-marker]:hidden">
                  {labels.systems}
                  <ChevronIcon />
                </summary>
                <div className="ml-3 mt-1 space-y-1 border-l border-slate-200 pl-3 dark:border-slate-800">
                  {systemLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-xl px-3 py-2.5 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:hover:bg-slate-900/70"
                    >
                      <span className="block font-semibold text-slate-900 dark:text-white">{link.label}</span>
                      <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{link.description}</span>
                    </Link>
                  ))}
                </div>
              </details>
              {trailingNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 font-medium transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:hover:bg-slate-900/70"
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
            {leadingNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-2.5 py-2 font-medium transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:hover:bg-slate-800/70 dark:hover:text-white xl:px-3 ${link.desktopHidden ? 'min-[1440px]:hidden' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 font-medium transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:hover:bg-slate-800/70 dark:hover:text-white xl:px-3 [&::-webkit-details-marker]:hidden">
                {labels.systems}
                <ChevronIcon />
              </summary>
              <div className="absolute left-0 top-[calc(100%+0.75rem)] z-50 w-80 rounded-2xl border border-black/8 bg-white p-2 shadow-[0_18px_55px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-slate-950">
                {systemLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(event) => event.currentTarget.closest('details')?.removeAttribute('open')}
                    className="block rounded-xl px-3 py-3 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:hover:bg-slate-900"
                  >
                    <span className="block font-semibold text-slate-900 dark:text-white">{link.label}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500 dark:text-slate-400">{link.description}</span>
                  </Link>
                ))}
              </div>
            </details>
            {trailingNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap rounded-full px-2.5 py-2 font-medium transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:hover:bg-slate-800/70 dark:hover:text-white xl:px-3"
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
