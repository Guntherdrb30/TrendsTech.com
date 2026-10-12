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
- 48 pruebas: 9 Control Center, 9 Installer, 25 LUNA y 5 MCP.
- `npm run build`: correcto; postbuild confirma que omite escrituras al catálogo en Preview.
- Auditoría completa (incluye dev): 0 critical, 0 high, 4 moderate. Sin excepciones para high/critical.
- Cuatro migraciones LUNA ejecutadas en una base PostgreSQL PGlite aislada.
- Integración HTTP sobre build compilado: login real, ROOT/tenant/CSRF, estados, credenciales, política, concurrencia, replay, telemetría idempotente e historial correctos.

## Límites y pendientes

- Preview del PR #49 usa variables exclusivas de `feature/luna-ai-control-center`; DATABASE_URL/DIRECT_URL apuntan a Neon `br-autumn-moon-a4ngnnc8` y la marca de aislamiento está habilitada. Producción conserva sus variables originales. Las otras dos ramas siguen bloqueadas para operaciones LUNA hasta tener una base de Preview propia.
- Gunther autorizó el entorno temporal. Rama `qa-luna-control-20261012`, cómputo 0.25 CU, suspensión 300 s, expiración 2026-10-19T12:03:17Z. No se reutilizó la rama QA de otro frente ni el respaldo existente.
- La instrumentación de llamadas de negocio es explícita mediante `luna.run`; el escaneo estático no garantiza detectar llamadas dinámicas y no reescribe automáticamente código arbitrario.
- Reservas de concurrencia de 60 segundos: limitan admisiones, no cancelan operaciones largas del proveedor. No equivalen a una cuota financiera.
- Presupuestos, conciliación de tarifas/facturas, pagos/licencias y detección automática de anomalías no forman parte de esta implementación verificada.
- Los costos no se inventan ni se calculan a partir de conteos incompletos.
- Concurrencia comprobada en PostgreSQL real de Neon: tres solicitudes simultáneas producen dos admisiones y un rechazo 429 con maxConcurrent=2; todas las reservas admitidas se liberaron.
- Revisión visual local: cuatro pantallas ROOT en 1440 y 390 px, sin desbordamiento, emisión de credencial en campo password y ocultación posterior correctas. Capturas conservadas como evidencia temporal. Las cuatro páginas ROOT también devolvieron 200 con sesión real en el Preview remoto.

## Preview remoto verificado

- URL estable: https://trends172techcom-git-fe-693fef-guntherdelrosario-5780s-projects.vercel.app/es/root/luna-ai-control
- Deployment de código verificado: dpl_HwCsksUbA7FpN1uSocZ7gj9Xe6HR; commit 2bfdfca88be5c2399d6ea0b58ce06e5b964d0a25. READY, target Preview.
- CI 38247677416 y 38247677425: success; npm ci, TypeScript, 48 pruebas, build, auditoría y escaneo de secretos correctos. GitHub Dependency Graph no está disponible; el audit obligatorio del lock completo permanece activo.
- Las cuatro migraciones remotas se aplicaron transaccionalmente y quedaron registradas con sus checksums en la rama aislada.
- Login real con cuentas ficticias, ROOT, aislamiento tenant, CSRF, estados, credenciales, agentes, límites persistentes, replay y deduplicación: correctos.
- CLI scan/plan/authorize/install/verify comprobado con fuentes ficticias de OpenAI; dos hallazgos sin ejecutar modelos. SDK generado verificó conexión ACTIVE, reservó/liberó Gateway, reportó telemetría y denegó agente ajeno antes de ejecutar callback.
- Evidencia persistente: instalación cmv57ul260004fak7tky0j65e, nueve eventos de auditoría, dos eventos de uso, cero leases activos y credencial revocada. Conexión y Gateway tras revocación: 401.
- Las tres cuentas ficticias quedaron sin contraseña, sin correo verificado, sin ROOT y con sesiones vencidas. Se conserva el historial para revisión.
- Corrección adicional: origen estable BETTER_AUTH_URL y URL temporal Vercel permitidos explícitamente; orígenes externos y Fetch Metadata cross-site siguen rechazados.

## Revisión y límites de publicación

Revisar el PR #49 y el Preview antes del 19 de octubre, cuando expira la base temporal. Main, producción y otros repositorios no se modificaron. Fusionar o publicar producción requiere autorización separada.

La revisión automática rechazó una actualización de la URL de Preview en `auth.ts` al interpretar las capacidades OAuth presentes en el archivo como una ampliación no autorizada. Se conservó íntegramente la versión existente; la URL del entorno se configuró mediante variables de Vercel, sin cambiar registro OAuth ni scopes.

