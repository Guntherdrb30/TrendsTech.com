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

  /* Close menu on resize to md+ */
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setOpen(false); };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${fontClass} ${
          scrolled || open
            ? 'border-b border-[#e5e7eb] bg-white/95 backdrop-blur-xl shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">

          {/* Logo */}
          <Link href="/es" className="flex shrink-0 items-center gap-2.5">
            <div className="relative h-8 w-8 shrink-0">
              <Image
                src="/branding/ttech-logo.svg"
                alt="Trends172Tech"
                fill
                className="object-contain"
              />
            </div>
            <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight text-[#0a0d14]">
              Trends172Tech
            </span>
          </Link>

          {/* Desktop nav items */}
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

          {/* Desktop CTA */}
          <Link
            href="/es/systems/luna"
            className="hidden h-9 shrink-0 items-center rounded-full bg-[#0a0d14] px-5 text-[13px] font-semibold text-white transition-all hover:bg-[#14D9D9] hover:text-[#0a0d14] md:flex"
          >
            Ver LUNA ERP
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-[5px] rounded-lg md:hidden"
          >
            <span
              className={`block h-[2px] w-5 rounded-full bg-[#0a0d14] transition-all duration-200 ${
                open ? 'translate-y-[7px] rotate-45' : ''
              }`}
            />
            <span
              className={`block h-[2px] w-5 rounded-full bg-[#0a0d14] transition-all duration-200 ${
                open ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-[2px] w-5 rounded-full bg-[#0a0d14] transition-all duration-200 ${
                open ? '-translate-y-[7px] -rotate-45' : ''
              }`}
            />
          </button>
        </nav>

        {/* Mobile dropdown */}
        <div
          className={`overflow-hidden transition-all duration-200 md:hidden ${
            open ? 'max-h-96 border-t border-[#f3f4f6]' : 'max-h-0'
          } bg-white`}
        >
          <div className="px-5 py-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                onClick={() => setOpen(false)}
                className="flex items-center py-3 text-[15px] font-medium text-[#374151] border-b border-[#f9fafb] last:border-0 hover:text-[#14D9D9]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/es/systems/luna"
              onClick={() => setOpen(false)}
              className="mt-4 mb-2 flex h-11 items-center justify-center rounded-full bg-[#0a0d14] text-[14px] font-semibold text-white"
            >
              Ver LUNA ERP AI
            </Link>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/10 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
