'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type AgentOption = {
  key: string;
  label: string;
};

type AgentSearchProps = {
  base: string;
  placeholder: string;
  label: string;
  options: AgentOption[];
  className?: string;
};

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function AgentSearch({
  base,
  placeholder,
  label,
  options,
  className
}: AgentSearchProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return options.filter((option) => {
      const labelMatch = option.label.toLowerCase().includes(normalizedQuery);
      const keyMatch = option.key.toLowerCase().includes(normalizedQuery);
      return labelMatch || keyMatch;
    });
  }, [normalizedQuery, options]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!normalizedQuery) {
      router.push(`${base}/agents`);
      return;
    }

    const exact = options.find((option) => {
      const labelMatch = option.label.toLowerCase() === normalizedQuery;
      const keyMatch = option.key.toLowerCase() === normalizedQuery;
      return labelMatch || keyMatch;
    });

    const destination = exact ?? filtered[0];

    if (destination) {
      router.push(`${base}/agents/${destination.key}`);
      return;
    }

    router.push(`${base}/agents`);
  };

  return (
    <div className={className}>
      <form className="relative" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="agent-search">
          {label}
        </label>
        <input
          id="agent-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="interactive-field w-full rounded-full border border-black/8 bg-white/88 px-4 py-2.5 pr-10 text-xs text-slate-900 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.3)] backdrop-blur transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 focus:ring-offset-white dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-700/40 dark:focus:ring-offset-slate-950"
        />
        <button
          type="submit"
          className="interactive-chip absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:ring-slate-700/40 dark:focus-visible:ring-offset-slate-950"
        >
          <span className="sr-only">{label}</span>
          <SearchIcon className="h-3.5 w-3.5" />
        </button>

        {normalizedQuery && filtered.length > 0 ? (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-[24px] border border-black/8 bg-white/96 shadow-[0_28px_70px_-45px_rgba(15,23,42,0.38)] backdrop-blur dark:border-slate-800 dark:bg-slate-950">
            <ul className="max-h-64 overflow-auto py-2 text-xs">
              {filtered.map((option) => (
                <li key={option.key}>
                  <Link
                    href={`${base}/agents/${option.key}`}
                    className="interactive-chip flex items-center gap-2 px-4 py-2.5 text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-inset dark:text-slate-200 dark:hover:bg-slate-900 dark:focus-visible:ring-slate-700/40"
                  >
                    <span className="font-medium">{option.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </form>
    </div>
  );
}
