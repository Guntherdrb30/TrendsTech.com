const locales = ['es', 'en'] as const;
const defaultLocale = 'es';

function getLocaleFromPathname(pathname: string) {
  const segment = pathname.split('/')[1];
  return locales.includes(segment as (typeof locales)[number]) ? segment : defaultLocale;
}

function hasLocalePrefix(pathname: string) {
  const segment = pathname.split('/')[1];
  return locales.includes(segment as (typeof locales)[number]);
}

function resolveLocale(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  for (const part of cookieHeader.split(';')) {
    const [rawName, rawValue] = part.split('=');
    const name = rawName?.trim();
    if (name === 'NEXT_LOCALE') {
      const value = rawValue?.trim();
      if (value && locales.includes(value as (typeof locales)[number])) {
        return value;
      }
    }
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

function hasSessionCookie(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  if (!cookieHeader) {
    return false;
  }
  const names = cookieHeader
    .split(';')
    .map((part) => part.split('=')[0]?.trim())
    .filter(Boolean) as string[];
  return names.some((name) =>
    SESSION_COOKIE_PREFIXES.some((prefix) => name === prefix || name.startsWith(`${prefix}.`))
  );
}

function nextResponse() {
  return new Response(null, { headers: { 'x-middleware-next': '1' } });
}

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (!hasLocalePrefix(pathname)) {
    const locale = resolveLocale(request);
    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
    return Response.redirect(url);
  }

  if (!isProtectedPath(pathname)) {
    return nextResponse();
  }

  const isAuthenticated = hasSessionCookie(request);

  if (!isAuthenticated) {
    const locale = getLocaleFromPathname(pathname);
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = `/${locale}/login`;
    return Response.redirect(redirectUrl);
  }

  return nextResponse();
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
