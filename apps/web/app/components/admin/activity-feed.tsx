import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AdminActivity } from '@/lib/admin-ai/types';
import { getLocalizedValue } from '@/lib/admin-ai/localization';

type ActivityFeedProps = {
  title: string;
  locale: string;
  items: AdminActivity[];
};

export function ActivityFeed({ title, locale, items }: ActivityFeedProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-black/8 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.actor}</div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {getLocalizedValue(item.action, locale)} <span className="font-medium">{item.entity}</span>
            </p>
            <p className="mt-2 text-xs text-slate-400">{new Date(item.occurredAt).toLocaleString(locale)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
