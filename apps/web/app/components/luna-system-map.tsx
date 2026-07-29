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
};

export function LunaSystemMap({ nodes, className = '', compact = false }: LunaSystemMapProps) {
  const reduceMotion = useReducedMotion();
  const visibleNodes = nodes.slice(0, NODE_POSITIONS.length);

  return (
    <div
      className={`relative isolate mx-auto aspect-square w-full ${compact ? 'max-w-[560px]' : 'max-w-[640px]'} ${className}`}
      aria-label={`LUNA: ${visibleNodes.join(', ')}`}
      role="img"
    >
      <div className="absolute inset-[7%] rounded-full bg-[radial-gradient(circle,rgba(22,199,199,.12),transparent_66%)] blur-2xl" />
      <div className="absolute inset-[10%] rounded-full border border-[#13bebe]/20" />
      <div className="absolute inset-[24%] rounded-full border border-[#13bebe]/25" />

      <motion.div
        aria-hidden="true"
        className="absolute inset-[10%] rounded-full border border-dashed border-[#13bebe]/25"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 54, repeat: Infinity, ease: 'linear' }}
      />

      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient id="luna-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0aa9a9" stopOpacity="0.08" />
            <stop offset="0.5" stopColor="#0aa9a9" stopOpacity="0.45" />
            <stop offset="1" stopColor="#0aa9a9" stopOpacity="0.08" />
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
              strokeWidth="0.35"
              strokeDasharray="1.5 2"
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.1, delay: 0.25 + index * 0.08 }}
            />
          );
        })}
      </svg>

      <motion.div
        className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-white/90 bg-white shadow-[0_30px_110px_rgba(16,45,50,.18)] ${compact ? 'h-36 w-36 rounded-[30px]' : 'h-40 w-40 rounded-[34px]'}`}
        animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="absolute inset-3 rounded-[24px] border border-black/[.04]" />
        <Image src="/branding/luna-logo.png" alt="LUNA" width={126} height={72} className="relative object-contain" priority />
      </motion.div>

      {visibleNodes.map((node, index) => (
        <motion.div
          key={node}
          className={`absolute ${NODE_POSITIONS[index]} whitespace-nowrap rounded-full border border-black/[.08] bg-white/90 px-4 py-2 text-xs font-semibold text-[#414953] shadow-[0_10px_30px_rgba(25,40,45,.08)] backdrop-blur-md`}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: [0, -5, 0] }}
          transition={reduceMotion ? { duration: 0 } : { opacity: { delay: 0.35 + index * 0.08 }, scale: { delay: 0.35 + index * 0.08 }, y: { duration: 4.2 + index * 0.35, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#14bebe] shadow-[0_0_12px_rgba(20,190,190,.75)]" />
          {node}
        </motion.div>
      ))}
    </div>
  );
}
