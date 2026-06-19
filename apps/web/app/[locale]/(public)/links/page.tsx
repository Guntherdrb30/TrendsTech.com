import type { Metadata } from 'next';
import Image from 'next/image';
import { Syne, DM_Sans } from 'next/font/google';
import { LinkHubCard } from '@/components/link-hub-card';

const display = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-display',
});

const body = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Trends172Tech | Software, IA y Automatización',
  description:
    'Empresa tecnológica especializada en desarrollo de software, inteligencia artificial, automatización empresarial y LUNA ERP AI.',
  openGraph: {
    title: 'Trends172Tech | Software, IA y Automatización',
    description:
      'Creamos soluciones digitales para empresas que quieren escalar, automatizar y operar con tecnología avanzada.',
    type: 'website',
  },
};

const STATS = [
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Soporte' },
  { value: '48h', label: 'Entrega' },
];

const LINKS = [
  {
    title: 'LUNA ERP AI',
    description:
      'Plataforma ERP inteligente para gestionar operaciones, inventario, ventas, compras e IA.',
    badge: 'ERP AI',
    href: '/es/systems/luna',
    external: false,
    emoji: '🌙',
  },
  {
    title: 'Desarrollo de Software a Medida',
    description: 'Plataformas, sistemas internos, SaaS, dashboards y soluciones empresariales.',
    badge: 'Software',
    href: '/es/contact',
    external: false,
    emoji: '💻',
  },
  {
    title: 'Inteligencia Artificial Empresarial',
    description: 'Automatización, agentes IA, reportes inteligentes y flujos operativos con IA.',
    badge: 'IA',
    href: '/es/contact',
    external: false,
    emoji: '🤖',
  },
  {
    title: 'Carpihogar',
    description: 'Caso real: La Tienda Inteligente de Venezuela operada sobre LUNA ERP AI.',
    badge: 'Caso real',
    href: 'https://www.carpihogar.com',
    external: true,
    emoji: '🏠',
  },
  {
    title: 'WhatsApp Comercial',
    description: 'Habla con nuestro equipo para evaluar tu proyecto.',
    badge: 'Contacto',
    href:
      'https://wa.me/584122640371?text=' +
      encodeURIComponent('Hola, quiero información sobre los servicios de Trends172Tech'),
    external: true,
    emoji: '💬',
  },
];

export default function LinksPage() {
  const fontClass = `${display.variable} ${body.variable} font-[var(--font-body)]`;

  return (
    <div className={`${fontClass} relative min-h-screen bg-white`}>
      {/* Subtle turquoise glow top */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[500px]"
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(20,217,217,0.06) 0%, transparent 70%)',
        }}
      />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col items-center px-5 pb-20 pt-28">

        {/* ── Header ── */}
        <div className="mb-10 flex flex-col items-center text-center w-full">
          {/* Logo */}
          <div className="relative mb-6">
            <div
              className="absolute -inset-3 rounded-2xl opacity-40"
              style={{
                background:
                  'radial-gradient(circle, rgba(20,217,217,0.25) 0%, transparent 70%)',
                filter: 'blur(12px)',
              }}
            />
            <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-[#14D9D9]/15 bg-white shadow-[0_2px_24px_rgba(0,0,0,0.06)]">
              <Image
                src="/branding/trends172tech-logo.png"
                alt="Trends172Tech"
                fill
                className="object-contain p-3"
                priority
              />
            </div>
          </div>

          {/* Nombre */}
          <h1
            className="font-[var(--font-display)] text-[32px] font-extrabold tracking-[-0.04em] text-[#0a0d14]"
          >
            Trends172Tech
          </h1>

          {/* Badges */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-[#14D9D9]/40 bg-[#14D9D9]/8 px-3 py-1 text-[12px] font-semibold text-[#0099a8]">
              Software
            </span>
            <span className="rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-3 py-1 text-[12px] font-medium text-[#6b7280]">
              Inteligencia Artificial
            </span>
            <span className="rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-3 py-1 text-[12px] font-medium text-[#6b7280]">
              Automatización
            </span>
          </div>

          {/* Descripción */}
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-[#6b7280]">
            Creamos soluciones digitales para empresas que quieren{' '}
            <span className="font-medium text-[#374151]">escalar</span>, automatizar procesos y
            operar con tecnología avanzada.
          </p>

          {/* Frase */}
          <div className="mt-4 rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-4 py-2">
            <p className="text-[12px] font-medium text-[#9ca3af]">
              Tecnología aplicada a negocios reales.
            </p>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="mb-8 grid w-full grid-cols-3 gap-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#f3f4f6] bg-[#fafafa] px-3 py-4 text-center"
            >
              <p className="font-[var(--font-display)] text-[20px] font-extrabold text-[#14D9D9]">
                {stat.value}
              </p>
              <p className="mt-0.5 text-[11px] text-[#9ca3af]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Divisor ── */}
        <div className="mb-6 flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-[#f3f4f6]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d1d5db]">
            Nuestros servicios
          </span>
          <div className="h-px flex-1 bg-[#f3f4f6]" />
        </div>

        {/* ── Links ── */}
        <div className="flex w-full flex-col gap-3">
          {LINKS.map((link) => (
            <LinkHubCard key={link.href} {...link} />
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="mt-14 flex flex-col items-center gap-2">
          <div className="h-px w-16 bg-[#f3f4f6]" />
          <div className="flex items-center gap-2">
            <div className="relative h-4 w-4 overflow-hidden rounded-sm">
              <Image
                src="/branding/ttech-logo.svg"
                alt="Trends172Tech"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-[11px] text-[#d1d5db]">
              Trends172Tech · Software · IA · Automatización · LUNA ERP AI
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
