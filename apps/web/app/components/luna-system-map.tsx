'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

const NODE_POSITIONS = [
  'left-1/2 top-[2%] -translate-x-1/2',
  'right-[1%] top-[24%]',
  'right-[4%] bottom-[21%]',
  'left-1/2 bottom-[1%] -translate-x-1/2',
  'left-[3%] bottom-[22%]',
  'left-[1%] top-[24%]',
] as const;

type LunaSystemMapProps = {
  nodes: string[];
  className?: string;
  compact?: boolean;
  decorative?: boolean;
};

export function LunaSystemMap({ nodes, className = '', compact = false, decorative = false }: LunaSystemMapProps) {
  const reduceMotion = useReducedMotion();
  const visibleNodes = nodes.slice(0, NODE_POSITIONS.length);
  const rootClass = compact
    ? 'relative mx-auto aspect-square w-full max-w-[560px]'
    : 'relative mx-auto aspect-square w-full max-w-[640px]';

  return (
    <div
      className={`${rootClass} isolate ${className}`}
      aria-label={decorative ? undefined : `LUNA: ${visibleNodes.join(', ')}`}
      aria-hidden={decorative || undefined}
      role={decorative ? undefined : 'img'}
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-[3%] rounded-full bg-[radial-gradient(circle,rgba(38,222,218,.2),rgba(20,190,190,.07)_38%,transparent_70%)] blur-2xl"
        animate={reduceMotion ? undefined : { scale: [0.94, 1.06, 0.94], opacity: [0.4, 0.72, 0.4] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-[10%] rounded-full border border-[#13bebe]/20" />
      <div className="absolute inset-[24%] rounded-full border border-[#13bebe]/25" />
      <div className="absolute inset-[37%] rounded-full border border-[#13bebe]/20" />

      <motion.div
        aria-hidden="true"
        className="absolute inset-[10%] rounded-full border border-dashed border-[#13bebe]/28"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 52, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-[24%] rounded-full border border-dashed border-[#13bebe]/18"
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 39, repeat: Infinity, ease: 'linear' }}
      />

      <motion.span
        aria-hidden="true"
        className="absolute left-1/2 top-[8%] h-2 w-2 -translate-x-1/2 rounded-full bg-[#18ceca] shadow-[0_0_18px_rgba(24,206,202,.8)]"
        animate={reduceMotion ? undefined : { scale: [0.85, 1.35, 0.85], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.span
        aria-hidden="true"
        className="absolute bottom-[18%] right-[12%] h-1.5 w-1.5 rounded-full bg-[#18ceca] shadow-[0_0_16px_rgba(24,206,202,.78)]"
        animate={reduceMotion ? undefined : { scale: [1.25, 0.8, 1.25], opacity: [0.9, 0.4, 0.9] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <svg aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="luna-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0aa9a9" stopOpacity="0.03" />
            <stop offset="0.5" stopColor="#0aa9a9" stopOpacity="0.5" />
            <stop offset="1" stopColor="#0aa9a9" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {[17, 33, 50, 67, 83, 97].map((angle, index) => {
          const radians = (angle * Math.PI) / 50;
          const x = 50 + Math.cos(radians) * 38;
          const y = 50 + Math.sin(radians) * 38;
          return (
            <motion.line
              key={angle}
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              stroke="url(#luna-line)"
              strokeWidth="0.4"
              strokeDasharray="1.5 2"
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.25, delay: 0.22 + index * 0.08 }}
            />
          );
        })}
      </svg>

      <motion.div
        className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-white/90 bg-white/95 shadow-[0_28px_100px_rgba(16,45,50,.18)] backdrop-blur-xl ${compact ? 'h-36 w-36 rounded-[30px]' : 'h-40 w-40 rounded-[34px]'}`}
        animate={reduceMotion ? undefined : { y: [0, -4, 0], boxShadow: ['0 28px 100px rgba(16,45,50,.14)', '0 34px 112px rgba(16,120,120,.24)', '0 28px 100px rgba(16,45,50,.14)'] }}
        transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="absolute inset-3 rounded-[24px] border border-black/[.04]" />
        <Image src="/branding/luna-logo.png" alt="LUNA" width={126} height={72} className="relative w-[68%] object-contain" priority />
      </motion.div>

      {!decorative && visibleNodes.map((node, index) => (
        <motion.div
          key={node}
          className={`absolute ${NODE_POSITIONS[index]} whitespace-nowrap rounded-full border border-black/[.08] bg-white/90 px-4 py-2 text-xs font-semibold text-[#414953] shadow-[0_10px_30px_rgba(25,40,45,.08)] backdrop-blur-md`}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: [0, -5, 0] }}
          transition={reduceMotion ? { duration: 0 } : { opacity: { delay: 0.35 + index * 0.08 }, scale: { delay: 0.35 + index * 0.08 }, y: { duration: 4.5 + index * 0.35, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#14bebe] shadow-[0_0_12px_rgba(20,190,190,.7)]" />
          {node}
        </motion.div>
      ))}
    </div>
  );
}
