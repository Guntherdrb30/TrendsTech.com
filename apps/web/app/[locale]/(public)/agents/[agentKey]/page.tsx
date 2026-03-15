import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AgentChat } from '@/components/agent-chat';
import { getCurrentUser } from '@/lib/auth/guards';
import { AGENT_PRODUCTS, type AgentKey } from '../agent-products';

const WHATSAPP_BUY_NUMBER = '584122640371';

function buildWhatsAppLink(agentName: string, message?: string) {
  const text = encodeURIComponent(message ?? `Estoy interesado en el agente ${agentName}`);
  return `https://wa.me/${WHATSAPP_BUY_NUMBER}?text=${text}`;
}

type PageParams = {
  locale: string;
  agentKey: AgentKey;
};

export function generateStaticParams() {
  return AGENT_PRODUCTS.map((agent) => ({ agentKey: agent.key }));
}

function isLunaCodeOrchestrator(agentKey: AgentKey) {
  return agentKey === 'luna_code_orchestrator';
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
  const agentName = a(`${agent.key}.name`);
  const redirectTo = `${base}/agents/${agent.key}`;
  const loginHref = `${base}/login?redirectTo=${encodeURIComponent(redirectTo)}`;
  const registerHref = `${base}/register?redirectTo=${encodeURIComponent(redirectTo)}`;
  const workflowMap: Record<AgentKey, string | undefined> = {
    marketing: process.env.CHATKIT_WORKFLOW_MARKETING,
    sales: process.env.CHATKIT_WORKFLOW_SALES,
    appointments: process.env.CHATKIT_WORKFLOW_APPOINTMENTS,
    support: process.env.CHATKIT_WORKFLOW_SUPPORT,
    public_voice: process.env.CHATKIT_WORKFLOW_PUBLIC_VOICE,
    luna_code_orchestrator: undefined
  };
  const workflowId = workflowMap[agent.key] ?? process.env.CHATKIT_WORKFLOW_ID ?? null;

  if (isLunaCodeOrchestrator(agent.key)) {
    const plans = ['basic', 'pro', 'enterprise'] as const;
    const capabilities = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'] as const;
    const fit = ['i1', 'i2', 'i3'] as const;
    const whatsappMessage = [
      'Quiero informacion comercial de Luna Code Orchestrator.',
      'Necesito demo, alcance, planes y siguientes pasos de implementacion.'
    ].join(' ');

    return (
      <section className="space-y-10">
        <div className="space-y-3">
          <Link className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400" href={`${base}/agents`}>
            {d('back')}
          </Link>
          <div className="inline-flex rounded-full border border-[#d7c7b4] bg-[#fff8f1] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a6b52]">
            {a('luna_code_orchestrator.commercial.eyebrow')}
          </div>
          <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            {a('luna_code_orchestrator.commercial.title')}
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {a('luna_code_orchestrator.summary')}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`${base}/pricing`}>{a('luna_code_orchestrator.commercial.primaryCta')}</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={buildWhatsAppLink(agentName, whatsappMessage)} target="_blank" rel="noreferrer">
                {a('luna_code_orchestrator.commercial.secondaryCta')}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`${base}/systems/luna`}>{a('luna_code_orchestrator.commercial.systemCta')}</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-[#e7ddd1] bg-white/90 dark:border-slate-800 dark:bg-slate-950/70">
            <CardHeader>
              <CardTitle>{a('luna_code_orchestrator.commercial.valueTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>{a('luna_code_orchestrator.tagline')}</p>
              <ul className="space-y-2">
                {agent.featureKeys.map((featureKey) => (
                  <li key={featureKey} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#d97706]" aria-hidden="true" />
                    <span>{a(`${agent.key}.features.${featureKey}`)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-[#e7ddd1] bg-[linear-gradient(180deg,#fffdfb_0%,#f5ede4_100%)] dark:border-slate-800 dark:bg-slate-950/70">
            <CardHeader>
              <CardTitle>{a('luna_code_orchestrator.commercial.painTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <p>{a('luna_code_orchestrator.commercial.painBody')}</p>
              <div className="rounded-2xl border border-[#e7ddd1] bg-white/85 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a6b52]">
                  {a('luna_code_orchestrator.commercial.fitTitle')}
                </div>
                <ul className="mt-3 space-y-2">
                  {fit.map((fitKey) => (
                    <li key={fitKey}>{a(`luna_code_orchestrator.commercial.fit.${fitKey}`)}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {a('luna_code_orchestrator.commercial.capabilitiesTitle')}
            </h2>
            <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              {a('luna_code_orchestrator.commercial.capabilitiesBody')}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {capabilities.map((capabilityKey) => (
              <Card key={capabilityKey} className="border-[#e7ddd1] bg-white/90 dark:border-slate-800 dark:bg-slate-950/70">
                <CardContent className="px-5 py-5 text-sm text-slate-600 dark:text-slate-300">
                  {a(`luna_code_orchestrator.commercial.capabilities.${capabilityKey}`)}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {a('luna_code_orchestrator.commercial.plansTitle')}
            </h2>
            <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              {a('luna_code_orchestrator.commercial.plansBody')}
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((planKey) => (
              <Card
                key={planKey}
                className={`border-[#e7ddd1] ${
                  planKey === 'pro'
                    ? 'bg-[linear-gradient(180deg,#fff9f2_0%,#fff3e2_100%)] shadow-[0_25px_80px_-60px_rgba(15,23,42,0.45)]'
                    : 'bg-white/90'
                } dark:border-slate-800 dark:bg-slate-950/70`}
              >
                <CardHeader>
                  <CardTitle>{a(`luna_code_orchestrator.commercial.plans.${planKey}.name`)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="text-3xl font-semibold text-slate-900 dark:text-white">
                    {a(`luna_code_orchestrator.commercial.plans.${planKey}.price`)}
                  </div>
                  <p>{a(`luna_code_orchestrator.commercial.plans.${planKey}.summary`)}</p>
                  <ul className="space-y-2">
                    {['i1', 'i2', 'i3', 'i4'].map((itemKey) => (
                      <li key={itemKey} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#d97706]" aria-hidden="true" />
                        <span>{a(`luna_code_orchestrator.commercial.plans.${planKey}.items.${itemKey}`)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>{d('flowTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <ol className="space-y-2">
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
              <ul className="space-y-2">
                {agent.outcomeKeys.map((outcomeKey) => (
                  <li key={outcomeKey}>{a(`${agent.key}.outcomes.${outcomeKey}`)}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{a('luna_code_orchestrator.commercial.ctaTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <p>{a('luna_code_orchestrator.commercial.ctaBody')}</p>
              <div className="flex flex-col gap-3">
                <Button asChild>
                  <Link href={`${base}/pricing`}>{a('luna_code_orchestrator.commercial.primaryCta')}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={loginHref}>{a('luna_code_orchestrator.commercial.workspaceCta')}</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href={buildWhatsAppLink(agentName, whatsappMessage)} target="_blank" rel="noreferrer">
                    {a('luna_code_orchestrator.commercial.secondaryCta')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <Link className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400" href={`${base}/agents`}>
          {d('back')}
        </Link>
        <h1 className="text-2xl font-semibold sm:text-3xl">{agentName}</h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          {a(`${agent.key}.summary`)}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`${base}/pricing`}>{d('primaryCta')}</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={buildWhatsAppLink(agentName)} target="_blank" rel="noreferrer">
              {d('whatsappCta')}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={loginHref}>{d('secondaryCta')}</Link>
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
                <Link href={loginHref}>{d('chatLoginPrimary')}</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={registerHref}>{d('chatLoginSecondary')}</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
