import type { Metadata } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import { getTranslations } from 'next-intl/server';
import { HomePremium, type HomePremiumCopy } from '@/components/home-premium';
import { buildLocalizedMetadata } from '@/lib/seo';

const display = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
});

const body = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    title: {
      es: 'LUNA — Plataforma Empresarial Inteligente',
      en: 'LUNA — Intelligent Business Platform',
    },
    description: {
      es: 'Trends172Tech es la creadora de LUNA, una plataforma empresarial inteligente que conecta operaciones, comercio, datos, automatización e inteligencia artificial.',
      en: 'Trends172Tech created LUNA, an intelligent business platform connecting operations, commerce, data, automation and artificial intelligence.',
    },
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const home = await getTranslations('home');

  const fontClass = `${display.variable} ${body.variable} font-[var(--font-body)]`;

  const conciergeCopy = {
    locale,
    intakeBadge: home('intakeBadge'),
    intakeTitle: home('intakeTitle'),
    intakeSubtitle: home('intakeSubtitle'),
    intakeNote: home('intakeNote'),
    chatPlaceholder: home('chatPlaceholder'),
    chatClearLabel: home('chatClearLabel'),
    chatSuggestionsTitle: home('chatSuggestionsTitle'),
    chatSuggestions: [
      { label: home('chatSuggestions.s1Label'), prompt: home('chatSuggestions.s1Prompt') },
      { label: home('chatSuggestions.s2Label'), prompt: home('chatSuggestions.s2Prompt') },
    ],
  };

  const premiumCopy = home.raw('premium') as HomePremiumCopy;

  return <HomePremium fontClass={fontClass} conciergeCopy={conciergeCopy} copy={premiumCopy} />;
}
