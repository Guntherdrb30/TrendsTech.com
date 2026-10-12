# LUNA AI Control Center, Security Gateway y Auto Installer

## Alcance y decisiones

Repositorio autorizado: `Guntherdrb30/TrendsTech.com`. No se modifican otros repositorios, no se fusiona a main, no se publica en producción y no se invocan modelos de pago.

Fuentes conservadas:
- Control Center: `dd382644be89ea9182d35db77002b9becb3c30fd`.
- Installer: `1c8cfd3f6c03c3e9077a494f55cbb6b825d5fa64`.
- Seguridad: `f99add5688a88144c429079952cf8efd5d9e0ff1`.

El candidato integrado se entrega en el PR #49. El PR #50 conserva la distribución aislada del cliente; #51 conserva la propuesta de dependencias. Todas las actualizaciones deben avanzar desde el head existente, sin force push.

## Implementado

- Registro de instalaciones y auditoría; aprobación, activación, suspensión y revocación exclusivas ROOT.
- Credenciales de 256 bits, hash SHA-256, exposición una sola vez y revocación auditable.
- Separación por tenant, validación acotada de cuerpos y protección de origen en mutaciones con cookie.
- Gateway opt-in: credencial ACTIVE, lista explícita de agentes, límite por minuto y concurrencia mediante PostgreSQL; operaciones de un solo uso y liberación por instalación.
- Instalador: scan, plan, autorización del planId exacto, instalación exclusiva y verificación local/online. Detecta cambios de fuente y planes alterados. No sobrescribe instalaciones existentes.
- SDK de servidor desactivado por defecto; Gateway deniega ante falta de autorización o indisponibilidad. Telemetría tolera fallos y conserva resultados del proveedor.
- Panel ROOT conectado con Installer, políticas, credenciales, actividad e historial.
- Tailwind 4 y lockfile regenerado desde manifiestos limpios; runtime de autenticación compartido en el paquete raíz con Zod 4; la aplicación y sus herramientas conservan Zod 3. Se evita cambiar los módulos OAuth/MCP existentes.
- MCP SDK actualizado a 1.31.0 (OAuth advisory corregido), conservando su superficie y validaciones existentes; linter independiente de la cadena vulnerable de glob de eslint-config-next.

## Verificación confirmada

- `npm ci`: instalación desde directorio sin dependencias residuales y generación Prisma correctas.
- `npm run typecheck`: correcto.
- `npm run lint`: correcto.
- 47 pruebas: 8 Control Center, 9 Installer, 25 LUNA y 5 MCP.
- `npm run build`: correcto; postbuild confirma que omite escrituras al catálogo en Preview.
- Auditoría completa (incluye dev): 0 critical, 0 high, 4 moderate. Sin excepciones para high/critical.
- Cuatro migraciones LUNA ejecutadas en una base PostgreSQL PGlite aislada.
- Integración HTTP sobre build compilado: login real, ROOT/tenant/CSRF, estados, credenciales, política, concurrencia, replay, telemetría idempotente e historial correctos.

## Límites y pendientes

- Las variables DATABASE_URL/DIRECT_URL de Vercel están compartidas entre Preview y producción. No se aplicaron migraciones remotas. El Preview desplegado bloquea operaciones LUNA hasta revisar y configurar una base aislada y `LUNA_CONTROL_PREVIEW_DATABASE_ISOLATED=true`.
- Crear un entorno Neon temporal puede generar consumo; requiere autorización de Gunther antes de provisionarlo. No se reutilizó la rama QA de otro frente ni el respaldo existente.
- La instrumentación de llamadas de negocio es explícita mediante `luna.run`; el escaneo estático no garantiza detectar llamadas dinámicas y no reescribe automáticamente código arbitrario.
- Reservas de concurrencia de 60 segundos: limitan admisiones, no cancelan operaciones largas del proveedor. No equivalen a una cuota financiera.
- Presupuestos, conciliación de tarifas/facturas, pagos/licencias y detección automática de anomalías no forman parte de esta implementación verificada.
- Los costos no se inventan ni se calculan a partir de conteos incompletos.
- PGlite no sustituye la validación de concurrencia distribuida con PostgreSQL real en el Preview.
- Revisión visual local: cuatro pantallas ROOT en 1440 y 390 px, sin desbordamiento, emisión de credencial en campo password y ocultación posterior correctas. Capturas conservadas como evidencia temporal. La verificación remota sigue pendiente de una base aislada.

## Próximo paso

Autorizar una base de Preview aislada, aplicar allí las migraciones LUNA, configurar DATABASE_URL, DIRECT_URL, BETTER_AUTH_URL y orígenes de autenticación únicamente para las ramas autorizadas y comprobar el flujo ROOT/Installer/Gateway en Vercel. Producción permanece pendiente de una autorización separada.

La revisión automática rechazó una actualización de la URL de Preview en `auth.ts` al interpretar las capacidades OAuth presentes en el archivo como una ampliación no autorizada. Se conservó íntegramente la versión existente; la URL del entorno se configurará mediante variables de Vercel, sin cambiar registro OAuth ni scopes.
