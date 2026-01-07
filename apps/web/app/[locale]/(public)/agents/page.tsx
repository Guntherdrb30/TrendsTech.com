import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AGENT_PRODUCTS } from './agent-products';

export default async function AgentsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = `/${locale}`;
  const t = await getTranslations('agentsPage');
  const a = await getTranslations('agents');

  return (
    <section className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold sm:text-3xl">{t('title')}</h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">{t('subtitle')}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`${base}/pricing`}>{t('ctaPrimary')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`${base}/login`}>{t('ctaSecondary')}</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {AGENT_PRODUCTS.map((agent) => (
          <Card key={agent.key} className="flex h-full flex-col">
            <CardHeader>
              <CardTitle>{a(`${agent.key}.name`)}</CardTitle>
            </CardHeader>
            <CardContent className="flex h-full flex-col gap-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {a(`${agent.key}.tagline`)}
              </p>
              <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {agent.featureKeys.map((featureKey) => (
                  <li key={featureKey}>{a(`${agent.key}.features.${featureKey}`)}</li>
                ))}
              </ul>
              <div className="mt-auto flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link href={`${base}/agents/${agent.key}`}>{t('detailCta')}</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`${base}/pricing`}>{t('pricingCta')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('flowTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-3">
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">{t('flowStep1Title')}</p>
            <p>{t('flowStep1Body')}</p>
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">{t('flowStep2Title')}</p>
            <p>{t('flowStep2Body')}</p>
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">{t('flowStep3Title')}</p>
            <p>{t('flowStep3Body')}</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
