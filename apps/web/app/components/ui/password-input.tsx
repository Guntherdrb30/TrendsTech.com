'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type PasswordInputProps = React.ComponentProps<typeof Input>;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input {...props} type={visible ? 'text' : 'password'} className={cn('pr-12', className)} />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
        aria-label={visible ? 'Ocultar clave' : 'Mostrar clave'}
        title={visible ? 'Ocultar clave' : 'Mostrar clave'}
      >
        {visible ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M3 3l18 18" />
            <path d="M10.6 10.7a2 2 0 002.7 2.7" />
            <path d="M9.9 4.2A10.7 10.7 0 0112 4c5 0 8.8 4.5 9.8 6a3.2 3.2 0 010 4c-.5.7-1.3 1.7-2.4 2.7" />
            <path d="M6.2 6.3C4.1 7.8 2.7 9.8 2.2 10.6a3.2 3.2 0 000 2.8C3.2 15 7 19.5 12 19.5c1 0 2-.2 2.9-.5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M2.2 10.6a3.2 3.2 0 000 2.8C3.2 15 7 19.5 12 19.5S20.8 15 21.8 13.4a3.2 3.2 0 000-2.8C20.8 9 17 4.5 12 4.5S3.2 9 2.2 10.6z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
