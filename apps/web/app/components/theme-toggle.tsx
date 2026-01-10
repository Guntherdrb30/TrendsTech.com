'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { themes } from '../lib/theme/constants';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-nowrap items-center gap-2 text-xs sm:text-sm">
      {themes.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setTheme(item)}
          className={
            theme === item
              ? 'rounded border border-slate-900 px-2 py-1 dark:border-slate-100'
              : 'rounded border border-transparent px-2 py-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
          }
        >
          {item}
        </button>
      ))}
    </div>
  );
}
