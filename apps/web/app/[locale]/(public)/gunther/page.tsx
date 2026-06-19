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
  },
  {
    title: 'Carpihogar',
    description: 'La Tienda Inteligente de Venezuela, operada sobre LUNA ERP AI.',
    badge: 'Ecosistema real',
    href: 'https://www.carpihogar.com',
    external: true,
  },
  {
    title: 'Trends172Tech',
    description: 'Desarrollo de software, inteligencia artificial y automatización empresarial.',
    badge: 'Empresa tecnológica',
    href: '/es',
    external: false,
  },
  {
    title: 'Desarrollo de Software e IA',
    description: 'Soluciones empresariales, ERP, automatización y plataformas digitales.',
    badge: 'Servicios',
    href: '/es/contact',
    external: false,
  },
  {
    title: 'WhatsApp',
    description: 'Agenda una reunión o solicita información comercial.',
    badge: 'Contacto directo',
    href: 'https://wa.me/584122640371?text=' + encodeURIComponent('Hola Gunther, quiero agendar una reunión'),
    external: true,
  },
];

export default function GuntherPage() {
  return (
    <div
      className={`${display.variable} ${body.variable} font-[var(--font-body)] min-h-screen bg-slate-950`}
    >
      {/* Fondo con gradiente sutil */}
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(0,191,165,0.08),transparent)]"
        aria-hidden="true"
      />

      <main className="relative mx-auto flex min-h-screen max-w-md flex-col items-center px-5 py-12 sm:py-16">
        {/* Header — perfil */}
        <div className="mb-10 flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[#00bfa5]/30 bg-[#00bfa5]/10 shadow-[0_0_32px_rgba(0,191,165,0.15)]">
            <span className="font-[var(--font-display)] text-2xl font-bold text-[#00bfa5]">G</span>
          </div>

          {/* Nombre */}
          <h1 className="font-[var(--font-display)] text-2xl font-bold tracking-[-0.03em] text-white">
            Gunther Del Rosario
          </h1>

          {/* Rol */}
          <p className="mt-1.5 text-sm font-medium text-[#00bfa5]">
            CEO de Trends172Tech · Creador de LUNA ERP AI
          </p>

          {/* Descripción */}
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
            Fundador de Carpihogar, La Tienda Inteligente de Venezuela.
          </p>

          {/* Frase */}
          <div className="mt-4 rounded-full border border-white/8 bg-white/4 px-4 py-1.5">
            <p className="text-xs text-slate-400">
              Construyendo tecnología desde la experiencia empresarial.
            </p>
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
            Trends172Tech · LUNA ERP AI · Carpihogar
          </p>
        </footer>
      </main>
    </div>
  );
}
