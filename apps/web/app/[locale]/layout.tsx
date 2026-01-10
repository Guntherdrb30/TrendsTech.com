import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { cookies } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { ThemeProvider } from '../components/theme-provider';
import { HumanVerificationGate } from '../components/human-verification-gate';
import { locales } from '../lib/i18n/config';
import '../../styles/globals.css';

export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Trends172 Tech',
  description: 'AI agent platform for analysis, creation, and distribution.'
};

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
  const verified = cookies().get('human_verified')?.value === '1';
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <Script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          strategy="beforeInteractive"
        />
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <HumanVerificationGate initialVerified={verified} siteKey={siteKey} locale={locale} />
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
