import Link from 'next/link';
import { requireRole } from '@/lib/auth/guards';

export default async function InstallerPilot({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireRole('ROOT');
  return (
    <main className="mx-auto max-w-3xl space-y-5 py-8">
      <Link href={`/${locale}/root`} className="underline">Volver a ROOT</Link>
      <h1 className="text-3xl font-semibold">LUNA AI Auto Installer</h1>
      <p>Piloto: Club Español E.F. (Guntherdrb30/ClubEspa-nolE.F)</p>
      <section className="rounded-xl border p-5 space-y-3">
        <h2 className="text-xl font-semibold">Estado de instalación</h2>
        <p>Escáner CLI creado. La conexión de GitHub y la ejecución remota todavía están pendientes.</p>
        <p>Esta pantalla no modifica el repositorio ni la producción del club.</p>
        <a className="underline" href="https://github.com/Guntherdrb30/TrendsTech.com/pull/50">Ver código del instalador</a>
      </section>
    </main>
  );
}
