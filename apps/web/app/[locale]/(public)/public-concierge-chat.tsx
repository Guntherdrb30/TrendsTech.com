"use client";

import { useCallback, useMemo, useRef } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import type { SupportedLocale } from "@openai/chatkit";

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
const LEAD_TOOL_NAMES = new Set(["lead_capture", "capture_lead", "notify_lead"]);

function normalizeLocale(locale: string): SupportedLocale | undefined {
  if (locale.startsWith("es")) {
    return "es";
  }
  if (locale.startsWith("en")) {
    return "en";
  }
  return undefined;
}

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

function readString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeLeadPayload(
  params: Record<string, unknown>,
  threadId: string | null,
  locale: string
) {
  return {
    name: readString(params.name ?? params.nombre ?? params.contactName ?? params.contacto),
    phone: readString(params.phone ?? params.telefono ?? params.phoneNumber ?? params.whatsapp),
    business: readString(params.business ?? params.negocio ?? params.company),
    notes: readString(params.notes ?? params.nota ?? params.detalle),
    transcript: readString(params.transcript ?? params.chat ?? params.conversation),
    source: "public_home",
    locale,
    threadId: threadId ?? undefined
  };
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
  const threadIdRef = useRef<string | null>(initialThread);
  const getClientSecret = useMemo(() => createClientSecretFetcher(), []);
  const chatLocale = useMemo(() => normalizeLocale(copy.locale), [copy.locale]);

  const startPrompts = useMemo(
    () =>
      copy.chatSuggestions
        .filter((item) => item && item.trim())
        .map((item) => ({ label: item, prompt: item })),
    [copy.chatSuggestions]
  );

  const sendLeadCapture = useCallback(
    async (rawParams: Record<string, unknown>) => {
      const payload = normalizeLeadPayload(rawParams, threadIdRef.current, copy.locale);
      const response = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Lead capture failed.");
      }
    },
    [copy.locale]
  );

  const chatkit = useChatKit({
    api: { getClientSecret },
    locale: chatLocale,
    initialThread,
    header: { enabled: false },
    history: { enabled: false },
    startScreen: { greeting: "", prompts: startPrompts },
    composer: { placeholder: copy.chatPlaceholder },
    disclaimer: { text: copy.intakeNote, highContrast: true },
    onClientTool: async ({ name, params }) => {
      if (!LEAD_TOOL_NAMES.has(name)) {
        return { ok: false, error: "Unsupported tool." };
      }
      const safeParams = params && typeof params === "object" ? params : {};
      try {
        await sendLeadCapture(safeParams);
        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : "Lead capture failed."
        };
      }
    },
    onEffect: async ({ name, data }) => {
      if (!LEAD_TOOL_NAMES.has(name)) {
        return;
      }
      const safeParams = data && typeof data === "object" ? data : {};
      try {
        await sendLeadCapture(safeParams);
      } catch (error) {
        console.error("Lead capture failed", error);
      }
    },
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
      const resolved = threadId ?? null;
      threadIdRef.current = resolved;
      persistThreadId(resolved);
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
