"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import type { SupportedLocale } from "@openai/chatkit";

type ConciergeCopy = {
  locale: string;
  intakeBadge: string;
  intakeTitle: string;
  intakeSubtitle: string;
  intakeNote: string;
  chatPlaceholder: string;
  chatClearLabel: string;
  chatSuggestionsTitle: string;
  chatSuggestions: Array<{ label: string; prompt: string }>;
};

const THREAD_STORAGE_KEY = "publicConciergeThread";
const THREAD_ACTIVITY_KEY = "publicConciergeThreadLastActive";
const THREAD_ARCHIVE_KEY = "publicConciergeThreadArchive";
const THREAD_TTL_MS = 24 * 60 * 60 * 1000;
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
  const stored = readString(window.localStorage.getItem(THREAD_STORAGE_KEY));
  if (!stored) {
    return null;
  }
  const lastActive = readTimestamp(window.localStorage.getItem(THREAD_ACTIVITY_KEY));
  if (lastActive !== null && Date.now() - lastActive > THREAD_TTL_MS) {
    archiveThread(stored, lastActive);
    clearStoredThread();
    return null;
  }
  if (lastActive === null) {
    persistLastActive(Date.now());
  }
  return stored;
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

function readTimestamp(value: string | null) {
  if (!value) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function persistLastActive(timestamp: number | null) {
  if (typeof window === "undefined") {
    return;
  }
  if (timestamp === null) {
    window.localStorage.removeItem(THREAD_ACTIVITY_KEY);
    return;
  }
  window.localStorage.setItem(THREAD_ACTIVITY_KEY, String(timestamp));
}

function getLastActive() {
  if (typeof window === "undefined") {
    return null;
  }
  return readTimestamp(window.localStorage.getItem(THREAD_ACTIVITY_KEY));
}

function archiveThread(threadId: string, lastActive: number | null) {
  if (typeof window === "undefined") {
    return;
  }
  const payload = {
    threadId,
    lastActive: lastActive ?? undefined,
    archivedAt: Date.now()
  };
  window.localStorage.setItem(THREAD_ARCHIVE_KEY, JSON.stringify(payload));
}

function clearStoredThread() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(THREAD_STORAGE_KEY);
  window.localStorage.removeItem(THREAD_ACTIVITY_KEY);
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
  const [resetCounter, setResetCounter] = useState(0);
  const initialThread = useMemo(
    () => (resetCounter >= 0 ? getStoredThreadId() : null),
    [resetCounter]
  );
  const threadIdRef = useRef<string | null>(initialThread);
  const [isResponding, setIsResponding] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const getClientSecret = useMemo(() => createClientSecretFetcher(), []);
  const chatLocale = useMemo(() => normalizeLocale(copy.locale), [copy.locale]);

  const startPrompts = useMemo(
    () =>
      copy.chatSuggestions
        .filter((item) => item.label && item.prompt)
        .map((item) => ({ label: item.label, prompt: item.prompt })),
    [copy.chatSuggestions]
  );
  const sideSignals = useMemo(
    () => [
      { label: "Mode", value: "Enterprise intake" },
      { label: "Security", value: "Session isolated" },
      { label: "Output", value: "Lead capture ready" }
    ],
    []
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
    onReady: () => {
      setIsReady(true);
    },
    onResponseStart: () => {
      setIsResponding(true);
    },
    onResponseEnd: () => {
      setIsResponding(false);
      persistLastActive(Date.now());
    },
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
      colorScheme: "light",
      radius: "round",
      typography: {
        fontFamily: "var(--font-body)",
        fontFamilyMono: "var(--font-display)"
      },
      color: {
        grayscale: { hue: 24, tint: 2, shade: -1 },
        surface: { background: "#ffffff", foreground: "#0f172a" },
        accent: { primary: "#8b5e34", level: 2 }
      }
    },
    onThreadChange: ({ threadId }) => {
      const resolved = threadId ?? null;
      threadIdRef.current = resolved;
      persistThreadId(resolved);
      if (resolved) {
        persistLastActive(Date.now());
      } else {
        persistLastActive(null);
      }
    }
  });

  const clearChat = useCallback(() => {
    const activeThread = threadIdRef.current;
    if (activeThread) {
      archiveThread(activeThread, getLastActive());
    }
    threadIdRef.current = null;
    persistThreadId(null);
    persistLastActive(null);
    setResetCounter((prev) => prev + 1);
    chatkit.setThreadId(null).catch((error) => {
      console.error("Failed to clear chat", error);
    });
  }, [chatkit]);

  const isClearDisabled = isResponding || !isReady;

  return (
    <section className="reveal premium-metal relative overflow-hidden rounded-[36px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f6f9fc_100%)] p-4 text-slate-900 shadow-[0_55px_140px_-92px_rgba(15,23,42,0.42)] sm:p-5">
      <div
        className="premium-grid absolute inset-0 opacity-50"
        aria-hidden="true"
      />
      <div
        className="absolute -right-24 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(120,53,15,0.14),_transparent_70%)] blur-2xl"
        aria-hidden="true"
      />
      <div className="relative overflow-hidden rounded-[30px] border border-white/60 bg-white/74 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 border-b border-black/6 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-950/75" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#8b5e34]/70" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                {copy.intakeBadge}
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">AI Concierge Console</div>
            </div>
          </div>
          <button
            type="button"
            onClick={clearChat}
            disabled={isClearDisabled}
            className="inline-flex items-center justify-center rounded-full border border-black/8 bg-white/88 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
          >
            {copy.chatClearLabel}
          </button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[300px_1fr]">
          <aside className="border-b border-black/6 bg-[linear-gradient(180deg,rgba(248,250,252,0.96)_0%,rgba(255,255,255,0.88)_100%)] p-5 lg:border-b-0 lg:border-r">
            <div className="space-y-4">
              <div className="space-y-3">
                <h2 className="text-3xl font-[var(--font-display)] font-semibold tracking-[-0.04em] text-slate-900">
                  {copy.intakeTitle}
                </h2>
                <p className="text-sm leading-relaxed text-slate-600">{copy.intakeSubtitle}</p>
              </div>

              <div className="grid gap-3">
                {sideSignals.map((signal) => (
                  <div
                    key={signal.label}
                    className="rounded-[22px] border border-black/8 bg-white/86 px-4 py-4 shadow-[0_16px_40px_-34px_rgba(15,23,42,0.22)]"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {signal.label}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{signal.value}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-[24px] border border-black/8 bg-slate-950 px-4 py-4 text-white shadow-[0_24px_60px_-42px_rgba(15,23,42,0.42)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Prompt rail
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {copy.chatSuggestions.map((item) => (
                    <span
                      key={item.label}
                      className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white"
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[22px] border border-black/8 bg-white/86 px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Notice
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{copy.intakeNote}</p>
              </div>
            </div>
          </aside>

          <div className="p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-black/8 bg-white/86 px-4 py-3 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.24)]">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                <span>{copy.chatSuggestionsTitle}</span>
                <span className="rounded-full border border-black/8 bg-white px-3 py-1 text-slate-700">
                  Session {isReady ? "ready" : "loading"}
                </span>
                <span className="rounded-full border border-black/8 bg-white px-3 py-1 text-slate-700">
                  {isResponding ? "Assistant busy" : "Awaiting prompt"}
                </span>
              </div>
              <div className="rounded-full border border-black/8 bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                Lead capture
              </div>
            </div>

            <div className="h-[56vh] min-h-[360px] overflow-hidden rounded-[28px] border border-black/8 bg-white/96 shadow-[0_28px_80px_-60px_rgba(15,23,42,0.35)] backdrop-blur sm:h-[60vh] sm:min-h-[460px]">
              <ChatKit control={chatkit.control} className="block h-full w-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
