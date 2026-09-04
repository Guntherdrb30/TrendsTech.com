import Link from 'next/link';

const metrics = [
  ['Proyectos activos', '0', 'Listos para registrar'],
  ['Agentes ejecutándose', '0', 'Runtime aún desconectado'],
  ['Approvals pendientes', '0', 'Sin acciones sensibles'],
  ['Costo real', '$0.00', 'Sin consumo IA'],
  ['Forecast', '$0.00', 'Se calcula por proyecto'],
  ['Runs fallidos', '0', 'Sin ejecuciones']
] as const;

const agents = [
  ['Astra', 'Director de Ingeniería', 'Orquestación y decisiones críticas'],
  ['Product Analyst', 'Producto', 'Requisitos, alcance y criterios'],
  ['Software Architect', 'Arquitectura', 'Stack, dominios y dependencias'],
  ['Frontend Engineer', 'Frontend', 'Next.js, React y UX'],
  ['Backend Engineer', 'Backend', 'Servicios, APIs y lógica'],
  ['QA Engineer', 'Calidad', 'Tests y regresiones'],
  ['Cybersecurity Engineer', 'Seguridad', 'Riesgos y controles'],
  ['NVIDIA Local AI Architect', 'IA local', 'GPU, serving, benchmarks y costos']
] as const;

const integrations = [
  ['GitHub', 'Preparado', 'Ramas, commits y PR'],
  ['Vercel', 'Pendiente', 'Previews controlados'],
  ['OpenAI API', 'Pendiente', 'Modelos y orquestación'],
  ['ChatGPT / Trends MCP', 'Diseñado', 'Sincronización de decisiones y contexto'],
  ['Codex', 'Diseñado', 'Tareas con repo, rama y criterios'],
  ['NVIDIA Local AI', 'Planificado', 'NeMo, Dynamo y runtimes locales']
] as const;

export default async function EngineeringStudioOverview({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const base = `/${locale}/admin/programming`;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metrics.map(([label, value, note]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Project Factory</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Comenzar un proyecto</h3>
              <p className="mt-1 text-sm text-slate-500">Idea, PRD, conversación, repositorio existente o recuperación de software.</p>
            </div>
            <Link href={`${base}/projects`} className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-cyan-600 dark:bg-white dark:text-slate-950">
              Nuevo proyecto
            </Link>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              ['1', 'Blueprint', 'Astra analiza antes de programar.'],
              ['2', 'Approval Gate', 'Tú apruebas alcance y presupuesto.'],
              ['3', 'Build + Verify', 'Agentes, tests, seguridad y preview.']
            ].map(([step, title, text]) => (
              <div key={step} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">{step}</span>
                <p className="mt-4 font-semibold text-slate-950 dark:text-white">{title}</p>
                <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[26px] border border-amber-200 bg-amber-50/60 p-6 dark:border-amber-900 dark:bg-amber-950/20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">Atención requerida</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">MVP en modo diseño</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Esta pantalla usa datos mock deliberadamente. No se han conectado modelos pagados, base de datos nueva, Vercel preview ni ejecución autónoma.
          </p>
          <div className="mt-5 space-y-3 text-sm">
            <div className="rounded-xl bg-white/80 p-3 dark:bg-slate-950/60"><strong>Gate 1:</strong> aprobar experiencia visual.</div>
            <div className="rounded-xl bg-white/80 p-3 dark:bg-slate-950/60"><strong>Gate 2:</strong> crear persistencia y Cost Engine.</div>
            <div className="rounded-xl bg-white/80 p-3 dark:bg-slate-950/60"><strong>Gate 3:</strong> conectar agentes y herramientas.</div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Equipo IA</p><h3 className="mt-2 text-xl font-semibold">Agentes especialistas</h3></div>
            <Link href={`${base}/agents`} className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">Ver equipo</Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {agents.map(([name, role, detail]) => (
              <div key={name} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-950 dark:text-white">{name}</p><p className="text-xs font-medium text-cyan-700 dark:text-cyan-300">{role}</p></div><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-900">OFF</span></div>
                <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">{detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Ecosistema</p><h3 className="mt-2 text-xl font-semibold">Integraciones</h3></div><Link href={`${base}/integrations`} className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">Configurar</Link></div>
          <div className="mt-5 space-y-3">
            {integrations.map(([name, status, detail]) => (
              <div key={name} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div><p className="font-semibold text-slate-950 dark:text-white">{name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{detail}</p></div>
                <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">{status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link href={`${base}/costs`} className="interactive-panel rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Finanzas</p><h3 className="mt-2 text-lg font-semibold">Cost Engine</h3><p className="mt-2 text-sm text-slate-500">Baseline, forecast, actual, margen, electricidad y amortización.</p></Link>
        <Link href={`${base}/hardware`} className="interactive-panel rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Local AI</p><h3 className="mt-2 text-lg font-semibold">Hardware IA</h3><p className="mt-2 text-sm text-slate-500">RTX, RTX PRO, DGX, benchmarks y comparador Local/API/Híbrido.</p></Link>
        <Link href={`${base}/runs`} className="interactive-panel rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Auditoría</p><h3 className="mt-2 text-lg font-semibold">Agent Runs</h3><p className="mt-2 text-sm text-slate-500">Modelo, herramientas, costo, commits, tests, errores y approvals.</p></Link>
      </section>
    </div>
  );
}
