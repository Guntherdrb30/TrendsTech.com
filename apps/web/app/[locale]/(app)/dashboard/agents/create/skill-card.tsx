'use client';

import type { SkillItem } from './actions';

type Props = {
  skill: SkillItem;
  selected: boolean;
  onToggle: (id: string) => void;
  isEs: boolean;
};

export function SkillCard({ skill, selected, onToggle, isEs }: Props) {
  return (
    <button
      type="button"
      onClick={() => onToggle(skill.id)}
      className={[
        'interactive-panel w-full rounded-[24px] border p-5 text-left transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2',
        selected
          ? 'border-slate-900 bg-slate-950 text-white shadow-[0_20px_50px_-30px_rgba(15,23,42,0.5)]'
          : 'border-black/8 bg-white/92 hover:border-slate-300 hover:shadow-[0_12px_30px_-20px_rgba(15,23,42,0.15)] dark:border-slate-800 dark:bg-slate-950/70',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-2xl leading-none">{skill.icon}</span>
        {/* Indicador de selección */}
        <div
          className={[
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
            selected ? 'border-white bg-white' : 'border-slate-300 dark:border-slate-600',
          ].join(' ')}
        >
          {selected && (
            <svg className="h-3 w-3 text-slate-950" fill="currentColor" viewBox="0 0 12 12">
              <path d="M10.28 2.28L4 8.56 1.72 6.28a1 1 0 00-1.44 1.44l3 3a1 1 0 001.44 0l7-7a1 1 0 00-1.44-1.44z" />
            </svg>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <p className={['text-sm font-semibold', selected ? 'text-white' : 'text-slate-900 dark:text-white'].join(' ')}>
          {isEs ? skill.name : skill.nameEn}
        </p>
        <p
          className={[
            'text-xs leading-relaxed',
            selected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400',
          ].join(' ')}
        >
          {isEs ? skill.description : skill.descriptionEn}
        </p>
      </div>

      <div className={['mt-4 text-xs font-semibold', selected ? 'text-slate-300' : 'text-slate-500'].join(' ')}>
        ${skill.priceMonthly}/{isEs ? 'mes' : 'mo'}
      </div>
    </button>
  );
}
