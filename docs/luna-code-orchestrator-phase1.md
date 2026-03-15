# Luna Code Orchestrator Phase 1

## Alcance

La fase 1 entrega la base funcional del agente:
- dashboard propio
- proyectos
- tareas
- logs y archivos por tarea
- configuracion de proveedores IA
- sesiones remotas por QR
- vista movil para crear tareas remotas
- cola placeholder

## Rutas principales

- `/[locale]/dashboard/agents/luna-code-orchestrator`
- `/[locale]/dashboard/agents/luna-code-orchestrator/projects`
- `/[locale]/dashboard/agents/luna-code-orchestrator/tasks`
- `/[locale]/dashboard/agents/luna-code-orchestrator/tasks/new`
- `/[locale]/dashboard/agents/luna-code-orchestrator/tasks/[taskId]`
- `/[locale]/dashboard/agents/luna-code-orchestrator/queue`
- `/[locale]/dashboard/agents/luna-code-orchestrator/settings`
- `/[locale]/remote/luna-code-orchestrator/[token]`

## Modelos

- `DevProject`
- `DevTask`
- `DevTaskLog`
- `DevTaskFile`
- `DevAIProvider`
- `RemoteSession`
- `DevExecutionQueue`

## Variables de entorno

- `LUNA_AGENT_ENCRYPTION_KEY`
  - recomendada para cifrar API keys del modulo
  - si no existe, se usa `NEXTAUTH_SECRET`

## Limitaciones actuales

- la cola es placeholder y no ejecuta runners reales
- no existe aun runner local/remoto en esta fase
- no hay enforcement comercial avanzado por plan
- las sesiones QR permiten crear tareas, no ejecutar codigo real

## Siguiente fase

La fase 2 debe introducir:
- runners
- pairing
- heartbeats
- ejecucion real controlada
- integracion inicial con Codex CLI
