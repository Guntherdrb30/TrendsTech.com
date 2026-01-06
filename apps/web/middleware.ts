import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, locales } from './app/lib/i18n/config';

function getLocaleFromPathname(pathname: string) {
  const segment = pathname.split('/')[1];
  return locales.includes(segment as (typeof locales)[number]) ? segment : defaultLocale;
}

function hasLocalePrefix(pathname: string) {
  const segment = pathname.split('/')[1];
  return locales.includes(segment as (typeof locales)[number]);
}

function resolveLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale as (typeof locales)[number])) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get('accept-language') ?? '';
  for (const part of acceptLanguage.split(',')) {
    const locale = part.split(';')[0]?.trim().split('-')[0]?.toLowerCase();
    if (locale && locales.includes(locale as (typeof locales)[number])) {
      return locale;
    }
  }

  return defaultLocale;
}

function stripLocale(pathname: string) {
  const segment = pathname.split('/')[1];
  if (locales.includes(segment as (typeof locales)[number])) {
    const rest = pathname.split('/').slice(2).join('/');
    return rest ? `/${rest}` : '/';
  }
  return pathname;
}

function isProtectedPath(pathname: string) {
  const normalized = stripLocale(pathname);
  return normalized.startsWith('/dashboard') || normalized.startsWith('/root');
}

const SESSION_COOKIE_PREFIXES = ['__Secure-next-auth.session-token', 'next-auth.session-token'];

function hasSessionCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some(({ name }) => SESSION_COOKIE_PREFIXES.some((prefix) => name === prefix || name.startsWith(`${prefix}.`)));
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!hasLocalePrefix(pathname)) {
    const locale = resolveLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const isAuthenticated = hasSessionCookie(request);

  if (!isAuthenticated) {
    const locale = getLocaleFromPathname(pathname);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
