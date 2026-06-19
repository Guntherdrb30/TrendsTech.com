import type { Metadata } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import { getTranslations } from 'next-intl/server';
import { HomePremium } from '@/components/home-premium';

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

export const metadata: Metadata = {
  title: 'Trends172Tech | Software Empresarial, IA y Automatización',
  description:
    'Empresa tecnológica especializada en desarrollo de software, inteligencia artificial, automatización empresarial y LUNA ERP AI. Tecnología que impulsa el futuro.',
  openGraph: {
    title: 'Trends172Tech | Tecnología que impulsa el futuro',
    description:
      'Software empresarial, Inteligencia Artificial y Automatización para empresas modernas.',
    type: 'website',
  },
};

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

  return <HomePremium fontClass={fontClass} conciergeCopy={conciergeCopy} />;
}
