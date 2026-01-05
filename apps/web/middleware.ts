import createMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, locales } from './app/lib/i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale
});

function getLocaleFromPathname(pathname: string) {
  const segment = pathname.split('/')[1];
  return locales.includes(segment as (typeof locales)[number]) ? segment : defaultLocale;
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

function isRootPath(pathname: string) {
  return stripLocale(pathname).startsWith('/root');
}

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request as unknown as Parameters<typeof intlMiddleware>[0]);
  const pathname = request.nextUrl.pathname;

  if (!isProtectedPath(pathname)) {
    return response;
  }

  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  const isAuthenticated = Boolean(token);

  if (!isAuthenticated) {
    const locale = getLocaleFromPathname(pathname);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  if (isRootPath(pathname) && token?.role !== 'ROOT') {
    const locale = getLocaleFromPathname(pathname);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
