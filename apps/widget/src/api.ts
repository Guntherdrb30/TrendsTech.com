import type { InstallValidationResponse, WidgetLanguage } from './types';

const DEFAULT_TIMEOUT_MS = 12000;
const DEFAULT_RETRIES = 2;

async function fetchWithTimeout(input: RequestInfo, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function requestWithRetry(input: RequestInfo, init: RequestInit, retries = DEFAULT_RETRIES) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetchWithTimeout(input, init, DEFAULT_TIMEOUT_MS);
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
        continue;
      }
      throw lastError;
    }
  }

  throw lastError;
}

export async function validateInstall(params: { installId: string; domain: string; apiBaseUrl: string }) {
  const url = new URL('/api/installs/validate', params.apiBaseUrl);
  url.searchParams.set('installId', params.installId);
  url.searchParams.set('domain', params.domain);

  const response = await requestWithRetry(url.toString(), { method: 'GET' });
  const payload = (await response.json()) as InstallValidationResponse;
  if (!response.ok) {
    return { valid: false, error: payload.error ?? 'Validation failed' } as InstallValidationResponse;
  }
  return payload;
}

export async function sendMessage(params: {
  installId: string;
  sessionId: string;
  message: string;
  language: WidgetLanguage;
  pageUrl: string;
  apiBaseUrl: string;
}) {
  const url = new URL('/api/orchestrator/chat', params.apiBaseUrl);
  const response = await requestWithRetry(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      installId: params.installId,
      sessionId: params.sessionId,
      message: params.message,
      channel: 'web',
      language: params.language,
      pageUrl: params.pageUrl
    })
  });

  const payload = (await response.json()) as { reply?: string; error?: string };
  if (!response.ok || !payload.reply) {
    throw new Error(payload.error ?? 'Request failed');
  }

  return payload.reply;
}
