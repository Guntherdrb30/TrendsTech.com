"use client";

import { useCallback, useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type KnowledgeSource = {
  id: string;
  type: 'URL' | 'PDF' | 'TEXT';
  title: string | null;
  url: string | null;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';
  updatedAt: string;
  logs?: KnowledgeLog[];
};

type KnowledgeLog = {
  message: string | null;
  progress: number | null;
  status: string | null;
  stage: string | null;
  createdAt: string;
};

type KnowledgeManagerProps = {
  agentInstanceId: string;
};

export function KnowledgeManager({ agentInstanceId }: KnowledgeManagerProps) {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [urlValue, setUrlValue] = useState('');
  const [textValue, setTextValue] = useState('');
  const [titleValue, setTitleValue] = useState('');
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const loadSources = useCallback(async () => {
    const response = await fetch(`/api/knowledge-sources?agentInstanceId=${agentInstanceId}`);
    if (!response.ok) {
      return;
    }
    const result = await response.json();
    setSources(result.data ?? []);
  }, [agentInstanceId]);

  useEffect(() => {
    loadSources();
  }, [loadSources]);

  useEffect(() => {
    const hasPending = sources.some((source) => source.status === 'PENDING' || source.status === 'PROCESSING');
    if (!hasPending) {
      return;
    }
    const interval = setInterval(() => {
      loadSources();
    }, 5000);
    return () => clearInterval(interval);
  }, [sources, loadSources]);

  const handleUrlSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch('/api/knowledge-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentInstanceId,
          type: 'URL',
          title: titleValue || undefined,
          url: urlValue
        })
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error ?? 'Failed to ingest URL.');
        return;
      }

      setUrlValue('');
      setTitleValue('');
      await loadSources();
    });
  };

  const handleTextSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch('/api/knowledge-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentInstanceId,
          type: 'TEXT',
          title: titleValue || undefined,
          rawText: textValue
        })
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error ?? 'Failed to ingest text.');
        return;
      }

      setTextValue('');
      setTitleValue('');
      await loadSources();
    });
  };

  const handlePdfSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!pdfFile) {
      setError('Select a PDF file.');
      return;
    }

    startTransition(async () => {
      const data = new FormData();
      data.append('agentInstanceId', agentInstanceId);
      data.append('file', pdfFile);
      if (pdfTitle) {
        data.append('title', pdfTitle);
      }

      const response = await fetch('/api/knowledge-sources', {
        method: 'POST',
        body: data
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error ?? 'Failed to ingest PDF.');
        return;
      }

      setPdfFile(null);
      setPdfTitle('');
      await loadSources();
    });
  };

  const handleReindex = (sourceId: string) => {
    setError(null);
    startTransition(async () => {
      const response = await fetch(`/api/knowledge-sources/${sourceId}/reindex`, {
        method: 'POST'
      });
      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error ?? 'Failed to reindex source.');
        return;
      }
      await loadSources();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conocimiento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleUrlSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="kbUrl">URL</Label>
            <Input
              id="kbUrl"
              value={urlValue}
              onChange={(event) => setUrlValue(event.target.value)}
              placeholder="https://empresa.com/servicios"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kbUrlTitle">Titulo (opcional)</Label>
            <Input
              id="kbUrlTitle"
              value={titleValue}
              onChange={(event) => setTitleValue(event.target.value)}
              placeholder="Servicios"
            />
          </div>
          <Button type="submit" disabled={isPending}>
            Ingestar URL
          </Button>
        </form>

        <form onSubmit={handleTextSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="kbText">Texto libre</Label>
            <textarea
              id="kbText"
              className="min-h-[120px] w-full rounded border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={textValue}
              onChange={(event) => setTextValue(event.target.value)}
              placeholder="Pegue aqui SOPs o descripcion del negocio."
              required
            />
          </div>
          <Button type="submit" disabled={isPending}>
            Ingestar texto
          </Button>
        </form>

        <form onSubmit={handlePdfSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="kbPdf">PDF</Label>
            <Input
              id="kbPdf"
              type="file"
              accept="application/pdf"
              onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kbPdfTitle">Titulo (opcional)</Label>
            <Input
              id="kbPdfTitle"
              value={pdfTitle}
              onChange={(event) => setPdfTitle(event.target.value)}
              placeholder="Catalogo"
            />
          </div>
          <Button type="submit" disabled={isPending}>
            Ingestar PDF
          </Button>
        </form>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">Fuentes</h3>
          {sources.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No hay fuentes todavia.</p>
          ) : (
            <div className="space-y-2">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="flex flex-col gap-2 rounded border border-slate-200 p-3 text-sm dark:border-slate-700 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {source.title ?? source.url ?? source.type} ({source.type})
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {source.status} - {new Date(source.updatedAt).toLocaleString()}
                    </p>
                    {source.logs && source.logs.length > 0 ? (
                      <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                        {source.logs.map((log, index) => {
                          const progress =
                            typeof log.progress === 'number' ? Math.min(Math.max(log.progress, 0), 100) : null;
                          const isLatest = index === 0;
                          return (
                            <div key={`${source.id}-log-${index}`} className="space-y-1">
                              <p>
                                {new Date(log.createdAt).toLocaleTimeString()} - {log.message ?? log.status ?? 'Log'}
                              </p>
                              {isLatest && progress !== null ? (
                                <div className="h-2 w-full rounded bg-slate-200 dark:bg-slate-800">
                                  <div
                                    className="h-2 rounded bg-emerald-500"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleReindex(source.id)}
                  >
                    Reindexar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
