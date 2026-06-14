import { IBM_Plex_Sans, Space_Grotesk } from 'next/font/google';
import { getPublicSkills } from './actions';
import { PublicAgentWizard } from './public-agent-wizard';
import { RestoreHandler } from './restore-handler';

export const dynamic = 'force-dynamic';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
});

const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
});

type PageParams = { locale: string };
type PageSearchParams = { restore?: string };

export default async function CrearAgentePage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<PageSearchParams>;
}) {
  const { locale } = await params;
  const { restore } = await searchParams;
  const isEs = locale.startsWith('es');
  const isRestore = restore === '1' || restore === 'true';

  return (
    <div className={`${display.variable} ${body.variable} font-[var(--font-body)] text-slate-900`}>
      {/* page header */}
      <div className="border-b border-black/6 bg-[linear-gradient(180deg,#f3f6fa_0%,#ffffff_100%)] px-6 pb-8 pt-10 sm:px-8 lg:px-14 xl:px-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/92 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
            <span className="h-2 w-2 rounded-full bg-[#00bfa5]" />
            Trends172 Tech
          </div>
          <h1 className="text-3xl font-[var(--font-display)] font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            {isEs ? 'Crea tu agente IA con skills' : 'Create your AI agent with skills'}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-slate-600">
            {isEs
              ? 'Configura tu agente, elige las habilidades que necesita tu empresa y despliégalo en tu sitio web en minutos.'
              : 'Configure your agent, choose the skills your business needs and deploy it on your website in minutes.'}
          </p>

          {!isRestore && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <div className="rounded-full border border-black/8 bg-white px-3 py-1 text-[11px] font-medium text-slate-500">
                {isEs ? '✓ Sin tarjeta requerida para explorar' : '✓ No card required to explore'}
              </div>
              <div className="rounded-full border border-black/8 bg-white px-3 py-1 text-[11px] font-medium text-slate-500">
                {isEs ? '✓ Actívalo cuando estés listo' : '✓ Activate when you\'re ready'}
              </div>
              <div className="rounded-full border border-black/8 bg-white px-3 py-1 text-[11px] font-medium text-slate-500">
                {isEs ? '✓ Código de instalación incluido' : '✓ Installation code included'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* main content */}
      <div className="px-6 py-10 sm:px-8 lg:px-14 xl:px-20">
        {isRestore ? (
          <RestoreHandler locale={locale} />
        ) : (
          <PublicAgentWizardLoader locale={locale} />
        )}
      </div>
    </div>
  );
}

async function PublicAgentWizardLoader({ locale }: { locale: string }) {
  const skillGroups = await getPublicSkills();
  return <PublicAgentWizard skillGroups={skillGroups} locale={locale} />;
}
