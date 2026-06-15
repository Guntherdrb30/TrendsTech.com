'use client';

import type { SkillItem } from './actions';

type Props = {
  selectedSkills: SkillItem[];
  isEs: boolean;
  onCreateClick: () => void;
  isPending: boolean;
  currentStep: number;
};

const SKILL_PRICE = 10;

export function PriceSidebar({ selectedSkills, isEs, onCreateClick, isPending, currentStep }: Props) {
  const total = selectedSkills.length * SKILL_PRICE;

  return (
    <div className="interactive-panel sticky top-6 rounded-[32px] border border-black/8 bg-white/92 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.32)] dark:border-slate-800 dark:bg-slate-950/70">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        {isEs ? 'Créditos iniciales' : 'Initial credits'}
      </p>

      {/* Skills seleccionadas */}
      {selectedSkills.length > 0 ? (
        <div className="mt-4 space-y-2">
          {selectedSkills.map((skill) => (
            <div key={skill.id} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>{skill.icon}</span>
                <span>{isEs ? skill.name : skill.nameEn}</span>
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">${SKILL_PRICE}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-xs text-slate-400">
          {isEs ? 'Selecciona al menos una skill para empezar.' : 'Select at least one skill to get started.'}
        </p>
      )}

      {/* Separador */}
      <div className="my-4 border-t border-black/8 dark:border-slate-800" />

      {/* Total */}
      <div className="flex items-end justify-between">
        <div>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {isEs ? 'Crédito inicial' : 'Initial credit'}
          </span>
          <p className="mt-0.5 text-[10px] text-slate-400">
            {isEs ? '$10 por skill · consumo de IA descontado' : '$10 per skill · AI usage deducted'}
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">${total}</span>
          <span className="ml-1 text-xs text-slate-400">USD</span>
        </div>
      </div>

      {/* Info créditos */}
      {selectedSkills.length > 0 && (
        <div className="mt-3 rounded-2xl bg-[#f0fdf9] px-4 py-3 text-[11px] text-[#00897b] dark:bg-[#00897b]/10">
          {isEs
            ? 'El consumo de IA se descuenta de tus créditos. Cuando se agotan, el agente pausa y solicita recarga.'
            : 'AI usage is deducted from your credits. When exhausted, the agent pauses and prompts a recharge.'}
        </div>
      )}

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
    </div>
  );
}
