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

function getCarouselCopy(locale: string) {
  return locale.startsWith("es")
    ? {
        surfaceBadge: "Superficie empresarial",
        operationalFraming: "Marco operativo",
        operationalBody:
          "Arquitectura visual sobria, foco en claridad, profundidad controlada y superficies que transmiten una plataforma de nivel corporativo.",
        activeFrame: "Marco activo",
        connector: "de",
        executivePreview: "Vista ejecutiva",
        productNarrative: "Narrativa del producto"
      }
    : {
        surfaceBadge: "Enterprise product surface",
        operationalFraming: "Operational framing",
        operationalBody:
          "A restrained visual architecture with clear hierarchy, controlled depth, and surfaces that signal a true enterprise platform.",
        activeFrame: "Active frame",
        connector: "of",
        executivePreview: "Executive preview",
        productNarrative: "Product narrative"
      };
}

export function MarketingHeroCarousel({
  items,
  metrics,
  locale,
  secondaryHref,
  secondaryCta
}: {
  items: HeroCarouselItem[];
  metrics: HeroMetric[];
  locale: string;
  secondaryHref: string;
  secondaryCta: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const copy = getCarouselCopy(locale);

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
    <section className="relative isolate overflow-hidden border-y border-black/8 bg-[linear-gradient(180deg,#f3f6fa_0%,#ffffff_24%,#f4f7fb_100%)] shadow-[0_60px_150px_-100px_rgba(15,23,42,0.38)]">
      <div className="premium-grid absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="premium-spotlight absolute inset-0 opacity-90" aria-hidden="true" />
      <div
        className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.16),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(120,53,15,0.14),_transparent_28%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-y-0 left-1/2 w-[32vw] -translate-x-1/2 bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.38)_10%,rgba(255,255,255,0.82)_50%,rgba(255,255,255,0.26)_100%)] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent_0%,rgba(15,23,42,0.14)_20%,rgba(255,255,255,0.95)_50%,rgba(15,23,42,0.14)_80%,transparent_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent_0%,rgba(15,23,42,0.05)_100%)]"
        aria-hidden="true"
      />

      <div className="relative grid min-h-[88svh] w-full gap-12 px-6 py-10 sm:px-8 sm:py-12 lg:grid-cols-[0.76fr_1.24fr] lg:px-14 lg:py-16 xl:px-20 2xl:px-24">
        <div className="flex flex-col justify-between gap-10">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-full border border-black/8 bg-white/92 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.25)]">
                {activeItem.eyebrow}
              </div>
              <div className="inline-flex rounded-full border border-black/8 bg-white/72 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                {copy.surfaceBadge}
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-[7ch] text-5xl font-[var(--font-display)] font-semibold leading-[0.92] tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-[5.6rem] xl:text-[6.4rem]">
                {activeItem.title}
              </h1>
              <p className="max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg lg:text-[1.18rem]">
                {activeItem.body}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={activeItem.href}
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_-24px_rgba(15,23,42,0.48)] transition hover:-translate-y-0.5 hover:bg-slate-900"
              >
                {activeItem.cta}
              </Link>
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center rounded-full border border-black/8 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
              >
                {secondaryCta}
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[28px] border border-black/8 bg-white/86 px-5 py-5 shadow-[0_28px_60px_-45px_rgba(15,23,42,0.28)] backdrop-blur"
                >
                  <div className="text-3xl font-[var(--font-display)] font-semibold tracking-[-0.04em] text-slate-950">
                    {metric.value}
                  </div>
                  <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[28px] border border-black/8 bg-white/84 px-5 py-4 shadow-[0_24px_60px_-46px_rgba(15,23,42,0.3)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                {copy.operationalFraming}
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                {copy.operationalBody}
              </p>
            </div>
            <div className="rounded-[28px] border border-black/8 bg-slate-950 px-5 py-4 shadow-[0_28px_70px_-46px_rgba(15,23,42,0.52)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                {copy.activeFrame}
              </div>
              <div className="mt-3 text-lg font-semibold tracking-[-0.03em] text-white">
                {`0${activeIndex + 1} ${copy.connector} 0${items.length}`}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-5 lg:pl-4 xl:pl-10">
          <div className="relative overflow-hidden rounded-[42px] border border-black/8 bg-white/72 p-4 shadow-[0_70px_180px_-110px_rgba(15,23,42,0.55)] backdrop-blur-xl">
            <div className="premium-metal absolute inset-0 opacity-90" aria-hidden="true" />
            <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.96)_50%,transparent_100%)]" aria-hidden="true" />
            <div className="relative rounded-[34px] border border-white/65 bg-white/56 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-1px_0_rgba(15,23,42,0.05)]">
              <div className="flex items-center justify-between gap-3 border-b border-black/6 pb-4">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {copy.executivePreview}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{activeItem.eyebrow}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-900/75" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-400/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#8b5e34]/70" />
                </div>
              </div>

              <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-[28px] border border-black/6 bg-slate-100 shadow-[0_32px_80px_-58px_rgba(15,23,42,0.34)]">
                <Image
                  key={activeItem.image}
                  src={activeItem.image}
                  alt={activeItem.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 1536px) 58vw, (min-width: 1024px) 52vw, 100vw"
                />
                <div
                  className="absolute inset-0 bg-[linear-gradient(112deg,rgba(15,23,42,0.22)_0%,transparent_24%,rgba(255,255,255,0.14)_52%,transparent_68%,rgba(15,23,42,0.14)_100%)]"
                  aria-hidden="true"
                />
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
                <div className="rounded-[28px] border border-black/8 bg-white/76 px-5 py-5 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.24)]">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {copy.productNarrative}
                  </div>
                  <div className="mt-3 text-xl font-[var(--font-display)] font-semibold tracking-[-0.03em] text-slate-950">
                    {activeItem.title}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{activeItem.body}</p>
                </div>

                <div className="flex items-center justify-center gap-2 rounded-[28px] border border-black/8 bg-slate-950 px-5 py-4 shadow-[0_30px_80px_-55px_rgba(15,23,42,0.56)] lg:flex-col">
                  {items.map((item, index) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-label={item.title}
                      className={`rounded-full transition ${
                        index === activeIndex
                          ? "h-12 w-2 bg-white"
                          : "h-2.5 w-2.5 bg-white/28 hover:bg-white/54"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
