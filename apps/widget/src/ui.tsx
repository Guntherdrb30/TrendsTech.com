import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { WidgetBranding, WidgetLanguage, WidgetMessage, WidgetTheme } from './types';
import { t } from './i18n';
import { getThemeStyles, resolveTheme } from './themes';
import { getOrCreateSessionId, resetSessionId } from './state';
import { sendMessage } from './api';

type WidgetRootProps = {
  installId: string;
  language: WidgetLanguage;
  theme: WidgetTheme;
  branding?: WidgetBranding | null;
  apiBaseUrl: string;
};

function buildWelcomeMessage(language: WidgetLanguage, branding?: WidgetBranding | null) {
  const branded = branding?.welcomeMessage?.[language];
  return branded ?? t(language, 'welcome');
}

function createMessage(role: WidgetMessage['role'], content: string): WidgetMessage {
  return {
    id: `${role}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    role,
    content,
    createdAt: new Date().toISOString()
  };
}

export function WidgetRoot({ installId, language, theme, branding, apiBaseUrl }: WidgetRootProps) {
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(theme));
  const themeStyles = useMemo(() => getThemeStyles(resolvedTheme, branding), [resolvedTheme, branding]);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<WidgetMessage[]>(() => [
    createMessage('assistant', buildWelcomeMessage(language, branding))
  ]);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined' || !window.matchMedia) {
      setResolvedTheme(resolveTheme(theme));
      return;
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setResolvedTheme(media.matches ? 'dark' : 'light');
    handler();
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [theme]);

  const agentName = branding?.agentName || t(language, 'header.title');
  const [sessionId, setSessionId] = useState(() => getOrCreateSessionId(installId));

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) {
      return;
    }

    setError(null);
    setInput('');
    setIsSending(true);
    const userMessage = createMessage('user', trimmed);
    setMessages((prev) => [...prev, userMessage]);

    try {
      const reply = await sendMessage({
        installId,
        sessionId,
        message: trimmed,
        language,
        pageUrl: window.location.href,
        apiBaseUrl
      });
      setMessages((prev) => [...prev, createMessage('assistant', reply)]);
    } catch (sendError) {
      console.error('Widget send error', sendError);
      setError(t(language, 'error.connection'));
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    setSessionId(resetSessionId(installId));
    setMessages([createMessage('assistant', buildWelcomeMessage(language, branding))]);
    setError(null);
  };

  return (
    <div className="tw-widget" style={themeStyles as CSSProperties}>
      <button
        className="tw-bubble"
        type="button"
        aria-label={isOpen ? t(language, 'widget.close') : t(language, 'widget.open')}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="tw-bubble-dot" />
      </button>

      {isOpen ? (
        <div className="tw-panel" role="dialog" aria-label={agentName}>
          <header className="tw-header">
            <div className="tw-header-brand">
              {branding?.logoUrl ? (
                <img src={branding.logoUrl} alt={agentName} className="tw-logo" />
              ) : (
                <div className="tw-logo-placeholder" />
              )}
              <div>
                <p className="tw-title">{agentName}</p>
                <p className="tw-subtitle">{t(language, 'header.subtitle')}</p>
              </div>
            </div>
            <button className="tw-reset" type="button" onClick={handleReset}>
              {t(language, 'widget.reset')}
            </button>
          </header>

          <div className="tw-messages" role="log" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.role === 'user' ? 'tw-message tw-message-user' : 'tw-message tw-message-agent'}
              >
                {message.content}
              </div>
            ))}
            {isSending ? (
              <div className="tw-message tw-message-agent">{t(language, 'status.typing')}</div>
            ) : null}
            <div ref={scrollAnchorRef} />
          </div>

          <form
            className="tw-input"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSend();
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t(language, 'input.placeholder')}
              aria-label={t(language, 'input.placeholder')}
              disabled={isSending}
            />
            <button type="submit" disabled={!input.trim() || isSending}>
              {t(language, 'input.send')}
            </button>
          </form>

          {error ? <p className="tw-error">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
