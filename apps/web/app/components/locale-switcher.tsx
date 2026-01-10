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
    <div className="flex flex-nowrap items-center gap-2 text-xs sm:text-sm">
      {locales.map((locale) => {
        const href = basePath === '/' ? `/${locale}` : `/${locale}${basePath}`;
        const isActive = locale === activeLocale;
        return (
          <Link
            key={locale}
            href={href}
            className={
              isActive
                ? 'rounded border border-slate-900 px-2 py-1 dark:border-slate-100'
                : 'rounded border border-transparent px-2 py-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }
          >
            {locale}
          </Link>
        );
      })}
    </div>
  );
}
