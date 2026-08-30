'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

const slides = [
  {
    src: '/screenshots/luna/carpihogar-real-mobile.jpg',
    altEs: 'CarpiHogar.com en funcionamiento desde un dispositivo móvil',
    altEn: 'CarpiHogar.com running on a mobile device',
    labelEs: 'Comercio + Modo IA',
    labelEn: 'Commerce + AI Mode',
    position: 'object-top',
  },
  {
    src: '/screenshots/luna/carpihogar-panel-ejecutivo-mobile.jpg',
    altEs: 'Panel ejecutivo real de CarpiHogar con ventas y estado operativo',
    altEn: 'Real CarpiHogar executive dashboard with sales and operational status',
    labelEs: 'Panel ejecutivo',
    labelEn: 'Executive dashboard',
    position: 'object-top',
  },
  {
    src: '/screenshots/luna/carpihogar-metricas-mobile.jpg',
    altEs: 'Métricas reales de inventario, cuentas por cobrar y cuentas por pagar en CarpiHogar',
    altEn: 'Real CarpiHogar inventory, receivables, and payables metrics',
    labelEs: 'Finanzas e inventario',
    labelEn: 'Finance and inventory',
    position: 'object-top',
  },
  {
    src: '/screenshots/luna/carpihogar-catalogo-inteligente-mobile.jpg',
    altEs: 'Catálogo inteligente real de CarpiHogar con productos recientes y de alta rotación',
    altEn: 'Real CarpiHogar smart catalog with recent and fast-moving products',
    labelEs: 'Catálogo inteligente',
    labelEn: 'Smart catalog',
    position: 'object-top',
  },
] as const;

export function CarpiHogarShowcase({ isEs }: { isEs: boolean }) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (paused || reduceMotion) return;
    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5200);
    return () => window.clearInterval(interval);
  }, [paused, reduceMotion]);

  const move = (direction: number) => {
    setDirection(direction);
    setActive((current) => (current + direction + slides.length) % slides.length);
  };

  const select = (index: number) => {
    setDirection(index >= active ? 1 : -1);
    setActive(index);
  };

  const slide = slides[active];

  return (
    <div
      className="group relative min-h-[310px] overflow-hidden bg-[#11130f] [perspective:1400px] md:min-h-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={slide.src}
          className="absolute inset-0"
          custom={direction}
          initial={
            reduceMotion
              ? { opacity: 0 }
              : {
                  opacity: 0,
                  scale: 1.09,
                  x: direction * 70,
                  rotateY: direction * 5,
                  filter: 'blur(14px) saturate(0.75)',
                  clipPath: direction > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)',
                }
          }
          animate={{
            opacity: 1,
            scale: 1,
            x: 0,
            rotateY: 0,
            filter: 'blur(0px) saturate(1)',
            clipPath: 'inset(0 0 0 0)',
          }}
          exit={
            reduceMotion
              ? { opacity: 0 }
              : {
                  opacity: 0,
                  scale: 0.94,
                  x: direction * -52,
                  rotateY: direction * -4,
                  filter: 'blur(10px) saturate(0.7)',
                  clipPath: direction > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)',
                }
          }
          transition={{ duration: reduceMotion ? 0.15 : 0.78, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          drag={reduceMotion ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={(_, info) => {
            if (info.offset.x < -55) move(1);
            if (info.offset.x > 55) move(-1);
          }}
        >
          <Link
            href="https://carpihogar.com/"
            target="_blank"
            rel="noreferrer"
            aria-label={isEs ? 'Visitar CarpiHogar.com' : 'Visit CarpiHogar.com'}
            className="absolute inset-0"
          >
            <Image
              src={slide.src}
              alt={isEs ? slide.altEs : slide.altEn}
              fill
              priority={active === 0}
              className={`select-none object-cover ${slide.position}`}
              sizes="(min-width: 1024px) 36vw, (min-width: 768px) 42vw, 100vw"
            />
          </Link>
        </motion.div>
      </AnimatePresence>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-y-24 z-[1] w-28 rotate-12 bg-gradient-to-r from-transparent via-white/45 to-transparent blur-xl"
        key={`light-${active}`}
        initial={{ left: '-35%', opacity: 0 }}
        animate={{ left: '125%', opacity: [0, 0.75, 0] }}
        transition={{ duration: reduceMotion ? 0 : 1.05, delay: 0.08, ease: 'easeInOut' }}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-black/10" />

      <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
        <div className="mb-3 flex items-end justify-between gap-3">
          <Link
            href="https://carpihogar.com/"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/25 bg-black/55 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-black/75"
          >
            {isEs ? slide.labelEs : slide.labelEn} ↗
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label={isEs ? 'Imagen anterior' : 'Previous image'}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/55 text-lg text-white backdrop-blur-md transition hover:bg-black/75"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label={isEs ? 'Imagen siguiente' : 'Next image'}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/55 text-lg text-white backdrop-blur-md transition hover:bg-black/75"
            >
              ›
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2" aria-label={isEs ? 'Selector de imágenes' : 'Image selector'}>
          {slides.map((item, index) => (
            <button
              type="button"
              key={item.src}
              onClick={() => select(index)}
              aria-label={`${isEs ? 'Mostrar imagen' : 'Show image'} ${index + 1}`}
              aria-current={index === active ? 'true' : undefined}
              className={`h-1.5 rounded-full transition-all ${
                index === active ? 'w-9 bg-[#20c9c3]' : 'w-4 bg-white/55 hover:bg-white/85'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
