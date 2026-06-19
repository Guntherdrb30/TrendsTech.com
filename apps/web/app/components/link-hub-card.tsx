import Link from 'next/link';

type LinkHubCardProps = {
  title: string;
  description: string;
  badge: string;
  href: string;
  external?: boolean;
  emoji?: string;
};

function CardInner({
  title,
  description,
  badge,
  emoji,
}: {
  title: string;
  description: string;
  badge: string;
  emoji?: string;
}) {
  return (
    <div className="interactive-panel group flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4 backdrop-blur-sm transition-all duration-300 hover:border-[#00bfa5]/35 hover:bg-white/[0.08] hover:shadow-[0_8px_40px_-12px_rgba(0,191,165,0.28)]">
      {emoji && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.06] text-xl">
          {emoji}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-white">{title}</span>
          <span className="rounded-full bg-[#00bfa5]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#00bfa5]">
            {badge}
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
      </div>
      <div className="shrink-0 rounded-full border border-white/8 bg-white/[0.04] p-1.5 text-slate-600 transition-all duration-300 group-hover:border-[#00bfa5]/30 group-hover:bg-[#00bfa5]/10 group-hover:text-[#00bfa5]">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M2.5 7h9M8 3.5L11.5 7 8 10.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

export function LinkHubCard({ title, description, badge, href, external, emoji }: LinkHubCardProps) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        <CardInner title={title} description={description} badge={badge} emoji={emoji} />
      </a>
    );
  }
  return (
    <Link href={href} className="block">
      <CardInner title={title} description={description} badge={badge} emoji={emoji} />
    </Link>
  );
}
