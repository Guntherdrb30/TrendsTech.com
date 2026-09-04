# Trends Engineering Studio — Arquitectura técnica MVP

## 1. Objetivo

Definir la arquitectura del MVP interno de Engineering Studio dentro del monorepo existente de Trends172Tech, preservando aislamiento por proyecto, aprobación humana, trazabilidad de costos y extensibilidad para OpenAI, Codex, ChatGPT Work y NVIDIA local AI.

## 2. Ubicación en el monorepo

### Web
`apps/web/app/.../admin/programming`

Subrutas objetivo:
- `/admin/programming`
- `/admin/programming/projects`
- `/admin/programming/projects/new`
- `/admin/programming/projects/[projectId]`
- `/admin/programming/agents`
- `/admin/programming/costs`
- `/admin/programming/hardware`
- `/admin/programming/runs`
- `/admin/programming/settings`

### Dominio de servidor
Se recomienda crear un paquete desacoplado:
`packages/engineering-studio`

Responsabilidades:
- contratos de dominio;
- estados de proyecto;
- approval gates;
- cost engine;
- change requests;
- agent registry;
- provider/model registry;
- event log;
- adapters de ejecución.

La UI de `apps/web` no debe contener lógica de orquestación crítica.

## 3. Componentes

### Project Service
Crea proyectos, workspaces, baseline, constitution y vínculos con repositorio/entornos.

### Blueprint Service
Convierte idea/PRD/contexto en requisitos, arquitectura, backlog, riesgos, agentes y forecast.

### Orchestrator
Coordina jobs y agentes. En el MVP debe ser provider-agnostic. Astra puede ser el director principal, pero la arquitectura no debe depender de un modelo fijo.

### Agent Runtime
Ejecuta tareas especializadas con contratos explícitos de input/output y presupuesto.

### Approval Gate Service
Bloquea acciones sensibles hasta registrar aprobación válida.

### Cost Engine
Mantiene estimate, baseline, forecast, actuals, CAPEX, OPEX, margen y desviación.

### Change Control
Registra ideas, change requests, alcance aprobado e impacto económico.

### Git Provider Adapter
Para GitHub: ramas, commits, PR, estados y trazabilidad.

### Deployment Provider Adapter
Para Vercel: preview, estado y URL. Producción queda fuera de autonomía del MVP.

### Model Provider Registry
Configuración de OpenAI y futuros proveedores/local models.

### OpenAI Collaboration Gateway
Puente entre Engineering Studio y ChatGPT/Codex/Work mediante una app MCP propia de Trends172Tech y APIs oficiales cuando corresponda.

### NVIDIA Local AI Adapter
Capa para futuros runtimes locales: NeMo Agent Toolkit, Dynamo, TensorRT-LLM, vLLM/SGLang y hardware catalogado.

### Audit/Event Store
Registra toda mutación relevante y estado de ejecución.

## 4. Modelo de estados del proyecto

`IDEA -> DISCOVERY -> BLUEPRINT_READY -> BLUEPRINT_APPROVED -> DEMO_BUILDING -> DEMO_REVIEW -> MVP_BUILDING -> MVP_REVIEW -> PRODUCTION_READY -> PRODUCTION`

Estados excepcionales:
- `PAUSED`
- `BLOCKED`
- `BUDGET_STOPPED`
- `SECURITY_BLOCKED`
- `ARCHIVED`

## 5. Approval Gates del MVP

Gate A — aprobar Blueprint y presupuesto.

Gate B — autorizar ejecución de demo/MVP dentro de presupuesto.

Gate C — autorizar cambios de alcance facturables.

Gate D — autorizar creación/modificación de infraestructura con costo no incluida.

Gate E — autorizar merge hacia rama protegida.

Gate F — autorizar producción.

## 6. Ejecución segura

Cada Agent Run recibe:
- projectId;
- taskId;
- agentRole;
- provider/model;
- allowedTools;
- repositoryScope;
- fileScope cuando aplique;
- token/cost budget;
- time/resource budget;
- environment;
- approvalContext.

