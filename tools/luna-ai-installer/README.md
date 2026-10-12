# LUNA AI Auto Installer — cliente de servidor

CLI Node.js >=20, sin dependencias ni llamadas a modelos. Analiza SDK/HTTP de IA sin exportar líneas de código, prompts ni secretos.

```sh
node bin/luna-ai-installer.mjs scan --project /ruta/proyecto
node bin/luna-ai-installer.mjs plan --project /ruta/proyecto --output plan.json
# Revisar el plan y copiar su planId:
node bin/luna-ai-installer.mjs install --project /ruta/proyecto --plan plan.json --authorize PLAN_ID
node bin/luna-ai-installer.mjs verify --project /ruta/proyecto
```

El plan se vincula al directorio real, el inventario de fuentes y los hashes del SDK. Un cambio de fuente, un plan alterado o un destino existente detienen la instalación. Se crea `.luna-ai` con permisos privados; no se sobrescriben archivos ni se ejecutan scripts del proyecto.

## Activación

Registrar la instalación en Control Center, aprobar/activar con ROOT, emitir una credencial y configurar:

- `LUNA_CONTROL_ENDPOINT`: URL HTTPS del Control Center.
- `LUNA_INSTALLATION_TOKEN`: credencial privada de instalación, nunca `NEXT_PUBLIC_*`.
- `LUNA_TELEMETRY_ENABLED=true`: activar reporter.
- `LUNA_GATEWAY_ENABLED=true`: activar autorización antes de la llamada.

Gateway se autoriza independientemente de la telemetría: `LUNA_GATEWAY_ENABLED=true` exige autorización aunque `LUNA_TELEMETRY_ENABLED=false`.

Gateway requiere una política ROOT habilitada y una lista explícita de agentes. El servidor verifica ACTIVE, revocación, agente, cuota por minuto y concurrencia. La reserva dura 60 segundos y no cancela operaciones del proveedor que superen ese plazo.

```js
import { luna } from './.luna-ai/index.mjs';
const result = await luna.run({
  agent: 'assistant', platform: 'mi-app', module: 'api_call',
  action: 'generate', provider: 'openai', environment: 'preview',
}, () => myExistingAiCall());
```

Enlazar cada llamada en el límite del servidor después de revisar los hallazgos. No importar este SDK en código del navegador. Para streams, el callback debe esperar la finalización que se desea medir. Los tokens/costos de un stream no se deducen automáticamente.

```sh
node bin/luna-ai-installer.mjs verify --project /ruta/proyecto --online
node --test tests/*.test.mjs
```

La verificación online comprueba archivos y credencial ACTIVE. No certifica por sí sola que todos los call sites estén instrumentados: realizar una operación autorizada y revisar el historial.

La telemetría tolera errores; el Gateway, cuando se habilita, deniega si no puede comprobar autorización. El SDK desactivado conserva la llamada sin red. No envía claves del proveedor, contenido de prompts, respuestas ni mensajes de error.
