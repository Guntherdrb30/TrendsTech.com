import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export const adminControlClass =
  'min-h-11 w-full rounded-2xl border border-slate-200 bg-white/96 px-4 py-2 text-sm text-slate-900 shadow-[0_14px_35px_-28px_rgba(15,23,42,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-slate-600';

type AdminFormCardProps = {
  title: string;
  description?: string;
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
  submitLabel: string;
  className?: string;
};

export function AdminFormCard({
  title,
  description,
  action,
  children,
  submitLabel,
  className
}: AdminFormCardProps) {
  return (
    <Card className={cn('rounded-lg border-slate-200/80 bg-white/92 shadow-[0_22px_70px_-45px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-950/80', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {children}
          <Button type="submit" className="w-full sm:w-auto">
            {submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function AdminField({
  id,
  label,
  children
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

export function AdminTextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <Input {...props} />;
}

export function AdminTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(adminControlClass, props.className)} />;
}

export function AdminSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(adminControlClass, props.className)} />;
}
