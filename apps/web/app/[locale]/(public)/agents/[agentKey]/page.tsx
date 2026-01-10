import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AgentChat } from '@/components/agent-chat';
import { getCurrentUser } from '@/lib/auth/guards';
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
  const user = await getCurrentUser();
  const workflowMap: Record<AgentKey, string | undefined> = {
    marketing: process.env.CHATKIT_WORKFLOW_MARKETING,
    sales: process.env.CHATKIT_WORKFLOW_SALES,
    appointments: process.env.CHATKIT_WORKFLOW_APPOINTMENTS,
    support: process.env.CHATKIT_WORKFLOW_SUPPORT,
    public_voice: process.env.CHATKIT_WORKFLOW_PUBLIC_VOICE
  };
  const workflowId = workflowMap[agent.key] ?? process.env.CHATKIT_WORKFLOW_ID ?? null;

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

      <div className="space-y-3">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold sm:text-2xl">{d('chatTitle')}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{d('chatSubtitle')}</p>
        </div>
        {user ? (
          <AgentChat
            agentKey={agent.key}
            locale={locale}
            workflowId={workflowId}
            placeholder={d('chatPlaceholder')}
            unavailableMessage={d('chatUnavailable')}
          />
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white/80 px-6 py-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
            <p className="font-semibold">{d('chatLoginTitle')}</p>
            <p className="mt-2">{d('chatLoginBody')}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild size="sm">
                <Link href={`${base}/login`}>{d('chatLoginPrimary')}</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`${base}/register`}>{d('chatLoginSecondary')}</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
