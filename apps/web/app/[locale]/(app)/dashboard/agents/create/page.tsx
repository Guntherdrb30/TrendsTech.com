import { requireAuth } from '@/lib/auth/guards';
import { resolveTenantFromUser } from '@/lib/tenant';
import { getAvailableSkills } from './actions';
import { AgentCreatorClient } from './agent-creator-client';

export const dynamic = 'force-dynamic';

type PageParams = { locale: string };

export default async function AgentCreatePage({ params }: { params: Promise<PageParams> }) {
  const { locale } = await params;
  const isEs = locale.startsWith('es');

  const user = await requireAuth();
  const tenant = await resolveTenantFromUser(user);

  if (!tenant) {
    return (
      <section className="space-y-6">
        <div className="interactive-panel premium-noise overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-7 shadow-[0_35px_100px_-72px_rgba(15,23,42,0.35)] sm:px-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isEs ? 'No hay tenant asignado.' : 'No tenant assigned.'}
          </p>
        </div>
      </section>
    );
  }

  const skillGroups = await getAvailableSkills();

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="interactive-panel premium-noise overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-7 shadow-[0_35px_100px_-72px_rgba(15,23,42,0.35)] sm:px-8">
        <div className="space-y-3">
          <div className="inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            {isEs ? 'Nuevo agente' : 'New agent'}
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              {isEs ? 'Crear agente con skills' : 'Create agent with skills'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isEs
                ? 'Elige las habilidades especializadas de tu agente y obtén tu snippet de instalación.'
                : 'Choose your agent specialized skills and get your installation snippet.'}
            </p>
          </div>
        </div>
      </div>

      {/* Wizard multi-step */}
      <AgentCreatorClient skillGroups={skillGroups} locale={locale} />
    </section>
  );
}
