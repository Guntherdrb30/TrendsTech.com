import type { Metadata } from 'next';
import { defaultLocale, locales, type Locale } from './i18n/config';

const FALLBACK_SITE_URL = 'https://www.trends172tech.com';

function normalizeSiteUrl(value?: string) {
  try {
    return new URL(value || FALLBACK_SITE_URL);
  } catch {
    return new URL(FALLBACK_SITE_URL);
  }
}

export const siteUrl = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL
);

export function getSocialImage(locale: string) {
  const isEs = locale.startsWith('es');

  return {
    url: `/${isEs ? 'es' : 'en'}/og`,
    width: 1200,
    height: 630,
    alt: isEs
      ? 'Trends172Tech — Software empresarial, IA y automatización'
      : 'Trends172Tech — Business software, AI and automation',
  };
}

export function localizedPath(locale: Locale | string, pathname = '') {
  const normalizedPath = pathname === '/' ? '' : `/${pathname.replace(/^\/+|\/+$/g, '')}`;
  return `/${locale}${normalizedPath}`;
}

export function localeAlternates(pathname = '') {
  return {
    canonical: localizedPath(defaultLocale, pathname),
    languages: {
      ...Object.fromEntries(locales.map((locale) => [locale, localizedPath(locale, pathname)])),
      'x-default': localizedPath(defaultLocale, pathname),
    },
  };
}

type LocalizedCopy = {
  es: string;
  en: string;
};

export function buildLocalizedMetadata({
  locale,
  pathname,
  title,
  description,
}: {
  locale: string;
  pathname?: string;
  title: LocalizedCopy;
  description: LocalizedCopy;
}): Metadata {
  const isEs = locale.startsWith('es');
  const resolvedTitle = isEs ? title.es : title.en;
  const resolvedDescription = isEs ? description.es : description.en;
  const canonical = localizedPath(locale, pathname);
  const socialImage = getSocialImage(locale);

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: {
      ...localeAlternates(pathname),
      canonical,
    },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonical,
      siteName: 'Trends172Tech',
      type: 'website',
      locale: isEs ? 'es_VE' : 'en_US',
      alternateLocale: isEs ? ['en_US'] : ['es_VE'],
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
      images: [socialImage.url],
    },
  };
}
