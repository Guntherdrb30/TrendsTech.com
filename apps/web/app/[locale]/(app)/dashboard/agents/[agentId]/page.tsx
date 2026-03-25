import Link from 'next/link';
import { prisma } from '@trends172tech/db';
import { TOOL_NAMES } from '@trends172tech/openai';
import { requireAuth } from '@/lib/auth/guards';
import { resolveTenantFromUser } from '@/lib/tenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AgentRunner } from './agent-runner';
import { KnowledgeManager } from './knowledge-manager';
import { AgentAccessManager } from './agent-access-client';

export const dynamic = 'force-dynamic';

type PageParams = {
  locale: string;
  agentId: string;
};

function getMetaString(meta: unknown, key: string) {
  if (!meta || typeof meta !== 'object') {
    return null;
  }
  const value = (meta as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : null;
}

function getMetaNumber(meta: unknown, key: string) {
  if (!meta || typeof meta !== 'object') {
    return null;
  }
  const value = (meta as Record<string, unknown>)[key];
  return typeof value === 'number' ? value : null;
}

export default async function AgentDetailPage({ params }: { params: Promise<PageParams> }) {
  const { locale, agentId } = await params;
  const user = await requireAuth();
  const tenant = await resolveTenantFromUser(user);

  if (!tenant) {
    return (
      <section className="space-y-6">
        <div className="interactive-panel premium-noise overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-7 shadow-[0_35px_100px_-72px_rgba(15,23,42,0.35)] sm:px-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">Agent detail</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">No tenant assigned.</p>
          </div>
        </div>
      </section>
    );
  }

  const agentInstance = await prisma.agentInstance.findFirst({
    where: { id: agentId, tenantId: tenant.id },
    include: { endCustomer: true }
  });

  if (!agentInstance) {
    return (
      <section className="space-y-6">
        <div className="interactive-panel premium-noise overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-7 shadow-[0_35px_100px_-72px_rgba(15,23,42,0.35)] sm:px-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">Agent detail</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Agent instance not found.</p>
          </div>
        </div>
        <Link
          className="interactive-chip inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
          href={`/${locale}/dashboard`}
        >
          Back to dashboard
        </Link>
      </section>
    );
  }

  const subscription = await prisma.subscription.findFirst({
    where: { tenantId: tenant.id, status: 'ACTIVE' },
    orderBy: { startedAt: 'desc' },
    include: { plan: true }
  });

  const limits = (subscription?.plan?.limitsJson ?? {}) as {
    allowedTools?: string[];
  };

  const activeTools =
    limits.allowedTools && limits.allowedTools.length > 0 ? limits.allowedTools : TOOL_NAMES;

  const [conversations, agentAccesses] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        tenantId: tenant.id,
        action: 'openai_message',
        entity: 'agent_instance',
        entityId: agentInstance.id
      },
      orderBy: { createdAt: 'desc' },
      take: 6
    }),
    prisma.agentAccess.findMany({
      where: { tenantId: tenant.id, agentId: agentInstance.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        agentId: true,
        name: true,
        allowedDomains: true,
        isActive: true,
        maxTokensPerMonth: true
      }
    })
  ]);

  return (
    <section className="space-y-6">
      <div className="interactive-panel premium-noise overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-7 shadow-[0_35px_100px_-72px_rgba(15,23,42,0.35)] sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Agent workspace
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">Agent detail</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {agentInstance.name} | {agentInstance.baseAgentKey} | {agentInstance.status}
              </p>
            </div>
          </div>
          <Link
            className="interactive-chip inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
            href={`/${locale}/dashboard`}
          >
            Back to dashboard
          </Link>
        </div>
      </div>

      <Card className="interactive-panel">
        <CardHeader>
          <CardTitle>Base agent y contexto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Base agent asignado: <span className="font-medium">{agentInstance.baseAgentKey}</span>
          </p>
          <p>Idioma: {agentInstance.languageDefault}</p>
          <p>Tenant: {tenant.name}</p>
          <p>Plan activo: {subscription?.plan?.key ?? 'None'}</p>
          <p>End customer: {agentInstance.endCustomer?.name ?? 'N/A'}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="interactive-panel">
          <CardHeader>
            <CardTitle>Tools activas</CardTitle>
          </CardHeader>
          <CardContent>
            {activeTools.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No tools configured.</p>
            ) : (
              <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {activeTools.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="interactive-panel">
          <CardHeader>
            <CardTitle>Probar con IA real</CardTitle>
          </CardHeader>
          <CardContent>
            <AgentRunner agentInstanceId={agentInstance.id} />
          </CardContent>
        </Card>
      </div>

      <Card className="interactive-panel">
        <CardHeader>
          <CardTitle>Ultimas conversaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No conversations yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Respuesta</TableHead>
                  <TableHead>Tool calls</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversations.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                      {log.createdAt.toISOString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {getMetaString(log.metaJson, 'userMessage') ?? '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {getMetaString(log.metaJson, 'reply') ?? '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {getMetaNumber(log.metaJson, 'toolCalls') ?? 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="interactive-panel">
        <CardHeader>
          <CardTitle>Canales</CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            className="interactive-chip inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
            href={`/${locale}/dashboard/agents/${agentInstance.id}/channels`}
          >
            Configurar canales (WhatsApp)
          </Link>
        </CardContent>
      </Card>

      <Card className="interactive-panel">
        <CardHeader>
          <CardTitle>Agent Access</CardTitle>
        </CardHeader>
        <CardContent>
          <AgentAccessManager
            agentAccesses={agentAccesses}
            agentInstanceId={agentInstance.id}
            agentName={agentInstance.name}
          />
        </CardContent>
      </Card>

      <KnowledgeManager agentInstanceId={agentInstance.id} />

      <Link
        className="interactive-chip inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
        href={`/${locale}/dashboard`}
      >
        Back to dashboard
      </Link>
    </section>
  );
}
