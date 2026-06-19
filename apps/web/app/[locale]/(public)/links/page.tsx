import type { Metadata } from 'next';
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
  title: 'Trends172Tech | Software, IA y Automatización',
  description:
    'Empresa tecnológica especializada en desarrollo de software, inteligencia artificial, automatización empresarial y LUNA ERP AI.',
  openGraph: {
    title: 'Trends172Tech | Software, IA y Automatización',
    description:
      'Creamos soluciones digitales para empresas que quieren escalar, automatizar procesos y operar con tecnología avanzada.',
    type: 'website',
  },
};

const LINKS = [
  {
    title: 'LUNA ERP AI',
    description:
      'Plataforma ERP inteligente para gestionar operaciones, inventario, ventas, compras, reportes e IA.',
    badge: 'ERP AI',
    href: '/es/systems/luna',
    external: false,
  },
  {
    title: 'Desarrollo de Software a Medida',
    description:
      'Creamos plataformas, sistemas internos, SaaS, dashboards y soluciones empresariales.',
    badge: 'Software',
    href: '/es/contact',
    external: false,
  },
  {
    title: 'Inteligencia Artificial Empresarial',
    description:
      'Automatización, agentes IA, reportes inteligentes y flujos operativos con IA.',
    badge: 'IA',
    href: '/es/contact',
    external: false,
  },
  {
    title: 'Carpihogar',
    description: 'Caso real: La Tienda Inteligente de Venezuela operada sobre LUNA ERP AI.',
    badge: 'Caso real',
    href: 'https://www.carpihogar.com',
    external: true,
  },
  {
    title: 'WhatsApp Comercial',
    description: 'Habla con nuestro equipo para evaluar tu proyecto.',
    badge: 'Contacto',
    href:
      'https://wa.me/584122640371?text=' +
      encodeURIComponent('Hola, quiero información sobre los servicios de Trends172Tech'),
    external: true,
  },
];

export default function LinksPage() {
  return (
    <div
      className={`${display.variable} ${body.variable} font-[var(--font-body)] min-h-screen bg-slate-950`}
    >
      {/* Fondo con gradiente sutil */}
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(0,191,165,0.06),transparent)]"
        aria-hidden="true"
      />

      <main className="relative mx-auto flex min-h-screen max-w-md flex-col items-center px-5 py-12 sm:py-16">
        {/* Header — marca empresa */}
        <div className="mb-10 flex flex-col items-center text-center">
          {/* Logo */}
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#00bfa5]/25 bg-[#00bfa5]/8 shadow-[0_0_32px_rgba(0,191,165,0.12)]">
            <span className="font-[var(--font-display)] text-xl font-bold tracking-[-0.04em] text-[#00bfa5]">
              T172
            </span>
          </div>

          {/* Nombre */}
          <h1 className="font-[var(--font-display)] text-2xl font-bold tracking-[-0.03em] text-white">
            Trends172Tech
          </h1>

          {/* Subtítulo */}
          <p className="mt-1.5 text-sm font-medium text-[#00bfa5]">
            Software, Inteligencia Artificial y Automatización Empresarial
          </p>

          {/* Descripción */}
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
            Creamos soluciones digitales para empresas que quieren escalar, automatizar procesos y
            operar con tecnología avanzada.
          </p>

          {/* Frase */}
          <div className="mt-4 rounded-full border border-white/8 bg-white/4 px-4 py-1.5">
            <p className="text-xs text-slate-400">Tecnología aplicada a negocios reales.</p>
          </div>
        </div>

        {/* Links */}
        <div className="w-full space-y-3">
          {LINKS.map((link) => (
            <LinkHubCard key={link.href} {...link} />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-[11px] text-slate-600">
            Trends172Tech · Software · IA · Automatización · LUNA ERP AI
          </p>
        </footer>
      </main>
    </div>
  );
}
