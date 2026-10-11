# Inventario inicial de puntos de ejecución — piloto GNB

## Rutas verificadas por lectura estática
- `apps/web/app/[locale]/(admin)/admin/programming/projects/[projectId]/actions.ts`: `prepareAgentRunAction` requiere ROOT y llama `prepareAgentRun`; prepara, no ejecuta IA pagada.
- `apps/web/app/lib/engineering-studio/agent-runner.ts`: preparación GitHub/StudioRun, ahora verifica presupuesto configurado, no pausado y con saldo. **No reserva** ni invoca modelos.
- `apps/web/app/lib/engineering-studio/workflow-engine.ts`: PREPARE_AGENT_RUN y RUN_QA devuelven WAITING_EXECUTOR; no se constató una llamada pagada en estos casos.
- `apps/web/app/lib/engineering-studio/paid-execution-gate.ts`: puerta reutilizable con reserva previa, pero sin adaptador de proveedor conectado ni garantía de cota del proveedor.
- `packages/luna-runner/src/executors/codex.ts`: ejecutor placeholder, no ejecución real.
- `apps/web/app/api/luna-agent/runners/internal/claim/route.ts`: circuito separado de Luna Code Orchestrator; debe auditarse antes de afirmar cobertura del presupuesto Studio.

## Restricciones
1. `READY` en Studio es estado de **preparación**, no autorización final de ejecución pagada.
2. Toda futura integración de modelo debe pasar por una reserva atómica y autorización por proyecto.
3. `PAUSE` debe impedir iniciar nuevas llamadas incluso cuando existan tareas preparadas.
4. Los costos confirmados por el proveedor y las llamadas inciertas deben reconciliarse antes de liberar reservas.
5. No afirmar protección universal hasta enumerar rutas de IA de `apps/web`, workers, cron y `packages/luna-runner`, y verificar pruebas.
6. El esquema de presupuesto no ha sido migrado ni probado en Neon; no desplegar.

## Riesgo técnico pendiente
Una reserva limitada no es por sí misma un límite duro del proveedor. Hace falta calcular cotas verificables (modelo, tokens máximos, tarifa, reintentos, overhead) y evitar excedentes. También falta validar Prisma/TS y probar serialización en DB.

## Estado
Auditoría parcial y cambios en PR #47; sin ejecución pagada, sin migración aplicada y sin despliegue.
