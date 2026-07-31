import type { MetadataRoute } from 'next';
import { AGENT_PRODUCTS } from './[locale]/(public)/agents/agent-products';
import { locales } from './lib/i18n/config';
import { localizedPath, siteUrl } from './lib/seo';

const publicRoutes = [
  { pathname: '', priority: 1, changeFrequency: 'weekly' as const },
  { pathname: 'systems', priority: 0.9, changeFrequency: 'monthly' as const },
  { pathname: 'systems/luna', priority: 0.9, changeFrequency: 'monthly' as const },
  { pathname: 'projects', priority: 0.8, changeFrequency: 'monthly' as const },
  { pathname: 'projects/carpihogar', priority: 0.8, changeFrequency: 'monthly' as const },
  { pathname: 'projects/luna-football', priority: 0.8, changeFrequency: 'monthly' as const },
  { pathname: 'agents', priority: 0.8, changeFrequency: 'monthly' as const },
  ...AGENT_PRODUCTS.map((agent) => ({
    pathname: `agents/${agent.key}`,
    priority: 0.7,
    changeFrequency: 'monthly' as const,
  })),
  { pathname: 'crear-agente', priority: 0.8, changeFrequency: 'monthly' as const },
  { pathname: 'skills', priority: 0.7, changeFrequency: 'monthly' as const },
  { pathname: 'pricing', priority: 0.7, changeFrequency: 'monthly' as const },
  { pathname: 'privacy', priority: 0.4, changeFrequency: 'yearly' as const },
  { pathname: 'terms', priority: 0.4, changeFrequency: 'yearly' as const },
  { pathname: 'security', priority: 0.5, changeFrequency: 'monthly' as const },
  { pathname: 'contact', priority: 0.6, changeFrequency: 'monthly' as const },
  { pathname: 'news', priority: 0.6, changeFrequency: 'weekly' as const },
  { pathname: 'gunther', priority: 0.5, changeFrequency: 'yearly' as const },
  { pathname: 'links', priority: 0.4, changeFrequency: 'monthly' as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: new URL(localizedPath(locale, route.pathname), siteUrl).toString(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: {
          ...Object.fromEntries(
            locales.map((alternateLocale) => [
              alternateLocale,
              new URL(localizedPath(alternateLocale, route.pathname), siteUrl).toString(),
            ])
          ),
          'x-default': new URL(localizedPath('es', route.pathname), siteUrl).toString(),
        },
      },
    }))
  );
}
