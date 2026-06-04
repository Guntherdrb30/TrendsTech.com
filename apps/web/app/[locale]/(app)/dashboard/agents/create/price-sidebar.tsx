'use client';

import type { SkillItem } from './actions';

type Props = {
  selectedSkills: SkillItem[];
  isEs: boolean;
  onCreateClick: () => void;
  isPending: boolean;
  currentStep: number;
};

const BASE_PRICE = 29;

export function PriceSidebar({ selectedSkills, isEs, onCreateClick, isPending, currentStep }: Props) {
  const skillsTotal = selectedSkills.reduce((sum, s) => sum + s.priceMonthly, 0);
  const total = BASE_PRICE + skillsTotal;

  return (
    <div className="interactive-panel sticky top-6 rounded-[32px] border border-black/8 bg-white/92 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.32)] dark:border-slate-800 dark:bg-slate-950/70">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        {isEs ? 'Resumen de precio' : 'Price summary'}
      </p>

      {/* Plan base */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-slate-600 dark:text-slate-300">{isEs ? 'Plan base' : 'Base plan'}</span>
        <span className="text-sm font-semibold text-slate-900 dark:text-white">${BASE_PRICE}/mes</span>
      </div>

      {/* Skills seleccionadas */}
      {selectedSkills.length > 0 && (
        <div className="mt-3 space-y-2">
          {selectedSkills.map((skill) => (
            <div key={skill.id} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>{skill.icon}</span>
                <span>{isEs ? skill.name : skill.nameEn}</span>
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">+${skill.priceMonthly}</span>
            </div>
          ))}
        </div>
      )}

      {/* Separador */}
      <div className="my-4 border-t border-black/8 dark:border-slate-800" />

      {/* Total */}
      <div className="flex items-end justify-between">
        <span className="text-sm font-semibold text-slate-900 dark:text-white">
          {isEs ? 'Total mensual' : 'Monthly total'}
        </span>
        <div className="text-right">
          <span className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">${total}</span>
          <span className="ml-1 text-xs text-slate-400">/mes</span>
        </div>
      </div>

      {/* Botón crear — visible en paso 3 */}
      {currentStep === 3 && (
        <button
          type="button"
          onClick={onCreateClick}
          disabled={isPending}
          className="interactive-chip mt-5 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_-24px_rgba(15,23,42,0.45)] transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {isPending
            ? isEs
              ? 'Creando agente...'
              : 'Creating agent...'
            : isEs
              ? 'Crear agente'
              : 'Create agent'}
        </button>
      )}

      {/* Nota cuando no hay skills */}
      {selectedSkills.length === 0 && (
        <p className="mt-4 text-xs text-slate-400">
          {isEs ? 'Selecciona al menos una skill para empezar.' : 'Select at least one skill to get started.'}
        </p>
      )}
    </div>
  );
}
