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
  const isEs = locale.startsWith('es');
  const uiCopy = isEs
    ? {
        pageTitle: 'Detalle del agente',
        noTenant: 'No hay tenant asignado.',
        notFound: 'Instancia de agente no encontrada.',
        backToDashboard: 'Volver al dashboard',
        workspace: 'Espacio del agente',
        contextTitle: 'Agente base y contexto',
        baseAgent: 'Agente base asignado',
        language: 'Idioma',
        tenant: 'Tenant',
        activePlan: 'Plan activo',
        none: 'Ninguno',
        endCustomer: 'Cliente final',
        na: 'N/D',
        activeTools: 'Herramientas activas',
        noTools: 'No hay herramientas configuradas.',
        realAi: 'Probar con IA real',
        recentConversations: 'Ultimas conversaciones',
        noConversations: 'No hay conversaciones todavia.',
        timestamp: 'Fecha',
        message: 'Mensaje',
        reply: 'Respuesta',
        toolCalls: 'Llamadas de herramientas',
        channels: 'Canales',
        configureChannels: 'Configurar canales (WhatsApp)',
        agentAccess: 'Accesos del agente'
      }
    : {
        pageTitle: 'Agent detail',
        noTenant: 'No tenant assigned.',
        notFound: 'Agent instance not found.',
        backToDashboard: 'Back to dashboard',
        workspace: 'Agent workspace',
        contextTitle: 'Base agent and context',
        baseAgent: 'Assigned base agent',
        language: 'Language',
        tenant: 'Tenant',
        activePlan: 'Active plan',
        none: 'None',
        endCustomer: 'End customer',
        na: 'N/A',
        activeTools: 'Active tools',
        noTools: 'No tools configured.',
        realAi: 'Test with real AI',
        recentConversations: 'Recent conversations',
        noConversations: 'No conversations yet.',
        timestamp: 'Timestamp',
        message: 'Message',
        reply: 'Reply',
        toolCalls: 'Tool calls',
        channels: 'Channels',
        configureChannels: 'Configure channels (WhatsApp)',
        agentAccess: 'Agent access'
      };

  const user = await requireAuth();
  const tenant = await resolveTenantFromUser(user);

  if (!tenant) {
    return (
      <section className="space-y-6">
        <div className="interactive-panel premium-noise overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-7 shadow-[0_35px_100px_-72px_rgba(15,23,42,0.35)] sm:px-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">{uiCopy.pageTitle}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{uiCopy.noTenant}</p>
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
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">{uiCopy.pageTitle}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{uiCopy.notFound}</p>
          </div>
        </div>
        <Link
          className="interactive-chip inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
          href={`/${locale}/dashboard`}
        >
          {uiCopy.backToDashboard}
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
              {uiCopy.workspace}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">{uiCopy.pageTitle}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {agentInstance.name} | {agentInstance.baseAgentKey} | {agentInstance.status}
              </p>
            </div>
          </div>
          <Link
            className="interactive-chip inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
            href={`/${locale}/dashboard`}
          >
            {uiCopy.backToDashboard}
          </Link>
        </div>
      </div>

      <Card className="interactive-panel">
        <CardHeader>
          <CardTitle>{uiCopy.contextTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>
            {uiCopy.baseAgent}: <span className="font-medium">{agentInstance.baseAgentKey}</span>
          </p>
          <p>{uiCopy.language}: {agentInstance.languageDefault}</p>
          <p>{uiCopy.tenant}: {tenant.name}</p>
          <p>{uiCopy.activePlan}: {subscription?.plan?.key ?? uiCopy.none}</p>
          <p>{uiCopy.endCustomer}: {agentInstance.endCustomer?.name ?? uiCopy.na}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="interactive-panel">
          <CardHeader>
            <CardTitle>{uiCopy.activeTools}</CardTitle>
          </CardHeader>
          <CardContent>
            {activeTools.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{uiCopy.noTools}</p>
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
            <CardTitle>{uiCopy.realAi}</CardTitle>
          </CardHeader>
          <CardContent>
            <AgentRunner agentInstanceId={agentInstance.id} />
          </CardContent>
        </Card>
      </div>

      <Card className="interactive-panel">
        <CardHeader>
          <CardTitle>{uiCopy.recentConversations}</CardTitle>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{uiCopy.noConversations}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{uiCopy.timestamp}</TableHead>
                  <TableHead>{uiCopy.message}</TableHead>
                  <TableHead>{uiCopy.reply}</TableHead>
                  <TableHead>{uiCopy.toolCalls}</TableHead>
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
          <CardTitle>{uiCopy.channels}</CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            className="interactive-chip inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
            href={`/${locale}/dashboard/agents/${agentInstance.id}/channels`}
          >
            {uiCopy.configureChannels}
          </Link>
        </CardContent>
      </Card>

      <Card className="interactive-panel">
        <CardHeader>
          <CardTitle>{uiCopy.agentAccess}</CardTitle>
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
        {uiCopy.backToDashboard}
      </Link>
    </section>
  );
}
