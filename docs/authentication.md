# Autenticación central de Trends172 Tech

Este portal es la autoridad de identidad para Trends172 Tech. Usa Better Auth con PostgreSQL/Prisma, contraseñas Argon2id, sesiones revocables almacenadas en base de datos y tokens JWT de corta duración firmados con claves publicadas mediante JWKS.

## Flujo

1. El usuario inicia sesión en `trends172tech.com`.
2. Better Auth crea una sesión revocable de siete días.
3. Las aplicaciones propias, incluido Trends Projects, pueden solicitar un JWT de 15 minutos.
4. La aplicación consumidora valida firma, emisor y audiencia contra el JWKS de Trends172 Tech.
5. Al restablecer una contraseña se revocan todas las sesiones existentes.

La contraseña nunca se comparte con Trends Projects ni con Gmail.

## Variables obligatorias en producción

- `BETTER_AUTH_SECRET`: secreto aleatorio de al menos 32 caracteres, distinto de las demás claves.
- `BETTER_AUTH_URL`: `https://trends172tech.com` o el origen canónico definitivo.
- `AUTH_TRUSTED_ORIGINS`: lista separada por comas de las aplicaciones autorizadas.
- `RESEND_API_KEY`: credencial de Resend.
- `RESEND_FROM_EMAIL`: `Trends172 Tech <seguridad@auth.trends172tech.com>`.
- `RESEND_REPLY_TO_EMAIL`: `trends172tech@gmail.com`.
- `AUTH_ADMIN_EMAIL`: `trends172tech@gmail.com`.

## Primer despliegue

1. Verificar `auth.trends172tech.com` en Resend y añadir los registros SPF y DKIM que Resend entregue. El SPF actual del dominio (`v=spf1 -all`) debe reemplazarse por el valor indicado por el proveedor para poder enviar.
2. Configurar las variables anteriores en Vercel para Production, Preview y Development según corresponda.
3. Aplicar las migraciones con `npm run db:migrate:deploy`.
4. Definir temporalmente `AUTH_ADMIN_PASSWORD` en el entorno local o seguro desde el que se ejecutará el alta.
5. Ejecutar `npm --workspace apps/web run auth:bootstrap-admin`.
6. Eliminar `AUTH_ADMIN_PASSWORD` inmediatamente después. El comando revoca sesiones anteriores y puede volver a ejecutarse para recuperar el administrador.
7. Probar inicio de sesión, cierre de sesión y recuperación desde una ventana privada antes de retirar el despliegue anterior.

## Integración de Trends Projects

Trends Projects debe aceptar únicamente tokens con:

- emisor igual a `BETTER_AUTH_URL`;
- audiencia `trends172tech-apps`;
- firma válida usando el JWKS publicado por Better Auth;
- expiración vigente;
- rol y `tenantId` autorizados para la operación solicitada.

Nunca debe confiar en los datos del navegador sin volver a verificar el token en el servidor. Cuando el producto quede servido bajo `trends172tech.com/proyectos`, el proxy debe conservar el origen canónico de autenticación y enviar todas las operaciones protegidas al servidor.
