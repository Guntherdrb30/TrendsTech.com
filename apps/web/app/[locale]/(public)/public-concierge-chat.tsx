"use client";

import { useEffect, useMemo, useRef, useState } from "react";
type ConciergeCopy = {
  locale: string;
  intakeTitle: string;
  intakeSubtitle: string;
  intakeNote: string;
  chatPlaceholder: string;
  chatSend: string;
  chatVoiceInput: string;
  chatVoiceOutput: string;
  chatListening: string;
  chatMemory: string;
  chatReset: string;
  chatError: string;
  chatSuggestionsTitle: string;
  chatSuggestions: string[];
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

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
  const placeholderPrefix = copy.locale === "en" ? "E.g." : "Ej:";
  const rotatingOptions = useMemo(
    () => (copy.chatSuggestions.length > 0 ? copy.chatSuggestions : [copy.chatPlaceholder]),
    [copy.chatPlaceholder, copy.chatSuggestions]
  );

  useEffect(() => {
    if (isFocused || input.trim() || rotatingOptions.length < 2) {
      return;
    }
    const interval = window.setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % rotatingOptions.length);
    }, 4200);
    return () => window.clearInterval(interval);
  }, [isFocused, input, rotatingOptions.length]);

  const placeholderText = !isFocused && !input.trim()
    ? `${placeholderPrefix} ${rotatingOptions[placeholderIndex] ?? copy.chatPlaceholder}`
    : copy.chatPlaceholder;

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

  function extractUrl(message: string) {
    const match = message.match(/https?:\/\/[^\s)]+/i);
    if (match?.[0]) {
      return match[0].replace(/[),.;]+$/g, "");
    }
    const trimmed = message.trim();
    if (trimmed && !trimmed.includes(" ") && trimmed.includes(".")) {
      return `https://${trimmed.replace(/^https?:\/\//i, "")}`;
    }
    return null;
  }

  async function handleSend(message: string, includeContext = false) {
    if (!message.trim() || loading) {
      return;
    }
    setError("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setLoading(true);

    const shouldIncludeContext = includeContext || !threadId;
    const detectedUrl = extractUrl(message);
    const resolvedSessionId = sessionId || getStoredSessionId();
    const payload = {
      message,
      sessionId: resolvedSessionId,
      threadId,
      url: shouldIncludeContext ? detectedUrl ?? undefined : undefined
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

  const hasConversation = messages.length > 0;

  return (
    <section className="reveal relative overflow-hidden rounded-[32px] border border-slate-900 bg-slate-950 px-6 py-12 text-white shadow-[0_50px_140px_-90px_rgba(15,23,42,0.85)] sm:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_55%)]" aria-hidden="true" />
      <div className="absolute -right-24 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(234,88,12,0.35),_transparent_70%)] blur-2xl" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <div className="space-y-3">
          <h2 className="text-3xl font-[var(--font-display)] font-semibold sm:text-4xl">
            {copy.intakeTitle}
          </h2>
          <p className="text-sm text-slate-300 sm:text-base">{copy.intakeSubtitle}</p>
        </div>

        <div className="w-full space-y-3">
          <div className="flex items-center gap-3 rounded-[28px] border border-slate-800 bg-slate-900/70 px-4 py-3 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.7)] backdrop-blur">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-lg">
              +
            </div>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder={placeholderText}
              className="rotating-placeholder flex-1 bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none sm:text-base"
            />
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                listening
                  ? "border-emerald-400 text-emerald-300"
                  : "border-slate-700 text-slate-400"
              }`}
            >
              {listening ? copy.chatListening : copy.chatVoiceInput}
            </button>
            <button
              type="button"
              onClick={() => handleSend(input)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-white shadow-[0_12px_30px_-18px_rgba(249,115,22,0.8)] transition hover:bg-orange-400 disabled:opacity-60"
              disabled={loading}
            >
              {copy.chatSend}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
            <span>{copy.chatSuggestionsTitle}</span>
            {copy.chatSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSend(suggestion)}
                className="rounded-full border border-slate-800 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 transition hover:border-slate-700 hover:text-slate-200"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
            <span>{copy.intakeNote}</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setVoiceOutputEnabled((prev) => !prev)}
                className={`rounded-full border px-3 py-1 ${
                  voiceOutputEnabled
                    ? "border-orange-300 text-orange-200"
                    : "border-slate-800 text-slate-500"
                }`}
              >
                {copy.chatVoiceOutput}
              </button>
              {hasConversation && (
                <button type="button" onClick={resetConversation}>
                  {copy.chatReset}
                </button>
              )}
            </div>
          </div>
        </div>

        {hasConversation && (
          <div className="w-full space-y-3 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 text-left text-sm text-slate-200 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.75)]">
            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
              <span className="rounded-full border border-slate-800 px-3 py-1">
                {copy.chatMemory}
              </span>
            </div>
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "ml-auto bg-slate-800 text-white"
                      : "bg-slate-950 text-slate-200"
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>
            {error && <p className="text-xs text-rose-400">{error}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
