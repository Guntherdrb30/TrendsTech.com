'use client';

import { useMemo, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';

type AgentRunnerProps = {
  agentInstanceId: string;
};

function createSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `session_${Math.random().toString(36).slice(2)}`;
}

export function AgentRunner({ agentInstanceId }: AgentRunnerProps) {
  const sessionId = useMemo(createSessionId, []);
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submitMessage = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setReply(null);

    startTransition(async () => {
      const response = await fetch('/api/orchestrator/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentInstanceId,
          sessionId,
          message,
          channel: 'dashboard'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error ?? 'No response from orchestrator.');
        return;
      }

      setReply(data?.reply ?? '');
      setMessage('');
    });
  };

  return (
    <form onSubmit={submitMessage} className="space-y-3">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="agentMessage">
          Probar con IA real
        </label>
        <textarea
          id="agentMessage"
          className="min-h-[120px] w-full rounded border border-slate-200 bg-white p-3 text-sm shadow-sm focus:outline-none dark:border-slate-700 dark:bg-slate-900"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Escribe un mensaje de prueba..."
          required
        />
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {reply ? (
        <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-950">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Respuesta</p>
          <p className="mt-2 whitespace-pre-wrap">{reply}</p>
        </div>
      ) : null}
      <Button type="submit" disabled={isPending || message.trim().length === 0}>
        {isPending ? 'Enviando...' : 'Enviar'}
      </Button>
    </form>
  );
}
