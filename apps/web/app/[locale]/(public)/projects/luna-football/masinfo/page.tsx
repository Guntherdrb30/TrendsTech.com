export const metadata = {
  title: 'LUNA Fútbol Inteligente | Presentación comercial',
  description: 'Presentación comercial interactiva de LUNA Fútbol Inteligente desarrollada por Trends172Tech.',
  robots: { index: false, follow: false }
};

export default function LunaFootballMasInfoPage() {
  return (
    <main className="h-screen w-full overflow-hidden bg-white">
      <iframe
        src="/presentaciones/luna-futbol.html"
        title="LUNA Fútbol Inteligente — Presentación interactiva"
        className="h-full w-full border-0"
        allow="fullscreen"
      />
    </main>
  );
}
