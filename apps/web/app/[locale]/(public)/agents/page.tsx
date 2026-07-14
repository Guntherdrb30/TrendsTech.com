import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { IBM_Plex_Sans, Space_Grotesk } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { buildLocalizedMetadata } from '@/lib/seo';
import { AGENT_PRODUCTS } from './agent-products';

const WHATSAPP_BUY_NUMBER = '584122640371';

function buildWhatsAppLink(agentName: string) {
  const text = encodeURIComponent(`Estoy interesado en el agente ${agentName}`);
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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    pathname: 'agents',
    title: {
      es: 'Agentes inteligentes para procesos empresariales',
      en: 'Intelligent agents for business processes',
    },
    description: {
      es: 'Explora agentes especializados para marketing, ventas, citas, soporte, voz y orquestación de desarrollo con demostraciones controladas.',
      en: 'Explore specialized agents for marketing, sales, appointments, support, voice and development orchestration through controlled demos.',
    },
  });
}

export default async function AgentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const base = `/${locale}`;
  const t = await getTranslations('agentsPage');
  const a = await getTranslations('agents');
  const loginHref = `${base}/login?redirectTo=${encodeURIComponent(`${base}/agents`)}`;

  const demoRules = [
    t('demoRequirement1'),
    t('demoRequirement2'),
    t('demoRequirement3'),
    t('demoRequirement4')
  ];

  const flowSteps = [
    { step: '01', title: t('flowStep1Title'), body: t('flowStep1Body') },
    { step: '02', title: t('flowStep2Title'), body: t('flowStep2Body') },
    { step: '03', title: t('flowStep3Title'), body: t('flowStep3Body') }
  ];
  const uiCopy = locale.startsWith('es')
    ? {
        demoAccess: 'Acceso demo',
        verifiedOnly: 'Solo verificados',
        features: 'Funciones',
        demo: 'Demo',
        controlledAccess: 'Acceso controlado',
        operationalNotes: 'Notas operativas',
        ready: 'Listo',
        sequence: 'Secuencia'
      }
    : {
        demoAccess: 'Demo access',
        verifiedOnly: 'Verified only',
        features: 'Features',
        demo: 'Demo',
        controlledAccess: 'Controlled access',
        operationalNotes: 'Operational notes',
        ready: 'Ready',
        sequence: 'Sequence'
      };

  return (
    <div className={`${display.variable} ${body.variable} space-y-14 font-[var(--font-body)]`}>
      <section className="premium-spotlight relative overflow-hidden border-y border-black/8 bg-[linear-gradient(180deg,#f4f7fb_0%,#ffffff_24%,#f6f9fc_100%)] px-6 py-12 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="premium-grid absolute inset-0 opacity-55" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-[1760px] gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/88 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t('eyebrow')}
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-[var(--font-display)] font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
                {t('title')}
              </h1>
              <p className="max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
                {t('subtitle')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href={`${base}/pricing`}>{t('ctaPrimary')}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={loginHref}>{t('ctaSecondary')}</Link>
              </Button>
            </div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t('demoPolicyNote')}</p>
          </div>

          <div className="interactive-panel premium-metal relative overflow-hidden rounded-[34px] border border-black/8 bg-white/78 p-5 shadow-[0_38px_100px_-70px_rgba(15,23,42,0.4)]">
            <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.96)_50%,transparent_100%)]" aria-hidden="true" />
            <div className="grid gap-4">
              <div className="rounded-[28px] border border-white/60 bg-white/78 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {t('demoPolicyTitle')}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{t('demoPolicyBody')}</p>
                <ul className="mt-4 grid gap-3 text-sm text-slate-600">
                  {demoRules.map((rule) => (
                    <li key={rule} className="flex items-start gap-3 rounded-[18px] border border-black/6 bg-slate-50/80 px-3 py-3">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[28px] border border-black/8 bg-slate-950 px-5 py-5 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.5)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {uiCopy.demoAccess}
                </div>
                <div className="mt-3 text-3xl font-[var(--font-display)] font-semibold tracking-[-0.05em] text-white">
                  {uiCopy.verifiedOnly}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{t('demoRulesInline')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto grid w-full max-w-[1760px] gap-6 xl:grid-cols-2">
          {AGENT_PRODUCTS.map((agent, index) => (
            <article
              key={agent.key}
              className="group interactive-panel premium-spotlight overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.96)_100%)] shadow-[0_36px_100px_-64px_rgba(15,23,42,0.34)] backdrop-blur transition hover:shadow-[0_48px_120px_-68px_rgba(15,23,42,0.4)]"
            >
              <div className="flex items-center justify-between border-b border-black/6 px-6 py-4">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {t('productBadge')}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{a(`${agent.key}.name`)}</div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/86 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  <span className={`h-2 w-2 rounded-full ${index % 2 === 0 ? 'bg-emerald-500' : 'bg-[#8b5e34]'}`} />
                  <span>{t('demoBadge')}</span>
                </div>
              </div>

              <div className="grid gap-5 p-6">
                <div className="grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h2 className="text-[2rem] font-[var(--font-display)] font-semibold tracking-[-0.04em] text-slate-900">
                        {a(`${agent.key}.name`)}
                      </h2>
                      <p className="text-sm leading-relaxed text-slate-600">{a(`${agent.key}.tagline`)}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="interactive-panel rounded-[22px] border border-black/8 bg-white/86 px-4 py-4">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {uiCopy.features}
                        </div>
                        <div className="mt-2 text-2xl font-[var(--font-display)] font-semibold tracking-[-0.04em] text-slate-950">
                          {String(agent.featureKeys.length).padStart(2, '0')}
                        </div>
                      </div>
                      <div className="interactive-panel rounded-[22px] border border-black/8 bg-white/86 px-4 py-4">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {uiCopy.demo}
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">
                          {uiCopy.controlledAccess}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="interactive-panel rounded-[28px] border border-black/8 bg-white/84 px-5 py-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {t('demoPromptLabel')}
                    </div>
                    <div className="mt-4 space-y-3 text-xs">
                      <div className="rounded-[18px] bg-slate-950 px-4 py-3 text-slate-100 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.45)]">
                        {a(`${agent.key}.demoUser`)}
                      </div>
                      <div className="rounded-[18px] border border-black/8 bg-slate-50/90 px-4 py-3 text-slate-700">
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {a(`${agent.key}.name`)}
                        </span>
                        {a(`${agent.key}.demoAgent`)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="interactive-panel rounded-[26px] border border-black/8 bg-white/84 px-5 py-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {uiCopy.operationalNotes}
                    </div>
                    <div className="rounded-full border border-black/8 bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                      {uiCopy.ready}
                    </div>
                  </div>
                  <ul className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    {agent.featureKeys.map((featureKey) => (
                      <li
                        key={featureKey}
                        className="flex items-start gap-3 rounded-[18px] border border-black/6 bg-slate-50/80 px-3 py-3"
                      >
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-[#8b5e34]" aria-hidden="true" />
                        <span>{a(`${agent.key}.features.${featureKey}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild size="sm">
                    <Link href={`${base}/login?redirectTo=${encodeURIComponent(`${base}/agents/${agent.key}`)}`}>
                      {t('demoCta')}
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`${base}/agents/${agent.key}`}>{t('detailCta')}</Link>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <Link href={buildWhatsAppLink(a(`${agent.key}.name`))} target="_blank" rel="noreferrer">
                      {t('buyCta')}
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="w-full px-6 pb-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px] space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-[var(--font-display)] font-semibold text-slate-900">{t('flowTitle')}</h2>
            <p className="max-w-2xl text-base text-slate-600">{t('flowSubtitle')}</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {flowSteps.map((step) => (
              <div
                key={step.step}
                className="interactive-panel premium-spotlight rounded-[26px] border border-black/8 bg-white/92 px-5 py-5 text-sm text-slate-600 shadow-[0_24px_64px_-52px_rgba(15,23,42,0.3)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{step.step}</div>
                  <div className="rounded-full border border-black/8 bg-white/84 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {uiCopy.sequence}
                  </div>
                </div>
                <div className="mt-4 text-base font-semibold text-slate-900">{step.title}</div>
                <p className="mt-2 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
