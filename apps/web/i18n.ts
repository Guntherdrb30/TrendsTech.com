import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales } from './app/lib/i18n/config';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const resolvedLocale = locales.includes(locale as (typeof locales)[number])
    ? locale
    : defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`./app/lib/i18n/messages/${resolvedLocale}.json`)).default
  };
});
