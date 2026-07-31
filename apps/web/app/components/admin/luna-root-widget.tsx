'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

type Message = { id: string; role: 'user' | 'assistant'; content: string };

const content = {
  es: {
    label: 'Abrir LUNA',
    title: 'LUNA',
    subtitle: 'Copiloto ejecutivo',
    close: 'Cerrar LUNA',
    welcome: 'Hola. Puedo ayudarte con proyectos, finanzas y el uso del sistema.',
    placeholder: 'Pregúntale a LUNA…',
    send: 'Enviar',
    thinking: 'Analizando…',
    error: 'No pude responder en este momento. Intenta nuevamente.',
    suggestions: ['Resume los proyectos', '¿Cómo están las finanzas?', 'Explícame esta área']
  },
  en: {
    label: 'Open LUNA',
    title: 'LUNA',
    subtitle: 'Executive copilot',
    close: 'Close LUNA',
    welcome: 'Hello. I can help with projects, finances, and system usage.',
    placeholder: 'Ask LUNA…',
    send: 'Send',
    thinking: 'Analyzing…',
    error: 'I could not respond right now. Please try again.',
    suggestions: ['Summarize projects', 'How are the finances?', 'Explain this area']
  }
} as const;

export function LunaRootWidget({ locale }: { locale: string }) {
  const pathname = usePathname();
  const language = locale.startsWith('en') ? 'en' : 'es';
  const copy = content[language];
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [previousResponseId, setPreviousResponseId] = useState<string>();

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  if (pathname.endsWith('/admin/luna')) return null;

  async function sendMessage(value: string) {
    const message = value.trim();
    if (!message || pending) return;

    setDraft('');
    setPending(true);
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'user', content: message }]);

    try {
      const response = await fetch('/api/luna-root/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId, previousResponseId, locale: language })
      });
      const payload = (await response.json()) as { reply?: string; responseId?: string | null; error?: string };
      if (!response.ok || !payload.reply) throw new Error(payload.error || copy.error);
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', content: payload.reply! }]);
      setPreviousResponseId(payload.responseId ?? undefined);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: 'assistant', content: error instanceof Error ? error.message : copy.error }
      ]);
    } finally {
      setPending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(draft);
  }

  return (
    <>
      <button
        type="button"
        aria-label={copy.label}
        aria-expanded={open}
        aria-controls="luna-root-panel"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 grid h-[52px] w-[52px] place-items-center rounded-full border border-cyan-200 bg-slate-950 text-3xl leading-none text-cyan-300 shadow-[0_18px_50px_-12px_rgba(8,145,178,0.65)] transition hover:-translate-y-1 hover:scale-105 hover:bg-cyan-600 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200 dark:border-cyan-800 sm:bottom-7 sm:right-7 sm:h-14 sm:w-14"
      >
        <span aria-hidden="true" className="-translate-y-px">☾</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button type="button" aria-label={copy.close} onClick={() => setOpen(false)} className="absolute inset-0 bg-slate-950/25 backdrop-blur-[2px]" />
          <section
            id="luna-root-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="luna-root-title"
            className="absolute inset-x-2 bottom-2 top-16 flex flex-col overflow-hidden rounded-[28px] border border-cyan-100 bg-white shadow-2xl dark:border-cyan-950 dark:bg-slate-950 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:top-5 sm:w-[430px]"
          >
            <header className="flex items-center justify-between border-b border-cyan-100 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.2),transparent_55%),#fff] px-5 py-4 dark:border-cyan-950 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-2xl text-cyan-300 dark:bg-white dark:text-cyan-700">☾</span>
                <span>
                  <span id="luna-root-title" className="block text-base font-semibold text-slate-950 dark:text-white">{copy.title}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{copy.subtitle}</span>
                </span>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label={copy.close} className="grid h-9 w-9 place-items-center rounded-full border border-black/10 text-xl text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900">×</button>
            </header>

            <div aria-live="polite" className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 dark:bg-slate-950">
              {messages.length === 0 ? (
                <div className="pt-6">
                  <p className="rounded-3xl rounded-bl-md border border-cyan-100 bg-cyan-50/80 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-cyan-950 dark:bg-cyan-950/30 dark:text-slate-200">{copy.welcome}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {copy.suggestions.map((suggestion) => (
                      <button key={suggestion} type="button" disabled={pending} onClick={() => void sendMessage(suggestion)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                    <div className={message.role === 'user'
                      ? 'max-w-[86%] whitespace-pre-wrap rounded-3xl rounded-br-md bg-slate-950 px-4 py-3 text-sm leading-6 text-white dark:bg-white dark:text-slate-950'
                      : 'max-w-[90%] whitespace-pre-wrap rounded-3xl rounded-bl-md border border-cyan-100 bg-cyan-50/80 px-4 py-3 text-sm leading-6 text-slate-800 dark:border-cyan-950 dark:bg-cyan-950/30 dark:text-slate-100'}>
                      {message.content}
                    </div>
                  </div>
                ))
              )}
              {pending ? <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">{copy.thinking}</p> : null}
            </div>

            <form onSubmit={submit} className="border-t border-black/8 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-end gap-2 rounded-3xl border border-slate-200 bg-white p-2 focus-within:border-cyan-400 dark:border-slate-700 dark:bg-slate-900">
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage(draft);
                    }
                  }}
                  rows={1}
                  maxLength={4000}
                  placeholder={copy.placeholder}
                  className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                />
                <button type="submit" disabled={!draft.trim() || pending} className="rounded-2xl bg-slate-950 px-4 py-3 text-xs font-semibold text-white hover:bg-cyan-600 disabled:opacity-40 dark:bg-white dark:text-slate-950">{copy.send}</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
