import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { IBM_Plex_Sans, Space_Grotesk } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { AgentChat } from '@/components/agent-chat';
import { getCurrentUser } from '@/lib/auth/guards';
import { AGENT_PRODUCTS, type AgentKey } from '../agent-products';

const WHATSAPP_BUY_NUMBER = '584122640371';

function buildWhatsAppLink(agentName: string, message?: string) {
  const text = encodeURIComponent(message ?? `Estoy interesado en el agente ${agentName}`);
  return `https://wa.me/${WHATSAPP_BUY_NUMBER}?text=${text}`;
}

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display'
});

const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body'
});

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

function DetailShell({
  eyebrow,
  title,
  summary,
  backHref,
  backLabel,
  actions,
  leftPanel,
  rightPanel,
  bottomPanels
}: {
  eyebrow: string;
  title: string;
  summary: string;
  backHref: string;
  backLabel: string;
  actions: ReactNode;
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  bottomPanels: ReactNode;
}) {
  return (
    <div className={`${display.variable} ${body.variable} space-y-12 font-[var(--font-body)]`}>
      <section className="premium-spotlight relative overflow-hidden border-y border-black/8 bg-[linear-gradient(180deg,#f4f7fb_0%,#ffffff_24%,#f6f9fc_100%)] px-6 py-12 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="premium-grid absolute inset-0 opacity-55" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-[1760px] gap-8 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="space-y-6">
            <Link
              href={backHref}
              className="interactive-chip inline-flex rounded-full border border-black/8 bg-white/86 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
            >
              {backLabel}
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/88 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {eyebrow}
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-[var(--font-display)] font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              <p className="max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">{summary}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">{actions}</div>
          </div>

          <div className="interactive-panel premium-metal relative overflow-hidden rounded-[36px] border border-black/8 bg-white/78 p-5 shadow-[0_40px_110px_-74px_rgba(15,23,42,0.42)]">
            <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.96)_50%,transparent_100%)]" aria-hidden="true" />
            <div className="grid gap-4">
              <div className="rounded-[28px] border border-white/60 bg-white/78 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                {leftPanel}
              </div>
              <div className="rounded-[28px] border border-black/8 bg-slate-950 px-5 py-5 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.5)]">
                {rightPanel}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-6 pb-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px]">{bottomPanels}</div>
      </section>
    </div>
  );
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
      <DetailShell
        eyebrow={a('luna_code_orchestrator.commercial.eyebrow')}
        title={a('luna_code_orchestrator.commercial.title')}
        summary={a('luna_code_orchestrator.summary')}
        backHref={`${base}/agents`}
        backLabel={d('back')}
        actions={
          <>
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
          </>
        }
        leftPanel={
          <div className="space-y-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {a('luna_code_orchestrator.commercial.valueTitle')}
            </div>
            <p className="text-sm leading-relaxed text-slate-700">{a('luna_code_orchestrator.tagline')}</p>
            <ul className="grid gap-3 text-sm text-slate-600">
              {agent.featureKeys.map((featureKey) => (
                <li
                  key={featureKey}
                  className="flex items-start gap-3 rounded-[18px] border border-black/6 bg-slate-50/80 px-3 py-3"
                >
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                  <span>{a(`${agent.key}.features.${featureKey}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        }
        rightPanel={
          <div className="space-y-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {a('luna_code_orchestrator.commercial.painTitle')}
            </div>
            <p className="text-sm leading-relaxed text-slate-300">{a('luna_code_orchestrator.commercial.painBody')}</p>
            <div className="rounded-[22px] border border-white/10 bg-white/10 px-4 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {a('luna_code_orchestrator.commercial.fitTitle')}
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-slate-200">
                {fit.map((fitKey) => (
                  <li key={fitKey}>{a(`luna_code_orchestrator.commercial.fit.${fitKey}`)}</li>
                ))}
              </ul>
            </div>
          </div>
        }
        bottomPanels={
          <div className="space-y-10">
            <section className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {a('luna_code_orchestrator.commercial.capabilitiesTitle')}
                </h2>
                <p className="max-w-3xl text-sm text-slate-600">
                  {a('luna_code_orchestrator.commercial.capabilitiesBody')}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {capabilities.map((capabilityKey, index) => (
                  <div
                    key={capabilityKey}
                    className="interactive-panel premium-spotlight rounded-[26px] border border-black/8 bg-white/92 px-5 py-5 text-sm text-slate-600 shadow-[0_24px_64px_-52px_rgba(15,23,42,0.3)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-base font-semibold text-slate-900">
                        Capability {String(index + 1).padStart(2, '0')}
                      </div>
                      <span className={`h-2.5 w-2.5 rounded-full ${index % 2 === 0 ? 'bg-emerald-500' : 'bg-[#8b5e34]'}`} />
                    </div>
                    <p className="mt-3">{a(`luna_code_orchestrator.commercial.capabilities.${capabilityKey}`)}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {a('luna_code_orchestrator.commercial.plansTitle')}
                </h2>
                <p className="max-w-3xl text-sm text-slate-600">
                  {a('luna_code_orchestrator.commercial.plansBody')}
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {plans.map((planKey) => (
                  <div
                    key={planKey}
                    className={`interactive-panel rounded-[28px] border border-black/8 px-5 py-5 shadow-[0_24px_64px_-52px_rgba(15,23,42,0.3)] ${
                      planKey === 'pro'
                        ? 'premium-spotlight bg-[linear-gradient(180deg,#fff8f1_0%,#fff1df_100%)]'
                        : 'bg-white/92'
                    }`}
                  >
                    <div className="text-base font-semibold text-slate-900">
                      {a(`luna_code_orchestrator.commercial.plans.${planKey}.name`)}
                    </div>
                    <div className="mt-3 text-3xl font-[var(--font-display)] font-semibold tracking-[-0.05em] text-slate-950">
                      {a(`luna_code_orchestrator.commercial.plans.${planKey}.price`)}
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      {a(`luna_code_orchestrator.commercial.plans.${planKey}.summary`)}
                    </p>
                    <ul className="mt-4 grid gap-3 text-sm text-slate-600">
                      {['i1', 'i2', 'i3', 'i4'].map((itemKey) => (
                        <li
                          key={itemKey}
                          className="flex items-start gap-3 rounded-[18px] border border-black/6 bg-white/70 px-3 py-3"
                        >
                          <span className="mt-1.5 h-2 w-2 rounded-full bg-[#8b5e34]" aria-hidden="true" />
                          <span>{a(`luna_code_orchestrator.commercial.plans.${planKey}.items.${itemKey}`)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <div className="interactive-panel premium-spotlight rounded-[28px] border border-black/8 bg-white/92 px-5 py-5 shadow-[0_24px_64px_-52px_rgba(15,23,42,0.3)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{d('flowTitle')}</div>
                <ol className="mt-4 grid gap-3 text-sm text-slate-600">
                  {agent.stepKeys.map((stepKey) => (
                    <li key={stepKey} className="rounded-[18px] border border-black/6 bg-slate-50/80 px-3 py-3">
                      {a(`${agent.key}.steps.${stepKey}`)}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="interactive-panel premium-spotlight rounded-[28px] border border-black/8 bg-white/92 px-5 py-5 shadow-[0_24px_64px_-52px_rgba(15,23,42,0.3)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{d('idealTitle')}</div>
                <p className="mt-4 text-sm text-slate-600">{a(`${agent.key}.ideal`)}</p>
                <ul className="mt-4 grid gap-3 text-sm text-slate-600">
                  {agent.outcomeKeys.map((outcomeKey) => (
                    <li key={outcomeKey} className="rounded-[18px] border border-black/6 bg-slate-50/80 px-3 py-3">
                      {a(`${agent.key}.outcomes.${outcomeKey}`)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[28px] border border-black/8 bg-slate-950 px-5 py-5 text-white shadow-[0_28px_70px_-48px_rgba(15,23,42,0.5)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {a('luna_code_orchestrator.commercial.ctaTitle')}
                </div>
                <p className="mt-4 text-sm text-slate-300">{a('luna_code_orchestrator.commercial.ctaBody')}</p>
                <div className="mt-5 flex flex-col gap-3">
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
              </div>
            </section>
          </div>
        }
      />
    );
  }

  return (
    <DetailShell
      eyebrow={d('whatTitle')}
      title={agentName}
      summary={a(`${agent.key}.summary`)}
      backHref={`${base}/agents`}
      backLabel={d('back')}
      actions={
        <>
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
        </>
      }
      leftPanel={
        <div className="space-y-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{d('whatTitle')}</div>
          <p className="text-sm leading-relaxed text-slate-700">{a(`${agent.key}.tagline`)}</p>
          <ul className="grid gap-3 text-sm text-slate-600">
            {agent.featureKeys.map((featureKey) => (
              <li
                key={featureKey}
                className="flex items-start gap-3 rounded-[18px] border border-black/6 bg-slate-50/80 px-3 py-3"
              >
                <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                <span>{a(`${agent.key}.features.${featureKey}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      }
      rightPanel={
        <div className="space-y-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{d('idealTitle')}</div>
          <p className="text-sm leading-relaxed text-slate-300">{a(`${agent.key}.ideal`)}</p>
          <div className="rounded-[22px] border border-white/10 bg-white/10 px-4 py-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Expected outcomes</div>
            <ul className="mt-3 grid gap-2 text-sm text-slate-200">
              {agent.outcomeKeys.map((outcomeKey) => (
                <li key={outcomeKey}>{a(`${agent.key}.outcomes.${outcomeKey}`)}</li>
              ))}
            </ul>
          </div>
        </div>
      }
      bottomPanels={
        <div className="space-y-8">
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="interactive-panel premium-spotlight rounded-[28px] border border-black/8 bg-white/92 px-5 py-5 shadow-[0_24px_64px_-52px_rgba(15,23,42,0.3)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{d('flowTitle')}</div>
              <ol className="mt-4 grid gap-3 text-sm text-slate-600">
                {agent.stepKeys.map((stepKey) => (
                  <li key={stepKey} className="rounded-[18px] border border-black/6 bg-slate-50/80 px-3 py-3">
                    {a(`${agent.key}.steps.${stepKey}`)}
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-[28px] border border-black/8 bg-slate-950 px-5 py-5 text-white shadow-[0_28px_70px_-48px_rgba(15,23,42,0.5)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{d('chatTitle')}</div>
              <p className="mt-4 text-sm text-slate-300">{d('chatSubtitle')}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1">Live demo</span>
                <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1">Session aware</span>
                <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1">Enterprise flow</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            {user ? (
              <div className="interactive-panel rounded-[32px] border border-black/8 bg-white/92 p-4 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.3)]">
                <AgentChat
                  agentKey={agent.key}
                  locale={locale}
                  workflowId={workflowId}
                  placeholder={d('chatPlaceholder')}
                  unavailableMessage={d('chatUnavailable')}
                />
              </div>
            ) : (
              <div className="interactive-panel rounded-[32px] border border-black/8 bg-white/92 px-6 py-6 text-sm text-slate-600 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.3)]">
                <p className="font-semibold text-slate-900">{d('chatLoginTitle')}</p>
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
          </section>
        </div>
      }
    />
  );
}
