'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

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
  companyDescription: string;
  websiteUrl: string | null;
  additionalInfo: string | null;
  objectives: string[];
  targetChannel: 'web' | 'whatsapp' | 'both';
  suggestedAgentName: string;
  recommendedSkillKeys: string[];
  knowledgeTextContent: string;
};

type Props = {
  locale: string;
  onIntakeComplete: (result: IntakeResult) => void;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const OBJECTIVE_KEYS = [
  'customer_support',
  'order_management',
  'price_inquiry',
  'appointment_booking',
  'technical_support',
  'sales',
  'location_info',
] as const;

const INTAKE_COPY = {
  es: {
    objectives: [
      'Atender clientes 24/7',
      'Recibir y gestionar pedidos',
      'Responder preguntas de precios',
      'Agendar citas o reuniones',
      'Soporte técnico',
      'Ventas y cotizaciones',
      'Informar sobre ubicación y horarios',
    ],
    channels: ['🌐 En mi sitio web', '💬 En WhatsApp', '🔗 En ambos'],
    welcome: '¡Hola! Soy tu asistente de configuración 🤖 Vamos a crear tu agente de IA juntos. Te haré unas preguntas para entender tu empresa y configurarlo perfectamente. ¿Comenzamos?',
    start: 'Sí, empecemos →',
    companyQuestion: '¿A qué se dedica tu empresa? Cuéntame qué haces, qué vendes o qué servicio ofreces. Mientras más detalle, mejor quedará tu agente.',
    websiteQuestion: '¿Tienes un sitio web? Si me das la URL, lo reviso automáticamente y tu agente conocerá toda tu empresa desde el primer día.',
    hasWebsite: 'Sí, tengo sitio web',
    noWebsite: 'No tengo sitio web',
    websiteUrlQuestion: '¿Cuál es la URL de tu sitio web?',
    noWebsiteQuestion: 'No hay problema. Cuéntame más: ¿qué productos o servicios ofreces, cuáles son tus precios aproximados, dónde operas y cómo pueden contactarte tus clientes?',
    websiteReview: (url: string) => `Listo, revisaré ${url}. ¿Hay información importante que no esté en tu web? Por ejemplo: precios especiales, políticas o datos de contacto adicionales. (Puedes saltar esto si no aplica)`,
    skip: 'Saltar este paso',
    objectivesQuestion: '¿Cuál es el objetivo principal de tu agente? Puedes elegir más de uno.',
    channelQuestion: '¿Dónde quieres que opere principalmente tu agente?',
    analyzing: 'Perfecto, analizando tu información para recomendarte la mejor configuración...',
    fallbackName: 'Asistente Virtual',
    recommendation: (name: string, count: number) => `¡Listo! Basado en lo que me contaste, te recomiendo nombrar a tu agente "${name}" con ${count} habilidad${count === 1 ? '' : 'es'} preconfigurada${count === 1 ? '' : 's'}. ¿Continuamos?`,
  },
  en: {
    objectives: [
      'Support customers 24/7',
      'Receive and manage orders',
      'Answer pricing questions',
      'Schedule appointments or meetings',
      'Technical support',
      'Sales and quotations',
      'Share locations and business hours',
    ],
    channels: ['🌐 On my website', '💬 On WhatsApp', '🔗 On both'],
    welcome: "Hello! I'm your setup assistant 🤖 Let's create your AI agent together. I'll ask a few questions to understand your company and configure it properly. Shall we begin?",
    start: "Yes, let's start →",
    companyQuestion: 'What does your company do? Tell me what you sell or which services you offer. The more detail you provide, the better your agent will be.',
    websiteQuestion: 'Do you have a website? Share the URL and I will review it automatically so your agent can learn about your company from day one.',
    hasWebsite: 'Yes, I have a website',
    noWebsite: "I don't have a website",
    websiteUrlQuestion: 'What is your website URL?',
    noWebsiteQuestion: 'No problem. Tell me more: which products or services do you offer, what are your approximate prices, where do you operate, and how can customers contact you?',
    websiteReview: (url: string) => `Great, I will review ${url}. Is there any important information that is not on your website, such as special prices, policies, or additional contact details? (You can skip this if it does not apply)`,
    skip: 'Skip this step',
    objectivesQuestion: 'What is the main goal of your agent? You can choose more than one.',
    channelQuestion: 'Where do you want your agent to operate?',
    analyzing: 'Great, I am analyzing your information to recommend the best configuration...',
    fallbackName: 'Virtual Assistant',
    recommendation: (name: string, count: number) => `All set! Based on what you shared, I recommend naming your agent "${name}" with ${count} preconfigured skill${count === 1 ? '' : 's'}. Shall we continue?`,
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export function IntakeChatWizard({ locale, onIntakeComplete }: Props) {
  const isEs = locale.startsWith('es');
  const copy = INTAKE_COPY[isEs ? 'es' : 'en'];
  const objectives = OBJECTIVE_KEYS.map((skillKey, index) => ({
    skillKey,
    label: copy.objectives[index],
  }));
  const channels: { value: 'web' | 'whatsapp' | 'both'; label: string }[] = [
    { value: 'web', label: copy.channels[0] },
    { value: 'whatsapp', label: copy.channels[1] },
    { value: 'both', label: copy.channels[2] },
  ];
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
  const pendingResultRef = useRef<IntakeResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addMessage = useCallback((role: 'agent' | 'user', content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), role, content },
    ]);
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
          copy.welcome
        ),
      300
    );
    return () => clearTimeout(t);
  }, [addMessage, copy.welcome]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Step handlers ─────────────────────────────────────────────────────────

  const handleStart = () => {
    addMessage('user', copy.start);
    agentSay(
      copy.companyQuestion,
      () => setStep('company')
    );
  };

  const handleCompany = useCallback(() => {
    const desc = inputValue.trim();
    if (desc.length < 10) return;
    setCompanyDesc(desc);
    addMessage('user', desc);
    setInputValue('');
    agentSay(
      copy.websiteQuestion,
      () => setStep('has_website')
    );
  }, [inputValue, addMessage, agentSay, copy.websiteQuestion]);

  const handleHasWebsite = (has: boolean) => {
    addMessage('user', has ? copy.hasWebsite : copy.noWebsite);
    if (has) {
      agentSay(copy.websiteUrlQuestion, () => setStep('website_url'));
    } else {
      agentSay(
        copy.noWebsiteQuestion,
        () => setStep('no_web_detail')
      );
    }
  };

  const handleWebsiteUrl = useCallback(() => {
    const raw = inputValue.trim();
    if (!raw) return;
    const url = raw.startsWith('http') ? raw : `https://${raw}`;
    setWebsiteUrl(url);
    addMessage('user', url);
    setInputValue('');
    agentSay(
      copy.websiteReview(url),
      () => setStep('additional_info')
    );
  }, [inputValue, addMessage, agentSay, copy]);

  const handleAdditionalInfo = useCallback(
    (skip: boolean) => {
      const info = skip ? '' : inputValue.trim();
      if (skip) {
        addMessage('user', copy.skip);
      } else if (info) {
        addMessage('user', info);
      }
      setAdditionalInfo(info);
      setInputValue('');
      agentSay(
        copy.objectivesQuestion,
        () => setStep('objectives')
      );
    },
    [inputValue, addMessage, agentSay, copy.objectivesQuestion, copy.skip]
  );

  const handleNoWebDetail = useCallback(() => {
    const detail = inputValue.trim();
    if (detail.length < 10) return;
    setNoWebDetail(detail);
    addMessage('user', detail);
    setInputValue('');
    agentSay(
      copy.objectivesQuestion,
      () => setStep('objectives')
    );
  }, [inputValue, addMessage, agentSay, copy.objectivesQuestion]);

  const toggleObjective = (label: string) => {
    setSelectedObjectives((prev) =>
      prev.includes(label) ? prev.filter((o) => o !== label) : [...prev, label]
    );
  };

  const handleObjectives = () => {
    if (selectedObjectives.length === 0) return;
    addMessage('user', selectedObjectives.join(' · '));
    agentSay(
      copy.channelQuestion,
      () => setStep('channel')
    );
  };

  const handleChannel = async (ch: 'web' | 'whatsapp' | 'both') => {
    const channelLabel = channels.find((c) => c.value === ch)?.label ?? ch;
    addMessage('user', channelLabel);
    setStep('recommending');

    // Combined text for knowledge ingestion
    const textParts = [companyDesc, noWebDetail, additionalInfo].filter(Boolean);
    const knowledgeTextContent = textParts.join('\n\n');

    // Typing delay for "analyzing..." message
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage('agent', copy.analyzing);
    }, 500);

    // Fetch recommendation (8s timeout para evitar colgarse si la API falla)
    let rec = { suggestedName: copy.fallbackName, skillKeys: ['customer_support'] };
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch('/api/intake/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: knowledgeTextContent,
          objectives: selectedObjectives,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        rec = (await res.json()) as typeof rec;
      }
    } catch {
      // fallback already set
    }

    setRecommendation(rec);

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
    pendingResultRef.current = result;

    // Show final message after a small delay
    setTimeout(() => {
      agentSay(
        copy.recommendation(rec.suggestedName, rec.skillKeys.length),
        () => setStep('complete'),
        900
      );
    }, 1400);
  };

  const handleConfirm = () => {
    if (pendingResultRef.current) {
      onIntakeComplete(pendingResultRef.current);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="mx-auto flex max-w-2xl flex-col rounded-[32px] border border-black/8 bg-white shadow-[0_24px_64px_-48px_rgba(15,23,42,0.22)]"
      style={{ height: 'min(600px, 80vh)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-black/6 px-6 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#00bfa5,#00897b)] text-base shadow-[0_6px_18px_-8px_rgba(0,191,165,0.6)]">
          🤖
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">
            {isEs ? 'Asistente de configuración' : 'Setup assistant'}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00bfa5]" />
            <span className="text-[11px] text-slate-500">
              {isEs ? 'En línea' : 'Online'}
            </span>
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
            {isEs ? 'Sí, empecemos →' : 'Yes, let\'s start →'}
          </button>
        )}

        {step === 'company' && (
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
              placeholder={
                isEs
                  ? 'Ej: Tenemos una ferretería en Caracas, vendemos materiales de construcción...'
                  : 'E.g.: We have a hardware store in Miami, we sell construction materials...'
              }
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
              🌐 {isEs ? 'Sí, tengo web' : 'Yes, I have a website'}
            </button>
            <button
              type="button"
              onClick={() => handleHasWebsite(false)}
              className="flex-1 rounded-2xl border border-black/10 bg-slate-50 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              💬 {isEs ? 'No tengo' : 'I don\'t have one'}
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
              placeholder={
                isEs
                  ? 'Precios especiales, políticas, datos de contacto adicional...'
                  : 'Special prices, policies, additional contact info...'
              }
              rows={2}
              className="w-full resize-none rounded-2xl border border-black/10 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#00bfa5] focus:ring-2 focus:ring-[#00bfa5]/15"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleAdditionalInfo(true)}
                className="rounded-2xl border border-black/10 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-300"
              >
                {isEs ? 'Saltar' : 'Skip'}
              </button>
              <button
                type="button"
                disabled={!inputValue.trim()}
                onClick={() => handleAdditionalInfo(false)}
                className="flex-1 rounded-full bg-[#00bfa5] px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-40 hover:bg-[#00897b]"
              >
                {isEs ? 'Agregar y continuar →' : 'Add and continue →'}
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
              placeholder={
                isEs
                  ? 'Ej: Ofrecemos diseño gráfico, precios desde $50, operamos online, WhatsApp: +58 412...'
                  : 'E.g.: We offer graphic design, prices from $50, we operate online...'
              }
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
              {objectives.map((obj) => (
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
              {isEs ? 'Continuar →' : 'Continue →'}
            </button>
          </div>
        )}

        {step === 'channel' && (
          <div className="flex gap-2">
            {channels.map((ch) => (
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
            {isEs ? 'Generando recomendación...' : 'Generating recommendation...'}
          </div>
        )}

        {step === 'complete' && recommendation && (
          <div className="space-y-2">
            <div className="rounded-2xl border border-[#00bfa5]/25 bg-[#f0fdf9] px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#00897b]">
                {isEs ? 'Configuración recomendada' : 'Recommended config'}
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
              {isEs ? '¡Me gusta! Continuar →' : 'Looks great! Continue →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
