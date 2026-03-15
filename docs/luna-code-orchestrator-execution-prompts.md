# Luna Code Orchestrator Execution Prompts

## Prompt 1

Implementa la fase 1 de `Luna Code Orchestrator` dentro de `trends172tech.com` sobre la arquitectura real del repositorio.

Contexto obligatorio:
- stack real: Next.js App Router, React, TypeScript estricto, Prisma, PostgreSQL Neon, Vercel
- roles reales: `ROOT`, `TENANT_ADMIN`, `TENANT_OPERATOR`, `TENANT_VIEWER`
- no romper auth, billing ni dashboard actual
- integrar dentro de `app/[locale]/(app)/dashboard/...`

Objetivo de fase 1:
- dashboard del agente
- proyectos
- tareas
- logs
- configuracion de IA
- sesiones remotas QR
- interfaz movil
- cola placeholder
- base lista para futura ejecucion real

Modelos esperados:
- `DevProject`
- `DevTask`
- `DevTaskLog`
- `DevTaskFile`
- `DevAIProvider`
- `RemoteSession`
- `DevExecutionQueue`

Rutas sugeridas:
- `/[locale]/dashboard/agents/luna-code-orchestrator`
- `/[locale]/dashboard/agents/luna-code-orchestrator/projects`
- `/[locale]/dashboard/agents/luna-code-orchestrator/tasks`
- `/[locale]/dashboard/agents/luna-code-orchestrator/tasks/new`
- `/[locale]/dashboard/agents/luna-code-orchestrator/tasks/[id]`
- `/[locale]/dashboard/agents/luna-code-orchestrator/queue`
- `/[locale]/dashboard/agents/luna-code-orchestrator/settings`
- `/[locale]/dashboard/agents/luna-code-orchestrator/remote/[token]`

Entrega:
- resumen tecnico
- archivos creados/modificados
- como usar el agente
- como configurar IA
- como activar control remoto
- placeholders claros para fase 2

## Prompt 2

Asume que la fase 1 ya existe e implementa la fase 2: runner real.

Objetivo:
- cola segura
- runners locales/remotos
- pairing seguro
- heartbeats
- logs incrementales
- base para `codex`, `claude` y `custom`
- no ejecutar procesos largos dentro de Vercel

Modelos esperados:
- `DevRunner`
- `DevRunnerEvent`
- extensiones de `DevExecutionQueue`

Requisitos:
- runner local TypeScript fuera de Vercel
- modo `dry-run`
- modo `shell` controlado
- adaptador inicial `codex-cli`
- endpoints internos para runners
- UI de runners
- documentacion README del runner

Entrega:
- flujo tarea -> cola -> runner -> logs -> resultado
- instrucciones de pairing
- variables de entorno
- limites y riesgos de seguridad documentados

## Prompt 3

Asume que fases 1 y 2 ya existen e implementa la fase 3: monetizacion y producto vendible.

Objetivo:
- integrar con billing existente si es posible
- planes `basic`, `pro`, `enterprise`
- enforcement real de limites en backend
- plan actual, consumo, upgrade path, onboarding comercial
- visibilidad ROOT del producto

Temas a cubrir:
- acceso por tenant
- limites de tareas/proyectos
- soporte a remote y runners segun plan
- uso mensual
- auditoria
- onboarding y README comercial/tecnico

Entrega:
- enforcement real
- UI de billing/usage
- documentacion de activacion
- que falta para venta productiva

## Prompt 4

Asume que fases 1, 2 y 3 ya existen e implementa la fase 4: QA, hardening y release readiness.

Objetivo:
- revisar seguridad multi-tenant
- revisar rutas, guards, secretos, QR, runner, logs
- validar flujos criticos
- mejorar errores y estados vacios
- documentar variables y checklist de despliegue
- dejar el producto listo para salida seria

Cobertura minima:
- crear proyecto
- crear tarea
- encolar
- runner reclama
- logs
- completar
- QR remoto
- configuracion IA
- enforcement de plan
- visibilidad ROOT

Entrega:
- hallazgos corregidos
- riesgos residuales
- variables necesarias
- checklist de despliegue
- documentacion operativa final
