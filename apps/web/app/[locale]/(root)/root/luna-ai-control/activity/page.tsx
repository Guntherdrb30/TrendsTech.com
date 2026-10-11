import Link from 'next/link';
import { prisma } from '@trends172tech/db';
import { requireRole } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

export default async function LunaActivityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireRole('ROOT');
  const [events, total] = await Promise.all([
    prisma.aiControlUsageEvent.findMany({
      orderBy: { startedAt: 'desc' }, take: 250,
      include: { installation: { select: { name: true, applicationKey: true } } },
    }),
    prisma.aiControlUsageEvent.count(),
  ]);
  const byDay = new Map<string, { day: string; requests: number; tools: number; api: number; errors: number; tokens: number }>();
  for (const e of events) {
    const day = e.startedAt.toISOString().slice(0, 10);
    let row = byDay.get(day);
    if (!row) { row = { day, requests: 0, tools: 0, api: 0, errors: 0, tokens: 0 }; byDay.set(day, row); }
    if (e.module === 'request') row.requests++;
    if (e.module === 'tool_call') row.tools++;
    if (e.module === 'api_call') row.api++;
    if (e.status === 'error') row.errors++;
    row.tokens += (e.inputTokens ?? 0) + (e.outputTokens ?? 0);
  }
  return <main className="space-y-6">
    <Link href={`/${locale}/root/luna-ai-control`} className="text-sm underline">← LUNA AI Control Center</Link>
    <header className="space-y-2">
      <h1 className="text-3xl font-semibold">Actividad e historial LUNA</h1>
      <p className="text-sm text-muted-foreground">Eventos persistidos por instalaciones autorizadas. Vista exclusiva ROOT.</p>
      <p className="text-sm">Eventos totales: <strong>{total}</strong> · Mostrando los últimos {events.length} eventos</p>
      <p className="text-xs text-muted-foreground">El resumen diario corresponde únicamente a los eventos mostrados, no a todo el historial. Los costos monetarios todavía no se registran.</p>
    </header>
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Resumen diario</h2>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th className="p-3">Día (UTC)</th><th className="p-3">Solicitudes</th><th className="p-3">Herramientas</th><th className="p-3">APIs</th><th className="p-3">Errores</th><th className="p-3">Tokens</th></tr></thead>
          <tbody>{[...byDay.values()].map(row => <tr key={row.day} className="border-b"><td className="p-3">{row.day}</td><td className="p-3">{row.requests}</td><td className="p-3">{row.tools}</td><td className="p-3">{row.api}</td><td className="p-3">{row.errors}</td><td className="p-3">{row.tokens}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Últimos eventos</h2>
      {events.length === 0 && <p className="rounded-xl border p-4 text-sm">Todavía no se han recibido eventos de instalaciones.</p>}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th className="p-3">Fecha (UTC)</th><th className="p-3">Instalación</th><th className="p-3">Módulo / acción</th><th className="p-3">Proveedor</th><th className="p-3">Estado</th><th className="p-3">Tokens</th></tr></thead>
          <tbody>{events.map(e => <tr key={e.id} className="border-b"><td className="p-3 whitespace-nowrap">{e.startedAt.toISOString().replace('T', ' ').slice(0, 19)}</td><td className="p-3">{e.installation.name}</td><td className="p-3">{e.module} / {e.action}</td><td className="p-3">{e.provider}</td><td className="p-3">{e.status}</td><td className="p-3">{(e.inputTokens ?? 0) + (e.outputTokens ?? 0)}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  </main>;
}
