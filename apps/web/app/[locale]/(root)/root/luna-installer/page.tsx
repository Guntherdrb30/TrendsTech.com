import { requireRootPage } from '@/lib/luna-ai-control/root-page';
import Link from 'next/link';
import { requireRole } from '@/lib/auth/guards';
export const dynamic = 'force-dynamic';
export default async function InstallerPilot({ params }: { params: Promise<{ locale: string }> }) {
 const { locale } = await params; await requireRootPage(locale);
 return <div className="space-y-5">
 <Link href={`/${locale}/root/luna-ai-control`} className="underline">← Control Center</Link>
 <h1 className="text-3xl font-semibold">LUNA AI Auto Installer</h1>
 <p>Integración local y revisable en servidores Node.js. Este panel no ejecuta cambios en repositorios de clientes.</p>
 <ol className="list-decimal space-y-4 pl-6">
 <li><strong>Analizar</strong><pre className="overflow-auto rounded border p-3">node tools/luna-ai-installer/bin/luna-ai-installer.mjs scan --project /ruta/proyecto</pre></li>
 <li><strong>Planificar</strong><pre className="overflow-auto rounded border p-3">node tools/luna-ai-installer/bin/luna-ai-installer.mjs plan --project /ruta/proyecto --output plan.json</pre><p>Revisar hallazgos, archivos propuestos y planId. No incluye código fuente ni secretos.</p></li>
 <li><strong>Autorizar e instalar</strong><pre className="overflow-auto rounded border p-3">node tools/luna-ai-installer/bin/luna-ai-installer.mjs install --project /ruta/proyecto --plan plan.json --authorize PLAN_ID</pre><p>Genera .luna-ai con wrappers privados; se detiene si el código cambió o si ya existe una instalación.</p></li>
 <li><strong>Conectar</strong><p>Registrar y aprobar la instalación en Control Center, emitir una credencial, activar y configurar agentes permitidos. Configurar LUNA_CONTROL_ENDPOINT y LUNA_INSTALLATION_TOKEN como variables privadas. Enlazar cada llamada de servidor mediante luna.run. La integración permanece desactivada hasta establecer LUNA_TELEMETRY_ENABLED=true; Gateway requiere además LUNA_GATEWAY_ENABLED=true.</p></li>
 <li><strong>Verificar</strong><pre className="overflow-auto rounded border p-3">node tools/luna-ai-installer/bin/luna-ai-installer.mjs verify --project /ruta/proyecto --online</pre><p>Comprueba integridad y conexión activa. Revisar eventos en Actividad e historial tras una operación de prueba autorizada.</p></li>
 </ol><p className="text-sm">El escaneo es estático. No garantiza descubrir llamadas dinámicas ni instrumenta automáticamente código de negocio. No instala dependencias, llama a modelos ni despliega.</p>
 </div>;
}
