import Link from 'next/link';
import { prisma } from '@trends172tech/db';
import { requireTenant } from '@/lib/auth/guards';
import { USD_MICROS_PER_DOLLAR } from '@/lib/billing/pricing';

export const dynamic = 'force-dynamic';

function formatUsd(micros: number) {
  return (micros / USD_MICROS_PER_DOLLAR).toFixed(2);
}

function formatPercent(used: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

export default async function SpendingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isEs = locale.startsWith('es');
  const user = await requireTenant();
  const tenantId = user.tenantId!;

  const [wallet, usageLogs, agents] = await Promise.all([
    prisma.tokenWallet.findUnique({ where: { tenantId } }),
    prisma.tokenUsageLog.findMany({
      where: { tenantId, billedAt: { not: null } },
      orderBy: { billedAt: 'desc' },
      take: 100,
      include: { agentInstance: { select: { name: true } } },
    }),
    prisma.agentInstance.findMany({
      where: { tenantId, status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        skills: { select: { skill: { select: { name: true, nameEn: true, icon: true } } } },
      },
    }),
  ]);

  const balanceMicros = wallet?.balance ?? 0;

  // Gasto total cobrado (con markup)
  const totalSpentMicros = usageLogs.reduce((s, l) => s + (l.costUsdMicros ?? 0), 0);

  // Gasto por agente
  const byAgent: Record<string, { name: string; spentMicros: number; calls: number }> = {};
  for (const log of usageLogs) {
    const key = log.agentInstanceId;
    if (!byAgent[key]) {
      byAgent[key] = { name: log.agentInstance?.name ?? 'Agente', spentMicros: 0, calls: 0 };
    }
    byAgent[key].spentMicros += log.costUsdMicros ?? 0;
    byAgent[key].calls += 1;
  }

  // Gasto últimos 30 días agrupado por día
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentLogs = usageLogs.filter((l) => l.billedAt && l.billedAt >= thirtyDaysAgo);
  const dailyMap: Record<string, number> = {};
  for (const log of recentLogs) {
    if (!log.billedAt) continue;
    const day = log.billedAt.toISOString().slice(0, 10);
    dailyMap[day] = (dailyMap[day] ?? 0) + (log.costUsdMicros ?? 0);
  }
  const dailyEntries = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14);

  const maxDayMicros = Math.max(...dailyEntries.map(([, v]) => v), 1);

  const totalSkills = agents.reduce((s, a) => s + a.skills.length, 0);
  const creditPoolMicros = totalSkills * 10 * USD_MICROS_PER_DOLLAR;

  const c = isEs
    ? {
        title: 'Control de Gastos',
        subtitle: 'Monitorea el consumo de IA de tus agentes y gestiona tus créditos.',
        balanceLabel: 'Créditos disponibles',
        spentLabel: 'Consumido (con markup)',
        poolLabel: 'Crédito total activo',
        rechargeBtn: 'Recargar créditos',
        agentsTitle: 'Consumo por agente',
        chartTitle: 'Consumo diario — últimos 14 días',
        howTitle: '¿Cómo funciona?',
        howItems: [
          'Cada skill contratada carga $10 USD en créditos.',
          'Cada llamada a IA descuenta el costo de OpenAI con 50% de markup (si OpenAI cobra $1, se descuentan $1.50).',
          'Cuando el crédito llega a $0, el agente pausa y solicita recarga.',
          'Si el consumo mensual no supera los $10 por skill, ese es el costo mínimo.',
        ],
        noUsage: 'Aún no hay consumo registrado.',
        calls: 'llamadas',
      }
    : {
        title: 'Spending Control',
        subtitle: 'Monitor AI usage from your agents and manage your credits.',
        balanceLabel: 'Available credits',
        spentLabel: 'Consumed (with markup)',
        poolLabel: 'Total active credit',
        rechargeBtn: 'Add credits',
        agentsTitle: 'Consumption by agent',
        chartTitle: 'Daily consumption — last 14 days',
        howTitle: 'How it works',
        howItems: [
          'Each contracted skill loads $10 USD in credits.',
          'Each AI call deducts the OpenAI cost with a 50% markup (if OpenAI charges $1, $1.50 is deducted).',
          'When credits reach $0, the agent pauses and requests a recharge.',
          'If monthly usage stays below $10 per skill, that is the minimum cost.',
        ],
        noUsage: 'No usage recorded yet.',
        calls: 'calls',
      };

  const usedPercent = formatPercent(totalSpentMicros, creditPoolMicros);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="interactive-panel premium-noise overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-7 shadow-[0_35px_100px_-72px_rgba(15,23,42,0.35)] sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              {isEs ? 'Facturación' : 'Billing'}
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">{c.title}</h1>
            <p className="text-sm text-slate-500">{c.subtitle}</p>
          </div>
          <Link
            href={`/${locale}/recharge`}
            className="inline-flex items-center gap-2 rounded-full bg-[#00bfa5] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(0,191,165,0.5)] transition hover:bg-[#00897b]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            {c.rechargeBtn}
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Balance */}
        <div className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{c.balanceLabel}</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#00897b]">
            ${formatUsd(balanceMicros)}
          </p>
          <p className="mt-1 text-xs text-slate-400">USD</p>
        </div>

        {/* Consumido */}
        <div className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{c.spentLabel}</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
            ${formatUsd(totalSpentMicros)}
          </p>
          <p className="mt-1 text-xs text-slate-400">{usageLogs.length} {c.calls}</p>
        </div>

        {/* Crédito pool */}
        <div className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{c.poolLabel}</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
            ${formatUsd(creditPoolMicros)}
          </p>
          <p className="mt-1 text-xs text-slate-400">{totalSkills} skills × $10</p>
        </div>
      </div>

      {/* Barra de uso */}
      <div className="rounded-[28px] border border-black/8 bg-white px-6 py-5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-700">{isEs ? 'Uso de créditos' : 'Credit usage'}</span>
          <span className="text-slate-500">{usedPercent}%</span>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#00bfa5] transition-all"
            style={{ width: `${usedPercent}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-slate-400">
          <span>${formatUsd(totalSpentMicros)} {isEs ? 'consumido' : 'used'}</span>
          <span>${formatUsd(creditPoolMicros)} {isEs ? 'total' : 'total'}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        {/* Gasto por agente */}
        <div className="rounded-[28px] border border-black/8 bg-white px-6 py-5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
          <h2 className="text-sm font-semibold text-slate-700">{c.agentsTitle}</h2>
          {Object.keys(byAgent).length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">{c.noUsage}</p>
          ) : (
            <div className="mt-4 space-y-3">
              {Object.entries(byAgent)
                .sort(([, a], [, b]) => b.spentMicros - a.spentMicros)
                .map(([id, data]) => {
                  const pct = formatPercent(data.spentMicros, totalSpentMicros);
                  return (
                    <div key={id}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="max-w-[60%] truncate font-medium text-slate-700">{data.name}</span>
                        <span className="text-slate-500">
                          ${formatUsd(data.spentMicros)} · {data.calls} {c.calls}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#00bfa5]/70"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Mini chart diario */}
        <div className="rounded-[28px] border border-black/8 bg-white px-6 py-5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
          <h2 className="text-sm font-semibold text-slate-700">{c.chartTitle}</h2>
          {dailyEntries.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">{c.noUsage}</p>
          ) : (
            <div className="mt-4 flex h-28 items-end gap-1">
              {dailyEntries.map(([day, micros]) => {
                const heightPct = Math.max(4, Math.round((micros / maxDayMicros) * 100));
                const label = day.slice(5); // MM-DD
                return (
                  <div key={day} className="group relative flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md bg-[#00bfa5]/70 transition-all group-hover:bg-[#00bfa5]"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[9px] text-slate-400">{label}</span>
                    {/* Tooltip */}
                    <div className="pointer-events-none absolute bottom-full mb-1 hidden rounded-lg bg-slate-900 px-2 py-1 text-[10px] text-white group-hover:block">
                      ${formatUsd(micros)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cómo funciona */}
      <div className="rounded-[28px] border border-[#00bfa5]/20 bg-[#f0fdf9] px-6 py-5">
        <h2 className="text-sm font-semibold text-[#00897b]">{c.howTitle}</h2>
        <ul className="mt-3 space-y-2">
          {c.howItems.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00bfa5] text-[10px] font-bold text-white">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
