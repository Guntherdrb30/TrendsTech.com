'use client';

import { useState, useTransition, useCallback } from 'react';
import type { PublicSkillGroup, PublicSkillItem } from './actions';

const STORAGE_KEY = 'pendingAgentConfig';

export type WizardData = {
  name: string;
  description: string;
  language: 'ES' | 'EN';
  skillIds: string[];
};

function saveToStorage(data: WizardData) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

type Props = {
  skillGroups: PublicSkillGroup[];
  locale: string;
};

const BASE_PRICE = 29;

export function PublicAgentWizard({ skillGroups, locale }: Props) {
  const isEs = locale.startsWith('es');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<'ES' | 'EN'>(isEs ? 'ES' : 'EN');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  const allSkills = skillGroups.flatMap((g) => g.skills);
  const selectedSkills = allSkills.filter((s) => selectedIds.has(s.id));
  const skillsTotal = selectedSkills.reduce((sum, s) => sum + s.priceMonthly, 0);
  const total = BASE_PRICE + skillsTotal;

  const toggleSkill = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const goToAuth = useCallback(() => {
    startTransition(() => {
      const data: WizardData = {
        name: name.trim(),
        description: description.trim(),
        language,
        skillIds: Array.from(selectedIds),
      };
      saveToStorage(data);
      const redirectTo = encodeURIComponent(`/${locale}/crear-agente?restore=1`);
      window.location.href = `/${locale}/register?redirectTo=${redirectTo}`;
    });
  }, [name, description, language, selectedIds, locale]);

  const copy = isEs
    ? {
        stepLabels: ['Información', 'Skills', 'Resumen', 'Activar'],
        step1Title: 'Información del agente',
        namePlaceholder: 'Ej: Agente de Ventas — Carpihogar',
        nameLabel: 'Nombre del agente *',
        descLabel: 'Descripción de tu negocio',
        descPlaceholder: 'Describe brevemente tu negocio, qué vendes o qué servicios ofreces...',
        langLabel: 'Idioma del agente',
        next: 'Continuar →',
        back: '← Volver',
        step2Title: 'Elige las habilidades de tu agente',
        step2Sub: 'Cada skill especializa al agente en un área de tu negocio.',
        noSkills: 'Selecciona al menos una skill para continuar.',
        step3Title: 'Resumen de tu agente',
        agentName: 'Nombre',
        agentDesc: 'Descripción',
        agentLang: 'Idioma',
        agentSkills: 'Skills seleccionadas',
        noSkillsSelected: 'Ninguna skill seleccionada.',
        priceBase: 'Plan base',
        priceSkills: 'Skills',
        priceTotal: 'Total mensual',
        step4Title: '¡Tu agente está listo para activarse!',
        step4Sub: 'Crea tu cuenta para desplegar tu agente en nuestros servidores. Necesitas créditos para mantenerlo activo.',
        step4Point1: 'Tu agente queda configurado con las skills que elegiste.',
        step4Point2: 'Necesitas créditos en tu billetera para que el agente responda a tus usuarios.',
        step4Point3: 'Después del registro te mostraremos el código de instalación.',
        createAccount: 'Crear cuenta y activar agente →',
        loginInstead: '¿Ya tienes cuenta? Inicia sesión',
        featured: 'Destacado',
      }
    : {
        stepLabels: ['Info', 'Skills', 'Summary', 'Activate'],
        step1Title: 'Agent information',
        namePlaceholder: 'E.g.: Sales Agent — My Store',
        nameLabel: 'Agent name *',
        descLabel: 'Business description',
        descPlaceholder: 'Briefly describe your business, what you sell or what services you offer...',
        langLabel: 'Agent language',
        next: 'Continue →',
        back: '← Back',
        step2Title: 'Choose your agent skills',
        step2Sub: 'Each skill specializes the agent in a specific area of your business.',
        noSkills: 'Select at least one skill to continue.',
        step3Title: 'Your agent summary',
        agentName: 'Name',
        agentDesc: 'Description',
        agentLang: 'Language',
        agentSkills: 'Selected skills',
        noSkillsSelected: 'No skills selected.',
        priceBase: 'Base plan',
        priceSkills: 'Skills',
        priceTotal: 'Monthly total',
        step4Title: 'Your agent is ready to activate!',
        step4Sub: 'Create your account to deploy your agent on our servers. You need credits to keep it active.',
        step4Point1: 'Your agent will be set up with the skills you chose.',
        step4Point2: 'You need credits in your wallet for the agent to respond to your users.',
        step4Point3: 'After registration we will show you the installation code.',
        createAccount: 'Create account and activate agent →',
        loginInstead: 'Already have an account? Sign in',
        featured: 'Featured',
      };

  return (
    <div className="mx-auto max-w-4xl">
      {/* step indicator */}
      <div className="mb-8 flex items-center justify-center gap-0">
        {copy.stepLabels.map((label, i) => {
          const s = (i + 1) as 1 | 2 | 3 | 4;
          const active = step === s;
          const done = step > s;
          return (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    done
                      ? 'bg-[#00bfa5] text-white'
                      : active
                      ? 'bg-slate-950 text-white'
                      : 'border border-black/12 bg-white text-slate-400'
                  }`}
                >
                  {done ? '✓' : s}
                </div>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${
                    active ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < copy.stepLabels.length - 1 && (
                <div
                  className={`mx-2 mb-5 h-px w-12 sm:w-20 ${done ? 'bg-[#00bfa5]' : 'bg-slate-200'}`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-[32px] border border-black/8 bg-white shadow-[0_24px_64px_-48px_rgba(15,23,42,0.22)]">
        {/* ── STEP 1: Info ── */}
        {step === 1 && (
          <div className="p-7 sm:p-8">
            <h2 className="mb-6 text-2xl font-semibold tracking-[-0.03em] text-slate-900">
              {copy.step1Title}
            </h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">{copy.nameLabel}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={copy.namePlaceholder}
                  className="w-full rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#00bfa5] focus:bg-white focus:ring-2 focus:ring-[#00bfa5]/20"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">{copy.descLabel}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={copy.descPlaceholder}
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#00bfa5] focus:bg-white focus:ring-2 focus:ring-[#00bfa5]/20"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">{copy.langLabel}</label>
                <div className="flex gap-3">
                  {(['ES', 'EN'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguage(lang)}
                      className={`rounded-2xl border px-6 py-2.5 text-sm font-semibold transition ${
                        language === lang
                          ? 'border-[#00bfa5] bg-[#00bfa5] text-white'
                          : 'border-black/10 bg-slate-50 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {lang === 'ES' ? '🇻🇪 Español' : '🇺🇸 English'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                disabled={!name.trim()}
                onClick={() => setStep(2)}
                className="rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-800 transition"
              >
                {copy.next}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Skills ── */}
        {step === 2 && (
          <div className="p-7 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">{copy.step2Title}</h2>
              <p className="mt-1 text-sm text-slate-500">{copy.step2Sub}</p>
            </div>
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
              {skillGroups.map((group) => (
                <div key={group.industry}>
                  <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {isEs ? group.industry : group.industryEn}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.skills.map((skill) => (
                      <SkillCard
                        key={skill.id}
                        skill={skill}
                        selected={selectedIds.has(skill.id)}
                        onToggle={toggleSkill}
                        isEs={isEs}
                        featuredLabel={copy.featured}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-between gap-4">
              <button type="button" onClick={() => setStep(1)} className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition">
                {copy.back}
              </button>
              <button
                type="button"
                disabled={selectedIds.size === 0}
                onClick={() => setStep(3)}
                className="rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-800 transition"
              >
                {copy.next}
              </button>
            </div>
            {selectedIds.size === 0 && (
              <p className="mt-3 text-center text-xs text-amber-600">{copy.noSkills}</p>
            )}
          </div>
        )}

        {/* ── STEP 3: Summary ── */}
        {step === 3 && (
          <div className="p-7 sm:p-8">
            <h2 className="mb-6 text-2xl font-semibold tracking-[-0.03em] text-slate-900">{copy.step3Title}</h2>
            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
              <div className="space-y-4">
                <InfoRow label={copy.agentName} value={name} />
                {description && <InfoRow label={copy.agentDesc} value={description} />}
                <InfoRow label={copy.agentLang} value={language === 'ES' ? '🇻🇪 Español' : '🇺🇸 English'} />
                <div>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {copy.agentSkills}
                  </div>
                  {selectedSkills.length === 0 ? (
                    <p className="text-sm text-slate-500">{copy.noSkillsSelected}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedSkills.map((s) => (
                        <span
                          key={s.id}
                          className="flex items-center gap-1.5 rounded-full border border-[#00bfa5]/30 bg-[#f0fdf9] px-3 py-1 text-sm font-medium text-[#00897b]"
                        >
                          <span>{s.icon}</span>
                          <span>{isEs ? s.name : s.nameEn}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* price box */}
              <div className="rounded-[24px] border border-black/8 bg-slate-950 p-5 text-white">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {copy.priceBase}
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <span className="text-sm text-slate-300">Plan base</span>
                  <span className="text-lg font-semibold">${BASE_PRICE}/mes</span>
                </div>
                {selectedSkills.map((s) => (
                  <div key={s.id} className="mt-2 flex items-end justify-between">
                    <span className="text-sm text-slate-400">{s.icon} {isEs ? s.name : s.nameEn}</span>
                    <span className="text-sm font-medium text-slate-300">${s.priceMonthly}/mes</span>
                  </div>
                ))}
                <div className="mt-4 border-t border-white/10 pt-4">
                  <div className="flex items-end justify-between">
                    <span className="text-sm font-semibold text-white">{copy.priceTotal}</span>
                    <span className="text-2xl font-bold text-[#00bfa5]">${total}/mes</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              <button type="button" onClick={() => setStep(2)} className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition">
                {copy.back}
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="rounded-full bg-[#00bfa5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#00897b] transition"
              >
                {copy.next}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Auth wall ── */}
        {step === 4 && (
          <div className="p-7 sm:p-8">
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#00bfa5,#00897b)] text-3xl shadow-[0_14px_35px_-16px_rgba(0,191,165,0.5)]">
                🚀
              </div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">{copy.step4Title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{copy.step4Sub}</p>

              <div className="mt-6 space-y-3 text-left">
                {[copy.step4Point1, copy.step4Point2, copy.step4Point3].map((pt, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-2xl border border-black/8 bg-slate-50 px-4 py-3">
                    <span className="mt-0.5 text-[#00bfa5]">✓</span>
                    <span className="text-sm text-slate-700">{pt}</span>
                  </div>
                ))}
              </div>

              {/* agent mini-summary */}
              <div className="mt-6 rounded-2xl border border-[#00bfa5]/25 bg-[#f0fdf9] px-4 py-4 text-left">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00897b]">
                  {isEs ? 'Tu agente configurado' : 'Your configured agent'}
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900">{name}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedSkills.map((s) => (
                    <span key={s.id} className="rounded-full bg-white border border-[#00bfa5]/30 px-2.5 py-0.5 text-xs font-medium text-[#00897b]">
                      {s.icon} {isEs ? s.name : s.nameEn}
                    </span>
                  ))}
                </div>
                <div className="mt-3 text-right text-sm font-bold text-slate-900">${total}/mes</div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={goToAuth}
                  className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_-16px_rgba(15,23,42,0.4)] transition hover:bg-slate-800"
                >
                  {copy.createAccount}
                </button>
                <a
                  href={`/${locale}/login?redirectTo=${encodeURIComponent(`/${locale}/crear-agente?restore=1`)}`}
                  className="block text-sm font-semibold text-slate-500 hover:text-slate-900 transition"
                  onClick={() => {
                    const data: WizardData = { name: name.trim(), description: description.trim(), language, skillIds: Array.from(selectedIds) };
                    saveToStorage(data);
                  }}
                >
                  {copy.loginInstead}
                </a>
              </div>
            </div>

            <div className="mt-6 flex justify-start">
              <button type="button" onClick={() => setStep(3)} className="text-sm font-semibold text-slate-400 hover:text-slate-700 transition">
                {copy.back}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SkillCard({
  skill,
  selected,
  onToggle,
  isEs,
  featuredLabel,
}: {
  skill: PublicSkillItem;
  selected: boolean;
  onToggle: (id: string) => void;
  isEs: boolean;
  featuredLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(skill.id)}
      className={`relative w-full rounded-[20px] border p-4 text-left transition ${
        selected
          ? 'border-[#00bfa5] bg-[#f0fdf9] shadow-[0_0_0_2px_rgba(0,191,165,0.25)]'
          : 'border-black/8 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {skill.isFeatured && (
        <span className="absolute right-3 top-3 rounded-full bg-[#00bfa5] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white">
          {featuredLabel}
        </span>
      )}
      <div className="flex items-start gap-2">
        <span className="text-xl">{skill.icon}</span>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">{isEs ? skill.name : skill.nameEn}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">{isEs ? skill.description : skill.descriptionEn}</div>
          <div className="mt-2 text-[11px] font-semibold text-[#00897b]">${skill.priceMonthly}/mes</div>
        </div>
      </div>
      {selected && (
        <div className="absolute right-3 bottom-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#00bfa5] text-[10px] text-white">
          ✓
        </div>
      )}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-black/8 bg-slate-50 px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}
