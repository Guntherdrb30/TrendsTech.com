# Propuestas ChatGPT → CRM: preparación de producción

Fecha: 2026-10-20. Proyecto: Guntherdrb30/TrendsTech.com.

## Alcance y autorización

Gunther autorizó completar la integración, revisar CIMA #55, conservar propuestas existentes y preparar producción. Publicar producción requiere aprobación posterior. No se han ejecutado migraciones ni escrituras en la base de producción, enviado propuestas, modificado conexiones privadas ni desactivado controles de seguridad.

Base revisada: main aebef48 (incluye PR #56, c8442ed). CIMA #55: ccb3aecc, incorporada en la rama de preparación. City Center, Big Home y Fits Tools conservan sus rutas y contenido.

## Cambios

- El CRM separa borradores privados de propuestas compartibles. Los borradores abren la ruta ROOT `/es/admin/proposals/preview/{slug}` y no ofrecen enlace público.
- Persistencia en AdminProposal y AdminClient existentes. Sin tablas, migraciones ni reinicio de datos. Control de revisión y auditoría transaccionales; bloqueo por cliente para creaciones concurrentes.
- El registro postbuild reutiliza los registros históricos PIT/Fits Tools sin reiniciar importe, probabilidad, estado, título, notas ni fechas. Solo añade el enlace de presentación cuando falta.
- Pruebas MCP independientes de la carga de Prisma/server-only. Incluyen confirmación de publicación, permisos separados, preservación de contratos, conflictos y reversión ante error de auditoría.
- No se expone el identificador del aprobador en las propiedades de la página pública. Se rechazan marcadores de almacenamiento dentro del contenido.
- CI ejecuta `npm run proposals:test`.

## Conexión Trends172Tech Control

En esta sesión, la búsqueda por nombre no devolvió el plugin privado. No se inventó un ID ni se creó un duplicado. La conexión y el consentimiento de la cuenta ROOT están pendientes de validación en el plugin existente.

Comprobación de solo lectura en producción:

- Recurso OAuth anunciado: `https://trends172tech.com/mcp`.
- Metadatos: `https://trends172tech.com/.well-known/oauth-protected-resource/mcp`.
- Authorization server anunciado: `https://trends172tech.com`.
- `/mcp` sin token devuelve 401, Cache-Control no-store y WWW-Authenticate con resource_metadata.
- Los metadatos anuncian mcp:read, mcp:proposals:write y mcp:proposals:publish.

Usar los endpoints descubiertos del servidor OAuth, no URL de callback inventadas. Mantener el ID, audiencia privada y configuración del plugin existente. La URI de redirección debe ser exactamente la que proporciona ChatGPT. Reautorizar desde la interfaz si la conexión anterior no consintió los nuevos scopes. No copiar tokens a chat ni repositorio. No usar TRENDS_MCP_TOKEN como sustituto de OAuth.

Permisos mínimos: `mcp:read` para consultar; añadir `mcp:proposals:write` para guardar borradores. `mcp:proposals:publish` es independiente y solo debe concederse para publicar tras aprobación expresa. La ruta verifica la identidad y el rol ROOT en servidor. El registro dinámico de cliente no concede el rol ROOT.

## Flujo de aceptación pendiente en entorno conectado

1. Usuario ROOT inicia sesión y consiente los scopes solicitados por el plugin existente.
2. `proposals_templates` obtiene City Center/CIMA como referencia; `proposals_list` y `proposals_get` recuperan documentos dinámicos.
3. Crear un borrador de prueba con slug exclusivo y contenido aprobado, sin modificar propuestas históricas. Abrirlo en CRM desde móvil y escritorio.
4. Verificar que su URL pública devuelve 404, que una cuenta no ROOT no accede a su vista previa y que un token de lectura no ofrece escrituras.
5. Revisar el contenido y número de revisión. Una modificación invalida la aprobación de la revisión anterior.
6. Solo tras autorización expresa ejecutar `proposals_publish` con slug, expectedRevision y confirmation=PUBLICAR. Verificar URL pública, registro CRM y auditoría. Publicar no significa enviar, aceptar ni facturar.

## Puerta de producción

Antes de fusionar: CI verde, revisión visual, prueba autenticada con el plugin privado y aprobación de Gunther para el commit concreto. No fusionar #55 por separado si ya se integra esta rama. La PR #55 no se cierra automáticamente aquí.

El postbuild de producción registra las cuatro propuestas estáticas de forma transaccional. Revisar previamente duplicados ambiguos y confirmar copia de seguridad operativa; el registro aborta ante ambigüedad. No es necesaria una migración Prisma. Las propuestas dinámicas no se generan automáticamente en el despliegue.

Reversión: revertir el commit de aplicación tras aprobación; no borrar filas CRM ni auditoría. Una reversión no elimina propuestas ya compartidas de la base de datos. No usar db reset/seed para esta entrega.

## Evidencia y límites

- 19 pruebas de propuestas aprobadas (catálogo, documentos, transporte MCP y store con doble transaccional).
- 5 pruebas existentes de seguridad MCP aprobadas con `node --import tsx --test apps/web/tests/mcp/*.test.ts`; el lanzador `npx tsx` intenta crear un socket IPC no disponible en este entorno.
- Auditoría de dependencias: pasa la política existente; 0 critical, 1 high y 6 moderate. PostCSS conserva excepciones high preexistentes; no se alteraron las excepciones ni se ocultaron avisos.
- La prueba del store usa dobles de Prisma; no sustituye una prueba OAuth/CRM con base de datos real.
- Compilación local aislada aprobada, con lint y TypeScript. Postbuild confirma que no es producción y omite escrituras CRM. Se repite sobre el árbol final antes de entregar.
- Presentación dinámica inspeccionada con Playwright en 1440×1000 y 390×844; navegación y agenda privada comprobadas. City Center y diseño CIMA inspeccionados en móvil. La ruta temporal de fixture no forma parte de la entrega.
- CIMA consulta primero si existe un documento dinámico histórico: conserva su contenido público o su privacidad, según corresponda. Esta consulta necesita la conexión de base de datos en el entorno de aceptación.
