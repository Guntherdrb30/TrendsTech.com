"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type IntakeExample = { label: string; value: string };

type ConciergeCopy = {
  locale: string;
  intakeBadge: string;
  intakeTitle: string;
  intakeSubtitle: string;
  intakeUrlLabel: string;
  intakeUrlPlaceholder: string;
  intakeFileLabel: string;
  intakeDescriptionLabel: string;
  intakeDescriptionPlaceholder: string;
  intakeCtaPrimary: string;
  intakeCtaSecondary: string;
  intakeNote: string;
  intakeExamplesTitle: string;
  intakeExamples: IntakeExample[];
  intakePromiseTitle: string;
  intakePromiseBody: string;
  chatTitle: string;
  chatSubtitle: string;
  chatActivate: string;
  chatDeactivate: string;
  chatPlaceholder: string;
  chatSend: string;
  chatVoiceInput: string;
  chatVoiceOutput: string;
  chatListening: string;
  chatMemory: string;
  chatReset: string;
  chatError: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const STORAGE_KEY = "publicConciergeChat";
const SESSION_KEY = "publicConciergeSession";

function getStoredSessionId() {
  if (typeof window === "undefined") {
    return "";
  }
  const stored = window.localStorage.getItem(SESSION_KEY);
  if (stored) {
    return stored;
  }
  const generated = crypto?.randomUUID?.() ?? `session_${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(SESSION_KEY, generated);
  return generated;
}

function getVoiceLocale(locale: string) {
  return locale === "en" ? "en-US" : "es-ES";
}

export function PublicConciergeChat({ copy }: { copy: ConciergeCopy }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [fileText, setFileText] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef<unknown>(null);

  useEffect(() => {
    setSessionId(getStoredSessionId());
    if (typeof window === "undefined") {
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }
    try {
      const parsed = JSON.parse(stored) as {
        threadId?: string;
        messages?: ChatMessage[];
      };
      if (parsed.threadId) {
        setThreadId(parsed.threadId);
      }
      if (parsed.messages && parsed.messages.length > 0) {
        setMessages(parsed.messages);
      }
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        threadId,
        messages: messages.slice(-16)
      })
    );
  }, [threadId, messages]);

  const voiceLocale = useMemo(() => getVoiceLocale(copy.locale), [copy.locale]);

  function speak(text: string) {
    if (!voiceOutputEnabled || typeof window === "undefined") {
      return;
    }
    if (!("speechSynthesis" in window)) {
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLocale;
    window.speechSynthesis.speak(utterance);
  }

  function ensureRecognition() {
    if (recognitionRef.current) {
      return recognitionRef.current as {
        start: () => void;
        stop: () => void;
      };
    }
    const speechWindow = window as typeof window & {
      SpeechRecognition?: new () => unknown;
      webkitSpeechRecognition?: new () => unknown;
    };
    const SpeechRecognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return null;
    }
    const recognition = new SpeechRecognition() as {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      onresult: (event: { results: Array<Array<{ transcript: string }>> }) => void;
      onstart: () => void;
      onend: () => void;
      onerror: () => void;
      start: () => void;
      stop: () => void;
    };
    recognition.lang = voiceLocale;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      if (transcript) {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    return recognition;
  }

  async function handleSend(message: string, includeContext = false) {
    if (!message.trim() || loading) {
      return;
    }
    setError("");
    setChatOpen(true);
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setLoading(true);

    const shouldIncludeContext = includeContext || !threadId;
    const resolvedSessionId = sessionId || getStoredSessionId();
    const payload = {
      message,
      sessionId: resolvedSessionId,
      threadId,
      url: shouldIncludeContext ? url : undefined,
      description: shouldIncludeContext ? description : undefined,
      fileText: shouldIncludeContext ? fileText : undefined
    };

    try {
      const response = await fetch("/api/public-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = (await response.json()) as { reply?: string; threadId?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? copy.chatError);
      }
      if (data.threadId && data.threadId !== threadId) {
        setThreadId(data.threadId);
      }
      const reply = data.reply ?? "";
      if (reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        speak(reply);
      }
    } catch (err) {
      const messageText = err instanceof Error ? err.message : copy.chatError;
      setError(messageText);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: copy.chatError }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleAnalyze() {
    const intent = copy.locale === "en"
      ? "Analyze my business and recommend the best agents. Ask any clarifying questions."
      : "Analiza mi negocio y recomienda los agentes ideales. Haz las preguntas que necesites.";
    handleSend(intent, true);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setFileText("");
      return;
    }
    try {
      const text = await file.text();
      setFileText(text.slice(0, 4000));
    } catch {
      setFileText("");
    }
  }

  function handleVoiceToggle() {
    const recognition = ensureRecognition();
    if (!recognition) {
      setError(copy.chatError);
      return;
    }
    if (listening) {
      recognition.stop();
      return;
    }
    recognition.start();
  }

  function resetConversation() {
    setMessages([]);
    setThreadId(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  return (
    <section className="reveal relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-[0_35px_90px_-70px_rgba(15,23,42,0.5)] dark:border-slate-800 dark:bg-slate-950 sm:px-10 sm:py-10">
      <div className="absolute -right-32 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.2),_transparent_70%)] blur-2xl" aria-hidden="true" />
      <div className="absolute -left-28 -bottom-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.18),_transparent_70%)] blur-2xl" aria-hidden="true" />
      <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.55)]" />
            {copy.intakeBadge}
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-[var(--font-display)] font-semibold text-slate-900 dark:text-white sm:text-3xl">
              {copy.intakeTitle}
            </h2>
            <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              {copy.intakeSubtitle}
            </p>
          </div>
          <form className="grid gap-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 sm:p-5">
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {copy.intakeUrlLabel}
              <input
                type="url"
                name="websiteUrl"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder={copy.intakeUrlPlaceholder}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-normal text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800"
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {copy.intakeFileLabel}
              <input
                type="file"
                name="companyFile"
                onChange={handleFileChange}
                className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2 text-sm font-normal text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:file:bg-white dark:file:text-slate-950"
              />
            </label>
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {copy.intakeDescriptionLabel}
              <textarea
                name="companyDescription"
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={copy.intakeDescriptionPlaceholder}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-normal text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800"
              />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleAnalyze}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(15,23,42,0.6)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                disabled={loading}
              >
                {loading ? copy.chatListening : copy.intakeCtaPrimary}
              </button>
              <Link
                href="agents"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                {copy.intakeCtaSecondary}
              </Link>
            </div>
            <p className="text-xs text-slate-400">{copy.intakeNote}</p>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-300">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {copy.intakeExamplesTitle}
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {copy.intakeExamples.map((example) => (
                <li
                  key={example.label}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                >
                  <span className="block text-xs uppercase tracking-[0.18em] text-slate-400">
                    {example.label}
                  </span>
                  <span className="mt-1 block font-semibold text-slate-900 dark:text-white">
                    {example.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-950 px-5 py-5 text-xs text-slate-200 shadow-sm dark:border-slate-800">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {copy.intakePromiseTitle}
            </div>
            <p className="mt-3 text-sm text-slate-200">{copy.intakePromiseBody}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {copy.chatTitle}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{copy.chatSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen((prev) => !prev)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
              >
                {chatOpen ? copy.chatDeactivate : copy.chatActivate}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">
              <span className="rounded-full border border-slate-200 px-2 py-1 dark:border-slate-700">
                {copy.chatMemory}
              </span>
              <button
                type="button"
                onClick={() => setVoiceInputEnabled((prev) => !prev)}
                className={`rounded-full border px-2 py-1 ${
                  voiceInputEnabled
                    ? "border-emerald-400 text-emerald-500"
                    : "border-slate-200 text-slate-400 dark:border-slate-700"
                }`}
              >
                {copy.chatVoiceInput}
              </button>
              <button
                type="button"
                onClick={() => setVoiceOutputEnabled((prev) => !prev)}
                className={`rounded-full border px-2 py-1 ${
                  voiceOutputEnabled
                    ? "border-indigo-400 text-indigo-500"
                    : "border-slate-200 text-slate-400 dark:border-slate-700"
                }`}
              >
                {copy.chatVoiceOutput}
              </button>
            </div>

            {chatOpen && (
              <div className="mt-4 space-y-3">
                <div className="max-h-72 space-y-3 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/60">
                  {messages.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {copy.intakeSubtitle}
                    </p>
                  )}
                  {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "ml-auto bg-slate-900 text-white"
                          : "bg-white text-slate-700 dark:bg-slate-950 dark:text-slate-200"
                      }`}
                    >
                      {message.content}
                    </div>
                  ))}
                </div>

                {error && (
                  <p className="text-xs text-rose-500">{error}</p>
                )}

                <div className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={copy.chatPlaceholder}
                    className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800"
                  />
                  {voiceInputEnabled && (
                    <button
                      type="button"
                      onClick={handleVoiceToggle}
                      className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                        listening
                          ? "border-emerald-400 text-emerald-500"
                          : "border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {listening ? copy.chatListening : copy.chatVoiceInput}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSend(input)}
                    className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950"
                    disabled={loading}
                  >
                    {copy.chatSend}
                  </button>
                </div>

                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  <button type="button" onClick={resetConversation}>
                    {copy.chatReset}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
