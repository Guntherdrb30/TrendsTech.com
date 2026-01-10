import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { AgentSearch } from './agent-search';
import { LocaleSwitcher } from './locale-switcher';
import { ThemeToggle } from './theme-toggle';
import { AGENT_PRODUCTS } from '../[locale]/(public)/agents/agent-products';

type SiteHeaderProps = {
  locale: string;
};

export async function SiteHeader({ locale }: SiteHeaderProps) {
  const t = await getTranslations('nav');
  const a = await getTranslations('agents');
  const base = `/${locale}`;

  const agentOptions = AGENT_PRODUCTS.map((agent) => ({
    key: agent.key,
    label: a(`${agent.key}.name`)
  }));

  return (
    <header className="border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-5xl px-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Link href={base} className="flex items-center gap-3 text-sm font-semibold">
              <Image
                src="/branding/ttech-logo.svg"
                alt="Trends172 Tech"
                width={44}
                height={44}
                className="h-11 w-11"
                priority
              />
              <span>Trends172 Tech</span>
            </Link>
            <nav className="flex flex-wrap items-center gap-3 text-sm">
              <Link href={base}>{t('home')}</Link>
              <Link href={`${base}/agents`}>{t('agents')}</Link>
              <Link href={`${base}/pricing`}>{t('pricing')}</Link>
            </nav>
          </div>
          <AgentSearch
            base={base}
            placeholder={t('searchPlaceholder')}
            label={t('searchLabel')}
            options={agentOptions}
            className="w-full lg:max-w-xs"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Link href={`${base}/login`} className="text-sm">
              {t('login')}
            </Link>
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
