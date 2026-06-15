"use client";

import Link from "next/link";
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

const WHATSAPP_NUMBER = "584245262306";

function normalizeLocale(locale: string): SupportedLocale | undefined {
  if (locale.startsWith("es")) return "es";
  if (locale.startsWith("en")) return "en";
  return undefined;
}

function getStoredThreadId() {
  if (typeof window === "undefined") return null;
  const stored = readString(window.localStorage.getItem(THREAD_STORAGE_KEY));
  if (!stored) return null;
  const lastActive = readTimestamp(window.localStorage.getItem(THREAD_ACTIVITY_KEY));
  if (lastActive !== null && Date.now() - lastActive > THREAD_TTL_MS) {
    archiveThread(stored, lastActive);
    clearStoredThread();
    return null;
  }
  if (lastActive === null) persistLastActive(Date.now());
  return stored;
}

function persistThreadId(threadId: string | null) {
  if (typeof window === "undefined") return;
  if (!threadId) {
    window.localStorage.removeItem(THREAD_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(THREAD_STORAGE_KEY, threadId);
}

function readTimestamp(value: string | null) {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function persistLastActive(timestamp: number | null) {
  if (typeof window === "undefined") return;
  if (timestamp === null) {
    window.localStorage.removeItem(THREAD_ACTIVITY_KEY);
    return;
  }
  window.localStorage.setItem(THREAD_ACTIVITY_KEY, String(timestamp));
}

function getLastActive() {
  if (typeof window === "undefined") return null;
  return readTimestamp(window.localStorage.getItem(THREAD_ACTIVITY_KEY));
}

function archiveThread(threadId: string, lastActive: number | null) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    THREAD_ARCHIVE_KEY,
    JSON.stringify({ threadId, lastActive: lastActive ?? undefined, archivedAt: Date.now() })
  );
}

function clearStoredThread() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(THREAD_STORAGE_KEY);
  window.localStorage.removeItem(THREAD_ACTIVITY_KEY);
}

function readString(value: unknown) {
  if (typeof value !== "string") return undefined;
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
    if (currentSecret) return currentSecret;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    const payload = (await response.json().catch(() => ({}))) as {
      client_secret?: string;
      error?: string;
    };
    if (!response.ok) throw new Error(payload.error ?? "Failed to create session");
    if (!payload.client_secret) throw new Error("Missing client secret in response");
    return payload.client_secret;
  };
}

