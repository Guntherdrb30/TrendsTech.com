import Image from 'next/image';
import { Syne, DM_Sans } from 'next/font/google';
import { LinkHubCard } from '@/components/link-hub-card';
import { buildLocalizedMetadata } from '@/lib/seo';

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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    pathname: 'gunther',
    title: {
      es: 'Gunther Del Rosario, fundador de Trends172Tech',
      en: 'Gunther Del Rosario, founder of Trends172Tech',
    },
    description: {
      es: 'Perfil de Gunther Del Rosario, fundador de Trends172Tech y creador de productos empresariales como LUNA y CarpiHogar.',
      en: 'Profile of Gunther Del Rosario, founder of Trends172Tech and creator of business products including LUNA and CarpiHogar.',
    },
  });
}

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
          {/* Avatar / Logo */}
          <div className="relative mb-6">
            <div
              className="absolute -inset-3 rounded-full opacity-40"
              style={{
                background:
                  'radial-gradient(circle, rgba(20,217,217,0.25) 0%, transparent 70%)',
                filter: 'blur(12px)',
              }}
            />
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-[#14D9D9]/20 bg-white shadow-[0_0_0_4px_rgba(20,217,217,0.08)]">
              <Image
                src="/branding/trends172tech-logo.png"
                alt="Gunther Del Rosario"
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
            Gunther Del Rosario
          </h1>

          {/* Badges */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-[#14D9D9]/40 bg-[#14D9D9]/8 px-3 py-1 text-[12px] font-semibold text-[#0099a8]">
              CEO · Trends172Tech
            </span>
            <span className="rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-3 py-1 text-[12px] font-medium text-[#6b7280]">
              Creador de LUNA ERP AI
            </span>
          </div>

          {/* Bio */}
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-[#6b7280]">
            Fundador de <span className="font-medium text-[#374151]">Carpihogar</span>, La Tienda
            Inteligente de Venezuela. 17+ años construyendo empresa y tecnología real.
          </p>

          {/* Frase */}
          <div className="mt-4 rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-4 py-2">
            <p className="text-[12px] font-medium text-[#9ca3af]">
              Construyendo tecnología desde la experiencia empresarial.
            </p>
          </div>
        </div>

        {/* ── Divisor ── */}
        <div className="mb-6 flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-[#f3f4f6]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d1d5db]">
            Mis enlaces
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
              Trends172Tech · LUNA ERP AI · Carpihogar
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
