'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 22, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 380, damping: 28 },
  },
};

export function HubContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

export function HubItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

export function FloatingOrb({
  className,
  delay = 0,
  duration = 6,
  style,
}: {
  className?: string;
  delay?: number;
  duration?: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      animate={{
        scale: [1, 1.12, 1],
        opacity: [0.6, 1, 0.6],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}
