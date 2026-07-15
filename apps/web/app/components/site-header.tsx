import { getTranslations } from 'next-intl/server';
import { AGENT_PRODUCTS } from '../[locale]/(public)/agents/agent-products';
import { getCurrentUser } from '../lib/auth/guards';
import { SiteHeaderClient } from './site-header-client';

type SiteHeaderProps = {
  locale: string;
};

export async function SiteHeader({ locale }: SiteHeaderProps) {
  const t = await getTranslations('nav');
  const a = await getTranslations('agents');
  const base = `/${locale}`;
  const user = await getCurrentUser();

  const agentOptions = AGENT_PRODUCTS.map((agent) => ({
    key: agent.key,
    label: a(`${agent.key}.name`)
  }));

  return (
    <SiteHeaderClient
      base={base}
      isAuthenticated={Boolean(user)}
      labels={{
        home: t('home'),
        agents: t('agents'),
        systems: t('systems'),
        systemsOverview: t('systemsOverview'),
        systemsOverviewDescription: t('systemsOverviewDescription'),
        lunaSystem: t('lunaSystem'),
        lunaSystemDescription: t('lunaSystemDescription'),
        carpihogarSystem: t('carpihogarSystem'),
        carpihogarSystemDescription: t('carpihogarSystemDescription'),
        projects: t('projects'),
        lunaFootball: t('lunaFootball'),
        lunaFootballDescription: t('lunaFootballDescription'),
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
      agentOptions={agentOptions}
    />
  );
}
