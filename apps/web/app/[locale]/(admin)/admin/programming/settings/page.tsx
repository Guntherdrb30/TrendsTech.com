import { getGlobalRoutingPolicy } from '@/lib/engineering-studio/routing';
import { saveRoutingPolicyAction } from './actions';

const otherSections = [
  ['Finanzas', ['Margen objetivo', 'Margen mínimo', 'Contingencia', 'Overhead', 'Costo hora por rol', 'Tarifa eléctrica', 'Amortización', 'Moneda base']],
  ['Seguridad', ['Approval Gates', 'Presupuesto máximo', 'Roles', 'Scopes', 'Secrets Broker', 'Producción']],
  ['Hardware', ['Tarifa energía', 'Vida útil', 'Utilización', 'Mantenimiento', 'Fuente de precios', 'Telemetría']]
] as const;

const profiles = [
  { value: 'ECONOMY', title: 'Económico', detail: 'Mejoras pequeñas, UI, CRUD, documentación, pruebas y correcciones de bajo riesgo.' },
  { value: 'STANDARD', title: 'Estándar', detail: 'Features medianas, backend, integraciones y coordinación normal de especialistas.' },
  { value: 'ASTRA', title: 'Astra / Alta complejidad', detail: 'Arquitectura crítica, proyectos grandes, seguridad sensible y coordinación multiagente compleja.' }
] as const;

export default async function StudioSettingsPage() {
  const policy = await getGlobalRoutingPolicy();
  return <div className="space-y-6">
    <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Configuration</p><h3 className="mt-2 text-2xl font-semibold">Configuración de Engineering Studio</h3><p className="mt-2 text-sm text-slate-500">Políticas globales reales. Cada proyecto podrá sobrescribir el perfil de orquestación.</p></div>

    <form action={saveRoutingPolicyAction} className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Strategy / Routing</p><h4 className="mt-2 text-xl font-semibold">Orquestador predeterminado</h4><p className="mt-1 max-w-3xl text-sm text-slate-500">Astra deja de ser obligatorio. El sistema usa el perfil aprobado y nunca escala silenciosamente a un modelo más costoso.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">Persistencia activa</span></div>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">{profiles.map((profile) => <label key={profile.value} className="cursor-pointer rounded-2xl border border-slate-200 p-4 has-[:checked]:border-cyan-400 has-[:checked]:bg-cyan-50 dark:border-slate-800 dark:has-[:checked]:bg-cyan-950/20"><div className="flex items-start gap-3"><input type="radio" name="defaultProfile" value={profile.value} defaultChecked={policy.defaultProfile === profile.value} className="mt-1"/><span><span className="block font-semibold">{profile.title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{profile.detail}</span></span></div></label>)}</div>
      <label className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><input type="checkbox" name="requireApprovalForAstra" defaultChecked={policy.requireApprovalForAstra} className="mt-1"/><span><span className="block text-sm font-semibold">Exigir aprobación para escalar a Astra</span><span className="mt-1 block text-xs leading-5 text-slate-500">Recomendado. Si una tarea supera el perfil aprobado, el run se detiene y solicita autorización con impacto de costo antes de escalar.</span></span></label>
      <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900/60 dark:text-slate-300"><strong>Escalamiento automático a Astra:</strong> desactivado por política. Esta protección no puede habilitarse desde este MVP.</div>
      <button type="submit" className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-600 dark:bg-white dark:text-slate-950">Guardar política</button>
    </form>

    <div className="grid gap-4 md:grid-cols-2">{otherSections.map(([title, items]) => <section key={title} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"><h4 className="text-lg font-semibold">{title}</h4><div className="mt-4 space-y-2">{items.map((item) => <div key={item} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-900/60"><span>{item}</span><span className="text-xs text-slate-400">Próximo bloque</span></div>)}</div></section>)}</div>
  </div>;
}
