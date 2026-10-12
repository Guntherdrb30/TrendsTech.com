 'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
type Credential = { id: string; keyPrefix: string; revokedAt: boolean };
export default function InstallationControls({ id, credentials, policy }: { id: string; credentials: Credential[]; policy: { enabled: boolean; allowedAgents: string[]; requestsPerMinute: number; maxConcurrent: number } | null }) {
  const router = useRouter();
  const [secret, setSecret] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function send(path: string, body?: object) {
    setBusy(true); setMessage(''); setSecret('');
    try {
      const response = await fetch(`/api/luna-ai-control/installations/${id}/${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body ?? {}) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error de solicitud');
      if (result.credential) setSecret(result.credential);
      setMessage('Cambio registrado.'); router.refresh();
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Error'); }
    finally { setBusy(false); }
  }
  return <section className="space-y-3 border-t pt-3">
    <button disabled={busy} onClick={() => send('credentials')} className="rounded border px-3 py-2">Emitir nueva credencial</button>
    {secret && <div className="space-y-2 rounded border p-3"><p>Credencial mostrada una sola vez. Configúrala como variable privada del servidor.</p><input aria-label="Credencial privada" readOnly value={secret} type="password" className="w-full rounded border p-2" /><button onClick={() => { void navigator.clipboard.writeText(secret); }}>Copiar credencial</button><button onClick={() => setSecret('')} className="ml-3">Ocultar</button></div>}
    {credentials.map(c => <div key={c.id} className="flex flex-wrap items-center gap-3 text-sm"><span>{c.keyPrefix}… · {c.revokedAt ? 'Revocada' : 'Vigente'}</span>{!c.revokedAt && <button disabled={busy} onClick={() => send(`credentials/${c.id}/revoke`)} className="rounded border px-2 py-1">Revocar</button>}</div>)}
    <form className="flex flex-wrap items-end gap-3" onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); void send('policy', { enabled: f.get('enabled') === 'on', allowedAgents: String(f.get('agents')).split(',').map(x => x.trim()).filter(Boolean), requestsPerMinute: Number(f.get('rate')), maxConcurrent: Number(f.get('concurrency')) }); }}>
      <label className="text-sm"><input type="checkbox" name="enabled" defaultChecked={policy?.enabled} /> Autorizar Gateway</label>
      <label className="text-sm">Agentes permitidos<input name="agents" required defaultValue={policy?.allowedAgents.join(',') ?? ''} placeholder="assistant,analyst" className="block rounded border p-2" /></label>
      <label className="text-sm">Solicitudes/min<input name="rate" type="number" min={1} max={10000} defaultValue={policy?.requestsPerMinute ?? 60} className="block w-24 rounded border p-2" /></label>
      <label className="text-sm">Simultáneas<input name="concurrency" type="number" min={1} max={100} defaultValue={policy?.maxConcurrent ?? 4} className="block w-24 rounded border p-2" /></label>
      <button disabled={busy} className="rounded border px-3 py-2">Guardar política</button>
    </form>
    <p role="status" className="text-sm">{message}</p>
  </section>;
}
