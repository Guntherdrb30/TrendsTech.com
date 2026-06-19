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
      className="group flex items-center gap-4 rounded-2xl border border-[#e5e7eb] bg-white px-5 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
      whileHover={{
        y: -2,
        borderColor: 'rgba(20,217,217,0.35)',
        boxShadow: '0 8px 32px -8px rgba(20,217,217,0.20)',
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
    >
      {emoji && (
        <motion.div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#f3f4f6] bg-[#fafafa] text-xl"
          whileHover={{ scale: 1.1, rotate: 4 }}
          transition={{ type: 'spring', stiffness: 600, damping: 20 }}
        >
          {emoji}
        </motion.div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[#0a0d14]">{title}</span>
          <span className="rounded-full bg-[#14D9D9]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0099a8]">
            {badge}
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[#9ca3af]">{description}</p>
      </div>
      <motion.div
        className="shrink-0 rounded-full border border-[#e5e7eb] bg-[#fafafa] p-1.5 text-[#9ca3af]"
        whileHover={{
          borderColor: 'rgba(20,217,217,0.35)',
          backgroundColor: 'rgba(20,217,217,0.08)',
          color: '#14D9D9',
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
