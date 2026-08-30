import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '../lib/auth/guards';
import { SiteHeaderClient } from './site-header-client';

type SiteHeaderProps = {
  locale: string;
};

export async function SiteHeader({ locale }: SiteHeaderProps) {
  const t = await getTranslations('nav');
  const base = `/${locale}`;
  const user = await getCurrentUser();

  return (
    <SiteHeaderClient
      base={base}
      isAuthenticated={Boolean(user)}
      labels={{
        home: t('home'),
        offerings: locale.startsWith('es') ? 'Qué ofrecemos' : 'What we offer',
        agents: t('agents'),
        systems: t('systems'),
        projects: t('projects'),
        lunaFootball: t('lunaFootball'),
        news: t('news'),
        pricing: t('pricing'),
        login: t('login'),
        register: t('register'),
        dashboard: t('dashboard'),
        logout: t('logout'),
        searchPlaceholder: t('searchPlaceholder'),
        searchLabel: t('searchLabel'),
        menuOpen: t('menuOpen'),
        menuClose: t('menuClose')
      }}
    />
  );
}
