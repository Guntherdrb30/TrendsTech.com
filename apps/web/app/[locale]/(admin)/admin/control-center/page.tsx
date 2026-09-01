import { prisma } from '@trends172tech/db';
import { MetricCard } from '@/components/admin/metric-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { requireRole } from '@/lib/auth/guards';

type ControlCenterData = Awaited<ReturnType<typeof loadControlCenterData>>;

async function loadControlCenterData() {
  try {
    const [products, runCount, usage] = await Promise.all([
      prisma.controlProduct.findMany({
        orderBy: { name: 'asc' },
        include: {
          implementations: {
            orderBy: { name: 'asc' },
            include: {
              _count: { select: { agentInstances: true, agentRuns: true } }
            }
          },
          agentTemplates: {
            include: { _count: { select: { versions: true } } }
          }
        }
      }),
      prisma.controlAgentRun.count(),
      prisma.controlAgentUsageRecord.aggregate({
        _sum: { inputTokens: true, outputTokens: true, cachedTokens: true, costUsdMicros: true, gpuMillis: true }
      })
    ]);
    return { available: true as const, products, runCount, usage: usage._sum };
  } catch {
    return { available: false as const, products: [], runCount: 0, usage: null };
  }
}

function statusTone(status: string) {
  if (status === 'ACTIVE' || status === 'SUCCEEDED') return 'success' as const;
  if (status === 'SHADOW' || status === 'PLANNING') return 'info' as const;
  if (status === 'PAUSED' || status === 'SUSPENDED') return 'warning' as const;
  if (status === 'RETIRED' || status === 'FAILED') return 'danger' as const;
  return 'neutral' as const;
}

function integer(value: number | null | undefined) {
  return Number(value ?? 0).toLocaleString('en-US');
}

function cost(value: number | null | undefined) {
  return `$${(Number(value ?? 0) / 1_000_000).toFixed(4)}`;
}

export default async function ControlCenterPage({ params }: { params: Promise<{ locale: string }> }) {
  await requireRole('ROOT');
  const { locale } = await params;
  const es = locale.startsWith('es');
  const data: ControlCenterData = await loadControlCenterData();
  const implementations = data.products.flatMap((product) => product.implementations);
  const templates = data.products.reduce((sum, product) => sum + product.agentTemplates.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Trends172Tech Agent Infrastructure</p>
          <h2 className="mt-1 text-2xl font-semibold">{es ? 'Control Center de agentes' : 'Agent Control Center'}</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
            {es
              ? 'Gobierno central de productos, implementaciones, agentes, ejecuciones, consumo y capacidad GPU.'
              : 'Central governance for products, implementations, agents, runs, usage, and GPU capacity.'}
          </p>
        </div>
        <StatusBadge label={data.available ? (es ? 'Datos conectados' : 'Data connected') : (es ? 'Migración pendiente' : 'Migration pending')} tone={data.available ? 'success' : 'warning'} />
      </div>

      {!data.available ? (
        <div className="rounded-[22px] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <p className="font-semibold">{es ? 'El panel está listo; la base aún no tiene el contrato V1.' : 'The panel is ready; the database does not have contract V1 yet.'}</p>
          <p className="mt-1">{es ? 'Se mostrará información real después de validar la migración y ejecutar el bootstrap en staging.' : 'Real data will appear after validating the migration and running the bootstrap in staging.'}</p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label={es ? 'Productos gobernados' : 'Governed products'} value={String(data.products.length)} />
        <MetricCard label={es ? 'Implementaciones' : 'Implementations'} value={String(implementations.length)} accent="cyan" />
        <MetricCard label={es ? 'Plantillas de agentes' : 'Agent templates'} value={String(templates)} accent="emerald" />
        <MetricCard label={es ? 'Ejecuciones observadas' : 'Observed runs'} value={integer(data.runCount)} accent="amber" />
        <MetricCard label={es ? 'Costo estimado' : 'Estimated cost'} value={cost(data.usage?.costUsdMicros)} detail={`${integer(data.usage?.gpuMillis)} GPU ms`} />
      </div>

      <section className="overflow-hidden rounded-[24px] border border-black/8 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-black/8 px-5 py-4 dark:border-slate-800">
          <h3 className="font-semibold">{es ? 'Productos e implementaciones' : 'Products and implementations'}</h3>
          <p className="mt-1 text-xs text-slate-500">{es ? 'La clasificación evita mezclar LUNA con LUNA Fútbol o LUNA Medical.' : 'Classification prevents mixing LUNA with LUNA Football or LUNA Medical.'}</p>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.products.length === 0 ? <p className="p-5 text-sm text-slate-500">{es ? 'Sin productos registrados.' : 'No registered products.'}</p> : null}
          {data.products.map((product) => (
            <div key={product.id} className="grid gap-4 p-5 lg:grid-cols-[260px_1fr]">
              <div>
                <div className="flex items-center gap-2"><p className="font-semibold">{product.name}</p><StatusBadge label={product.status} tone={statusTone(product.status)} /></div>
                <p className="mt-1 text-xs text-slate-500">{product.key} · {product.agentTemplates.length} {es ? 'plantillas' : 'templates'}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {product.implementations.length === 0 ? <p className="text-sm text-slate-500">{es ? 'Sin implementaciones.' : 'No implementations.'}</p> : null}
                {product.implementations.map((implementation) => (
                  <article key={implementation.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{implementation.name}</p>
                      <StatusBadge label={implementation.status} tone={statusTone(implementation.status)} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{implementation.key} · {implementation.kind} · {implementation.environment}</p>
                    <div className="mt-3 flex gap-4 text-xs text-slate-600 dark:text-slate-300">
                      <span>{implementation._count.agentInstances} {es ? 'agentes' : 'agents'}</span>
                      <span>{implementation._count.agentRuns} runs</span>
                      <span>{implementation.shadowMode ? 'Shadow mode' : 'Control activo'}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-cyan-200 bg-cyan-50 p-5 dark:border-cyan-900 dark:bg-cyan-950/30">
        <h3 className="font-semibold text-cyan-950 dark:text-cyan-100">OpenAI + NVIDIA readiness</h3>
        <p className="mt-1 text-sm text-cyan-900/80 dark:text-cyan-200/80">
          {es
            ? 'Este panel conservará evidencia verificable de modelos, skills, políticas, consumo, GPU y casos productivos. No implica que exista todavía una alianza aprobada.'
            : 'This panel will retain verifiable evidence for models, skills, policies, usage, GPU, and production cases. It does not imply an approved partnership.'}
        </p>
      </section>
    </div>
  );
}
