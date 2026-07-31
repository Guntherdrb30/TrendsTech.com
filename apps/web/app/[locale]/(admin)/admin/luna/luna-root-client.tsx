'use client';

import { FormEvent, useState } from 'react';

type Message = { id: string; role: 'user' | 'assistant'; content: string };

const copy = {
  es: {
    eyebrow: 'Copiloto ejecutivo',
    title: 'Pregunta a LUNA',
    subtitle: 'Consulta proyectos, finanzas y el uso del centro operativo con informacion real del sistema.',
    placeholder: 'Ejemplo: dame el estado de LUNA Football y sus proximos entregables',
    send: 'Enviar',
    sending: 'Analizando...',
    reset: 'Nueva conversacion',
    emptyTitle: '¿Que necesitas conocer hoy?',
    emptyBody: 'LUNA puede consultar y explicar. Esta primera fase no modifica ningun registro.',
    error: 'No fue posible obtener una respuesta. Intenta nuevamente.',
    suggestions: ['Resume todos los proyectos', '¿Como estan las finanzas?', 'Estado de LUNA Football', '¿Como uso el area de pagos?']
  },
  en: {
    eyebrow: 'Executive copilot',
    title: 'Ask LUNA',
    subtitle: 'Review projects, finances, and system usage using live operational data.',
    placeholder: 'Example: give me the status of LUNA Football and its next deliverables',
    send: 'Send',
    sending: 'Analyzing...',
    reset: 'New conversation',
    emptyTitle: 'What do you need to know today?',
    emptyBody: 'LUNA can review and explain. This first phase cannot change records.',
    error: 'A response could not be generated. Please try again.',
    suggestions: ['Summarize all projects', 'How are the finances?', 'LUNA Football status', 'How do I use payments?']
  }
} as const;

function newSessionId() {
  return crypto.randomUUID();
}

export function LunaRootClient({ locale }: { locale: string }) {
  const language = locale.startsWith('en') ? 'en' : 'es';
  const text = copy[language];
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [sessionId, setSessionId] = useState(newSessionId);
  const [previousResponseId, setPreviousResponseId] = useState<string>();
  const canSend = draft.trim().length > 0 && !pending;

  function reset() {
    setMessages([]);
    setDraft('');
    setPreviousResponseId(undefined);
    setSessionId(newSessionId());
  }

  async function sendMessage(content: string) {
    const message = content.trim();
    if (!message || pending) return;

    setPending(true);
    setDraft('');
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'user', content: message }]);

    try {
      const response = await fetch('/api/luna-root/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId, previousResponseId, locale: language })
      });
      const payload = (await response.json()) as { reply?: string; responseId?: string | null; error?: string };
      if (!response.ok || !payload.reply) throw new Error(payload.error || text.error);

      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', content: payload.reply! }]);
      setPreviousResponseId(payload.responseId ?? undefined);
    } catch (error) {
      const content = error instanceof Error ? error.message : text.error;
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', content }]);
    } finally {
      setPending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(draft);
  }

  return (
    <div className="grid min-h-[690px] overflow-hidden rounded-[30px] border border-cyan-100 bg-white shadow-[0_30px_100px_-60px_rgba(8,145,178,0.5)] dark:border-cyan-950 dark:bg-slate-950 xl:grid-cols-[310px_1fr]">
      <aside className="border-b border-cyan-100 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.2),transparent_34%),linear-gradient(180deg,#ecfeff_0%,#ffffff_72%)] p-6 dark:border-cyan-950 dark:bg-slate-950 xl:border-b-0 xl:border-r">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-xl font-semibold text-cyan-300 shadow-xl dark:bg-white dark:text-cyan-700">L</div>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-600">{text.eyebrow}</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">{text.title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{text.subtitle}</p>

        <div className="mt-7 space-y-2">
          {text.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => void sendMessage(suggestion)}
              disabled={pending}
              className="w-full rounded-2xl border border-black/8 bg-white/90 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <button type="button" onClick={reset} className="mt-7 text-sm font-semibold text-slate-500 hover:text-cyan-700">
          {text.reset}
        </button>
      </aside>

      <section className="flex min-h-[620px] flex-col bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] dark:bg-slate-950">
        <div aria-live="polite" className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-8">
          {messages.length === 0 ? (
            <div className="grid h-full min-h-[390px] place-items-center text-center">
              <div className="max-w-md">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-cyan-200 bg-cyan-50 text-2xl text-cyan-600">✦</div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">{text.emptyTitle}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text.emptyBody}</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div className={message.role === 'user'
                  ? 'max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-md bg-slate-950 px-5 py-4 text-sm leading-6 text-white dark:bg-white dark:text-slate-950'
                  : 'max-w-[88%] whitespace-pre-wrap rounded-3xl rounded-bl-md border border-cyan-100 bg-cyan-50/70 px-5 py-4 text-sm leading-6 text-slate-800 dark:border-cyan-950 dark:bg-cyan-950/30 dark:text-slate-100'}>
                  {message.content}
                </div>
              </div>
            ))
          )}
          {pending ? <div className="text-sm font-medium text-cyan-700 dark:text-cyan-300">{text.sending}</div> : null}
        </div>

        <form onSubmit={submit} className="border-t border-black/8 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950 sm:p-6">
          <div className="flex items-end gap-3 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-cyan-400 dark:border-slate-700 dark:bg-slate-900">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  if (canSend) void sendMessage(draft);
                }
              }}
              placeholder={text.placeholder}
              rows={2}
              maxLength={4000}
              className="min-h-[54px] flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
            />
            <button type="submit" disabled={!canSend} className="shrink-0 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-950">
              {pending ? text.sending : text.send}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
