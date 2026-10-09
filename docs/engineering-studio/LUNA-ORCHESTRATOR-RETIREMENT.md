# Consolidación: retirar Luna Code Orchestrator a favor de Engineering Studio

## Decisión aprobada
Engineering Studio será el único producto de orquestación de desarrollo. Retirar Luna Code Orchestrator de manera escalonada; no eliminar datos, infraestructura compartida o procesos activos sin comprobar dependencias y plan de reversión.

## Hallazgos verificados en main (lectura estática)
- UI tenant: `apps/web/app/[locale]/(app)/dashboard/agents/luna-code-orchestrator/` incluye proyectos, tareas, cola, runners, facturación, uso y configuración.
- UI ROOT: `apps/web/app/[locale]/(root)/root/luna-code-orchestrator/page.tsx` consulta tablas DevProject, DevRunner, DevUsageMetric y auditoría.
- API separada: `apps/web/app/api/luna-agent/` incluye proyectos, tareas, proveedores, sesiones remotas y endpoints internos de runners (claim, complete, heartbeat, handshake, progress).
- Bibliotecas: `apps/web/app/lib/luna-agent/`, `apps/web/app/lib/validators/luna-agent.ts`, `apps/web/app/types/luna-agent.ts`.
- Ejecutor CLI: `packages/luna-runner/src/executors/codex.ts` es un adaptador placeholder; el paquete contiene otros componentes que requieren auditoría.
- El endpoint `claim` puede asignar tareas y marcarlas PROCESSING; retirar sin drenar la cola puede dejar tareas en estado intermedio.
- `apps/web/app/api/orchestrator/` y `apps/web/app/lib/orchestrator/` aparecen en el árbol, pero **no se ha verificado** que pertenezcan a Luna Code Orchestrator; no eliminarlos por similitud de nombre.

## Orden seguro de retiro
1. Inventariar importaciones, menús, cron, colas, secretos, servicios y consumidores externos del API y runner. Consultar datos reales: tareas pendientes/activas, sesiones, tenants y facturación.
2. Introducir bloqueo reversible de nuevas tareas/claims del producto legado, con respuestas explícitas y sin interrumpir operaciones existentes sin plan.
3. Migrar o archivar tareas, historiales y configuraciones que el negocio deba conservar; confirmar con responsables de tenants.
4. Reemplazar enlaces de navegación por Engineering Studio y mantener redirecciones informativas.
5. Retirar procesos exclusivos, rutas y UI obsoletos; ejecutar tests, revisar contratos externos y desplegar gradualmente.
6. Mantener esquema histórico y respaldos durante periodo de reversión; eliminar tablas únicamente en cambio posterior expresamente aprobado.

## No hacer todavía
- No eliminar tablas Dev* ni migraciones existentes.
- No borrar endpoints de runner o UI hasta conocer usuarios/consumidores y dependencias.
- No desactivar la API genérica `/api/orchestrator` sin prueba de pertenencia.
- No desplegar ni tocar producción sin pruebas y autorización de release.
- No conectar modelos pagados antes de validar spend guard y costos.

## Estado
Plan documentado en rama de trabajo. Ninguna ruta ni servicio ha sido eliminado/desactivado; sin despliegue ni consumo IA adicional.
