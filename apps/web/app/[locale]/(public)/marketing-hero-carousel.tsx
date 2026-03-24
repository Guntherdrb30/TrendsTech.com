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
    <section className="relative isolate min-h-[88svh] overflow-hidden text-white md:min-h-[92svh]">
      <Image
        key={activeItem.image}
        src={activeItem.image}
        alt={activeItem.title}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.9)_0%,rgba(15,23,42,0.72)_36%,rgba(15,23,42,0.28)_62%,rgba(15,23,42,0.58)_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.24),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_24%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[88svh] w-full max-w-[1440px] flex-col justify-end px-4 pb-8 pt-28 sm:px-6 md:min-h-[92svh] md:pb-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-white/18 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/88 backdrop-blur">
              {activeItem.eyebrow}
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-[var(--font-display)] font-semibold leading-[1.02] text-white sm:text-5xl lg:text-7xl">
                {activeItem.title}
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg lg:text-xl">
                {activeItem.body}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={activeItem.href}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_20px_45px_-20px_rgba(15,23,42,0.38)] transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                {activeItem.cta}
              </Link>
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center rounded-full border border-white/22 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/18"
              >
                {secondaryCta}
              </Link>
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] border border-white/14 bg-black/18 p-5 backdrop-blur-md lg:ml-auto lg:max-w-[520px]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/55">{`0${
                  activeIndex + 1
                } / 0${items.length}`}</div>
                <div className="mt-2 text-sm font-medium text-white/82">{activeItem.eyebrow}</div>
              </div>
              <div className="flex items-center gap-2">
                {items.map((item, index) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={item.title}
                    className={`h-2.5 rounded-full transition ${
                      index === activeIndex
                        ? "w-10 bg-white"
                        : "w-2.5 bg-white/35 hover:bg-white/55"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-white/14 bg-white/10 px-4 py-4 backdrop-blur"
                >
                  <div className="text-2xl font-[var(--font-display)] font-semibold text-white">
                    {metric.value}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/58">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
