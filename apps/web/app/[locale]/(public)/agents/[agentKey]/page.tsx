import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AGENT_PRODUCTS, type AgentKey } from '../agent-products';

type PageParams = {
  locale: string;
  agentKey: AgentKey;
};

export function generateStaticParams() {
  return AGENT_PRODUCTS.map((agent) => ({ agentKey: agent.key }));
}

export default async function AgentDetailPage({ params }: { params: Promise<PageParams> }) {
  const { locale, agentKey } = await params;
  const base = `/${locale}`;
  const agent = AGENT_PRODUCTS.find((item) => item.key === agentKey);

  if (!agent) {
    notFound();
  }

  const a = await getTranslations('agents');
  const d = await getTranslations('agentDetail');

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <Link className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400" href={`${base}/agents`}>
          {d('back')}
        </Link>
        <h1 className="text-2xl font-semibold sm:text-3xl">{a(`${agent.key}.name`)}</h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          {a(`${agent.key}.summary`)}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`${base}/pricing`}>{d('primaryCta')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`${base}/login`}>{d('secondaryCta')}</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{d('whatTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>{a(`${agent.key}.tagline`)}</p>
            <ul className="space-y-1">
              {agent.featureKeys.map((featureKey) => (
                <li key={featureKey}>{a(`${agent.key}.features.${featureKey}`)}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{d('flowTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
            <ol className="space-y-1">
              {agent.stepKeys.map((stepKey) => (
                <li key={stepKey}>{a(`${agent.key}.steps.${stepKey}`)}</li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{d('idealTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>{a(`${agent.key}.ideal`)}</p>
            <ul className="space-y-1">
              {agent.outcomeKeys.map((outcomeKey) => (
                <li key={outcomeKey}>{a(`${agent.key}.outcomes.${outcomeKey}`)}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
