import type { Metadata } from 'next';
import Image from 'next/image';
import { Space_Grotesk, IBM_Plex_Sans } from 'next/font/google';
import { LinkHubCard } from '@/components/link-hub-card';
import { HubContainer, HubItem, FloatingOrb } from '@/components/hub-animations';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
});

const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
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
  return (
    <div
      className={`${display.variable} ${body.variable} font-[var(--font-body)] relative min-h-screen overflow-hidden bg-[#030712]`}
    >
      {/* ── Fondo ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <FloatingOrb
          className="absolute -top-32 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,191,165,0.10)_0%,transparent_65%)] blur-3xl"
          duration={7}
          delay={0}
        />
        <FloatingOrb
          className="absolute right-0 top-1/4 h-[450px] w-[450px] translate-x-1/3 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.07)_0%,transparent_70%)] blur-3xl"
          duration={5}
          delay={1.5}
        />
        <FloatingOrb
          className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/4 rounded-full bg-[radial-gradient(circle,rgba(0,191,165,0.06)_0%,transparent_70%)] blur-3xl"
          duration={6}
          delay={0.7}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black_40%,transparent_100%)]" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-md flex-col items-center px-5 py-14">
        <HubContainer className="flex w-full flex-col items-center">

          {/* ── Header completo como bloque ── */}
          <HubItem className="mb-8 flex flex-col items-center text-center w-full">
            {/* Logo con glow */}
            <div className="relative mb-6">
              <div className="absolute -inset-4 animate-pulse rounded-2xl bg-[radial-gradient(circle,rgba(0,191,165,0.15)_0%,transparent_70%)] blur-xl" />
              <div className="absolute -inset-px rounded-2xl border border-[#00bfa5]/20" />
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-[#0a1628] shadow-[0_0_50px_rgba(0,191,165,0.12)]">
                <Image
                  src="/branding/trends172tech-logo.png"
                  alt="Trends172Tech"
                  fill
                  className="object-contain p-2"
                  priority
                />
              </div>
            </div>

            {/* Nombre */}
            <h1
              className="font-[var(--font-display)] text-3xl font-bold tracking-[-0.04em]"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Trends172Tech
            </h1>

            {/* Tags */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full border border-[#00bfa5]/30 bg-[#00bfa5]/10 px-3 py-1 text-xs font-semibold text-[#00bfa5]">
                Software
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">
                Inteligencia Artificial
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">
                Automatización
              </span>
            </div>

            {/* Descripción */}
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              Creamos soluciones digitales para empresas que quieren{' '}
              <span className="text-slate-300">escalar</span>, automatizar procesos y operar con
              tecnología avanzada.
            </p>

            {/* Frase */}
            <div className="mt-4 rounded-full border border-white/8 bg-white/[0.04] px-4 py-1.5 backdrop-blur-sm">
              <p className="text-[11px] font-medium tracking-wide text-slate-500">
                Tecnología aplicada a negocios reales.
              </p>
            </div>
          </HubItem>

          {/* ── Stats ── */}
          <HubItem className="mb-8 w-full">
            <div className="grid grid-cols-3 gap-3">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-4 text-center backdrop-blur-sm"
                >
                  <p
                    className="font-[var(--font-display)] text-lg font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #00bfa5 0%, #4dd0c4 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </HubItem>

          {/* ── Divisor ── */}
          <HubItem className="mb-6 flex w-full items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              Nuestros servicios
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </HubItem>

          {/* ── Links ── */}
          {LINKS.map((link) => (
            <HubItem key={link.href} className="w-full mb-3">
              <LinkHubCard {...link} />
            </HubItem>
          ))}

          {/* ── Footer ── */}
          <HubItem className="mt-12 flex flex-col items-center gap-3">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex items-center gap-2">
              <div className="relative h-5 w-5 overflow-hidden rounded-sm">
                <Image
                  src="/branding/trends172tech-logo.png"
                  alt="Trends172Tech"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-[11px] text-slate-700">
                Trends172Tech · Software · IA · Automatización · LUNA ERP AI
              </p>
            </div>
          </HubItem>

        </HubContainer>
      </main>
    </div>
  );
}
