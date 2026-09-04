const agents = [
  ['Astra', 'Director de Ingeniería', 'Director', 'Complejidad crítica, arquitectura, coordinación y revisión final.'],
  ['Product Analyst', 'Producto', 'Especialista', 'Convierte ideas y PRD en requisitos verificables.'],
  ['Software Architect', 'Arquitectura', 'Especialista', 'Diseña dominios, contratos, datos y dependencias.'],
  ['UX/UI Designer', 'Diseño', 'Especialista', 'Wireframes, flujos, accesibilidad y consistencia visual.'],
  ['Frontend Engineer', 'Frontend', 'Especialista', 'Next.js, React, TypeScript y experiencia de usuario.'],
  ['Backend Engineer', 'Backend', 'Especialista', 'Servicios, APIs, lógica y workers.'],
  ['Database Engineer', 'Datos', 'Especialista', 'Schema, migraciones, índices e integridad.'],
  ['AI / Agents Engineer', 'IA', 'Especialista', 'Tools, prompts, RAG, evaluaciones y runtimes.'],
  ['Integrations Engineer', 'Integraciones', 'Especialista', 'APIs externas, webhooks y contratos.'],
  ['DevOps Engineer', 'Infraestructura', 'Especialista', 'CI/CD, previews, observabilidad y rollback.'],
  ['QA Engineer', 'Calidad', 'Control', 'Pruebas funcionales, regresión y criterios de aceptación.'],
  ['Cybersecurity Engineer', 'Seguridad', 'Control', 'Threat modeling, secretos, permisos y auditoría.'],
  ['Code Reviewer', 'Integración', 'Control', 'Revisión cruzada, conflictos y preparación de PR.'],
  ['NVIDIA Local AI Architect', 'IA local', 'Especialista', 'GPU sizing, NeMo, Dynamo, TensorRT-LLM y benchmarks.']
] as const;

export default function StudioAgentsPage() {
  return <div className="space-y-6"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Agent Registry</p><h3 className="mt-2 text-2xl font-semibold">Equipo de ingeniería IA</h3><p className="mt-2 max-w-3xl text-sm text-slate-500">El director activa solo los especialistas necesarios. Los modelos concretos serán configurables y el consumo se contabilizará por run.</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{agents.map(([name, area, type, detail]) => <article key={name} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"><div className="flex items-start justify-between gap-3"><div><p className="text-lg font-semibold text-slate-950 dark:text-white">{name}</p><p className="mt-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300">{area}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-500 dark:bg-slate-900">{type}</span></div><p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">{detail}</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs dark:border-slate-800"><span className="text-slate-500">Estado</span><span className="font-semibold text-slate-700 dark:text-slate-300">No conectado</span></div></article>)}</div></div>;
}
