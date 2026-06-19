import type { Metadata } from 'next';
import Image from 'next/image';
import { Space_Grotesk, IBM_Plex_Sans } from 'next/font/google';
import { LinkHubCard } from '@/components/link-hub-card';

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
  title: 'Gunther Del Rosario | IA & Software',
  description:
    'CEO de Trends172Tech, creador de LUNA ERP AI y fundador de Carpihogar, La Tienda Inteligente de Venezuela.',
  openGraph: {
    title: 'Gunther Del Rosario | IA & Software',
    description: 'CEO de Trends172Tech · Creador de LUNA ERP AI · Fundador de Carpihogar',
    type: 'profile',
  },
};

const LINKS = [
  {
    title: 'LUNA ERP AI',
    description: 'ERP inteligente para inventario, ventas, compras, reportes e IA.',
    badge: 'Producto principal',
    href: '/es/systems/luna',
    external: false,
    emoji: '🌙',
  },
  {
    title: 'Carpihogar',
    description: 'La Tienda Inteligente de Venezuela, operada sobre LUNA ERP AI.',
    badge: 'Ecosistema real',
    href: 'https://www.carpihogar.com',
    external: true,
    emoji: '🏠',
  },
  {
    title: 'Trends172Tech',
    description: 'Desarrollo de software, inteligencia artificial y automatización empresarial.',
    badge: 'Empresa tecnológica',
    href: '/es',
    external: false,
    emoji: '⚡',
  },
  {
    title: 'Desarrollo de Software e IA',
    description: 'Soluciones empresariales, ERP, automatización y plataformas digitales.',
    badge: 'Servicios',
    href: '/es/contact',
    external: false,
    emoji: '🤖',
  },
  {
    title: 'WhatsApp',
    description: 'Agenda una reunión o solicita información comercial.',
    badge: 'Contacto directo',
    href:
      'https://wa.me/584122640371?text=' +
      encodeURIComponent('Hola Gunther, quiero agendar una reunión'),
    external: true,
    emoji: '💬',
  },
];

export default function GuntherPage() {
  return (
    <div
      className={`${display.variable} ${body.variable} font-[var(--font-body)] relative min-h-screen overflow-hidden bg-[#030712]`}
    >
      {/* ── Fondo animado ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {/* Orb teal superior */}
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(0,191,165,0.12)_0%,transparent_70%)] blur-3xl" />
        {/* Orb azul izquierda */}
        <div
          className="absolute left-0 top-1/3 h-[400px] w-[400px] -translate-x-1/2 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,transparent_70%)] blur-3xl"
          style={{ animationDelay: '1s', animationDuration: '3s' }}
        />
        {/* Orb teal inferior derecha */}
        <div
          className="absolute bottom-0 right-0 h-[350px] w-[350px] translate-x-1/4 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(0,191,165,0.07)_0%,transparent_70%)] blur-3xl"
          style={{ animationDelay: '2s', animationDuration: '4s' }}
        />
        {/* Grid sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black_40%,transparent_100%)]" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-md flex-col items-center px-5 py-14 sm:py-18">

        {/* ── Header ── */}
        <div className="reveal mb-10 flex flex-col items-center text-center">

          {/* Logo con glow ring */}
          <div className="relative mb-6">
            {/* Glow externo */}
            <div className="absolute -inset-3 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(0,191,165,0.2)_0%,transparent_70%)] blur-md" />
            {/* Ring decorativo */}
            <div className="absolute -inset-1 rounded-full border border-[#00bfa5]/25" />
            {/* Logo */}
            <div className="relative h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-[#0a1628] shadow-[0_0_40px_rgba(0,191,165,0.15)]">
              <Image
                src="/branding/trends172tech-logo.png"
                alt="Trends172Tech"
                fill
                className="object-contain p-3"
                priority
              />
            </div>
          </div>

          {/* Nombre con gradiente */}
          <h1
            className="font-[var(--font-display)] text-3xl font-bold tracking-[-0.04em]"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Gunther Del Rosario
          </h1>

          {/* Rol */}
          <div className="reveal-delay-1 mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-[#00bfa5]/30 bg-[#00bfa5]/10 px-3 py-1 text-xs font-semibold text-[#00bfa5]">
              CEO · Trends172Tech
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">
              Creador de LUNA ERP AI
            </span>
          </div>

          {/* Descripción */}
          <p className="reveal-delay-2 mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
            Fundador de <span className="text-slate-300">Carpihogar</span>, La Tienda Inteligente de Venezuela.
          </p>

          {/* Frase */}
          <div className="reveal-delay-3 mt-4 rounded-full border border-white/8 bg-white/[0.04] px-4 py-1.5 backdrop-blur-sm">
            <p className="text-[11px] font-medium tracking-wide text-slate-500">
              Construyendo tecnología desde la experiencia empresarial.
            </p>
          </div>
        </div>

        {/* ── Divisor ── */}
        <div className="reveal reveal-delay-1 mb-8 flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            Mis enlaces
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* ── Links ── */}
        <div className="reveal reveal-delay-2 w-full space-y-3">
          {LINKS.map((link) => (
            <LinkHubCard key={link.href} {...link} />
          ))}
        </div>

        {/* ── Footer ── */}
        <footer className="reveal reveal-delay-3 mt-12 flex flex-col items-center gap-3">
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
              Trends172Tech · LUNA ERP AI · Carpihogar
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
