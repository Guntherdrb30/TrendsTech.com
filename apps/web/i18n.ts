import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales } from './app/lib/i18n/config';

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locales.includes(locale as (typeof locales)[number])
    ? locale
    : defaultLocale;

  return {
    messages: (await import(`./app/lib/i18n/messages/${resolvedLocale}.json`)).default
  };
});
