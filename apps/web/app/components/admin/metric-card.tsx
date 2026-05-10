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
    <Card className="rounded-lg shadow-[0_18px_55px_-42px_rgba(15,23,42,0.35)]">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{label}</p>
          <span className={`h-2.5 w-2.5 rounded-full ${accentClass[accent]}`} />
        </div>
        <div className="text-2xl font-semibold text-slate-950 dark:text-white">{value}</div>
        {detail ? <p className="text-xs text-slate-500 dark:text-slate-400">{detail}</p> : null}
      </CardContent>
    </Card>
  );
}
