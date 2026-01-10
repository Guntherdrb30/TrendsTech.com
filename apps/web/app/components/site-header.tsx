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
      <div className="w-full px-4 py-1.5">
        <div className="flex flex-nowrap items-center gap-4 overflow-x-auto">
          <div className="flex min-w-0 items-center gap-4">
            <Link href={base} className="flex items-center gap-2 text-xs font-semibold">
              <Image
                src="/branding/ttech-logo.svg"
                alt="Trends172 Tech"
                width={36}
                height={36}
                className="h-9 w-9"
                priority
              />
              <span className="whitespace-nowrap">Trends172 Tech</span>
            </Link>
            <nav className="flex items-center gap-3 text-xs whitespace-nowrap">
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
            className="min-w-[200px] flex-1 max-w-sm"
          />
          <div className="flex items-center gap-2 text-xs whitespace-nowrap">
            <Link href={`${base}/login`}>
              {t('login')}
            </Link>
            <Link href={`${base}/register`}>{t('register')}</Link>
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
