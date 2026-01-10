'use client';

import { useMemo, useRef } from 'react';
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import type { SupportedLocale } from '@openai/chatkit';

type AgentChatProps = {
  agentKey: string;
  locale: string;
  workflowId?: string | null;
  placeholder: string;
  unavailableMessage: string;
};

const THREAD_STORAGE_PREFIX = 'agentChatThread:';

function normalizeLocale(locale: string): SupportedLocale | undefined {
  if (locale.startsWith('es')) {
    return 'es';
  }
  if (locale.startsWith('en')) {
    return 'en';
  }
  return undefined;
}

function getStoredThreadId(storageKey: string) {
  if (typeof window === 'undefined') {
    return null;
  }
  const stored = window.localStorage.getItem(storageKey);
  return stored && stored.trim() ? stored : null;
}

function persistThreadId(storageKey: string, threadId: string | null) {
  if (typeof window === 'undefined') {
    return;
  }
  if (!threadId) {
    window.localStorage.removeItem(storageKey);
    return;
  }
  window.localStorage.setItem(storageKey, threadId);
}

function createClientSecretFetcher(endpoint: string, workflowId: string) {
  return async (currentSecret: string | null) => {
    if (currentSecret) {
      return currentSecret;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId })
    });
    const payload = (await response.json().catch(() => ({}))) as {
      client_secret?: string;
      error?: string;
    };

    if (!response.ok) {
      throw new Error(payload.error ?? 'Failed to create session');
    }
    if (!payload.client_secret) {
      throw new Error('Missing client secret in response');
    }
    return payload.client_secret;
  };
}

export function AgentChat({
  agentKey,
  locale,
  workflowId,
  placeholder,
  unavailableMessage
}: AgentChatProps) {
  const storageKey = `${THREAD_STORAGE_PREFIX}${agentKey}`;
  const initialThread = useMemo(() => getStoredThreadId(storageKey), [storageKey]);
  const threadIdRef = useRef<string | null>(initialThread);
  const chatLocale = useMemo(() => normalizeLocale(locale), [locale]);

  if (!workflowId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
        {unavailableMessage}
      </div>
    );
  }

  const getClientSecret = useMemo(
    () => createClientSecretFetcher('/api/chatkit/session', workflowId),
    [workflowId]
  );

  const chatkit = useChatKit({
    api: { getClientSecret },
    locale: chatLocale,
    initialThread,
    header: { enabled: false },
    history: { enabled: false },
    composer: { placeholder },
    onThreadChange: ({ threadId }) => {
      const resolved = threadId ?? null;
      threadIdRef.current = resolved;
      persistThreadId(storageKey, resolved);
    }
  });

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
      <ChatKit control={chatkit.control} className="h-[55vh] min-h-[420px] w-full" />
    </div>
  );
}
