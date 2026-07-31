import { Card, CardContent } from '@/components/ui/card';

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  accent?: 'slate' | 'emerald' | 'amber' | 'cyan' | 'red';
};

const accentClass = {
  slate: 'bg-slate-900',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  cyan: 'bg-cyan-500',
  red: 'bg-red-500'
};

export function MetricCard({ label, value, detail, accent = 'slate' }: MetricCardProps) {
  return (
    <Card className="min-h-[132px] overflow-hidden rounded-[22px] border-black/8 bg-white shadow-[0_22px_65px_-48px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-950">
      <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <p className="max-w-[18rem] text-sm font-medium leading-5 text-slate-600 dark:text-slate-300">{label}</p>
          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${accentClass[accent]}`} />
        </div>
        <div className="text-[2rem] font-semibold leading-none tracking-[-0.04em] text-slate-950 dark:text-white">{value}</div>
        {detail ? <p className="text-xs text-slate-500 dark:text-slate-400">{detail}</p> : null}
      </CardContent>
    </Card>
  );
}
