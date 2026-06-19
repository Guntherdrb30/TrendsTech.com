'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

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
    <motion.div
      className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4 backdrop-blur-sm"
      whileHover={{
        y: -3,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderColor: 'rgba(0,191,165,0.35)',
        boxShadow: '0 12px 48px -12px rgba(0,191,165,0.30)',
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
    >
      {emoji && (
        <motion.div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.06] text-xl"
          whileHover={{ scale: 1.12, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 600, damping: 20 }}
        >
          {emoji}
        </motion.div>
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
      <motion.div
        className="shrink-0 rounded-full border border-white/8 bg-white/[0.04] p-1.5 text-slate-600"
        whileHover={{
          borderColor: 'rgba(0,191,165,0.30)',
          backgroundColor: 'rgba(0,191,165,0.10)',
          color: '#00bfa5',
          x: 2,
        }}
        transition={{ type: 'spring', stiffness: 600, damping: 25 }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M2.5 7h9M8 3.5L11.5 7 8 10.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </motion.div>
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
