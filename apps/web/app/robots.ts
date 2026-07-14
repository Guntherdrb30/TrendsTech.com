import type { MetadataRoute } from 'next';
import { siteUrl } from './lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/mcp',
        '/es/admin/',
        '/en/admin/',
        '/es/dashboard/',
        '/en/dashboard/',
        '/es/root/',
        '/en/root/',
        '/es/remote/',
        '/en/remote/',
        '/es/login',
        '/en/login',
        '/es/register',
        '/en/register',
        '/es/forgot-password',
        '/en/forgot-password',
        '/es/reset-password',
        '/en/reset-password',
        '/es/recharge',
        '/en/recharge',
        '/es/email',
        '/en/email',
      ],
    },
    sitemap: new URL('/sitemap.xml', siteUrl).toString(),
    host: siteUrl.origin,
  };
}
