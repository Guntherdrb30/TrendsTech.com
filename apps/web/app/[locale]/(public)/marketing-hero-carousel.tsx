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
    <section className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-slate-950 text-white shadow-[0_45px_140px_-90px_rgba(15,23,42,0.9)] dark:border-slate-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_50%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,_rgba(249,115,22,0.16),_transparent_40%)]" aria-hidden="true" />

      <div className="relative grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-between gap-8 px-6 py-8 sm:px-10 sm:py-10">
          <div className="space-y-5">
            <div className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
              {activeItem.eyebrow}
            </div>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-[var(--font-display)] font-semibold leading-tight text-white sm:text-5xl">
                {activeItem.title}
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
                {activeItem.body}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={activeItem.href}
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_18px_45px_-20px_rgba(255,255,255,0.4)] transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                {activeItem.cta}
              </Link>
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10"
              >
                {secondaryCta}
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur"
              >
                <div className="text-2xl font-[var(--font-display)] font-semibold text-white">
                  {metric.value}
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[340px] overflow-hidden border-t border-white/10 lg:min-h-[560px] lg:border-l lg:border-t-0">
          <Image
            key={activeItem.image}
            src={activeItem.image}
            alt={activeItem.title}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/18 to-transparent lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-slate-950/12" />
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 backdrop-blur">
              <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200">{`0${
                activeIndex + 1
              } / 0${items.length}`}</div>
              <div className="mt-1 text-sm text-slate-200">
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
                    index === activeIndex ? "w-9 bg-white" : "w-2.5 bg-white/35 hover:bg-white/60"
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
