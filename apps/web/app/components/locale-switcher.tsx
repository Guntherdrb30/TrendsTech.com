'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { defaultLocale, locales } from '../lib/i18n/config';

function stripLocale(pathname: string) {
  const segments = pathname.split('/');
  const maybeLocale = segments[1];
  if (locales.includes(maybeLocale as (typeof locales)[number])) {
    const rest = segments.slice(2).join('/');
    return rest ? `/${rest}` : '/';
  }
  return pathname;
}

export function LocaleSwitcher() {
  const pathname = usePathname();
  const basePath = stripLocale(pathname);
  const currentLocale = pathname.split('/')[1];
  const activeLocale = locales.includes(currentLocale as (typeof locales)[number])
    ? (currentLocale as (typeof locales)[number])
    : defaultLocale;

  return (
    <div className="flex flex-nowrap items-center gap-2 rounded-full border border-black/8 bg-white/80 p-1 text-xs shadow-[0_16px_35px_-28px_rgba(15,23,42,0.3)] backdrop-blur sm:text-sm dark:border-slate-800 dark:bg-slate-950/70">
      {locales.map((locale) => {
        const href = basePath === '/' ? `/${locale}` : `/${locale}${basePath}`;
        const isActive = locale === activeLocale;
        return (
          <Link
            key={locale}
            href={href}
            className={
              isActive
                ? 'interactive-chip rounded-full border border-slate-900 bg-slate-900 px-2.5 py-1 text-white shadow-[0_10px_24px_-18px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:focus-visible:ring-slate-600 dark:focus-visible:ring-offset-slate-950'
                : 'interactive-chip rounded-full border border-transparent px-2.5 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus-visible:ring-slate-700/40 dark:focus-visible:ring-offset-slate-950'
            }
          >
            {locale}
          </Link>
        );
      })}
    </div>
  );
}
