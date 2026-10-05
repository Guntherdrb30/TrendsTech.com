# Luna Runner

Runner local/remoto para `Luna Code Orchestrator`.

## Proposito

Este paquete reclama tareas desde la cola de `Luna Code Orchestrator`, reporta progreso, escribe logs y cierra la ejecucion de forma segura fuera de Vercel.

## Variables de entorno

- `LUNA_RUNNER_API_BASE_URL`: URL base del panel web.
- `LUNA_RUNNER_ID`: id del runner creado en el dashboard.
- `LUNA_RUNNER_TOKEN`: token entregado una sola vez al crear el runner.
- `LUNA_RUNNER_MODE`: `LOCAL`, `REMOTE` o `GITHUB`.
- `LUNA_RUNNER_RUNTIME`: `DRY_RUN`, `SHELL` o `CODEX_CLI`.
- `LUNA_RUNNER_POLL_INTERVAL_MS`: intervalo de polling/heartbeat.
- `LUNA_RUNNER_MAX_TASK_SECONDS`: timeout maximo por tarea.
- `LUNA_RUNNER_ALLOWED_COMMANDS`: allowlist para runtime shell.
- `LUNA_RUNNER_DEFAULT_WORKDIR`: directorio de trabajo por defecto.
- `LUNA_RUNNER_WORKSPACE_ROOT`: raiz donde CODEX_CLI clona/aisla repositorios cuando el proyecto no define `localPath`.
- `LUNA_RUNNER_HOST`: host reportado al panel.
- `LUNA_RUNNER_MACHINE_LABEL`: label descriptivo de la maquina.
- `LUNA_RUNNER_STALE_MINUTES`: minutos maximos sin heartbeat antes de marcar el runner como offline.

## Flujo recomendado

1. Crear el runner desde `/{locale}/dashboard/agents/luna-code-orchestrator/runners`.
2. Copiar el token de pairing.
3. Exportar variables de entorno.
4. Ejecutar `npm run luna:runner:build`.
5. Ejecutar `npm run luna:runner:start`.
6. Verificar heartbeat en el panel.

## Modos

- `DRY_RUN`: simula el flujo completo y deja logs/archivos simulados.
- `SHELL`: ejecuta comandos controlados por allowlist.
- `CODEX_CLI`: ejecuta `codex exec` en un workspace Git aislado, usa sandbox `workspace-write`, registra cambios, crea commit y publica exclusivamente la rama autorizada. Requiere Codex CLI autenticado y credenciales Git con acceso al repositorio.

## Limitaciones actuales

- La cola corre por polling.
- El host del runner debe tener Git y Codex CLI instalados/autenticados.
- Para repositorios privados, Git debe estar autenticado en el host del runner; el token nunca se incluye en prompts ni logs.
- El runner depende de que la API web este accesible desde la maquina que lo ejecuta.
- El runtime `SHELL` ya no usa `shell=true`; ejecuta comando + argumentos con allowlist, por lo que cualquier comando fuera de la lista se bloquea.