export function PublicConciergeChat({ copy }: { copy: ConciergeCopy }) {
  const isEs = copy.locale.startsWith("es");
  const [resetCounter, setResetCounter] = useState(0);
  const initialThread = useMemo(
    () => (resetCounter >= 0 ? getStoredThreadId() : null),
    [resetCounter]
  );
  const threadIdRef = useRef<string | null>(initialThread);
  const [isResponding, setIsResponding] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasMessages, setHasMessages] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const getClientSecret = useMemo(() => createClientSecretFetcher(), []);
  const chatLocale = useMemo(() => normalizeLocale(copy.locale), [copy.locale]);

  const startPrompts = useMemo(
    () =>
      copy.chatSuggestions
        .filter((item) => item.label && item.prompt)
        .map((item) => ({ label: item.label, prompt: item.prompt })),
    [copy.chatSuggestions]
  );

  const uiCopy = useMemo(
    () =>
      isEs
        ? {
            sessionReady: "En línea",
            sessionLoading: "Conectando...",
            assistantBusy: "Respondiendo...",
            awaitingPrompt: "Listo",
            downloadLabel: "Descargar sesión",
            downloadingLabel: "Descargando...",
            downloadError: "No se pudo descargar. Intenta de nuevo.",
            whatsappLabel: "Hablar con humano",
            whatsappSub: "WhatsApp · +58 424-526-2306",
            lunaTitle: "Luna ERP",
            lunaSub: "Sistema de gestión empresarial",
            lunaDesc: "Ventas, inventario, finanzas, tienda online e IA en una sola plataforma.",
            lunaCta: "Ver planes de Luna",
            agentTitle: "Agentes IA con Skills",
            agentSub: "Para tu sitio web o negocio",
            agentDesc: "Crea tu agente de atención con habilidades específicas para tu industria.",
            agentCta: "Crear mi agente",
            statusBar: "Estado del asesor",
            chatSuggestionsTitle: "Consultas frecuentes"
          }
        : {
            sessionReady: "Online",
            sessionLoading: "Connecting...",
            assistantBusy: "Responding...",
            awaitingPrompt: "Ready",
            downloadLabel: "Download session",
            downloadingLabel: "Downloading...",
            downloadError: "Download failed. Please try again.",
            whatsappLabel: "Talk to a human",
            whatsappSub: "WhatsApp · +58 424-526-2306",
            lunaTitle: "Luna ERP",
            lunaSub: "Business management system",
            lunaDesc: "Sales, inventory, finance, online store and AI on one platform.",
            lunaCta: "See Luna plans",
            agentTitle: "AI Agents with Skills",
            agentSub: "For your website or business",
            agentDesc: "Create your customer agent with specific skills for your industry.",
            agentCta: "Create my agent",
            statusBar: "Advisor status",
            chatSuggestionsTitle: "Common questions"
          },
    [isEs]
  );

  const lunaHref = `/${copy.locale}/systems/luna`;
  const agentCreatorHref = `/${copy.locale}/crear-agente`;

  const handleDownload = useCallback(async () => {
    const threadId = threadIdRef.current;
    if (!threadId || isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await fetch("/api/chatkit/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId })
      });
      if (!response.ok) {
        alert(uiCopy.downloadError);
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sesion-trends172-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert(uiCopy.downloadError);
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, uiCopy.downloadError]);

  const sendLeadCapture = useCallback(
    async (rawParams: Record<string, unknown>) => {
      const payload = normalizeLeadPayload(rawParams, threadIdRef.current, copy.locale);
      const response = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Lead capture failed.");
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
    onReady: () => setIsReady(true),
    onResponseStart: () => setIsResponding(true),
    onResponseEnd: () => {
      setIsResponding(false);
      setHasMessages(true);
      persistLastActive(Date.now());
    },
    onClientTool: async ({ name, params }) => {
      if (!LEAD_TOOL_NAMES.has(name)) return { ok: false, error: "Unsupported tool." };
      const safeParams = params && typeof params === "object" ? params : {};
      try {
        await sendLeadCapture(safeParams);
        return { ok: true };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Lead capture failed." };
      }
    },
    onEffect: async ({ name, data }) => {
      if (!LEAD_TOOL_NAMES.has(name)) return;
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
        grayscale: { hue: 215, tint: 2, shade: -1 },
        surface: { background: "#ffffff", foreground: "#0f172a" },
        accent: { primary: "#00bfa5", level: 2 }
      }
    },
    onThreadChange: ({ threadId }) => {
      const resolved = threadId ?? null;
      threadIdRef.current = resolved;
      persistThreadId(resolved);
      if (resolved) {
        persistLastActive(Date.now());
        setHasMessages(true);
      } else {
        persistLastActive(null);
      }
    }
  });

  const clearChat = useCallback(() => {
    const activeThread = threadIdRef.current;
    if (activeThread) archiveThread(activeThread, getLastActive());
    threadIdRef.current = null;
    persistThreadId(null);
    persistLastActive(null);
    setHasMessages(false);
    setResetCounter((prev) => prev + 1);
    chatkit.setThreadId(null).catch((error) => {
      console.error("Failed to clear chat", error);
    });
  }, [chatkit]);

  const isClearDisabled = isResponding || !isReady;
  const isDownloadDisabled = !hasMessages || isResponding || isDownloading;

  return (
    <div className="relative overflow-hidden rounded-[36px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f6f9fc_100%)] shadow-[0_55px_140px_-92px_rgba(15,23,42,0.42)]">
      {/* top bar */}
      <div className="flex items-center justify-between gap-3 border-b border-black/6 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-950/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400/55" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#00bfa5]/80" />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              {copy.intakeBadge}
            </div>
            <div className="mt-0.5 text-sm font-semibold text-slate-900">
              {isEs ? "Asesor Trends172 Tech" : "Trends172 Tech Advisor"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloadDisabled}
            title={uiCopy.downloadLabel}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/8 bg-white/88 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 transition hover:border-[#00bfa5] hover:text-[#00896e] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1v6.5M6 7.5l-2.5-2.5M6 7.5l2.5-2.5M1.5 10.5h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isDownloading ? uiCopy.downloadingLabel : uiCopy.downloadLabel}
          </button>
          <button
            type="button"
            onClick={clearChat}
            disabled={isClearDisabled}
            className="inline-flex items-center justify-center rounded-full border border-black/8 bg-white/88 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
          >
            {copy.chatClearLabel}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr]">
        {/* sidebar */}
        <aside className="space-y-3 border-b border-black/6 bg-[linear-gradient(180deg,rgba(248,250,252,0.98)_0%,rgba(255,255,255,0.92)_100%)] p-5 lg:border-b-0 lg:border-r">
          {/* header copy */}
          <div className="space-y-1.5 pb-1">
            <h2 className="text-xl font-[var(--font-display)] font-semibold tracking-[-0.03em] text-slate-900">
              {copy.intakeTitle}
            </h2>
            <p className="text-sm leading-relaxed text-slate-500">{copy.intakeSubtitle}</p>
          </div>

          {/* Luna CTA */}
          <div className="overflow-hidden rounded-[22px] border border-black/8 bg-white shadow-[0_20px_50px_-36px_rgba(15,23,42,0.22)]">
            <div className="border-b border-black/6 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-[18px] leading-none">🌙</span>
                <div>
                  <div className="text-sm font-semibold text-white">{uiCopy.lunaTitle}</div>
                  <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                    {uiCopy.lunaSub}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-[12px] leading-relaxed text-slate-600">{uiCopy.lunaDesc}</p>
              <Link
                href={lunaHref}
                className="mt-3 flex w-full items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-slate-800"
              >
                {uiCopy.lunaCta}
              </Link>
            </div>
          </div>

          {/* Agent Creator CTA */}
          <div className="overflow-hidden rounded-[22px] border border-[#00bfa5]/30 bg-white shadow-[0_20px_50px_-36px_rgba(0,191,165,0.18)]">
            <div className="border-b border-[#00bfa5]/20 bg-[linear-gradient(135deg,#00bfa5_0%,#00897b_100%)] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-[18px] leading-none">🤖</span>
                <div>
                  <div className="text-sm font-semibold text-white">{uiCopy.agentTitle}</div>
                  <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[rgba(255,255,255,0.75)]">
                    {uiCopy.agentSub}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-[12px] leading-relaxed text-slate-600">{uiCopy.agentDesc}</p>
              <Link
                href={agentCreatorHref}
                className="mt-3 flex w-full items-center justify-center rounded-full bg-[#00bfa5] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#00897b]"
              >
                {uiCopy.agentCta}
              </Link>
            </div>
          </div>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(isEs ? "Hola, quisiera hablar con un asesor de Trends172 Tech." : "Hello, I'd like to speak with a Trends172 Tech advisor.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-[20px] border border-black/8 bg-white px-4 py-3 text-slate-700 transition hover:border-[#25d366]/40 hover:bg-[#f0fdf4]"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 1.667A8.333 8.333 0 0 0 1.667 10c0 1.466.385 2.84 1.057 4.03L1.667 18.333l4.42-1.04A8.333 8.333 0 1 0 10 1.667Zm-3.458 4.583c.167 0 .354.003.518.008.193.006.4.016.598.462.238.537.714 1.836.779 1.97.064.133.107.287.021.462-.086.175-.128.285-.256.44-.128.155-.268.347-.384.465-.128.128-.26.268-.112.524.15.256.665 1.098 1.428 1.778.982.872 1.808 1.14 2.064 1.268.256.128.406.107.558-.064.15-.171.637-.742.807-1 .17-.256.34-.213.577-.128.235.085 1.496.706 1.752.835.256.128.427.192.49.299.065.107.065.619-.15 1.217-.214.6-1.246 1.15-1.71 1.193-.464.043-.898.213-3.028-.641-2.564-1.025-4.177-3.644-4.305-3.814-.128-.17-1.046-1.39-1.046-2.654 0-1.263.659-1.885.895-2.143.235-.256.513-.32.684-.32Z" fill="#25D366"/>
            </svg>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-slate-900">{uiCopy.whatsappLabel}</div>
              <div className="text-[10px] text-slate-500">{uiCopy.whatsappSub}</div>
            </div>
          </a>

          {/* status indicator */}
          <div className="flex items-center gap-2 px-1 py-1">
            <span
              className={`h-2 w-2 rounded-full transition-colors ${
                !isReady ? "bg-amber-400" : isResponding ? "bg-blue-400" : "bg-emerald-400"
              }`}
            />
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
              {!isReady ? uiCopy.sessionLoading : isResponding ? uiCopy.assistantBusy : uiCopy.sessionReady}
            </span>
          </div>
        </aside>

        {/* chat panel */}
        <div className="p-4 sm:p-5">
          <div className="h-[58vh] min-h-[380px] overflow-hidden rounded-[28px] border border-black/8 bg-white shadow-[0_28px_80px_-60px_rgba(15,23,42,0.28)] sm:h-[62vh] sm:min-h-[480px]">
            <ChatKit control={chatkit.control} className="block h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
