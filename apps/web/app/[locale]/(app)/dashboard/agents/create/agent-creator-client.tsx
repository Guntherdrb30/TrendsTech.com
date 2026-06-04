'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SkillCard } from './skill-card';
import { PriceSidebar } from './price-sidebar';
import type { SkillGroup, SkillItem, CreateAgentResult } from './actions';
import { createAgentWithSkills } from './actions';

type Props = {
  skillGroups: SkillGroup[];
  locale: string;
};

type Step = 1 | 2 | 3 | 4;

export function AgentCreatorClient({ skillGroups, locale }: Props) {
  const isEs = locale.startsWith('es');
  const [step, setStep] = useState<Step>(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Estado del formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<'ES' | 'EN'>('ES');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<CreateAgentResult | null>(null);

  // Lista plana de todas las skills para el sidebar
  const allSkills: SkillItem[] = skillGroups.flatMap((g) => g.skills);
  const selectedSkills = allSkills.filter((s) => selectedIds.has(s.id));

  function toggleSkill(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await createAgentWithSkills({
          name: name.trim(),
          description: description.trim(),
          language,
          skillIds: Array.from(selectedIds),
        });
        setResult(res);
        setStep(4);
      } catch (e) {
        setError(isEs ? 'Error al crear el agente. Intenta de nuevo.' : 'Error creating agent. Please try again.');
        console.error(e);
      }
    });
  }

  function buildSnippet(r: CreateAgentResult): string {
    const skillKeys = r.selectedSkills.map((s) => s.key).join(',');
    const dataSkills = skillKeys ? `\n  data-skills="${skillKeys}"` : '';
    return `<script\n  src="https://cdn.trends172tech.com/widget.js"\n  data-token="${r.installPublicKey}"${dataSkills}\n  async\n></script>`;
  }

  function copySnippet() {
    if (!result) return;
    navigator.clipboard.writeText(buildSnippet(result)).catch(() => {});
  }

  const copy = {
    step1: isEs ? 'Información del agente' : 'Agent information',
    step2: isEs ? 'Elige las skills' : 'Choose skills',
    step3: isEs ? 'Confirmar y crear' : 'Confirm & create',
    step4: isEs ? '¡Agente creado!' : 'Agent created!',
    next: isEs ? 'Continuar' : 'Next',
    back: isEs ? 'Atrás' : 'Back',
    copySnippet: isEs ? 'Copiar' : 'Copy',
    snippetInfo: isEs
      ? 'Pega este código antes del </body> en tu sitio web para activar el widget.'
      : 'Paste this code before </body> on your website to activate the widget.',
    goToAgent: isEs ? 'Ver mi agente' : 'View my agent',
    nameLabel: isEs ? 'Nombre del agente' : 'Agent name',
    namePlaceholder: isEs ? 'Ej: Agente de Cocinas' : 'E.g.: Kitchen Agent',
    descLabel: isEs ? 'Descripción del negocio' : 'Business description',
    descPlaceholder: isEs ? 'Describe brevemente tu negocio...' : 'Briefly describe your business...',
    langLabel: isEs ? 'Idioma por defecto' : 'Default language',
    nameRequired: isEs ? 'El nombre del agente es obligatorio.' : 'Agent name is required.',
    noSkills: isEs ? 'Ninguna' : 'None',
    token: 'Token',
  };

  const steps = [
    { n: 1, label: isEs ? 'Info' : 'Info' },
    { n: 2, label: 'Skills' },
    { n: 3, label: isEs ? 'Resumen' : 'Summary' },
    { n: 4, label: 'Snippet' },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {/* ── Columna principal ───────────────────────────────────── */}
      <div className="space-y-6">
        {/* Indicador de pasos */}
        <div className="flex flex-wrap items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  step === s.n
                    ? 'bg-slate-950 text-white'
                    : step > s.n
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'border border-black/10 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900',
                ].join(' ')}
              >
                {step > s.n ? '✓' : s.n}
              </div>
              <span
                className={[
                  'text-xs font-medium',
                  step === s.n ? 'text-slate-900 dark:text-white' : 'text-slate-400',
                ].join(' ')}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && <div className="mx-1 h-px w-6 bg-slate-200 dark:bg-slate-700" />}
            </div>
          ))}
        </div>

        {/* Error global */}
        {error && (
          <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        {/* ── PASO 1: Información ──────────────────────────────── */}
        {step === 1 && (
          <Card className="interactive-panel">
            <CardHeader>
              <CardTitle>{copy.step1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="agent-name">{copy.nameLabel} *</Label>
                <Input
                  id="agent-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={copy.namePlaceholder}
                  maxLength={80}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-desc">{copy.descLabel}</Label>
                <textarea
                  id="agent-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={copy.descPlaceholder}
                  maxLength={500}
                  rows={4}
                  className="w-full resize-none rounded-[14px] border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label>{copy.langLabel}</Label>
                <div className="flex gap-3">
                  {(['ES', 'EN'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguage(lang)}
                      className={[
                        'interactive-chip rounded-full border px-5 py-2 text-sm font-semibold transition',
                        language === lang
                          ? 'border-slate-900 bg-slate-950 text-white'
                          : 'border-black/8 bg-white/90 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
                      ].join(' ')}
                    >
                      {lang === 'ES' ? '🇪🇸 Español' : '🇺🇸 English'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!name.trim()) {
                      setError(copy.nameRequired);
                      return;
                    }
                    setError(null);
                    setStep(2);
                  }}
                  className="interactive-chip inline-flex rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
                >
                  {copy.next} →
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── PASO 2: Selección de skills ───────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            {skillGroups.map((group) => (
              <Card key={group.industry} className="interactive-panel">
                <CardHeader>
                  <div className="inline-flex rounded-full border border-black/8 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                    {isEs ? group.industry : group.industryEn}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {group.skills.map((skill) => (
                      <SkillCard
                        key={skill.id}
                        skill={skill}
                        selected={selectedIds.has(skill.id)}
                        onToggle={toggleSkill}
                        isEs={isEs}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="interactive-chip inline-flex rounded-full border border-black/8 bg-white/90 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                ← {copy.back}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="interactive-chip inline-flex rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
              >
                {copy.next} →
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 3: Resumen ───────────────────────────────────── */}
        {step === 3 && (
          <Card className="interactive-panel">
            <CardHeader>
              <CardTitle>{copy.step3}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2 rounded-[20px] border border-black/8 bg-slate-50/80 px-5 py-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                <p>
                  <span className="font-semibold">{isEs ? 'Nombre:' : 'Name:'}</span> {name}
                </p>
                {description && (
                  <p>
                    <span className="font-semibold">{isEs ? 'Descripción:' : 'Description:'}</span> {description}
                  </p>
                )}
                <p>
                  <span className="font-semibold">{isEs ? 'Idioma:' : 'Language:'}</span> {language}
                </p>
                <p>
                  <span className="font-semibold">Skills:</span>{' '}
                  {selectedSkills.length > 0
                    ? selectedSkills.map((s) => `${s.icon} ${isEs ? s.name : s.nameEn}`).join(', ')
                    : copy.noSkills}
                </p>
              </div>
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="interactive-chip inline-flex rounded-full border border-black/8 bg-white/90 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  ← {copy.back}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── PASO 4: Snippet de instalación ───────────────────── */}
        {step === 4 && result && (
          <Card className="interactive-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                {copy.step4}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-slate-600 dark:text-slate-300">{copy.snippetInfo}</p>

              {/* Snippet */}
              <div className="relative rounded-[18px] border border-black/8 bg-slate-950 p-5 dark:border-slate-700">
                <pre className="overflow-x-auto text-xs leading-relaxed text-emerald-400">
                  {buildSnippet(result)}
                </pre>
                <button
                  type="button"
                  onClick={copySnippet}
                  className="interactive-chip absolute right-3 top-3 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/16 focus-visible:outline-none"
                >
                  {copy.copySnippet}
                </button>
              </div>

              {/* Token */}
              <div className="rounded-[18px] border border-black/8 bg-white/90 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/60">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{copy.token}</p>
                <p className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-300">
                  {result.installPublicKey}
                </p>
              </div>

              <a
                href={`/${locale}/dashboard/agents/${result.agentId}`}
                className="interactive-chip inline-flex rounded-full border border-black/8 bg-white/90 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
              >
                {copy.goToAgent} →
              </a>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Sidebar de precio (columna derecha) ────────────────── */}
      {step < 4 && (
        <PriceSidebar
          selectedSkills={selectedSkills}
          isEs={isEs}
          onCreateClick={handleCreate}
          isPending={isPending}
          currentStep={step}
        />
      )}
    </div>
  );
}
