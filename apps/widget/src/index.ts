import { createRoot, type Root } from 'react-dom/client';
import { WidgetRoot } from './ui';
import { detectLanguage, t } from './i18n';
import type { InstallValidationResponse, WidgetInitOptions, WidgetLanguage } from './types';
import { validateInstall } from './api';

const ROOT_ID = 'trends172tech-widget-root';
const STYLE_ID = 'trends172tech-widget-style';

let root: Root | null = null;
let initialized = false;

function resolveApiBaseUrl(options: WidgetInitOptions) {
  if (options.apiBaseUrl) {
    return options.apiBaseUrl;
  }

  const currentScript = document.currentScript as HTMLScriptElement | null;
  const scriptSrc = currentScript?.src;
  if (scriptSrc) {
    return new URL(scriptSrc).origin;
  }

  const script = document.querySelector('script[src*="widget.js"]') as HTMLScriptElement | null;
  if (script?.src) {
    return new URL(script.src).origin;
  }

  return window.location.origin;
}

function ensureRootContainer() {
  let container = document.getElementById(ROOT_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = ROOT_ID;
    container.setAttribute('data-trends172tech-widget', 'root');
    document.body.appendChild(container);
  }
  return container;
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) {
    return;
  }
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=swap');

#${ROOT_ID} {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2147483646;
  font-family: "Space Grotesk", "Segoe UI", sans-serif;
}

#${ROOT_ID} *, #${ROOT_ID} *::before, #${ROOT_ID} *::after {
  box-sizing: border-box;
  font-family: inherit;
}

#${ROOT_ID} .tw-widget {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

#${ROOT_ID} .tw-bubble {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: linear-gradient(140deg, var(--tw-primary), var(--tw-secondary));
  box-shadow: var(--tw-shadow);
  display: grid;
  place-items: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

#${ROOT_ID} .tw-bubble:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.3);
}

#${ROOT_ID} .tw-bubble-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.18);
}

#${ROOT_ID} .tw-panel {
  width: 360px;
  max-height: 520px;
  border-radius: 20px;
  background: var(--tw-panel);
  color: var(--tw-text);
  border: 1px solid var(--tw-border);
  box-shadow: var(--tw-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

#${ROOT_ID} .tw-header {
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--tw-border);
  background: linear-gradient(160deg, rgba(255,255,255,0.02), transparent);
}

#${ROOT_ID} .tw-header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

#${ROOT_ID} .tw-logo {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  object-fit: cover;
  background: var(--tw-bg);
}

#${ROOT_ID} .tw-logo-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--tw-secondary);
  opacity: 0.9;
}

#${ROOT_ID} .tw-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

#${ROOT_ID} .tw-subtitle {
  margin: 0;
  font-size: 0.75rem;
  color: var(--tw-muted);
}

#${ROOT_ID} .tw-reset {
  border: none;
  background: transparent;
  color: var(--tw-muted);
  font-size: 0.75rem;
  cursor: pointer;
}

#${ROOT_ID} .tw-reset:hover {
  color: var(--tw-primary);
}

#${ROOT_ID} .tw-messages {
  padding: 16px 18px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--tw-bg);
}

#${ROOT_ID} .tw-message {
  padding: 10px 12px;
  border-radius: 14px;
  font-size: 0.85rem;
  line-height: 1.4;
  max-width: 85%;
  white-space: pre-wrap;
}

#${ROOT_ID} .tw-message-user {
  align-self: flex-end;
  background: var(--tw-bubble-user);
  color: var(--tw-bubble-user-text);
}

#${ROOT_ID} .tw-message-agent {
  align-self: flex-start;
  background: var(--tw-bubble-agent);
  color: var(--tw-bubble-agent-text);
}

#${ROOT_ID} .tw-input {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--tw-border);
  background: var(--tw-panel);
}

#${ROOT_ID} .tw-input input {
  flex: 1;
  border-radius: 999px;
  border: 1px solid var(--tw-border);
  background: transparent;
  padding: 10px 14px;
  color: var(--tw-text);
  font-size: 0.85rem;
  outline: none;
}

#${ROOT_ID} .tw-input button {
  border: none;
  border-radius: 999px;
  padding: 10px 16px;
  background: var(--tw-primary);
  color: #fff;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
}

#${ROOT_ID} .tw-input button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

#${ROOT_ID} .tw-error {
  padding: 8px 16px 14px;
  color: #f87171;
  font-size: 0.75rem;
}

@media (max-width: 520px) {
  #${ROOT_ID} {
    right: 12px;
    bottom: 12px;
  }

  #${ROOT_ID} .tw-panel {
    width: min(92vw, 420px);
    max-height: 70vh;
  }
}
`;
  document.head.appendChild(style);
}

function resolveLanguage(options: WidgetInitOptions, validation: InstallValidationResponse): WidgetLanguage {
  if (options.language) {
    return options.language;
  }
  if (validation.language) {
    return validation.language;
  }
  return detectLanguage();
}

export async function init(options: WidgetInitOptions) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  if (initialized) {
    return;
  }
  if (!options?.installId) {
    throw new Error('installId is required');
  }

  initialized = true;
  const apiBaseUrl = resolveApiBaseUrl(options);
  const domain = window.location.host;

  let validation: InstallValidationResponse;
  try {
    validation = await validateInstall({
      installId: options.installId,
      domain,
      apiBaseUrl
    });
  } catch (error) {
    console.error('Widget validation failed', error);
    initialized = false;
    return;
  }

  if (!validation.valid) {
    const fallbackLanguage = validation.language ?? detectLanguage();
    console.warn(t(fallbackLanguage, 'error.invalid'));
    initialized = false;
    return;
  }

  const language = resolveLanguage(options, validation);
  injectStyles();
  const container = ensureRootContainer();
  root = createRoot(container);
  root.render(
    <WidgetRoot
      installId={options.installId}
      language={language}
      theme={options.theme ?? 'system'}
      branding={validation.branding ?? undefined}
      apiBaseUrl={apiBaseUrl}
    />
  );
}

export function destroy() {
  root?.unmount();
  root = null;
  const container = document.getElementById(ROOT_ID);
  container?.remove();
  const style = document.getElementById(STYLE_ID);
  style?.remove();
  initialized = false;
}

export type { WidgetInitOptions };
