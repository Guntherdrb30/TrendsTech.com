 'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function RequestInstallation({ tenants }: { tenants: { id: string; name: string }[] }) {
 const router = useRouter(); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
 return <form className="space-y-3 rounded-xl border p-4" onSubmit={async e => {
  e.preventDefault(); const form = e.currentTarget; const f = new FormData(form); setBusy(true);
  try { const response = await fetch('/api/luna-ai-control/installations', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.fromEntries(f)) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setMessage('Solicitud registrada. Requiere aprobación ROOT.'); form.reset(); router.refresh(); } catch(e) { setMessage(e instanceof Error ? e.message : 'Error'); } finally { setBusy(false); }
 }}>
 <h2 className="text-xl font-semibold">Registrar instalación</h2><div className="flex flex-wrap gap-3">
 <label>Organización<select name="tenantId" required className="block rounded border p-2">{tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
 <label>Nombre<input name="name" required minLength={2} maxLength={120} className="block rounded border p-2" /></label>
 <label>Aplicación<input name="applicationKey" required pattern="[a-z0-9][a-z0-9-]{1,63}" className="block rounded border p-2" /></label>
 <label>Entorno<select name="environment" className="block rounded border p-2"><option>preview</option><option>development</option><option>production</option></select></label>
 </div><button disabled={busy || tenants.length === 0} className="rounded border px-3 py-2">Crear solicitud</button><p role="status">{message}</p></form>;
}
