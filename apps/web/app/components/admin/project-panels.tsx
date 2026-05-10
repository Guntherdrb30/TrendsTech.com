import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AdminProject } from '@/lib/admin-ai/types';
import { getClientById, getLocalizedValue } from '@/lib/admin-ai/mock-data';
import { MetricCard } from './metric-card';
import { StatusBadge, getFinanceStatusTone, getProjectStatusTone } from './status-badge';
import { AdminDataTable, TableCell, TableRow } from './admin-data-table';

type ProjectPanelProps = {
  project: AdminProject;
  locale: string;
  labels: Record<string, string>;
};

function money(value: number) {
  return `$${value.toLocaleString('en-US')}`;
}

export function ProjectOverview({ project, locale, labels }: ProjectPanelProps) {
  const client = getClientById(project.clientId);

  return (
    <div className="space-y-6">
      <Card className="rounded-lg">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-xl">{project.name}</CardTitle>
              <p className="mt-2 max-w-4xl text-sm text-slate-500 dark:text-slate-400">
                {getLocalizedValue(project.description, locale)}
              </p>
            </div>
            <StatusBadge label={labels[`projectStatus.${project.status}`] ?? project.status} tone={getProjectStatusTone(project.status)} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xs uppercase text-slate-400">{labels.client}</p>
            <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{client?.name ?? '-'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">{labels.manager}</p>
            <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{project.manager}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">{labels.repository}</p>
            <a className="mt-1 block truncate text-sm font-semibold text-cyan-700 dark:text-cyan-300" href={project.system.repositoryUrl}>
              {project.system.repositoryUrl}
            </a>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">{labels.domain}</p>
            <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{project.system.domain}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={labels.soldAmount} value={money(project.finance.soldAmount)} accent="emerald" />
        <MetricCard label={labels.monthlyRevenue} value={money(project.finance.recurringMonthly)} accent="cyan" />
        <MetricCard label={labels.monthlyCosts} value={money(project.finance.operationalCosts + project.finance.licenseCosts)} accent="amber" />
        <MetricCard label={labels.monthlyProfit} value={money(project.finance.estimatedMonthlyProfit)} accent="slate" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminDataTable
          title={labels.tasks}
          columns={[labels.task, labels.status, labels.priority, labels.assignee]}
          rows={project.tasks}
          emptyLabel={labels.empty}
          renderRow={(task) => (
            <TableRow key={task.id}>
              <TableCell>{getLocalizedValue(task.title, locale)}</TableCell>
              <TableCell>
                <StatusBadge label={labels[`taskStatus.${task.status}`] ?? task.status} tone={getProjectStatusTone(task.status)} />
              </TableCell>
              <TableCell>{labels[`priority.${task.priority}`] ?? task.priority}</TableCell>
              <TableCell>{task.assignee}</TableCell>
            </TableRow>
          )}
        />
        <AdminDataTable
          title={labels.deliverables}
          columns={[labels.deliverable, labels.status, labels.dueDate]}
          rows={project.deliverables}
          emptyLabel={labels.empty}
          renderRow={(deliverable) => (
            <TableRow key={deliverable.id}>
              <TableCell>{getLocalizedValue(deliverable.title, locale)}</TableCell>
              <TableCell>{deliverable.status}</TableCell>
              <TableCell>{deliverable.dueDate}</TableCell>
            </TableRow>
          )}
        />
      </div>
    </div>
  );
}

export function ProjectFinanceSummary({ project, labels }: ProjectPanelProps) {
  const costs = project.finance.operationalCosts + project.finance.licenseCosts;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={labels.initialBudget} value={money(project.finance.initialBudget)} accent="slate" />
        <MetricCard label={labels.soldAmount} value={money(project.finance.soldAmount)} accent="emerald" />
        <MetricCard label={labels.recurringMonthly} value={money(project.finance.recurringMonthly)} accent="cyan" />
        <MetricCard label={labels.estimatedProfit} value={money(project.finance.estimatedMonthlyProfit)} accent="emerald" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>{labels.costBreakdown}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-black/6 pb-3 dark:border-slate-800">
              <span>{labels.operationalCosts}</span>
              <strong>{money(project.finance.operationalCosts)}</strong>
            </div>
            <div className="flex justify-between border-b border-black/6 pb-3 dark:border-slate-800">
              <span>{labels.licenseCosts}</span>
              <strong>{money(project.finance.licenseCosts)}</strong>
            </div>
            <div className="flex justify-between pt-1">
              <span>{labels.totalCosts}</span>
              <strong>{money(costs)}</strong>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>{labels.collectionStatus}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <MetricCard label={labels.pendingInvoices} value={String(project.finance.pendingInvoices)} accent="amber" />
            <MetricCard label={labels.overduePayments} value={String(project.finance.overduePayments)} accent="red" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ProjectLicensesTable({ project, labels }: ProjectPanelProps) {
  return (
    <AdminDataTable
      title={labels.licenses}
      columns={[labels.license, labels.provider, labels.status, labels.monthlyCost, labels.renewsAt]}
      rows={project.licenses}
      emptyLabel={labels.empty}
      renderRow={(license) => (
        <TableRow key={license.id}>
          <TableCell>{license.name}</TableCell>
          <TableCell>{license.provider}</TableCell>
          <TableCell>
            <StatusBadge label={labels[`licenseStatus.${license.status}`] ?? license.status} tone={getFinanceStatusTone(license.status)} />
          </TableCell>
          <TableCell>{money(license.monthlyCost)}</TableCell>
          <TableCell>{license.renewsAt}</TableCell>
        </TableRow>
      )}
    />
  );
}

export function ProjectTabs({ locale, projectId, active, labels }: { locale: string; projectId: string; active: 'overview' | 'finances'; labels: Record<string, string> }) {
  const base = `/${locale}/admin/projects/${projectId}`;
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      <Link
        href={base}
        className={`rounded-lg border px-4 py-2 text-sm font-semibold ${active === 'overview' ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-black/10 text-slate-700 dark:border-slate-800 dark:text-slate-200'}`}
      >
        {labels.overview}
      </Link>
      <Link
        href={`${base}/finances`}
        className={`rounded-lg border px-4 py-2 text-sm font-semibold ${active === 'finances' ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-black/10 text-slate-700 dark:border-slate-800 dark:text-slate-200'}`}
      >
        {labels.finances}
      </Link>
    </div>
  );
}
