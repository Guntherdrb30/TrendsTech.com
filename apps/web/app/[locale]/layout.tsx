import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { ThemeProvider } from '../components/theme-provider';
import { locales } from '../lib/i18n/config';
import { getSocialImage, siteUrl } from '../lib/seo';
import '../../styles/globals.css';

export const runtime = 'nodejs';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale.startsWith('es');
  const description = isEs
    ? 'Software empresarial, automatización e inteligencia aplicada a operaciones reales.'
    : 'Business software, automation, and applied intelligence for real-world operations.';
  const socialImage = getSocialImage(locale);

  return {
    metadataBase: siteUrl,
    applicationName: 'Trends172Tech',
    title: {
      default: 'Trends172Tech',
      template: '%s | Trends172Tech',
    },
    description,
    openGraph: {
      siteName: 'Trends172Tech',
      type: 'website',
      description,
      locale: isEs ? 'es_VE' : 'en_US',
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      description,
      images: [socialImage.url],
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const isEs = locale.startsWith('es');
  const organizationId = new URL('/#organization', siteUrl).toString();
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: 'Trends172Tech',
        url: siteUrl.origin,
        logo: new URL('/branding/trends172tech-logo.png', siteUrl).toString(),
        description: isEs
          ? 'Empresa de software empresarial, automatización e inteligencia aplicada a operaciones reales.'
          : 'Business software, automation and applied intelligence for real-world operations.',
      },
      {
        '@type': 'WebSite',
        '@id': new URL('/#website', siteUrl).toString(),
        name: 'Trends172Tech',
        url: siteUrl.origin,
        inLanguage: ['es-VE', 'en-US'],
        publisher: { '@id': organizationId },
      },
    ],
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
          }}
        />
      </head>
      <body>
        <Script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          strategy="beforeInteractive"
        />
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
