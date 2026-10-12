import Link from 'next/link';
import { requireRootPage } from '@/lib/luna-ai-control/root-page';
export const dynamic = 'force-dynamic';
const safeguards = [
 ['Credenciales y acceso', 'Activo en las APIs', 'Se exige credencial válida, instalación ACTIVE y agente autorizado. Las credenciales se almacenan con hash y pueden revocarse.'],
 ['Límites por minuto', 'Implementado', 'Contador persistente por instalación; el bloqueo PostgreSQL serializa solicitudes concurrentes.'],
 ['Concurrencia', 'Implementado', 'Reservas de 60 segundos por operación. La liberación es idempotente y se limita a la instalación autenticada.'],
 ['Aprobación y suspensión', 'Implementado', 'Solo ROOT autoriza políticas, activa, suspende o revoca instalaciones. Los cambios quedan en el historial.'],
 ['Telemetría', 'Implementado', 'Eventos validados e idempotentes; sin prompts, respuestas ni claves de proveedores. Su fallo no altera el resultado de negocio.'],
 ['Presupuestos y anomalías', 'En desarrollo', 'No se reservan importes ni se concilian costos con proveedores. No hay bloqueo financiero ni detección automática de anomalías.'],
];
export default async function LunaAiSecurityPage({ params }: { params: Promise<{ locale: string }> }) {
 const { locale } = await params; await requireRootPage(locale);
 return <div className="space-y-6">
 <Link href={`/${locale}/root/luna-ai-control`} className="text-sm underline">← LUNA AI Control Center</Link>
 <h1 className="text-3xl font-semibold">LUNA AI Security Gateway</h1>
 <p>Configura la política en cada instalación del Control Center. El Gateway empieza desactivado y exige una lista explícita de agentes permitidos.</p>
 <div className="grid gap-3 sm:grid-cols-2">{safeguards.map(([name,status,description])=><article key={name} className="space-y-2 rounded-xl border p-4"><h2 className="font-semibold">{name}</h2><p className="text-xs">{status}</p><p className="text-sm">{description}</p></article>)}</div>
 <p className="text-sm">El Gateway protege llamadas de servidor enlazadas mediante luna.run con LUNA_GATEWAY_ENABLED=true. Si no puede comprobar autorización, deniega la operación. Las llamadas que no utilizan el wrapper siguen fuera de este control. Las reservas limitan admisiones; no cancelan operaciones del proveedor que duren más de 60 segundos.</p>
 </div>;
}
