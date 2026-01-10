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
          className="w-full rounded-full border border-slate-200 bg-white/90 px-4 py-2 pr-11 text-sm text-slate-900 shadow-sm transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-teal-400 dark:focus:ring-teal-500/30"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 dark:text-slate-400 dark:hover:text-white dark:focus-visible:ring-teal-500/40"
        >
          <span className="sr-only">{label}</span>
          <SearchIcon className="h-4 w-4" />
        </button>

        {normalizedQuery && filtered.length > 0 ? (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <ul className="max-h-64 overflow-auto py-2 text-sm">
              {filtered.map((option) => (
                <li key={option.key}>
                  <Link
                    href={`${base}/agents/${option.key}`}
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-900"
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
