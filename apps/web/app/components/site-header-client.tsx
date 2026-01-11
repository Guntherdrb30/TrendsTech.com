'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AgentSearch } from './agent-search';
import { LocaleSwitcher } from './locale-switcher';
import { ThemeToggle } from './theme-toggle';

type AgentOption = {
  key: string;
  label: string;
};

type SiteHeaderClientProps = {
  base: string;
  labels: {
    home: string;
    agents: string;
    projects: string;
    pricing: string;
    login: string;
    register: string;
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

export function SiteHeaderClient({ base, labels, agentOptions }: SiteHeaderClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-slate-200 dark:border-slate-800">
      <div className="w-full px-4 py-2">
        <div className="flex flex-col gap-3 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href={base} className="flex items-center gap-2 text-xs font-semibold">
              <Image
                src="/branding/ttech-logo.svg"
                alt="Trends172 Tech"
                width={36}
                height={36}
                className="h-9 w-9"
                priority
              />
              <span className="hidden sm:inline">Trends172 Tech</span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white"
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
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200">
              <nav className="flex flex-col gap-2">
                <Link href={base} onClick={() => setMenuOpen(false)}>
                  {labels.home}
                </Link>
                <Link href={`${base}/agents`} onClick={() => setMenuOpen(false)}>
                  {labels.agents}
                </Link>
                <Link href={`${base}/projects`} onClick={() => setMenuOpen(false)}>
                  {labels.projects}
                </Link>
                <Link href={`${base}/pricing`} onClick={() => setMenuOpen(false)}>
                  {labels.pricing}
                </Link>
              </nav>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <Link href={`${base}/login`} onClick={() => setMenuOpen(false)}>
                  {labels.login}
                </Link>
                <Link href={`${base}/register`} onClick={() => setMenuOpen(false)}>
                  {labels.register}
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <LocaleSwitcher />
                <ThemeToggle />
              </div>
            </div>
          ) : null}
        </div>

        <div className="hidden items-center justify-between gap-4 lg:flex">
          <div className="flex min-w-0 items-center gap-4">
            <Link href={base} className="flex items-center gap-2 text-xs font-semibold">
              <Image
                src="/branding/ttech-logo.svg"
                alt="Trends172 Tech"
                width={36}
                height={36}
                className="h-9 w-9"
                priority
              />
              <span className="whitespace-nowrap">Trends172 Tech</span>
            </Link>
            <nav className="flex items-center gap-3 text-xs whitespace-nowrap">
              <Link href={base}>{labels.home}</Link>
              <Link href={`${base}/agents`}>{labels.agents}</Link>
              <Link href={`${base}/projects`}>{labels.projects}</Link>
              <Link href={`${base}/pricing`}>{labels.pricing}</Link>
            </nav>
          </div>
          <AgentSearch
            base={base}
            placeholder={labels.searchPlaceholder}
            label={labels.searchLabel}
            options={agentOptions}
            className="min-w-[200px] flex-1 max-w-sm"
          />
          <div className="flex items-center gap-2 text-xs whitespace-nowrap">
            <Link href={`${base}/login`}>{labels.login}</Link>
            <Link href={`${base}/register`}>{labels.register}</Link>
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
