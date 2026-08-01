# Fase 05 — OAuth 2.1 y respuesta a incidentes

## Resultado objetivo

Permitir que clientes de IA conecten con LUNA mediante autorización delegada, sin compartir contraseñas ni depender de secretos estáticos por usuario.

## Controles implementados

- Proveedor OAuth 2.1 sobre la autenticación existente de Better Auth.
- Authorization Code con PKCE S256 obligatorio para clientes públicos.
- Registro dinámico limitado a clientes públicos.
- Pantalla propia de consentimiento y permisos visibles.
- Tokens de acceso de corta duración y permisos de escritura aún más breves.
- Audiencia restringida al recurso `https://trends172tech.com/mcp`.
- Verificación de usuario, empresa y agente en cada conexión MCP.
- Herramientas asignadas por alcance `mcp:read` o `mcp:write`.
- Metadatos estándar de servidor de autorización y recurso protegido.
- Límite persistente de solicitudes MCP usando PostgreSQL.
- Plan y plantilla de respuesta a incidentes.

## Principio de mínimo privilegio

`mcp:read` se entrega por defecto. `mcp:write` debe ser solicitado y aprobado de forma explícita. La creación de agentes y otras operaciones administrativas de alto impacto no se exponen en esta fase.

## Validación requerida antes de publicación

- Migración Prisma aplicada correctamente.
- Descubrimiento OAuth devuelve metadatos válidos.
- Solicitud MCP sin token devuelve `401` y anuncia `resource_metadata`.
- Token con audiencia incorrecta es rechazado.
- Usuario sin empresa no recibe herramientas empresariales.
- Límite devuelve `429` al superar el umbral.
- MCP Inspector completa descubrimiento, consentimiento y conexión.
