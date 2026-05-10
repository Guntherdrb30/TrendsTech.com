import { getTranslations } from 'next-intl/server';
import { AiAgentCard } from '@/components/admin/ai-agent-card';
import { AdminDataTable, TableCell, TableRow } from '@/components/admin/admin-data-table';
import { MetricCard } from '@/components/admin/metric-card';
import { StatusBadge, getProjectStatusTone } from '@/components/admin/status-badge';
import { getAdminAgentTasks, getAdminAiAgents, getAdminProjects } from '@/lib/admin-ai/data';
import { getLocalizedValue } from '@/lib/admin-ai/mock-data';

export default async function AdminAiAgentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('admin');
  const [agents, agentTasks, projects] = await Promise.all([
    getAdminAiAgents(),
    getAdminAgentTasks(),
    getAdminProjects()
  ]);
  const agentMap = new Map(agents.map((agent) => [agent.id, agent]));
  const projectMap = new Map(projects.map((project) => [project.id, project]));
  const active = agents.filter((agent) => agent.status === 'ACTIVE').length;
  const monthlyCost = agents.reduce((sum, agent) => sum + agent.monthlyCost, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t('aiAgents.title')}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('aiAgents.subtitle')}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label={t('metrics.aiAgents')} value={String(agents.length)} />
        <MetricCard label={t('metrics.activeAgents')} value={String(active)} accent="emerald" />
        <MetricCard label={t('metrics.agentCosts')} value={`$${monthlyCost.toLocaleString('en-US')}`} accent="amber" />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {agents.map((agent) => (
          <AiAgentCard
            key={agent.id}
            agent={agent}
            locale={locale}
            statusLabel={t('fields.status')}
            assignedLabel={t('fields.assignedTasks')}
            successLabel={t('fields.successRate')}
            costLabel={t('fields.monthlyCost')}
          />
        ))}
      </div>
      <AdminDataTable
        title={t('aiAgents.tasks')}
        columns={[t('fields.task'), t('fields.agent'), t('fields.project'), t('fields.status'), t('fields.priority')]}
        rows={agentTasks}
        emptyLabel={t('empty')}
        renderRow={(task) => (
          <TableRow key={task.id}>
            <TableCell className="font-semibold text-slate-950 dark:text-white">{getLocalizedValue(task.title, locale)}</TableCell>
            <TableCell>{agentMap.get(task.agentId)?.name ?? '-'}</TableCell>
            <TableCell>{projectMap.get(task.projectId)?.name ?? '-'}</TableCell>
            <TableCell>
              <StatusBadge label={t(`status.task.${task.status}`)} tone={getProjectStatusTone(task.status)} />
            </TableCell>
            <TableCell>{t(`status.priority.${task.priority}`)}</TableCell>
          </TableRow>
        )}
      />
    </div>
  );
}
