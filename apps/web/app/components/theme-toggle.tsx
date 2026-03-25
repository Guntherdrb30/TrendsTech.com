'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const activeTheme = theme === 'system' ? resolvedTheme : theme;

  return (
    <div className="flex flex-nowrap items-center gap-1 rounded-full border border-black/8 bg-white/80 p-1 shadow-[0_16px_35px_-28px_rgba(15,23,42,0.3)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
      <button
        type="button"
        aria-label="Light theme"
        aria-pressed={activeTheme === 'light'}
        onClick={() => setTheme('light')}
        className={
          activeTheme === 'light'
            ? 'interactive-chip rounded-full border border-slate-900 bg-slate-900 p-1.5 text-white shadow-[0_10px_24px_-18px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:focus-visible:ring-slate-600 dark:focus-visible:ring-offset-slate-950'
            : 'interactive-chip rounded-full border border-transparent p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus-visible:ring-slate-700/40 dark:focus-visible:ring-offset-slate-950'
        }
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="22" />
          <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
          <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
          <line x1="2" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
          <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Dark theme"
        aria-pressed={activeTheme === 'dark'}
        onClick={() => setTheme('dark')}
        className={
          activeTheme === 'dark'
            ? 'interactive-chip rounded-full border border-slate-900 bg-slate-900 p-1.5 text-white shadow-[0_10px_24px_-18px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:focus-visible:ring-slate-600 dark:focus-visible:ring-offset-slate-950'
            : 'interactive-chip rounded-full border border-transparent p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus-visible:ring-slate-700/40 dark:focus-visible:ring-offset-slate-950'
        }
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      </button>
    </div>
  );
}
