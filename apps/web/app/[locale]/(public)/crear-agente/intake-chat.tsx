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

  const handleCompany = useCallback(() => {
    const desc = inputValue.trim();
    if (desc.length < 10) return;
    setCompanyDesc(desc);
    addMessage('user', desc);
    setInputValue('');
    agentSay(
      '¿Tienes un sitio web? Si me das la URL, lo reviso automáticamente y tu agente conocerá toda tu empresa desde el primer día.',
      () => setStep('has_website')
    );
  }, [inputValue, addMessage, agentSay]);

  const handleHasWebsite = (has: boolean) => {
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

  const handleWebsiteUrl = useCallback(() => {
    const raw = inputValue.trim();
    if (!raw) return;
    const url = raw.startsWith('http') ? raw : `https://${raw}`;
    setWebsiteUrl(url);
    addMessage('user', url);
    setInputValue('');
    agentSay(
      `Listo, revisaré ${url}. ¿Hay información importante que no esté en tu web? Por ejemplo: precios especiales, políticas, datos de contacto adicionales. (Puedes saltar esto si no aplica)`,
      () => setStep('additional_info')
    );
  }, [inputValue, addMessage, agentSay]);

  const handleAdditionalInfo = useCallback(
    (skip: boolean) => {
      const info = skip ? '' : inputValue.trim();
      if (skip) {
        addMessage('user', 'Saltar este paso');
      } else if (info) {
        addMessage('user', info);
      }
      setAdditionalInfo(info);
      setInputValue('');
      agentSay(
        '¿Cuál es el objetivo principal de tu agente? Puedes elegir más de uno.',
        () => setStep('objectives')
      );
    },
    [inputValue, addMessage, agentSay]
  );

  const handleNoWebDetail = useCallback(() => {
    const detail = inputValue.trim();
    if (detail.length < 10) return;
    setNoWebDetail(detail);
    addMessage('user', detail);
    setInputValue('');
    agentSay(
      '¿Cuál es el objetivo principal de tu agente? Puedes elegir más de uno.',
      () => setStep('objectives')
    );
  }, [inputValue, addMessage, agentSay]);

  const toggleObjective = (label: string) => {
    setSelectedObjectives((prev) =>
      prev.includes(label) ? prev.filter((o) => o !== label) : [...prev, label]
    );
  };

  const handleObjectives = () => {
    if (selectedObjectives.length === 0) return;
    addMessage('user', selectedObjectives.join(' · '));
    agentSay(
      '¿Dónde quieres que opere principalmente tu agente?',
      () => setStep('channel')
    );
  };

  const handleChannel = async (ch: 'web' | 'whatsapp' | 'both') => {
    const channelLabel = CHANNELS.find((c) => c.value === ch)?.label ?? ch;
    addMessage('user', channelLabel);
    setStep('recommending');

    // Combined text for knowledge ingestion
    const textParts = [companyDesc, noWebDetail, additionalInfo].filter(Boolean);
    const knowledgeTextContent = textParts.join('\n\n');

    // Typing delay for "analyzing..." message
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage('agent', 'Perfecto, analizando tu información para recomendarte la mejor configuración...');
    }, 500);

    // Fetch recommendation
    let rec = { suggestedName: 'Asistente Virtual', skillKeys: ['customer_support'] };
    try {
      const res = await fetch('/api/intake/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: knowledgeTextContent,
          objectives: selectedObjectives,
        }),
      });
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
        `¡Listo! Basado en lo que me contaste, te recomiendo nombrar a tu agente "${rec.suggestedName}" con ${rec.skillKeys.length} habilidad${rec.skillKeys.length === 1 ? '' : 'es'} preconfigurada${rec.skillKeys.length === 1 ? '' : 's'}. ¿Continuamos?`,
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
              {isEs ? 'Continuar →' : 'Continue →'}
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
