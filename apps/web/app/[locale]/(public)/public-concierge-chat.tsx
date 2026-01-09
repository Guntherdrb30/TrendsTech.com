"use client";

import { useMemo } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";

type ConciergeCopy = {
  locale: string;
  intakeTitle: string;
  intakeSubtitle: string;
  intakeNote: string;
  chatPlaceholder: string;
  chatSuggestionsTitle: string;
  chatSuggestions: string[];
};

const THREAD_STORAGE_KEY = "publicConciergeThread";

function getStoredThreadId() {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = window.localStorage.getItem(THREAD_STORAGE_KEY);
  return stored && stored.trim() ? stored : null;
}

function persistThreadId(threadId: string | null) {
  if (typeof window === "undefined") {
    return;
  }
  if (!threadId) {
    window.localStorage.removeItem(THREAD_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(THREAD_STORAGE_KEY, threadId);
}

function createClientSecretFetcher(endpoint = "/api/chatkit/session") {
  return async (currentSecret: string | null) => {
    if (currentSecret) {
      return currentSecret;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    const payload = (await response.json().catch(() => ({}))) as {
      client_secret?: string;
      error?: string;
    };

    if (!response.ok) {
      throw new Error(payload.error ?? "Failed to create session");
    }
    if (!payload.client_secret) {
      throw new Error("Missing client secret in response");
    }
    return payload.client_secret;
  };
}

export function PublicConciergeChat({ copy }: { copy: ConciergeCopy }) {
  const initialThread = useMemo(() => getStoredThreadId(), []);
  const getClientSecret = useMemo(() => createClientSecretFetcher(), []);

  const startPrompts = useMemo(
    () =>
      copy.chatSuggestions
        .filter((item) => item && item.trim())
        .map((item) => ({ label: item, prompt: item })),
    [copy.chatSuggestions]
  );

  const chatkit = useChatKit({
    api: { getClientSecret },
    locale: copy.locale,
    initialThread,
    header: { enabled: false },
    history: { enabled: false },
    startScreen: { greeting: "", prompts: startPrompts },
    composer: { placeholder: copy.chatPlaceholder },
    disclaimer: { text: copy.intakeNote, highContrast: true },
    theme: {
      colorScheme: "dark",
      radius: "round",
      typography: {
        fontFamily: "var(--font-body)",
        fontFamilyMono: "var(--font-display)"
      },
      color: {
        grayscale: { hue: 220, tint: 6, shade: -2 },
        surface: { background: "#0b1120", foreground: "#e2e8f0" },
        accent: { primary: "#f97316", level: 2 }
      }
    },
    onThreadChange: ({ threadId }) => {
      persistThreadId(threadId ?? null);
    }
  });

  return (
    <section className="reveal relative overflow-hidden rounded-[32px] border border-slate-900 bg-slate-950 px-6 py-12 text-white shadow-[0_50px_140px_-90px_rgba(15,23,42,0.85)] sm:px-10">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%)]"
        aria-hidden="true"
      />
      <div
        className="absolute -right-24 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(234,88,12,0.32),_transparent_70%)] blur-2xl"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <div className="space-y-3">
          <h2 className="text-3xl font-[var(--font-display)] font-semibold sm:text-4xl">
            {copy.intakeTitle}
          </h2>
          <p className="text-sm text-slate-300 sm:text-base">
            {copy.intakeSubtitle}
          </p>
          <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
            {copy.chatSuggestionsTitle}
          </p>
        </div>

        <div className="w-full overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950/60 shadow-[0_28px_80px_-60px_rgba(0,0,0,0.7)] backdrop-blur">
          <ChatKit
            control={chatkit.control}
            className="h-[65vh] min-h-[420px] w-full"
          />
        </div>
      </div>
    </section>
  );
}
