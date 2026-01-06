import Link from 'next/link';
import { prisma } from '@trends172tech/db';
import { TOOL_NAMES } from '@trends172tech/openai';
import { requireAuth } from '@/lib/auth/guards';
import { resolveTenantFromUser } from '@/lib/tenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AgentRunner } from './agent-runner';
import { KnowledgeManager } from './knowledge-manager';

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
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Agent detail</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">No tenant assigned.</p>
      </section>
    );
  }

  const agentInstance = await prisma.agentInstance.findFirst({
    where: { id: agentId, tenantId: tenant.id },
    include: { endCustomer: true }
  });

  if (!agentInstance) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Agent detail</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Agent instance not found.</p>
        <Link className="text-sm text-blue-600 hover:underline" href={`/${locale}/dashboard`}>
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

  const conversations = await prisma.auditLog.findMany({
    where: {
      tenantId: tenant.id,
      action: 'openai_message',
      entity: 'agent_instance',
      entityId: agentInstance.id
    },
    orderBy: { createdAt: 'desc' },
    take: 6
  });

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Agent detail</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {agentInstance.name} | {agentInstance.baseAgentKey} | {agentInstance.status}
        </p>
      </div>

      <Card>
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
        <Card>
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

        <Card>
          <CardHeader>
            <CardTitle>Probar con IA real</CardTitle>
          </CardHeader>
          <CardContent>
            <AgentRunner agentInstanceId={agentInstance.id} />
          </CardContent>
        </Card>
      </div>

      <Card>
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

      <KnowledgeManager agentInstanceId={agentInstance.id} />

      <Link className="text-sm text-blue-600 hover:underline" href={`/${locale}/dashboard`}>
        Back to dashboard
      </Link>
    </section>
  );
}
