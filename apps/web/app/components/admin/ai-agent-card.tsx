import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AiAgent } from '@/lib/admin-ai/types';
import { getLocalizedValue } from '@/lib/admin-ai/mock-data';
import { StatusBadge, getFinanceStatusTone } from './status-badge';

type AiAgentCardProps = {
  agent: AiAgent;
  locale: string;
  statusLabel: string;
  assignedLabel: string;
  successLabel: string;
  costLabel: string;
};

export function AiAgentCard({ agent, locale, statusLabel, assignedLabel, successLabel, costLabel }: AiAgentCardProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{agent.name}</CardTitle>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{getLocalizedValue(agent.role, locale)}</p>
          </div>
          <StatusBadge label={`${statusLabel}: ${agent.status}`} tone={getFinanceStatusTone(agent.status)} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-3">
        <div>
          <div className="text-xs uppercase text-slate-400">{assignedLabel}</div>
          <div className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{agent.assignedTasks}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-slate-400">{successLabel}</div>
          <div className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{agent.successRate}%</div>
        </div>
        <div>
          <div className="text-xs uppercase text-slate-400">{costLabel}</div>
          <div className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">${agent.monthlyCost}</div>
        </div>
      </CardContent>
    </Card>
  );
}
