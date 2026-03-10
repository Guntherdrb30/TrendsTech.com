"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type HeroCarouselItem = {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  href: string;
  cta: string;
};

type HeroMetric = {
  value: string;
  label: string;
};

export function MarketingHeroCarousel({
  items,
  metrics,
  secondaryHref,
  secondaryCta
}: {
  items: HeroCarouselItem[];
  metrics: HeroMetric[];
  secondaryHref: string;
  secondaryCta: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [items.length]);

  const activeItem = items[activeIndex];

  return (
    <section className="relative overflow-hidden rounded-[40px] border border-[#dfcfbd] bg-[linear-gradient(135deg,#fffdf9_0%,#f4ede5_52%,#ece3d9_100%)] text-slate-900 shadow-[0_55px_140px_-95px_rgba(15,23,42,0.38)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_48%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,_rgba(249,115,22,0.1),_transparent_38%)]" aria-hidden="true" />

      <div className="relative grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-between gap-8 px-6 py-8 sm:px-10 sm:py-10">
          <div className="space-y-5">
            <div className="inline-flex rounded-full border border-[#e2d1bf] bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a6b52] shadow-sm">
              {activeItem.eyebrow}
            </div>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-[var(--font-display)] font-semibold leading-tight text-slate-900 sm:text-5xl">
                {activeItem.title}
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                {activeItem.body}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={activeItem.href}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_20px_45px_-20px_rgba(15,23,42,0.32)] transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                {activeItem.cta}
              </Link>
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center rounded-full border border-[#d6c2ad] bg-white/82 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-slate-900 hover:bg-white"
              >
                {secondaryCta}
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-[#e3d5c7] bg-white/82 px-4 py-4 backdrop-blur"
              >
                <div className="text-2xl font-[var(--font-display)] font-semibold text-slate-900">
                  {metric.value}
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8a6b52]">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[340px] overflow-hidden border-t border-[#e2d3c5] lg:min-h-[560px] lg:border-l lg:border-t-0">
          <Image
            key={activeItem.image}
            src={activeItem.image}
            alt={activeItem.title}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/12 to-transparent lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-white/32" />
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
            <div className="rounded-2xl border border-white/60 bg-white/82 px-4 py-3 backdrop-blur">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[#8a6b52]">{`0${
                activeIndex + 1
              } / 0${items.length}`}</div>
              <div className="mt-1 text-sm text-slate-700">
                {activeItem.eyebrow}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {items.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={item.title}
                  className={`h-2.5 rounded-full transition ${
                    index === activeIndex ? "w-9 bg-slate-900" : "w-2.5 bg-slate-900/25 hover:bg-slate-900/45"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
