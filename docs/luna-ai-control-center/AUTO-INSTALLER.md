# LUNA AI Auto Installer — diseño técnico

## Objetivo
Descubrir llamadas a proveedores de IA en repositorios autorizados y proponer una integración verificable con LUNA AI Control Center, sin modificar producción automáticamente.

## Fases del agente
1. **Connect**: OAuth/GitHub App con permiso de lectura del código y permiso separado para crear pull requests. Selección explícita de repositorio, rama y alcance.
2. **Discover**: escaneo estático de archivos relevantes y dependencias; detección de SDK OpenAI/Anthropic/Google, AI SDK, HTTP `fetch`/`axios`, endpoints proxy y jobs. No descargar ni enviar secretos a modelos.
3. **Classify**: reporte de hallazgos con archivo, línea, proveedor, modelo si está codificado, nivel de confianza, tipo (directo/proxy/background), si está instrumentado y riesgo de modificar.
4. **Plan**: propuesta de instrumentación idempotente, respetando wrappers y registros existentes; excluir archivos generados, tests, vendor, dependencias y secretos.
5. **Patch**: rama y PR con cambios mínimos, diff revisable, feature flag por defecto apagada y variables de servidor; jamás escribir claves en el repositorio.
6. **Validate**: build, tests, lint, aislamiento de tenants, no exposición de secretos, no duplicación de eventos, tolerancia a caída del control plane.
7. **Approve & Activate**: ROOT aprueba instalación y credencial; el cliente configura la variable de entorno en su plataforma, verifica heartbeat y telemetría. Despliegue solo con autorización explícita.

## Contrato del hallazgo
```ts
type DiscoveryFinding = {
  id: string;
  path: string;
  line: number;
  provider: 'openai' | 'anthropic' | 'google' | 'vercel-ai' | 'unknown';
  integration: 'sdk' | 'http' | 'proxy' | 'background';
  confidence: 'high' | 'medium' | 'low';
  alreadyInstrumented: boolean;
  evidence: string;
};
```

## Límites reales
- El análisis estático no garantiza descubrir llamadas construidas dinámicamente, ocultas tras servicios externos o efectuadas fuera del repositorio.
- El agente debe distinguir una referencia a una API de una llamada ejecutada.
- El costo es estimado hasta conciliar las tarifas y la facturación real del proveedor.
- Nunca interceptar tráfico de terceros ni acceder a sistemas sin autorización.
- Nunca cambiar llamadas de negocio por proxies obligatorios que introduzcan dependencia operacional del Control Center.

## Piloto
1. CarpiHogar: detectar `lib/openai.ts`, `lib/ai-usage-tracker.ts`, rutas no instrumentadas de Marketing Studio y APIs externas.
2. Trends172Tech: conectar el resultado con `AiControlInstallation` y su aprobación ROOT.
3. LUNA Fútbol: segundo repositorio después de validar el piloto.

## Criterios de aceptación
- Inventario de hallazgos reproducible y exportable.
- No se registran prompts, respuestas, claves ni datos personales.
- El agente no escribe ni despliega sin autorización.
- Reejecutar la instalación no duplica wrappers, variables ni eventos.
- Se distingue explícitamente 'detectado', 'instrumentado', 'verificado' y 'activo'.