La ejecución falla cerrada cuando un permiso o aprobación no existe.

## 7. Persistencia — entidades mínimas

- StudioProject
- ProjectWorkspace
- ProjectConstitution
- ProjectDocument
- ProjectDecision
- Blueprint
- BlueprintVersion
- Requirement
- BacklogItem
- AgentDefinition
- ModelDefinition
- ProviderDefinition
- AgentRun
- ToolInvocation
- Approval
- ChangeRequest
- CostEntry
- BudgetBaseline
- BudgetForecast
- HardwareAsset
- HardwareReference
- Benchmark
- RepositoryBinding
- DeploymentBinding
- ProjectIntegration
- StudioEvent

## 8. Cost Engine

Toda entrada de costo usa categorías y moneda base normalizada.

Tipos:
- AI_API
- CHATGPT_CODEX_CREDITS cuando sea medible/importado
- CLOUD
- DATABASE
- STORAGE
- THIRD_PARTY_API
- HUMAN_TIME
- ELECTRICITY
- HARDWARE_DEPRECIATION
- HARDWARE_PURCHASE
- IMPORTATION
- MAINTENANCE
- SUPPORT
- LICENSE
- CONTINGENCY
- OVERHEAD

Debe mantener separado costo observado, costo imputado y estimación.

## 9. OpenAI / ChatGPT / Codex

Se diseñará una integración bidireccional controlada.

### De ChatGPT hacia Engineering Studio
Una app MCP interna podrá exponer acciones como:
- buscar proyecto;
- leer estado, PRD, decisiones y backlog;
- agregar nota/decisión;
- crear idea pendiente;
- crear borrador de Change Request;
- adjuntar resumen de una sesión;
- registrar un entregable;
- solicitar una tarea para Codex;
- leer costos y riesgos.

Las acciones de escritura respetarán autenticación, RBAC y Approval Gates.

### De Engineering Studio hacia OpenAI
Las APIs oficiales podrán usarse para:
- razonamiento/orquestación;
- agentes;
- extracción/estructuración;
- generación de documentación;
- evaluaciones.

La API de OpenAI se contabiliza como costo separado del plan de ChatGPT.

### Codex
Engineering Studio podrá preparar tareas, ramas, contexto y criterios de aceptación para que Codex trabaje sobre GitHub. Se debe distinguir entre uso de Codex autenticado con ChatGPT y ejecuciones con API key.

### ChatGPT Work
Work se considera superficie de colaboración y producción de artefactos, no fuente automática de verdad. Engineering Studio será el system of record del proyecto.

## 10. Sincronización de contexto

No se asumirá acceso automático al historial completo de todas las conversaciones privadas de ChatGPT.

La sincronización debe ser explícita y trazable mediante una o varias acciones:
- `sync_session_summary`;
- `attach_artifact`;
- `record_decision`;
- `create_change_request_draft`;
- `link_codex_task`.

Cada sincronización registra fuente, usuario, timestamp, projectId y checksum/identificador cuando exista.

## 11. Seguridad

- Admin-only en MVP.
- RBAC preparado para ampliar luego.
- MCP remoto autenticado; no exponer secretos al modelo.
- scopes por proyecto y acción.
- logs de escritura.
- rate limits.
- idempotency keys.
- CSRF/OAuth protections según superficie.
- secrets almacenados fuera de prompts.
- producción separada de preview.

## 12. Orden de implementación

1. Shell UI Admin + navegación.
2. Project + Blueprint schema.
3. Cost Engine baseline/forecast/actual.
4. Approval Gates.
5. Change Requests.
6. Agent/Model Registry.
7. GitHub adapter.
8. Run log.
9. OpenAI Collaboration Gateway (read + controlled write).
10. Vercel preview adapter.
11. Primer flujo end-to-end con proyecto de prueba.
