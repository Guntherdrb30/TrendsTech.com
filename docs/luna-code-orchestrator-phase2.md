# Luna Code Orchestrator - Phase 2

## Alcance

La fase 2 agrega la capa de runners para ejecucion real controlada:

- registro de runners por tenant
- pairing token por runner
- heartbeat
- claim de cola
- progreso incremental
- cierre de tarea
- UI de runners
- paquete `packages/luna-runner`

## Rutas nuevas

- `/[locale]/dashboard/agents/luna-code-orchestrator/runners`
- `/[locale]/dashboard/agents/luna-code-orchestrator/runners/[runnerId]`

## Endpoints nuevos

- `GET/POST /api/luna-agent/runners`
- `POST /api/luna-agent/runners/internal/handshake`
- `POST /api/luna-agent/runners/internal/heartbeat`
- `POST /api/luna-agent/runners/internal/claim`
- `POST /api/luna-agent/runners/internal/progress`
- `POST /api/luna-agent/runners/internal/complete`

## Runtime soportado en esta fase

- `DRY_RUN`
- `SHELL`
- `CODEX_CLI` como adaptador inicial

## Nota operativa

La ejecucion persistente del runner no vive en Vercel. Debe correr en una maquina local o VPS controlada por el cliente o por el equipo de operaciones.
