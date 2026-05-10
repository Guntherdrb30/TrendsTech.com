import { cn } from '@/lib/utils';

type StatusBadgeProps = {
  label: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
};

const toneClass = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
  warning: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
  danger: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300',
  info: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950 dark:text-cyan-300'
};

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase',
        toneClass[tone]
      )}
    >
      {label}
    </span>
  );
}

export function getProjectStatusTone(status: string): StatusBadgeProps['tone'] {
  if (status === 'ACTIVE' || status === 'COMPLETED') {
    return 'success';
  }
  if (status === 'MAINTENANCE' || status === 'PLANNING') {
    return 'info';
  }
  if (status === 'PAUSED') {
    return 'warning';
  }
  if (status === 'CANCELLED') {
    return 'danger';
  }
  return 'neutral';
}

export function getFinanceStatusTone(status: string): StatusBadgeProps['tone'] {
  if (status === 'PAID' || status === 'COMPLETED' || status === 'ACTIVE') {
    return 'success';
  }
  if (status === 'PARTIALLY_PAID' || status === 'PENDING' || status === 'EXPIRING_SOON') {
    return 'warning';
  }
  if (status === 'OVERDUE' || status === 'FAILED' || status === 'EXPIRED' || status === 'CANCELLED') {
    return 'danger';
  }
  return 'neutral';
}
