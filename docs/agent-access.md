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

## Próximos pasos (sin implementar aún)
1. Capa de lectura en `apps/web/app/lib/agent-access` (o dentro de `installs`/`orchestrator`) para resolver `AgentAccess` antes de ejecutar el agente.
2. Validar dominios/canal en `app/api/orchestrator/chat/route.ts` y en `app/api/installs/validate/route.ts` usando este registro.
3. Registrar en `AuditLog` eventos de acceso (`agent_access_granted/denied`) para poder auditar quién y cuándo se usó cada acceso.
4. Exponer una UI en el dashboard (probablemente dentro de `dashboard/installs` o en un nuevo `dashboard/access`) para crear/activar `AgentAccess` records.
