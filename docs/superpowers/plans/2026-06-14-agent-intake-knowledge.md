# Agent Intake Chat + Knowledge Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the first step of the public agent-creation wizard with a conversational chat interface that interviews the client one question at a time, collects company knowledge (description + website URL), recommends skills and agent name via GPT-4o-mini, then processes the knowledge into the agent's knowledge base after login.

**Architecture:** A new `IntakeChatWizard` client component handles the interview. On completion it calls `onIntakeComplete(result)`, which pre-fills the existing wizard fields (name, description, skills) and stores knowledge data in sessionStorage. The `RestoreHandler` (post-login) reads that data, calls a new `createKnowledgeFromSession` server action that creates `KnowledgeSource` records and enqueues them in the existing BullMQ pipeline, then polls a `getKnowledgeSourceStatuses` action every 3 s to show live indexing progress alongside channel selection.

**Tech Stack:** Next.js 15 App Router, `'use client'` components, Prisma + NeonDB, OpenAI (`@trends172tech/openai`), BullMQ (`@/lib/kb/queue`), shadcn-free Tailwind CSS (teal `#00bfa5` accent), existing `enqueueKnowledgeJob` pipeline.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `apps/web/app/[locale]/(public)/crear-agente/actions.ts` | **Modify** | Add extended types + `createKnowledgeFromSession` + `getKnowledgeSourceStatuses` |
| `apps/web/app/api/intake/recommend/route.ts` | **Create** | POST endpoint — GPT-4o-mini skill/name suggestions |
| `apps/web/app/[locale]/(public)/crear-agente/intake-chat.tsx` | **Create** | Conversational chat wizard (7-step state machine) |
| `apps/web/app/[locale]/(public)/crear-agente/public-agent-wizard.tsx` | **Modify** | Add `'intake'` phase before step 1, pre-fill from intake result |
| `apps/web/app/[locale]/(public)/crear-agente/restore-handler.tsx` | **Modify** | Knowledge processing status + channel selection post-login |
| `apps/web/app/[locale]/(public)/crear-agente/page.tsx` | **Modify** | Update header copy to reflect conversational flow |

---

## Task 1: Extend actions.ts — types + knowledge server actions

**Files:**
- Modify: `apps/web/app/[locale]/(public)/crear-agente/actions.ts`

### What changes

1. `WizardData` gains `knowledge` and `targetChannel` optional fields.
2. `CreateAgentSessionInput` gains the same fields (it mirrors `WizardData` and is read from sessionStorage by `RestoreHandler`).
3. Two new exported server actions: `createKnowledgeFromSession` and `getKnowledgeSourceStatuses`.

- [ ] **Step 1: Open `actions.ts` and replace the type definitions at the top**

Replace the existing `WizardData` (in `public-agent-wizard.tsx` — it lives there) and `CreateAgentSessionInput` (in `actions.ts`) so they include the new fields.

In `actions.ts`, change:

```ts
export type CreateAgentSessionInput = {
  name: string;
  description: string;
  language: 'ES' | 'EN';
  skillIds: string[];
};
```

to:

```ts
export type CreateAgentSessionInput = {
  name: string;
  description: string;
  language: 'ES' | 'EN';
  skillIds: string[];
  knowledge?: {
    textContent: string | null;
    websiteUrl: string | null;
  };
  targetChannel?: 'web' | 'whatsapp' | 'both';
};
```

- [ ] **Step 2: Add the two new imports at the top of `actions.ts`**

After the existing imports, add:

```ts
import { enqueueKnowledgeJob } from '@/lib/kb/queue';
```

(`prisma` and `requireTenant` are already imported.)

- [ ] **Step 3: Append `createKnowledgeFromSession` to `actions.ts`**

```ts
export async function createKnowledgeFromSession(input: {
  agentInstanceId: string;
  textContent: string | null;
  websiteUrl: string | null;
}): Promise<{ sourceIds: string[] }> {
  const user = await requireTenant();
  const tenantId = user.tenantId!;

  const agent = await prisma.agentInstance.findFirst({
    where: { id: input.agentInstanceId, tenantId },
    select: { id: true },
  });
  if (!agent) throw new Error('Agent not found');

  const sourceIds: string[] = [];

  if (input.websiteUrl) {
    const source = await prisma.knowledgeSource.create({
      data: {
        tenantId,
        agentInstanceId: input.agentInstanceId,
        type: 'URL',
        url: input.websiteUrl,
        title: input.websiteUrl,
        status: 'PENDING',
      },
    });
    await enqueueKnowledgeJob({ sourceId: source.id, tenantId, actorUserId: user.id });
    sourceIds.push(source.id);
  }

  if (input.textContent) {
    const source = await prisma.knowledgeSource.create({
      data: {
        tenantId,
        agentInstanceId: input.agentInstanceId,
        type: 'TEXT',
        rawText: input.textContent,
        title: 'Descripción del negocio',
        status: 'PENDING',
      },
    });
    await enqueueKnowledgeJob({ sourceId: source.id, tenantId, actorUserId: user.id });
    sourceIds.push(source.id);
  }

  return { sourceIds };
}
```

- [ ] **Step 4: Append `getKnowledgeSourceStatuses` to `actions.ts`**

