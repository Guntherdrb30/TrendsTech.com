import Link from 'next/link';
import { requireRole } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

const safeguards = [
  ['Identidad y autorización', 'Validar sesión, tenant, rol y permiso por agente antes de invocar la API.'],
  ['Límites de uso', 'Configurar cuotas por usuario, agente e instalación con contadores compartidos.'],
  ['Concurrencia', 'Restringir llamadas simultáneas por identidad sin afectar a otros usuarios.'],
  ['Presupuesto', 'Reservar el costo estimado antes de invocar y conciliar el costo real después.'],
  ['Detección de anomalías', 'Registrar picos de solicitudes, gasto, errores y denegaciones.'],
  ['Interruptor de emergencia', 'Suspender un agente o instalación con auditoría y recuperación controlada.'],
];

export default async function LunaAiSecurityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireRole('ROOT');
  return (
    <main className="space-y-6">
      <Link href={`/${locale}/root/luna-ai-control`} className="text-sm underline">← LUNA AI Control Center</Link>
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">LUNA AI Security Gateway</h1>
        <p className="text-sm text-muted-foreground">Seguridad integrada para las instalaciones y agentes de IA.</p>
      </header>
      <div className="rounded-xl border p-5 space-y-2">
        <h2 className="text-lg font-semibold">Estado de protección</h2>
        <p className="text-sm">Diseño y política inicial preparados. La protección no está activa hasta completar los adaptadores, contadores distribuidos y pruebas de integración.</p>
        <p className="text-sm text-muted-foreground">No se aplican bloqueos ni límites a aplicaciones de producción desde esta pantalla.</p>
      </div>
      <section className="grid gap-3 sm:grid-cols-2">
        {safeguards.map(([name, description]) => (
          <article key={name} className="rounded-xl border p-4 space-y-2">
            <h2 className="font-semibold">{name}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="text-xs">Pendiente de implementación y verificación</p>
          </article>
        ))}
      </section>
    </main>
  );
}
