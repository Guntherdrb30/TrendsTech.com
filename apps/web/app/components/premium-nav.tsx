'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { label: 'LUNA ERP AI', href: '/es/systems/luna' },
  { label: 'Carpihogar', href: 'https://www.carpihogar.com' },
  { label: 'Ecosistema', href: '/es#ecosistema' },
  { label: 'Contacto', href: '/es/contact' },
];

export function PremiumNav({ fontClass = '' }: { fontClass?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  return (
    <>
      {/* ── Header bar ── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${fontClass} ${
          scrolled || open
            ? 'border-b border-[#e5e7eb] bg-white/95 shadow-sm backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">

          {/* Logo: solo ícono en móvil, ícono+texto en sm+ */}
          <Link href="/es" className="flex shrink-0 items-center gap-2.5">
            <div className="relative h-8 w-8 shrink-0">
              <Image
                src="/branding/ttech-logo.svg"
                alt="Trends172Tech"
                fill
                className="object-contain"
              />
            </div>
            <span className="hidden whitespace-nowrap text-[15px] font-semibold tracking-tight text-[#0a0d14] sm:block">
              Trends172Tech
            </span>
          </Link>

          {/* Nav desktop */}
          <div className="hidden items-center gap-7 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                className="text-[14px] font-medium text-[#6b7280] transition-colors hover:text-[#0a0d14]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* CTA desktop */}
          <Link
            href="/es/systems/luna"
            className="hidden h-9 shrink-0 items-center rounded-full bg-[#0a0d14] px-5 text-[13px] font-semibold text-white transition-all hover:bg-[#14D9D9] hover:text-[#0a0d14] md:flex"
          >
            Ver LUNA ERP
          </Link>

          {/* Hamburger — MUST be a plain button with explicit z-index */}
          <button
            type="button"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative z-10 flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[6px] rounded-xl md:hidden"
          >
            <span
              className={`block h-[2px] w-[22px] rounded-full bg-[#0a0d14] transition-all duration-200 ${
                open ? 'translate-y-[8px] rotate-45' : ''
              }`}
            />
            <span
              className={`block h-[2px] w-[22px] rounded-full bg-[#0a0d14] transition-all duration-200 ${
                open ? 'opacity-0 scale-x-0' : ''
              }`}
            />
            <span
              className={`block h-[2px] w-[22px] rounded-full bg-[#0a0d14] transition-all duration-200 ${
                open ? '-translate-y-[8px] -rotate-45' : ''
              }`}
            />
          </button>
        </nav>
      </header>

      {/*
        ── Mobile menu ──
        Está FUERA del <header> como elemento fixed independiente.
        Así evitamos el bug de iOS Safari donde overflow:hidden en el padre
        bloquea los touch events en los hijos.
      */}
      {open && (
        <div
          className={`fixed inset-x-0 z-50 border-b border-[#f3f4f6] bg-white shadow-lg md:hidden ${fontClass}`}
          style={{ top: '64px' }}
        >
          <div className="px-5 pb-4 pt-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                onClick={() => setOpen(false)}
                className="flex items-center border-b border-[#f3f4f6] py-3.5 text-[15px] font-medium text-[#374151] last:border-0"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/es/systems/luna"
              onClick={() => setOpen(false)}
              className="mt-4 flex h-11 items-center justify-center rounded-full bg-[#0a0d14] text-[14px] font-semibold text-white"
            >
              Ver LUNA ERP AI
            </Link>
          </div>
        </div>
      )}

      {/* Overlay backdrop (z-40, debajo del menú z-50) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
