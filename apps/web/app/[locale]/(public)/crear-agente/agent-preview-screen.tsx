'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// ── Tipos ──────────────────────────────────────────────────────────────────────

type UploadedFile = {
  name: string;
  type: string;
  text: string;
  charCount: number;
  status: 'ready' | 'error';
  errorMsg?: string;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
};

type Props = {
  agentName: string;
  skillKeys: string[];
  locale: string;
  onContinue: () => void;
  onSkip: () => void;
};

// ── Constantes ─────────────────────────────────────────────────────────────────

const MAX_FILES = 3;
const MAX_DEMO_MESSAGES = 8;
const ACCEPTED = '.pdf,.xlsx,.xls,.txt,.csv';

// ── Componente ─────────────────────────────────────────────────────────────────

export function AgentPreviewScreen({
  agentName,
  skillKeys,
  locale,
  onContinue,
  onSkip,
}: Props) {
  const isEs = locale.startsWith('es');

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [chatStarted, setChatStarted] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [demoOver, setDemoOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userMsgCount = messages.filter((m) => m.role === 'user').length;
  const remaining = MAX_DEMO_MESSAGES - userMsgCount;

  // Scroll al fondo al recibir mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Upload ─────────────────────────────────────────────────────────────────

  const uploadFile = useCallback(async (file: File) => {
    if (files.length >= MAX_FILES) return;

    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const allowed = ['pdf', 'xlsx', 'xls', 'txt', 'csv'];
    if (!allowed.includes(ext)) {
      setFiles((prev) => [
        ...prev,
        { name: file.name, type: ext, text: '', charCount: 0, status: 'error', errorMsg: 'Formato no soportado' },
      ]);
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/agent-preview/parse', { method: 'POST', body: fd });
      const data = await res.json() as { text?: string; filename?: string; type?: string; charCount?: number; error?: string };

      if (!res.ok || data.error) {
        setFiles((prev) => [
          ...prev,
          { name: file.name, type: ext, text: '', charCount: 0, status: 'error', errorMsg: data.error ?? 'Error al leer el archivo' },
        ]);
      } else {
        setFiles((prev) => [
          ...prev,
          { name: file.name, type: ext, text: data.text ?? '', charCount: data.charCount ?? 0, status: 'ready' },
        ]);
      }
    } catch {
      setFiles((prev) => [
        ...prev,
        { name: file.name, type: ext, text: '', charCount: 0, status: 'error', errorMsg: 'Error de red' },
      ]);
    } finally {
      setUploading(false);
    }
  }, [files.length]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const picked = Array.from(e.target.files ?? []);
      const available = MAX_FILES - files.length;
      picked.slice(0, available).forEach((f) => void uploadFile(f));
      e.target.value = '';
    },
    [files.length, uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = Array.from(e.dataTransfer.files);
      const available = MAX_FILES - files.length;
      dropped.slice(0, available).forEach((f) => void uploadFile(f));
    },
    [files.length, uploadFile]
  );

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Chat ───────────────────────────────────────────────────────────────────

  const buildContext = () =>
    files
      .filter((f) => f.status === 'ready' && f.text)
      .map((f) => `== Archivo: ${f.name} ==\n${f.text}`)
      .join('\n\n');

  const startChat = () => {
    setChatStarted(true);
    const welcome: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: isEs
        ? `¡Hola! Soy ${agentName}. ¿En qué puedo ayudarte hoy?`
        : `Hi! I'm ${agentName}. How can I help you today?`,
    };
    setMessages([welcome]);
  };

  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isStreaming || demoOver) return;

    const newUserMsg: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      role: 'user',
      content: text,
    };

    const nextMessages = [...messages, newUserMsg];
    setMessages(nextMessages);
    setInputValue('');

    const nextUserCount = nextMessages.filter((m) => m.role === 'user').length;
    if (nextUserCount >= MAX_DEMO_MESSAGES) {
      setDemoOver(true);
    }

    // Agregar mensaje de respuesta vacío que se irá llenando
    const assistantId = Math.random().toString(36).slice(2);
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', streaming: true },
    ]);
    setIsStreaming(true);

    try {
      const res = await fetch('/api/agent-preview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          context: buildContext(),
          agentName,
          skillKeys,
        }),
      });

      if (!res.ok) {
        const errData = await res.json() as { error?: string; message?: string };
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: errData.message ?? 'Error al conectar con el agente.', streaming: false }
              : m
          )
        );
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const snap = accumulated;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: snap, streaming: true } : m
          )
        );
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, streaming: false } : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Error de conexión. Intenta de nuevo.', streaming: false }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [inputValue, isStreaming, demoOver, messages, agentName, skillKeys]);

  // ── Render ─────────────────────────────────────────────────────────────────

  const readyFiles = files.filter((f) => f.status === 'ready');
  const hasContext = readyFiles.length > 0;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#14D9D9]/25 bg-[#14D9D9]/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0099a8]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#14D9D9]" />
          {isEs ? 'Prueba gratis · Sin cuenta requerida' : 'Free trial · No account required'}
        </div>
        <h2 className="mt-2 font-[var(--font-display)] text-2xl font-extrabold tracking-[-0.04em] text-[#0a0d14]">
          {isEs ? 'Prueba tu agente antes de activarlo' : 'Test your agent before activating'}
        </h2>
        <p className="mt-1.5 text-sm text-[#6b7280]">
          {isEs
            ? `Sube hasta ${MAX_FILES} archivos con info de tu empresa y habla con ${agentName}`
            : `Upload up to ${MAX_FILES} files with your business info and chat with ${agentName}`}
        </p>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-[#e5e7eb] bg-white shadow-[0_16px_48px_-24px_rgba(10,13,20,0.10)]">

        {/* ── Upload section ── */}
        {!chatStarted && (
          <div className="p-6 sm:p-7">
            {/* Agent name badge */}
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#14D9D9]/20 bg-[#14D9D9]/4 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#14D9D9,#0099a8)] text-base shadow-[0_4px_12px_rgba(20,217,217,0.3)]">
                🤖
              </div>
              <div>
                <div className="text-sm font-semibold text-[#0a0d14]">{agentName}</div>
                <div className="text-[11px] text-[#6b7280]">
                  {skillKeys.length} skill{skillKeys.length !== 1 ? 's' : ''} {isEs ? 'activada' : 'active'}{skillKeys.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#14D9D9]" />
                <span className="text-[11px] font-medium text-[#0099a8]">
                  {isEs ? 'Listo' : 'Ready'}
                </span>
              </div>
            </div>

            {/* Dropzone */}
            {files.length < MAX_FILES && (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`mb-4 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-8 transition-all ${
                  isDragging
                    ? 'border-[#14D9D9] bg-[#14D9D9]/5'
                    : 'border-[#e5e7eb] bg-[#fafafa] hover:border-[#14D9D9]/40 hover:bg-[#14D9D9]/3'
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                  {uploading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#14D9D9]/30 border-t-[#14D9D9]" />
                  ) : (
                    '📄'
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-[#0a0d14]">
                    {uploading
                      ? (isEs ? 'Procesando archivo...' : 'Processing file...')
                      : (isEs ? 'Arrastra o haz clic para subir' : 'Drag or click to upload')}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#9ca3af]">
                    PDF · Excel · TXT — {isEs ? `máx. ${MAX_FILES} archivos` : `max ${MAX_FILES} files`}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ACCEPTED}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {/* Files list */}
            {files.length > 0 && (
              <div className="mb-4 space-y-2">
                {files.map((f, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                      f.status === 'error'
                        ? 'border-red-200 bg-red-50'
                        : 'border-[#e5e7eb] bg-[#fafafa]'
                    }`}
                  >
                    <span className="text-lg">
                      {f.type === 'pdf' ? '📄' : f.type === 'xlsx' || f.type === 'xls' ? '📊' : '📝'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-[#0a0d14]">{f.name}</p>
                      {f.status === 'ready' ? (
                        <p className="text-[11px] text-[#6b7280]">
                          {f.charCount.toLocaleString()} {isEs ? 'caracteres leídos' : 'chars read'} ✓
                        </p>
                      ) : (
                        <p className="text-[11px] text-red-500">{f.errorMsg}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#9ca3af] transition hover:bg-[#f3f4f6] hover:text-[#6b7280]"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={startChat}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0a0d14] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(10,13,20,0.35)] transition hover:bg-[#14D9D9] hover:text-[#0a0d14]"
              >
                {hasContext
                  ? (isEs ? `Probar con ${readyFiles.length} archivo${readyFiles.length !== 1 ? 's' : ''} →` : `Test with ${readyFiles.length} file${readyFiles.length !== 1 ? 's' : ''} →`)
                  : (isEs ? 'Probar sin archivos →' : 'Test without files →')}
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="text-center text-[13px] text-[#9ca3af] transition hover:text-[#6b7280]"
              >
                {isEs ? 'Saltar prueba y activar directamente →' : 'Skip test and activate directly →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Chat section ── */}
        {chatStarted && (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-[#f3f4f6] px-5 py-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#14D9D9,#0099a8)] text-sm shadow-[0_4px_10px_rgba(20,217,217,0.3)]">
                🤖
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#0a0d14]">{agentName}</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#14D9D9]" />
                  <span className="text-[10px] text-[#6b7280]">
                    {isEs ? 'Modo demostración' : 'Demo mode'}
                  </span>
                </div>
              </div>
              {/* Contador */}
              <div className="ml-auto text-right">
                <p className="text-[11px] font-semibold text-[#9ca3af]">
                  {demoOver
                    ? (isEs ? 'Demo completada' : 'Demo complete')
                    : `${remaining} ${isEs ? 'mensajes restantes' : 'messages left'}`}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex h-[340px] flex-col gap-3 overflow-y-auto px-5 py-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#14D9D9]/10 text-xs">
                      🤖
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'rounded-tr-sm bg-[#0a0d14] text-white'
                        : 'rounded-tl-sm bg-[#f3f4f6] text-[#0a0d14]'
                    }`}
                  >
                    {msg.content}
                    {msg.streaming && (
                      <span className="ml-1 inline-block h-3 w-0.5 animate-pulse bg-current opacity-60" />
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator cuando la respuesta aún no llegó */}
              {isStreaming && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-2">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#14D9D9]/10 text-xs">
                    🤖
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-[#f3f4f6] px-4 py-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#9ca3af] animate-bounce [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#9ca3af] animate-bounce [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#9ca3af] animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[#f3f4f6] px-4 py-3">
              {!demoOver ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
                    placeholder={isEs ? 'Escribe tu pregunta al agente...' : 'Type your question to the agent...'}
                    disabled={isStreaming}
                    className="flex-1 rounded-full border border-[#e5e7eb] bg-[#fafafa] px-4 py-2.5 text-sm text-[#0a0d14] outline-none placeholder:text-[#9ca3af] focus:border-[#14D9D9] focus:ring-2 focus:ring-[#14D9D9]/15 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    disabled={!inputValue.trim() || isStreaming}
                    onClick={() => void sendMessage()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0a0d14] text-white transition disabled:opacity-40 hover:bg-[#14D9D9] hover:text-[#0a0d14]"
                  >
                    →
                  </button>
                </div>
              ) : (
                /* Demo terminada — CTA de conversión */
                <div className="py-1 space-y-2">
                  <div className="rounded-2xl border border-[#14D9D9]/20 bg-[#14D9D9]/5 px-4 py-3 text-center">
                    <p className="text-[13px] font-semibold text-[#0a0d14]">
                      {isEs ? '¿Tu agente respondió como esperabas?' : 'Did your agent respond as expected?'}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#6b7280]">
                      {isEs
                        ? 'Actívalo ahora y sube más documentos desde el panel'
                        : 'Activate it now and upload more documents from the dashboard'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onContinue}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#14D9D9] px-6 py-3 text-sm font-semibold text-[#0a0d14] shadow-[0_8px_24px_-8px_rgba(20,217,217,0.45)] transition hover:bg-[#0099a8] hover:text-white"
                  >
                    🚀 {isEs ? '¡Activar mi agente →' : 'Activate my agent →'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Skip / continue links debajo de la card */}
      {chatStarted && !demoOver && (
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => { setChatStarted(false); }}
            className="text-[13px] text-[#9ca3af] transition hover:text-[#6b7280]"
          >
            ← {isEs ? 'Cambiar archivos' : 'Change files'}
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="text-[13px] font-semibold text-[#0099a8] transition hover:text-[#14D9D9]"
          >
            {isEs ? 'Activar sin probar más →' : 'Activate without more testing →'}
          </button>
        </div>
      )}
    </div>
  );
}
