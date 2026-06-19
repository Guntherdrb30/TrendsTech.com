import Link from 'next/link';

type LinkHubCardProps = {
  title: string;
  description: string;
  badge: string;
  href: string;
  external?: boolean;
};

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CardInner({ title, description, badge }: { title: string; description: string; badge: string }) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-white/4 px-5 py-4 transition-all duration-200 hover:border-[#00bfa5]/30 hover:bg-white/8 hover:shadow-[0_8px_32px_-12px_rgba(0,191,165,0.25)]">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-white">{title}</span>
          <span className="rounded-full bg-[#00bfa5]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#00bfa5]">
            {badge}
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p>
      </div>
      <div className="shrink-0 text-slate-600 transition-colors group-hover:text-[#00bfa5]">
        <ArrowRight />
      </div>
    </div>
  );
}

export function LinkHubCard({ title, description, badge, href, external }: LinkHubCardProps) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        <CardInner title={title} description={description} badge={badge} />
      </a>
    );
  }
  return (
    <Link href={href}>
      <CardInner title={title} description={description} badge={badge} />
    </Link>
  );
}
