export const metadata = {
  title: 'LUNA Fútbol Inteligente | Presentación comercial',
  description: 'Presentación comercial interactiva de LUNA Fútbol Inteligente desarrollada por Trends172Tech.',
  robots: { index: false, follow: false }
};

export default function LunaFootballMasInfoPage() {
  const mobileCss = `
    html, body {
      width: 100% !important;
      max-width: 100vw !important;
      overflow-x: hidden !important;
      -webkit-text-size-adjust: 100% !important;
    }

    *, *::before, *::after {
      min-width: 0 !important;
      max-width: 100% !important;
    }

    nav {
      width: 100% !important;
      max-width: 100vw !important;
    }

    section {
      width: 100% !important;
      max-width: 100vw !important;
      overflow: hidden !important;
    }

    img, video, svg, canvas, picture {
      display: block !important;
      width: 100% !important;
      height: auto !important;
      max-width: 100% !important;
      object-fit: contain !important;
    }

    iframe {
      max-width: 100% !important;
    }

    h1, h2, h3, p, .lead, .big-title, .brand, .proof-item {
      overflow-wrap: anywhere !important;
      word-break: normal !important;
    }

    @media (max-width: 900px) {
      nav {
        padding: 14px 16px !important;
      }

      .brand {
        font-size: 14px !important;
        line-height: 1.2 !important;
      }

      .links {
        display: none !important;
      }

      section {
        display: block !important;
        min-height: auto !important;
        padding: 44px 18px !important;
      }

      .grid,
      .cards,
      .feature,
      .proof-grid,
      .phone-grid,
      .proof .phone-grid {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) !important;
        gap: 16px !important;
        width: 100% !important;
      }

      h1 {
        font-size: clamp(42px, 13vw, 58px) !important;
        line-height: .98 !important;
        letter-spacing: -.05em !important;
        margin: 14px 0 20px !important;
      }

      h2 {
        font-size: clamp(32px, 10.5vw, 44px) !important;
        line-height: 1.02 !important;
        letter-spacing: -.04em !important;
        margin: 10px 0 16px !important;
      }

      h3 {
        font-size: 21px !important;
        line-height: 1.15 !important;
      }

      .lead {
        font-size: 18px !important;
        line-height: 1.48 !important;
      }

      .eyebrow {
        font-size: 11px !important;
        letter-spacing: .13em !important;
      }

      .visual,
      .card,
      .box,
      .dark,
      .proof,
      .phone-card,
      .browser {
        width: 100% !important;
        max-width: 100% !important;
      }

      .visual {
        padding: 12px !important;
        border-radius: 22px !important;
        margin-top: 24px !important;
      }

      .card,
      .box {
        padding: 19px !important;
        border-radius: 18px !important;
      }

      .dark {
        padding: 22px 18px !important;
        border-radius: 20px !important;
      }

      .proof {
        margin: 24px 0 !important;
        padding: 14px !important;
        border-radius: 22px !important;
      }

      .proof h3 {
        font-size: 29px !important;
      }

      .proof-grid > *,
      .phone-grid > * {
        width: 100% !important;
        max-width: 100% !important;
      }

      .phone-card {
        padding: 9px !important;
        border-radius: 20px !important;
      }

      .phone-screen {
        width: 100% !important;
        max-width: 100% !important;
        min-height: 0 !important;
        border-radius: 16px !important;
      }

      .screen-body {
        padding: 16px !important;
      }

      .big-title {
        font-size: clamp(25px, 8vw, 34px) !important;
        line-height: 1.04 !important;
      }

      .mini-card {
        padding: 14px !important;
        border-radius: 15px !important;
      }

      .months {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 8px !important;
      }

      .month {
        padding: 9px 5px !important;
        font-size: 13px !important;
      }

      .bars {
        width: 100% !important;
        gap: 5px !important;
        overflow: hidden !important;
      }

      .bar {
        flex: 1 1 0 !important;
        width: auto !important;
        min-width: 0 !important;
      }

      .chips,
      .cta {
        width: 100% !important;
      }

      .btn {
        flex: 1 1 100% !important;
        text-align: center !important;
      }

      .browser {
        border-radius: 18px !important;
      }

      .browser iframe {
        width: 100% !important;
        height: 72vh !important;
        min-height: 540px !important;
      }
    }

    @media (max-width: 390px) {
      section {
        padding-left: 14px !important;
        padding-right: 14px !important;
      }

      h1 {
        font-size: 40px !important;
      }

      h2 {
        font-size: 32px !important;
      }

      .lead {
        font-size: 17px !important;
      }
    }
  `;

  const injectResponsiveCss = `
    (() => {
      const frame = document.getElementById('luna-presentation-frame');
      if (!frame) return;
      const inject = () => {
        try {
          const doc = frame.contentDocument || frame.contentWindow?.document;
          if (!doc || !doc.head) return;
          const existing = doc.getElementById('luna-mobile-responsive-fix');
          if (existing) existing.remove();
          const style = doc.createElement('style');
          style.id = 'luna-mobile-responsive-fix';
          style.textContent = ${JSON.stringify(mobileCss)};
          doc.head.appendChild(style);
        } catch (error) {
          console.warn('No se pudo aplicar el ajuste responsive de LUNA.', error);
        }
      };
      frame.addEventListener('load', inject);
      window.addEventListener('resize', inject);
      setTimeout(inject, 150);
    })();
  `;

  return (
    <main className="fixed inset-0 z-[9999] h-[100dvh] w-screen overflow-hidden bg-white">
      <iframe
        id="luna-presentation-frame"
        src="/presentaciones/luna-futbol.html"
        title="LUNA Fútbol Inteligente — Presentación interactiva"
        className="block h-full w-full border-0 bg-white"
        allow="fullscreen"
      />
      <script dangerouslySetInnerHTML={{ __html: injectResponsiveCss }} />
    </main>
  );
}
