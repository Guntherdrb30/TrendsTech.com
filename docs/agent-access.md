# Agent Access

## Qué es AgentAccess
`AgentAccess` es la tabla que centraliza el permiso de un tenant para exponer un agente (o varios) fuera del dashboard. Cada fila representa un canal embebido (por ahora `embedded_web`) que puede renderizar un agente específico, definir los dominios permitidos, controlar si la ruta activa y aplicar límites por tokens. Lo diseñamos para no alterar el runtime actual ni el guardado de sesiones: es una capa de autorización adicional entre quienes piden acceso y el motor de agentes.

## Para qué se usa
1. **Validación de embeds:** Antes de entregar un `client_secret` o aceptar un mensaje de widget se debe comprobar que existe un `AgentAccess` activo con ese `tenantId` + `agentId`, que el dominio de origen está listado en `allowedDomains` y que el canal (`embedded_web`) coincide con el flujo invocado.
2. **Límites administrativos:** `maxTokensPerMonth` permite planificar futuras restricciones sin tocar la lógica del `AgentInstance` ni la tabla de wallets. Se puede usar para deshabilitar embeds sin borrar agentes.
3. **Auditoría sencilla:** Gracias a `tenantId`, podemos relacionar cada acceso registrado en `AuditLog` con el tenant correcto y con el agente concreto (`agentId`).

## Relación con Agent y Tenant
- `AgentAccess.tenantId` apunta a `Tenant.id`; las consultas deben respetar la guardia actual (`requireTenantId`, `resolveTenantFromUser`).
- `AgentAccess.agentId` apunta a `AgentInstance.id`. Un agente puede tener múltiples accesos (por ejemplo, un mismo agente puede servir el dashboard y un widget con dominios diferentes).
- La combinación `tenantId + agentId` también nos permitirá, en futuras etapas, verificar que un `token_wallet` pertenece al tenant que tiene acceso al canal.

## Widget bootstrap
El flujo embebido empieza con `GET /api/widget/bootstrap?installId=...`. El handler:

- Requiere `installId` válido y activo (`Install.status = 'ACTIVE'`) y extrae el `agentInstance` relacionado.
- Obtiene el dominio del `Origin` (preferido), con `Host` o `Referer` como respaldo; si no hay dominio, responde 400.
- Busca un `AgentAccess` activo (`isActive = true`) del mismo `agentId` y usa `matchAllowedDomains` para verificar que el dominio esté autorizado. El helper admite coincidencias exactas y wildcards de subdominio (por ejemplo, `cliente.com`, `.cliente.com` o `*.cliente.com`).
- Si el dominio no aparece en `allowedDomains`, el endpoint devuelve 403 y registra el intento negado.
- Cada validación exitosa crea un registro en `AccessLog` con `event = 'widget_bootstrap'`, `channel = 'widget'`, el dominio recibido y `metaJson = { installId }`, facilitando auditoría de accesos y rechazos.

### Respuesta mínima
Actualmente la respuesta incluye `ok: true`, `channel: 'widget'`, `accessId` y `agentId` (el `agentId` se expone porque ya forma parte del embed público). En futuras iteraciones podemos enriquecerla con `tenant.brandingJson`, el nombre del agente y datos de handoff (por ejemplo, `whatsappUrl`) siempre que sean seguros.

### Reglas de dominio
- `allowedDomains` puede contener coincidencias exactas o prefijadas con `.`/`*.` para cubrir subdominios.
- Antes de comparar, el helper normaliza el valor de `Origin`/`Referer` eliminando protocolos, puertos y comillas, y acepta `localhost` solo cuando ningún dominio explícito está configurado.
- El dominio autorizado se debe asociar a un `AgentAccess` con el mismo `tenantId` que el usuario que solicita el embed; por eso todas las consultas pasan por `requireTenantId`.

### Logging
Cada bootstrap genera una fila en `AccessLog` con los campos `tenantId`, `agentInstanceId`, `agentAccessId`, `domain`, `channel`, `event = 'widget_bootstrap'`, `status = 'ok'` y `metaJson` con `{ installId }`.

## Modelo Prisma propuesto
```prisma
model AgentAccess {
  id                String        @id @default(cuid())
  tenantId          String
  agentId           String
  name              String
  allowedDomains    String[]      @default([])
  channel           String        @default("embedded_web")
  maxTokensPerMonth Int?
  isActive          Boolean       @default(true)
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  tenant            Tenant        @relation(fields: [tenantId], references: [id])
  agentInstance     AgentInstance @relation(fields: [agentId], references: [id])

  @@index([tenantId])
  @@index([agentId])
}
```

## Consideraciones de multi-tenant
- Todas las lecturas/actualizaciones deben pasar por los guardias `requireTenantId`/`requireAuth` y filtrar por `tenantId`. Evitar consultas sin tenant permitiría que un actor de un tenant vea (o active) los accesos de otro.
- `allowedDomains` es un arreglo de strings que se normalizan igual que en `lib/installs/domain.ts`. La comprobación se hará en el pipeline del widget (`/api/installs/validate`) antes de llamar al orchestrator.
- `maxTokensPerMonth` se puede sumar a los logs de `TokenUsageLog` y `AuditLog` (por ejemplo, agregando el `agentAccessId` a `metaJson`) para bloquear nuevos turnos una vez superado el límite. Mientras tanto, mantendremos la validación del balance en `tokenWallet`.
-
## Dashboard y operaciones administrativas
- El dashboard de `/${locale}/dashboard/agents/[agentId]` incluye un panel “Agent Access” con un formulario para crear accesos y una lista editable que muestra `accessId`, `name`, `allowedDomains`, `maxTokensPerMonth` e `isActive`.
- Desde esta interfaz se puede crear un nuevo acceso (nombre, dominios y límite de tokens), actualizar los datos existentes y activar/desactivar el canal sin salir del detalle del agente.
- Las acciones usan `POST /api/agent-access` y `PATCH /api/agent-access/[accessId]`, que validan multi-tenant mediante `requireTenantId`, aplican los schemas de `zod` (`createAgentAccessSchema`, `updateAgentAccessSchema`) y devuelven el registro actualizado.
- El componente cliente mantiene el estado con hooks (`useState`, `useTransition`) y envía cada cambio a la API para evitar recargar la página.

## Próximos pasos (pendientes)
1. Enriquecer la respuesta bootstrap con branding/agent display name/handoff seguro y documentar cómo se usa en el frontend embebido.
2. Aplicar límites sobre `maxTokensPerMonth` (por ejemplo, sumando `agentAccessId` al `TokenUsageLog`) para evitar abusos y notificar a los tenants cercanos al límite.
3. Exponer métricas de `AccessLog` (por tenant/domain) y soportar alertas para dominios no autorizados o bootstraps repetidos.