```ts
export type KbSourceStatus = {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';
};

export async function getKnowledgeSourceStatuses(
  sourceIds: string[]
): Promise<KbSourceStatus[]> {
  if (sourceIds.length === 0) return [];
  const user = await requireTenant();
  const tenantId = user.tenantId!;

  const sources = await prisma.knowledgeSource.findMany({
    where: { id: { in: sourceIds }, tenantId },
    select: { id: true, status: true },
  });

  return sources.map((s) => ({
    id: s.id,
    status: s.status as KbSourceStatus['status'],
  }));
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors in `actions.ts`.

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/[locale]/\(public\)/crear-agente/actions.ts
git commit -m "feat(wizard): extend types + add knowledge server actions"
```

---

## Task 2: Build recommendation API route

**Files:**
- Create: `apps/web/app/api/intake/recommend/route.ts`

This endpoint accepts `{ description: string; objectives: string[] }`, calls GPT-4o-mini, and returns `{ suggestedName: string; skillKeys: string[] }`. It has a pure-logic fallback so it never fails the intake flow.

- [ ] **Step 1: Create the file with the fallback map and route handler**

```ts
// apps/web/app/api/intake/recommend/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createOpenAIClient } from '@trends172tech/openai';

const OBJECTIVE_SKILL_MAP: Record<string, string> = {
  'Atender clientes 24/7': 'customer_support',
  'Recibir y gestionar pedidos': 'order_management',
  'Responder preguntas de precios': 'price_inquiry',
  'Agendar citas o reuniones': 'appointment_booking',
  'Soporte técnico': 'technical_support',
  'Ventas y cotizaciones': 'sales',
  'Informar sobre ubicación y horarios': 'location_info',
};

function fallbackRecommend(objectives: string[]): { suggestedName: string; skillKeys: string[] } {
  const skillKeys = objectives
    .map((o) => OBJECTIVE_SKILL_MAP[o])
    .filter(Boolean) as string[];
  return {
    suggestedName: 'Asistente Virtual',
    skillKeys: skillKeys.length > 0 ? skillKeys : ['customer_support'],
  };
}

export async function POST(request: NextRequest) {
  let description = '';
  let objectives: string[] = [];

  try {
    const body = await request.json() as { description?: string; objectives?: string[] };
    description = body.description ?? '';
    objectives = body.objectives ?? [];
  } catch {
    return NextResponse.json(fallbackRecommend(objectives));
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(fallbackRecommend(objectives));
  }

  try {
    const openai = createOpenAIClient({ apiKey });
    const prompt = `Based on this company description and goals, suggest:
1. A professional, concise agent name (2-4 words, in the same language as the description)
2. The most relevant skill keys from: customer_support, order_management, price_inquiry, appointment_booking, technical_support, sales, location_info

Description: ${description}
Goals: ${objectives.join(', ')}

Respond ONLY with valid JSON (no markdown, no code blocks): {"suggestedName":"string","skillKeys":["key1","key2"]}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 120,
      temperature: 0.3,
    });

    const text = response.choices[0]?.message?.content?.trim() ?? '';
    const parsed = JSON.parse(text) as { suggestedName: string; skillKeys: string[] };

    if (typeof parsed.suggestedName !== 'string' || !Array.isArray(parsed.skillKeys)) {
      throw new Error('Invalid GPT response shape');
    }

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(fallbackRecommend(objectives));
  }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | grep "recommend" | head -10
```

Expected: no output (no errors).

- [ ] **Step 3: Quick smoke test in dev (optional)**

```bash
curl -X POST http://localhost:3000/api/intake/recommend \
  -H "Content-Type: application/json" \
  -d '{"description":"Ferretería en Caracas, vende materiales","objectives":["Atender clientes 24/7","Responder preguntas de precios"]}'
```

Expected: `{"suggestedName":"...","skillKeys":["customer_support","price_inquiry"]}` (exact name varies)

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/api/intake/recommend/route.ts
git commit -m "feat(wizard): add GPT-4o-mini intake recommendation endpoint"
```

---

## Task 3: Build IntakeChatWizard component

**Files:**
- Create: `apps/web/app/[locale]/(public)/crear-agente/intake-chat.tsx`

This is a `'use client'` component with a 9-step state machine that simulates a real chat. Agent messages appear with a 700 ms "typing" delay. The final step calls `/api/intake/recommend` and shows the recommendation.

- [ ] **Step 1: Create `intake-chat.tsx` with full implementation**

```tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

type ChatMessage = {
  id: string;
  role: 'agent' | 'user';
  content: string;
};

type IntakeStep =
  | 'welcome'
  | 'company'
  | 'has_website'
  | 'website_url'
  | 'additional_info'
  | 'no_web_detail'
  | 'objectives'
  | 'channel'
  | 'recommending'
  | 'complete';

export type IntakeResult = {
  companyDescription: string;    // answer to Q1 (+ Q3 if no web)
  websiteUrl: string | null;
  additionalInfo: string | null;
  objectives: string[];
  targetChannel: 'web' | 'whatsapp' | 'both';
  suggestedAgentName: string;
  recommendedSkillKeys: string[];
  knowledgeTextContent: string;  // combined text blob for knowledge ingestion
};

type Props = {
  locale: string;
  onIntakeComplete: (result: IntakeResult) => void;
};

// ── Constants ────────────────────────────────────────────────────────────────

const OBJECTIVES = [
  { label: 'Atender clientes 24/7', skillKey: 'customer_support' },
  { label: 'Recibir y gestionar pedidos', skillKey: 'order_management' },
  { label: 'Responder preguntas de precios', skillKey: 'price_inquiry' },
  { label: 'Agendar citas o reuniones', skillKey: 'appointment_booking' },
  { label: 'Soporte técnico', skillKey: 'technical_support' },
  { label: 'Ventas y cotizaciones', skillKey: 'sales' },
  { label: 'Informar sobre ubicación y horarios', skillKey: 'location_info' },
];

const CHANNELS: { value: 'web' | 'whatsapp' | 'both'; label: string }[] = [
  { value: 'web', label: '🌐 En mi sitio web' },
  { value: 'whatsapp', label: '💬 En WhatsApp' },
  { value: 'both', label: '🔗 En ambos' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function IntakeChatWizard({ locale, onIntakeComplete }: Props) {
  const isEs = locale.startsWith('es');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [step, setStep] = useState<IntakeStep>('welcome');
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [companyDesc, setCompanyDesc] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [noWebDetail, setNoWebDetail] = useState('');
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<{
    suggestedName: string;
    skillKeys: string[];
  } | null>(null);
  const [hasWebsite, setHasWebsite] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addMessage = useCallback((role: 'agent' | 'user', content: string) => {
    setMessages((prev) => [...prev, { id: Math.random().toString(36).slice(2), role, content }]);
  }, []);

  const agentSay = useCallback(
    (content: string, onDone?: () => void, delay = 700) => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage('agent', content);
        onDone?.();
      }, delay);
    },
    [addMessage]
  );

  // Initial welcome message
  useEffect(() => {
    const t = setTimeout(
      () =>
        addMessage(
          'agent',
          '¡Hola! Soy tu asistente de configuración 🤖 Vamos a crear tu agente de IA juntos. Te haré unas preguntas para entender tu empresa y configurarlo perfectamente. ¿Comenzamos?'
        ),
      300
    );
    return () => clearTimeout(t);
  }, [addMessage]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Step handlers ─────────────────────────────────────────────────────────

  const handleStart = () => {
    addMessage('user', 'Sí, empecemos →');
    agentSay(
      '¿A qué se dedica tu empresa? Cuéntame qué haces, qué vendes o qué servicio ofreces. Mientras más detalle, mejor quedará tu agente.',
      () => setStep('company')
    );
  };

  const handleCompany = () => {
    const desc = inputValue.trim();
    if (desc.length < 10) return;
    setCompanyDesc(desc);
    addMessage('user', desc);
    setInputValue('');
    agentSay(
      '¿Tienes un sitio web? Si me das la URL, lo reviso automáticamente y tu agente conocerá toda tu empresa desde el primer día.',
      () => setStep('has_website')
    );
  };

  const handleHasWebsite = (has: boolean) => {
    setHasWebsite(has);
    addMessage('user', has ? 'Sí, tengo sitio web' : 'No tengo sitio web');
    if (has) {
      agentSay('¿Cuál es la URL de tu sitio web?', () => setStep('website_url'));
    } else {
      agentSay(
        'No hay problema. Cuéntame más: ¿qué productos o servicios ofreces, cuáles son tus precios aproximados, dónde operas y cómo pueden contactarte tus clientes?',
        () => setStep('no_web_detail')
      );
    }
  };

  const handleWebsiteUrl = () => {
    const raw = inputValue.trim();
    if (!raw) return;
    const url = raw.startsWith('http') ? raw : `https://${raw}`;
    setWebsiteUrl(url);
    addMessage('user', url);
    setInputValue('');
    agentSay(
      `Listo, revisaré ${url}. ¿Hay información importante que no esté en tu web? Por ejemplo: precios especiales, políticas, datos de contacto. (Puedes saltarte esto si no aplica)`,
      () => setStep('additional_info')
    );
  };

  const handleAdditionalInfo = (skip: boolean) => {
    const info = skip ? '' : inputValue.trim();
    if (!skip && info) addMessage('user', info);
    if (skip) addMessage('user', 'Saltar este paso');
    setAdditionalInfo(info);
    setInputValue('');
    agentSay(
      '¿Cuál es el objetivo principal de tu agente? Puedes elegir más de uno.',
      () => setStep('objectives')
    );
  };

  const handleNoWebDetail = () => {
    const detail = inputValue.trim();
    if (detail.length < 10) return;
    setNoWebDetail(detail);
    addMessage('user', detail);
    setInputValue('');
    agentSay(
      '¿Cuál es el objetivo principal de tu agente? Puedes elegir más de uno.',
      () => setStep('objectives')
    );
  };

  const toggleObjective = (label: string) => {
    setSelectedObjectives((prev) =>
      prev.includes(label) ? prev.filter((o) => o !== label) : [...prev, label]
    );
  };

  const handleObjectives = () => {
    if (selectedObjectives.length === 0) return;
    addMessage('user', selectedObjectives.join(' · '));
    agentSay('¿Dónde quieres que opere principalmente tu agente?', () => setStep('channel'));
  };

  const handleChannel = async (ch: 'web' | 'whatsapp' | 'both') => {
    const channelLabel = CHANNELS.find((c) => c.value === ch)?.label ?? ch;
    addMessage('user', channelLabel);
    setStep('recommending');

    agentSay('Perfecto, analizando tu información para recomendarte la mejor configuración...', undefined, 500);

    // Build combined text for knowledge
    const textParts = [companyDesc, noWebDetail, additionalInfo].filter(Boolean);
    const knowledgeTextContent = textParts.join('\n\n');

    // Call recommendation API
    let rec = { suggestedName: 'Asistente Virtual', skillKeys: ['customer_support'] };
    try {
      const res = await fetch('/api/intake/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: knowledgeTextContent, objectives: selectedObjectives }),
      });
      if (res.ok) {
        rec = await res.json() as typeof rec;
      }
    } catch {
      // keep fallback
    }

    setRecommendation(rec);

    setTimeout(() => {
      agentSay(
        `¡Listo! Basado en lo que me contaste, te recomiendo nombrar a tu agente "${rec.suggestedName}" con ${rec.skillKeys.length} habilidade${rec.skillKeys.length === 1 ? '' : 's'} preconfigurada${rec.skillKeys.length === 1 ? '' : 's'}. ¿Continuamos con esta configuración?`,
        () => setStep('complete'),
        900
      );
    }, 1800);

    // Store for callback
    setHasWebsite(hasWebsite); // already set
    // Will use rec in handleConfirm
    const result: IntakeResult = {
      companyDescription: companyDesc,
      websiteUrl: websiteUrl || null,
      additionalInfo: additionalInfo || null,
      objectives: selectedObjectives,
      targetChannel: ch,
      suggestedAgentName: rec.suggestedName,
      recommendedSkillKeys: rec.skillKeys,
      knowledgeTextContent,
    };

    // Store result for the confirm button
    pendingResultRef.current = result;
  };

  const pendingResultRef = useRef<IntakeResult | null>(null);

  const handleConfirm = () => {
    if (pendingResultRef.current) {
      onIntakeComplete(pendingResultRef.current);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto flex max-w-2xl flex-col rounded-[32px] border border-black/8 bg-white shadow-[0_24px_64px_-48px_rgba(15,23,42,0.22)]" style={{ height: 'min(600px, 80vh)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-black/6 px-6 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#00bfa5,#00897b)] text-base shadow-[0_6px_18px_-8px_rgba(0,191,165,0.6)]">
          🤖
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">Asistente de configuración</div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00bfa5]" />
            <span className="text-[11px] text-slate-500">En línea</span>
          </div>
        </div>
        <div className="ml-auto text-[11px] font-medium text-slate-400">
          {isEs ? 'Creador de agentes' : 'Agent creator'}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {msg.role === 'agent' && (
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f0fdf9] text-xs">
                🤖
              </div>
            )}
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'agent'
                  ? 'rounded-tl-sm bg-slate-100 text-slate-800'
                  : 'rounded-tr-sm bg-[#00bfa5] text-white'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2">
            <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f0fdf9] text-xs">
              🤖
            </div>
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-black/6 px-4 py-3">
        {step === 'welcome' && (
          <button
            type="button"
            onClick={handleStart}
            className="w-full rounded-full bg-[#00bfa5] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00897b]"
          >
            Sí, empecemos →
          </button>
        )}

        {(step === 'company') && (
          <div className="flex gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCompany();
                }
              }}
              placeholder="Ej: Tenemos una ferretería en Caracas, vendemos materiales de construcción y herramientas..."
              rows={2}
              className="flex-1 resize-none rounded-2xl border border-black/10 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#00bfa5] focus:ring-2 focus:ring-[#00bfa5]/15"
            />
            <button
              type="button"
              disabled={inputValue.trim().length < 10}
              onClick={handleCompany}
              className="shrink-0 rounded-full bg-[#00bfa5] px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-40 hover:bg-[#00897b]"
            >
              →
            </button>
          </div>
        )}

        {step === 'has_website' && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleHasWebsite(true)}
              className="flex-1 rounded-2xl border border-[#00bfa5]/40 bg-[#f0fdf9] py-2.5 text-sm font-semibold text-[#00897b] transition hover:bg-[#00bfa5]/15"
            >
              🌐 Sí, tengo web
            </button>
            <button
              type="button"
              onClick={() => handleHasWebsite(false)}
              className="flex-1 rounded-2xl border border-black/10 bg-slate-50 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              💬 No tengo
            </button>
          </div>
        )}

        {step === 'website_url' && (
          <div className="flex gap-2">
            <input
              type="url"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleWebsiteUrl()}
              placeholder="https://miempresa.com"
              className="flex-1 rounded-2xl border border-black/10 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#00bfa5] focus:ring-2 focus:ring-[#00bfa5]/15"
            />
            <button
              type="button"
              disabled={!inputValue.trim()}
              onClick={handleWebsiteUrl}
              className="shrink-0 rounded-full bg-[#00bfa5] px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-40 hover:bg-[#00897b]"
            >
              →
            </button>
          </div>
        )}

        {step === 'additional_info' && (
          <div className="space-y-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Precios especiales, políticas, información de contacto adicional..."
              rows={2}
              className="w-full resize-none rounded-2xl border border-black/10 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#00bfa5] focus:ring-2 focus:ring-[#00bfa5]/15"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleAdditionalInfo(true)}
                className="rounded-2xl border border-black/10 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-300"
              >
                Saltar
              </button>
              <button
                type="button"
                disabled={!inputValue.trim()}
                onClick={() => handleAdditionalInfo(false)}
                className="flex-1 rounded-full bg-[#00bfa5] px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-40 hover:bg-[#00897b]"
              >
                Agregar y continuar →
              </button>
            </div>
          </div>
        )}

        {step === 'no_web_detail' && (
          <div className="flex gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleNoWebDetail();
                }
              }}
              placeholder="Ej: Ofrecemos diseño gráfico, precios desde $50, operamos online, WhatsApp: +58 412..."
              rows={2}
              className="flex-1 resize-none rounded-2xl border border-black/10 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#00bfa5] focus:ring-2 focus:ring-[#00bfa5]/15"
            />
            <button
              type="button"
              disabled={inputValue.trim().length < 10}
              onClick={handleNoWebDetail}
              className="shrink-0 rounded-full bg-[#00bfa5] px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-40 hover:bg-[#00897b]"
            >
              →
            </button>
          </div>
        )}

        {step === 'objectives' && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {OBJECTIVES.map((obj) => (
                <button
                  key={obj.skillKey}
                  type="button"
                  onClick={() => toggleObjective(obj.label)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    selectedObjectives.includes(obj.label)
                      ? 'border-[#00bfa5] bg-[#00bfa5] text-white'
                      : 'border-black/10 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {obj.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={selectedObjectives.length === 0}
              onClick={handleObjectives}
              className="w-full rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white transition disabled:opacity-40 hover:bg-slate-800"
            >
              Continuar →
            </button>
          </div>
        )}

        {step === 'channel' && (
          <div className="flex gap-2">
            {CHANNELS.map((ch) => (
              <button
                key={ch.value}
                type="button"
                onClick={() => void handleChannel(ch.value)}
                className="flex-1 rounded-2xl border border-black/10 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-[#00bfa5]/40 hover:bg-[#f0fdf9] hover:text-[#00897b]"
              >
                {ch.label}
              </button>
            ))}
          </div>
        )}

        {step === 'recommending' && (
          <div className="flex items-center justify-center gap-2 py-1 text-sm text-slate-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#00bfa5]/30 border-t-[#00bfa5]" />
            Generando recomendación...
          </div>
        )}

        {step === 'complete' && recommendation && (
          <div className="space-y-2">
            <div className="rounded-2xl border border-[#00bfa5]/25 bg-[#f0fdf9] px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#00897b]">
                Configuración recomendada
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {recommendation.suggestedName}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {recommendation.skillKeys.map((k) => (
                  <span
                    key={k}
                    className="rounded-full border border-[#00bfa5]/30 bg-white px-2 py-0.5 text-[11px] font-medium text-[#00897b]"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full rounded-full bg-[#00bfa5] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_28px_-12px_rgba(0,191,165,0.5)] transition hover:bg-[#00897b]"
            >
              ¡Me gusta! Continuar →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | grep "intake-chat" | head -10
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/[locale]/(public)/crear-agente/intake-chat.tsx"
git commit -m "feat(wizard): add conversational intake chat wizard"
```

---

## Task 4: Wire intake into PublicAgentWizard

**Files:**
- Modify: `apps/web/app/[locale]/(public)/crear-agente/public-agent-wizard.tsx`

Changes:
1. Add `phase: 'intake' | 'steps'` state variable (starts as `'intake'`).
2. Render `<IntakeChatWizard>` when `phase === 'intake'`.
3. On intake complete: pre-fill `name`, `description`, pre-select skills, store `knowledgeData` + `targetChannel`.
4. Extend `WizardData` and `saveToStorage` to persist knowledge + targetChannel.

- [ ] **Step 1: Update the `WizardData` type in `public-agent-wizard.tsx`**

```ts
export type WizardData = {
  name: string;
  description: string;
  language: 'ES' | 'EN';
  skillIds: string[];
  knowledge?: {
    textContent: string | null;
    websiteUrl: string | null;
  };
  targetChannel?: 'web' | 'whatsapp' | 'both';
};
```

- [ ] **Step 2: Add import for IntakeChatWizard at the top of the file**

```ts
import { IntakeChatWizard } from './intake-chat';
import type { IntakeResult } from './intake-chat';
```

- [ ] **Step 3: Add new state variables inside `PublicAgentWizard`**

Inside the component, after the existing `useState` declarations, add:

```ts
const [phase, setPhase] = useState<'intake' | 'steps'>('intake');
const [knowledgeData, setKnowledgeData] = useState<{
  textContent: string | null;
  websiteUrl: string | null;
} | null>(null);
const [targetChannel, setTargetChannel] = useState<'web' | 'whatsapp' | 'both' | null>(null);
```

- [ ] **Step 4: Add the `handleIntakeComplete` callback**

```ts
const handleIntakeComplete = useCallback(
  (result: IntakeResult) => {
    // Pre-fill form fields
    setName(result.suggestedAgentName);
    setDescription(result.companyDescription);

    // Pre-select recommended skills
    const allSkills = skillGroups.flatMap((g) => g.skills);
    const matchedIds = allSkills
      .filter((s) => result.recommendedSkillKeys.includes(s.key))
      .map((s) => s.id);
    setSelectedIds(new Set(matchedIds));

    // Store knowledge data
    setKnowledgeData({
      textContent: result.knowledgeTextContent || null,
      websiteUrl: result.websiteUrl,
    });
    setTargetChannel(result.targetChannel);

    // Transition to wizard steps at step 1 (review/confirm name)
    setPhase('steps');
    setStep(1);
  },
  [skillGroups]
);
```

- [ ] **Step 5: Update `goToAuth` to persist knowledge + targetChannel**

Replace:

```ts
const data: WizardData = {
  name: name.trim(),
  description: description.trim(),
  language,
  skillIds: Array.from(selectedIds),
};
```

with:

```ts
const data: WizardData = {
  name: name.trim(),
  description: description.trim(),
  language,
  skillIds: Array.from(selectedIds),
  knowledge: knowledgeData ?? undefined,
  targetChannel: targetChannel ?? undefined,
};
```

Also update the `loginInstead` link's `onClick` handler the same way (it also calls `saveToStorage`).

- [ ] **Step 6: Update the JSX to render intake vs. steps**

Replace the outer `return (...)` content with a conditional:

```tsx
return (
  <div className="mx-auto max-w-4xl">
    {phase === 'intake' ? (
      <IntakeChatWizard locale={locale} onIntakeComplete={handleIntakeComplete} />
    ) : (
      <>
        {/* step indicator */}
        <div className="mb-8 flex items-center justify-center gap-0">
          {/* ... existing step indicator unchanged ... */}
        </div>
        <div className="overflow-hidden rounded-[32px] border border-black/8 bg-white shadow-[0_24px_64px_-48px_rgba(15,23,42,0.22)]">
          {/* Steps 1-4 unchanged */}
        </div>
      </>
    )}
  </div>
);
```

Keep Steps 1–4 entirely intact. Only wrap them under the `phase === 'steps'` branch.

Also update the step-1 heading copy to reflect pre-filled state. Change:

```ts
step1Title: 'Información del agente',
```

to:

```ts
step1Title: 'Confirma el nombre de tu agente',
```

(Both ES and EN variants.)

- [ ] **Step 7: Verify TypeScript**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | grep "public-agent-wizard" | head -10
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add "apps/web/app/[locale]/(public)/crear-agente/public-agent-wizard.tsx"
git commit -m "feat(wizard): wire intake chat into agent wizard with pre-fill"
```

---

## Task 5: Update RestoreHandler — knowledge processing + channel UI

**Files:**
- Modify: `apps/web/app/[locale]/(public)/crear-agente/restore-handler.tsx`

Changes:
1. Read `knowledge` and `targetChannel` from sessionStorage.
2. After creating the agent, call `createKnowledgeFromSession`.
3. Add `knowledgeSources` to the `done` state.
4. Poll `getKnowledgeSourceStatuses` every 3 s until all sources are READY/FAILED.
5. Show knowledge indexing status + channel selection cards in the `done` UI.

- [ ] **Step 1: Update the imports in `restore-handler.tsx`**

```ts
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import {
  createAgentFromSession,
  createKnowledgeFromSession,
  getKnowledgeSourceStatuses,
} from './actions';
import type {
  CreateAgentSessionResult,
  CreateAgentSessionInput,
  KbSourceStatus,
} from './actions';
```

- [ ] **Step 2: Update the `State` type**

```ts
type State =
  | { phase: 'loading' }
  | { phase: 'creating' }
  | { phase: 'no_credits'; result: CreateAgentSessionResult }
  | {
      phase: 'done';
      result: CreateAgentSessionResult;
      knowledgeSources: KbSourceStatus[];
      targetChannel?: 'web' | 'whatsapp' | 'both';
    }
  | { phase: 'error'; message: string }
  | { phase: 'no_data' };
```

- [ ] **Step 3: Replace the `useEffect` that loads and creates the agent**

```ts
useEffect(() => {
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    setState({ phase: 'no_data' });
    return;
  }

  let data: CreateAgentSessionInput;
  try {
    data = JSON.parse(raw) as CreateAgentSessionInput;
  } catch {
    setState({ phase: 'no_data' });
    return;
  }

  setState({ phase: 'creating' });
  createAgentFromSession(data)
    .then(async (result) => {
      window.sessionStorage.removeItem(STORAGE_KEY);

      // Create knowledge sources if any were collected during intake
      let knowledgeSources: KbSourceStatus[] = [];
      if (data.knowledge && (data.knowledge.textContent || data.knowledge.websiteUrl)) {
        try {
          const { sourceIds } = await createKnowledgeFromSession({
            agentInstanceId: result.agentId,
            textContent: data.knowledge.textContent ?? null,
            websiteUrl: data.knowledge.websiteUrl ?? null,
          });
          knowledgeSources = sourceIds.map((id) => ({ id, status: 'PENDING' as const }));
        } catch {
          // Non-fatal: agent is created, knowledge can be added from dashboard
        }
      }

      if (result.hasCredits) {
        setState({
          phase: 'done',
          result,
          knowledgeSources,
          targetChannel: data.targetChannel,
        });
      } else {
        setState({ phase: 'no_credits', result });
      }
    })
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      setState({ phase: 'error', message });
    });
}, []);
```

- [ ] **Step 4: Add the knowledge-polling effect**

```ts
const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

useEffect(() => {
  if (state.phase !== 'done') return;
  const pendingSources = state.knowledgeSources.filter(
    (s) => s.status === 'PENDING' || s.status === 'PROCESSING'
  );
  if (pendingSources.length === 0) return;

  const ids = state.knowledgeSources.map((s) => s.id);
  pollingRef.current = setInterval(async () => {
    try {
      const updated = await getKnowledgeSourceStatuses(ids);
      setState((prev) => {
        if (prev.phase !== 'done') return prev;
        return { ...prev, knowledgeSources: updated };
      });
      const allDone = updated.every(
        (s) => s.status === 'READY' || s.status === 'FAILED'
      );
      if (allDone && pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    } catch {
      // ignore polling errors
    }
  }, 3000);

  return () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
  };
}, [state]);
```

- [ ] **Step 5: Replace the `done` phase render with enhanced UI**

Replace the `/* ── Done with credits ── */` section:

```tsx
/* ── Done with credits ── */
const { result, knowledgeSources, targetChannel } = state;
const snippet = buildSnippet(result.installPublicKey);
const allKbDone = knowledgeSources.every(
  (s) => s.status === 'READY' || s.status === 'FAILED'
);
const hasKb = knowledgeSources.length > 0;

return (
  <div className="mx-auto max-w-2xl py-4 space-y-4">
    {/* ── Agent created banner ── */}
    <div className="overflow-hidden rounded-[32px] border border-[#00bfa5]/30 bg-white shadow-[0_24px_64px_-48px_rgba(0,191,165,0.25)]">
      <div className="border-b border-[#00bfa5]/20 bg-[linear-gradient(135deg,#00bfa5,#00897b)] px-7 py-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎉</span>
          <div>
            <h2 className="text-xl font-semibold text-white">{copy.doneTitle}</h2>
            <p className="mt-0.5 text-sm text-[rgba(255,255,255,0.8)]">{copy.doneSub}</p>
          </div>
        </div>
      </div>

      <div className="px-7 py-6 space-y-5">
        {/* Active skills */}
        <div>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {copy.skills}
          </div>
          <div className="flex flex-wrap gap-2">
            {result.selectedSkills.map((s) => (
              <span
                key={s.key}
                className="rounded-full border border-[#00bfa5]/30 bg-[#f0fdf9] px-3 py-1 text-xs font-medium text-[#00897b]"
              >
                {s.icon} {isEs ? s.name : s.nameEn}
              </span>
            ))}
          </div>
        </div>

        {/* Installation snippet */}
        <div>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {copy.snippet}
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-black/8 bg-slate-950">
            <pre className="overflow-x-auto px-4 py-4 text-xs text-[#00bfa5]">{snippet}</pre>
            <button
              type="button"
              onClick={() => handleCopy(snippet)}
              className="absolute right-3 top-3 rounded-xl border border-white/12 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/20"
            >
              {copied ? copy.copiedLabel : copy.copyLabel}
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* ── Knowledge status ── */}
    {hasKb && (
      <div className="rounded-[24px] border border-black/8 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0fdf9] text-base">
            🧠
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">
              {allKbDone ? copy.kbReady : copy.kbProcessing}
            </div>
            <div className="text-[11px] text-slate-500">
              {allKbDone ? copy.kbReadySub : copy.kbProcessingSub}
            </div>
          </div>
          {!allKbDone && (
            <div className="ml-auto flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#00bfa5] animate-pulse" />
              <span className="text-xs text-[#00897b] font-medium">{copy.kbIndexing}</span>
            </div>
          )}
          {allKbDone && (
            <div className="ml-auto text-[#00bfa5] text-lg">✓</div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${locale}/dashboard/agents/${result.agentId}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[#00bfa5]/40 hover:text-[#00897b]"
          >
            📄 {copy.addPdf}
          </Link>
          <Link
            href={`/${locale}/dashboard/agents/${result.agentId}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[#00bfa5]/40 hover:text-[#00897b]"
          >
            🌐 {copy.addUrl}
          </Link>
        </div>
      </div>
    )}

    {/* ── Channel selection ── */}
    <div className="rounded-[24px] border border-black/8 bg-white p-6 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-slate-900">{copy.channelTitle}</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[#00bfa5]/30 bg-[#f0fdf9] p-4 text-center">
          <div className="text-2xl mb-1">🌐</div>
          <div className="text-xs font-semibold text-[#00897b]">{copy.channelWeb}</div>
          <div className="mt-2 text-[10px] text-[#047857]">{copy.channelWebSub}</div>
        </div>
        <Link
          href={`/${locale}/dashboard/agents/${result.agentId}`}
          className="rounded-2xl border border-black/8 p-4 text-center transition hover:border-[#00bfa5]/30 hover:bg-[#f0fdf9]"
        >
          <div className="text-2xl mb-1">💬</div>
          <div className="text-xs font-semibold text-slate-700">{copy.channelWa}</div>
          <div className="mt-2 text-[10px] text-slate-500">{copy.channelWaSub}</div>
        </Link>
      </div>
    </div>

    {/* ── Navigation ── */}
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link
        href={`/${locale}/dashboard/agents/${result.agentId}`}
        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        {copy.viewAgent}
      </Link>
      <Link
        href={`/${locale}/crear-agente`}
        className="flex items-center justify-center rounded-full border border-black/8 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
      >
        {copy.createAnother}
      </Link>
    </div>
  </div>
);
```

- [ ] **Step 6: Add the new copy keys to both ES and EN `copy` objects**

In the `isEs ? { ... } : { ... }` copy block, add these keys (shown for ES, then EN):

ES additions:
```ts
kbProcessing: '🧠 Indexando conocimiento de tu empresa...',
kbProcessingSub: 'Tu agente aprenderá sobre tu empresa en ~2 min',
kbReady: '✅ Tu agente ya conoce tu empresa',
kbReadySub: 'Toda la información fue indexada correctamente',
kbIndexing: 'Indexando...',
addPdf: 'Subir PDF',
addUrl: 'Agregar URL',
channelTitle: '¿Dónde quieres desplegar tu agente?',
channelWeb: 'Sitio web',
channelWebSub: 'El código de instalación está arriba ↑',
channelWa: 'WhatsApp Business',
channelWaSub: 'Conecta tu número WABA desde el panel →',
```

EN additions:
```ts
kbProcessing: '🧠 Indexing your company knowledge...',
kbProcessingSub: 'Your agent will learn about your company in ~2 min',
kbReady: '✅ Your agent knows your company',
kbReadySub: 'All information was indexed successfully',
kbIndexing: 'Indexing...',
addPdf: 'Upload PDF',
addUrl: 'Add URL',
channelTitle: 'Where do you want to deploy your agent?',
channelWeb: 'Website',
channelWebSub: 'Installation code is above ↑',
channelWa: 'WhatsApp Business',
channelWaSub: 'Connect your WABA number from the dashboard →',
```

- [ ] **Step 7: Verify TypeScript**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | grep "restore-handler" | head -10
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add "apps/web/app/[locale]/(public)/crear-agente/restore-handler.tsx"
git commit -m "feat(wizard): enhance RestoreHandler with knowledge status + channel UI"
```

---

## Task 6: Update page.tsx header copy

**Files:**
- Modify: `apps/web/app/[locale]/(public)/crear-agente/page.tsx`

- [ ] **Step 1: Update the hero sub-copy**

In `page.tsx`, change the paragraph text (inside the page-header div) from:

```tsx
{isEs
  ? 'Configura tu agente, elige las habilidades que necesita tu empresa y despliégalo en tu sitio web en minutos.'
  : 'Configure your agent, choose the skills your business needs and deploy it on your website in minutes.'}
```

to:

```tsx
{isEs
  ? 'Cuéntanos sobre tu empresa y en minutos tendrás un agente de IA configurado, con conocimiento de tu negocio y listo para atender a tus clientes.'
  : 'Tell us about your company and in minutes you will have an AI agent configured, with knowledge of your business and ready to serve your customers.'}
```

- [ ] **Step 2: Commit**

```bash
git add "apps/web/app/[locale]/(public)/crear-agente/page.tsx"
git commit -m "feat(wizard): update crear-agente page copy for chat intake flow"
```

---

## Task 7: End-to-end smoke test

- [ ] **Step 1: Start dev server**

```bash
cd apps/web && pnpm dev
```

- [ ] **Step 2: Walk through the full intake flow**

Navigate to `http://localhost:3000/es/crear-agente` and verify:

1. Chat opens with the welcome message "¡Hola! Soy tu asistente de configuración 🤖..."
2. Clicking "Sí, empecemos →" transitions to company question
3. Typing a description and pressing Enter transitions to website question
4. Selecting "Sí, tengo web" shows URL input
5. Entering a URL transitions to additional info
6. Clicking "Saltar" transitions to objectives chips
7. Selecting objectives and clicking "Continuar →" transitions to channel
8. Selecting a channel shows loading state then recommendation summary
9. Clicking "¡Me gusta! Continuar →" transitions to the wizard step 1 with name pre-filled
10. Clicking "Continuar →" in step 1 shows skills step with pre-selected chips
11. Completing the wizard → register page
12. Post-register → RestoreHandler shows agent created + knowledge indexing badges + channel cards

- [ ] **Step 3: Verify sessionStorage contains knowledge fields**

In DevTools > Application > Session Storage:

```json
{
  "name": "...",
  "description": "...",
  "language": "ES",
  "skillIds": ["..."],
  "knowledge": { "textContent": "...", "websiteUrl": "https://..." },
  "targetChannel": "web"
}
```

- [ ] **Step 4: Deploy to production**

```bash
git push origin main
```

Vercel auto-deploys on push. Verify at https://trends172tech.com/es/crear-agente.

---

## Self-Review: Spec Coverage Check

| Spec requirement | Task |
|-----------------|------|
| Chat-style intake, questions one at a time | Task 3 |
| Company description question | Task 3 (step `company`) |
| Website URL question + auto-indexing | Task 3 (steps `has_website`, `website_url`) |
| Additional info beyond website | Task 3 (step `additional_info`) |
| Objectives multi-select chips | Task 3 (step `objectives`) |
| Channel selection | Task 3 (step `channel`) |
| GPT-4o-mini name + skill recommendations | Task 2 + Task 3 (`handleChannel`) |
| Skills pre-selected in wizard | Task 4 (`handleIntakeComplete`) |
| Agent name pre-filled | Task 4 (`handleIntakeComplete`) |
| knowledge → sessionStorage | Task 4 (`goToAuth`) |
| `createKnowledgeFromSession` action | Task 1 |
| BullMQ queue enqueue | Task 1 (calls `enqueueKnowledgeJob`) |
| Knowledge status polling | Task 5 (polling effect) |
| Knowledge indexing UI in RestoreHandler | Task 5 |
| Channel selection UI post-login | Task 5 |
| PDF/URL add buttons post-login | Task 5 |
| Fallback if no OpenAI key | Task 2 (`fallbackRecommend`) |
| targetChannel persisted to sessionStorage | Task 4 |
| RestoreHandler reads targetChannel | Task 5 |
| Page copy update | Task 6 |
