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
      es: 'Software empresarial, IA y automatización',
      en: 'Business software, AI and automation',
    },
    description: {
      es: 'Trends172Tech desarrolla software empresarial, automatización e inteligencia aplicada a operaciones reales con LUNA, CarpiHogar y LUNA Football.',
      en: 'Trends172Tech builds business software, automation and applied intelligence for real operations through LUNA, CarpiHogar and LUNA Football.',
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
