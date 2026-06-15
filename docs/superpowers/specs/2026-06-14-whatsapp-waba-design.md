# Integración WhatsApp WABA — Especificación de Diseño

**Fecha:** 2026-06-14  
**Estado:** Aprobado  
**Alcance:** Permitir que los clientes conecten sus propios números de WhatsApp Business API (WABA) a sus agentes, con memoria persistente de conversación y procesamiento de imágenes y documentos.

---

## 1. Resumen

Los clientes que crean un agente desde el wizard `/crear-agente` podrán conectar su propio número WABA de Meta para que sus usuarios finales conversen con el agente directamente por WhatsApp. El agente recuerda el contexto de la conversación por usuario (un hilo de OpenAI por número de teléfono) y puede procesar imágenes enviadas por el usuario final usando GPT-4o visión.

---

## 2. Arquitectura

**Patrón:** Webhook global + enrutamiento interno + hilos de OpenAI por usuario

```
Usuario final → WhatsApp → Meta Cloud API → POST /api/webhooks/whatsapp
  → busca WhatsAppChannel por phoneNumberId
  → obtiene o crea WhatsAppThread (channelId, teléfono del usuario) → openaiThreadId
  → [si hay imagen] descarga de CDN de Meta → sube a OpenAI
  → agrega mensaje al hilo → ejecuta asistente
  → envía respuesta de texto via API de Meta
  → Usuario final recibe la respuesta
```

Meta envía todos los eventos del webhook a una sola URL registrada por Meta App. El sistema enruta por `entry[0].changes[0].value.metadata.phone_number_id`.

---

## 3. Cambios en la Base de Datos

### WhatsAppChannel (ampliar modelo existente)

Agregar los siguientes campos al modelo `WhatsAppChannel` existente:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `phoneNumberId` | String único | ID interno del número de Meta (del Business Manager) |
| `displayName` | String? | Nombre visible del número |
| `accessTokenEnc` | String | Token permanente de sistema cifrado con AES-256-GCM |
| `businessAccountId` | String | ID de la cuenta de negocio WABA en Meta |

El campo existente `webhookSecret` se usa como el secreto HMAC-SHA256 de firma (por canal, lo provee Meta).

### WhatsAppThread (modelo nuevo)

```prisma
model WhatsAppThread {
  id             String          @id @default(cuid())
  channelId      String
  userPhone      String          // Teléfono del usuario final (formato E.164)
  openaiThreadId String          // ID del hilo de OpenAI beta
  messageCount   Int             @default(0)
  lastMessageAt  DateTime        @default(now())
  createdAt      DateTime        @default(now())

  channel WhatsAppChannel @relation(fields: [channelId], references: [id], onDelete: Cascade)

  @@unique([channelId, userPhone])
  @@index([channelId])
  @@index([lastMessageAt])
}
```

---

## 4. Componentes del Backend

### 4.1 Migración de Base de Datos
- Agregar `phoneNumberId`, `displayName`, `accessTokenEnc`, `businessAccountId` a `WhatsAppChannel`
- Agregar relación `threads` en `WhatsAppChannel`
- Crear modelo `WhatsAppThread`
- Ejecutar `prisma migrate dev`

### 4.2 Endpoint del Webhook — `apps/web/app/api/webhooks/whatsapp/route.ts`

**GET** — Verificación inicial de Meta:
- Lee `hub.mode`, `hub.verify_token`, `hub.challenge` de los parámetros de query
- Valida que `hub.verify_token === process.env.WHATSAPP_VERIFY_TOKEN`
- Devuelve `hub.challenge` como texto plano con status 200

**POST** — Recibir mensajes:
1. Leer el body como texto crudo (necesario para validar HMAC — NO parsear como JSON todavía)
2. Extraer `phoneNumberId` del body crudo con `JSON.parse(rawBody).entry[0].changes[0].value.metadata.phone_number_id`
3. Buscar el `WhatsAppChannel` por `phoneNumberId` para obtener el `webhookSecret`
4. Validar firma HMAC-SHA256: header `X-Hub-Signature-256` vs `hmac(webhookSecret, rawBody)` — retornar 403 si no coincide
5. Parsear el mensaje completo de `entry[0].changes[0].value.messages[0]`
6. Ignorar eventos que no son mensajes (actualizaciones de estado, etc.)
7. Enviar 200 OK inmediatamente a Meta (debe responder en menos de 20 segundos)
8. Procesar de forma asíncrona usando `unstable_after` de Next.js 15:
   - Obtener o crear `WhatsAppThread` para (channelId, teléfono del remitente)
   - Descifrar `accessTokenEnc` para obtener el token real
   - Si es imagen o documento: descargar del CDN de Meta, subir a la API de archivos de OpenAI
   - Agregar mensaje al hilo de OpenAI (texto + adjunto opcional)
   - Ejecutar el asistente del agente
   - Obtener el texto de respuesta
   - Llamar a `sendTextMessage` para enviar la respuesta via API de Meta
   - Actualizar `WhatsAppThread.lastMessageAt` y `messageCount`

**Nota sobre procesamiento asíncrono:** Las funciones serverless de Next.js se terminan al enviar la respuesta, lo que mataría el trabajo asíncrono. Se usa `unstable_after` de Next.js 15 para programar trabajo que continúa después de la respuesta:
```typescript
import { unstable_after as after } from 'next/server';
// Dentro del handler POST:
after(async () => { await procesarMensajeWhatsApp(...) });
return new Response('OK', { status: 200 });
```
Esto mantiene la función viva para el trabajo en segundo plano sin retener la respuesta.

### 4.3 Cliente API de Meta — `apps/web/lib/meta-api.ts`

```typescript
// Enviar un mensaje de texto
sendTextMessage(phoneNumberId: string, accessToken: string, to: string, text: string): Promise<void>

// Obtener URL de descarga de medios por ID
getMediaUrl(mediaId: string, accessToken: string): Promise<string>

// Descargar binario de medios desde la URL
downloadMedia(url: string, accessToken: string): Promise<Buffer>

// Marcar mensaje como leído (mejora de UX opcional)
markAsRead(phoneNumberId: string, accessToken: string, messageId: string): Promise<void>
```

Todas las funciones llaman a `https://graph.facebook.com/v20.0/...` con el token del canal como Bearer.

### 4.4 Runner del Agente para WhatsApp — `apps/web/lib/whatsapp-agent-runner.ts`

```typescript
runWhatsAppMessage(input: {
  agentInstance: AgentInstance & { skills: AgentSkill[] }
  thread: WhatsAppThread
  messageText: string | null
  mediaBuffer: Buffer | null    // null si es solo texto
  mediaType: string | null      // 'image/jpeg', 'application/pdf', etc.
}): Promise<string>             // devuelve el texto de respuesta del agente
```

Internamente:
1. Si hay `mediaBuffer`: sube a la API de Archivos de OpenAI, crea bloque de contenido de imagen o archivo
2. Agrega el mensaje del usuario al hilo via `openai.beta.threads.messages.create`
3. Crea una ejecución: `openai.beta.threads.runs.createAndPoll` con el ID del asistente del agente
4. Extrae el texto del mensaje final del asistente
5. Devuelve el texto de respuesta

### 4.5 Cifrado de Tokens — `apps/web/lib/crypto.ts`

```typescript
encryptToken(plaintext: string): string   // AES-256-GCM, devuelve base64
decryptToken(ciphertext: string): string  // inverso
```

Usa `process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY` (cadena hexadecimal de 32 bytes).

### 4.6 Server Actions — `apps/web/app/[locale]/(dashboard)/agents/[id]/channels/actions.ts`

```typescript
createWhatsAppChannel(input: {
  agentInstanceId: string
  phoneNumberId: string
  phoneNumber: string
  displayName: string
  accessToken: string       // plano — se cifra antes de guardar
  businessAccountId: string
  webhookSecret: string
}): Promise<{ channelId: string }>

deleteWhatsAppChannel(channelId: string): Promise<void>

getAgentChannels(agentInstanceId: string): Promise<ResumenCanal[]>

sendTestMessage(channelId: string): Promise<{ ok: boolean; error?: string }>
```

---

## 5. Componentes del Frontend

### 5.1 Actualización de RestoreHandler (`restore-handler.tsx`)

En el estado `done` (agente creado con créditos), agregar debajo del snippet:

```
[Separador]
"¿Quieres recibir mensajes por WhatsApp?"
[Botón] → Conectar WhatsApp Business → /[locale]/dashboard/agents/[agentId]/channels/connect-whatsapp
```

El estado `no_credits` también muestra la opción de WhatsApp pero en gris con tooltip "Necesitas créditos activos".

### 5.2 Wizard de Configuración WABA — `/dashboard/agents/[id]/channels/connect-whatsapp`

Wizard de 3 pasos del lado del cliente (`'use client'`):

**Paso 1 — Instrucciones:**
- Explica qué necesita el usuario de Meta Business Manager
- Guía numerada:
  1. Ir a business.facebook.com
  2. WhatsApp Manager → Números de teléfono
  3. Crear un Usuario del Sistema con permiso `whatsapp_business_messaging`
  4. Generar un token permanente (sin vencimiento)
  5. Copiar: ID del número de teléfono, Token permanente, ID de la cuenta de negocio
- URL del webhook a copiar en Meta: `https://trends172tech.com/api/webhooks/whatsapp`
- Botón "Ya tengo mis credenciales →" para ir al Paso 2

**Paso 2 — Credenciales:**
Campos del formulario:
- ID del número de teléfono (de Meta, cadena numérica)
- Número de teléfono (visible, ej. +58412...)
- Nombre visible
- Token de acceso (token permanente del usuario del sistema)
- ID de la cuenta de negocio
- Secreto del webhook (se muestra auto-generado, el usuario puede reemplazarlo — es el App Secret de Meta)

Al enviar: llama a la server action `createWhatsAppChannel` → guarda canal con token cifrado → avanza al Paso 3.

**Paso 3 — Verificación:**
- Llama a `sendTestMessage(channelId)` server action
- Muestra spinner mientras espera
- Éxito: "✅ Mensaje de prueba enviado. Revisa tu WhatsApp y confirma."
- Botón [Confirmar] → marca el canal como `ACTIVE` → muestra "Canal conectado"
- Botón [No lo recibí] → consejos de resolución de problemas (verificar permisos del token, verificar URL del webhook)

### 5.3 Panel de Canales del Agente — Pestaña Canales en `/dashboard/agents/[id]`

Renderiza `AgentChannelsPanel` (`'use client'`):
- Lista canales de `getAgentChannels(agentId)`
- Cada fila: ícono + número de teléfono + badge de estado + botones Editar / Eliminar
- Botón "Añadir canal" → /channels/connect-whatsapp
- Editar: formulario inline para actualizar nombre visible o reemplazar token
- Eliminar: diálogo de confirmación → `deleteWhatsAppChannel`

---

## 6. Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `WHATSAPP_VERIFY_TOKEN` | Token de verificación global registrado en la configuración del webhook de la Meta App |
| `WHATSAPP_TOKEN_ENCRYPTION_KEY` | Clave hexadecimal de 32 bytes para cifrado AES-256-GCM de los tokens de acceso |

---

## 7. Configuración de la Meta App (única vez, la hace Trends172Tech)

1. Crear una Meta Developer App en developers.facebook.com
2. Agregar el producto "WhatsApp" a la app
3. Registrar URL del webhook: `https://trends172tech.com/api/webhooks/whatsapp`
4. Establecer Verify Token = valor de la variable `WHATSAPP_VERIFY_TOKEN`
5. Suscribirse al campo de webhook `messages`
6. Cada cliente agrega su número WABA a la app de Trends172Tech

---

## 8. Tipos de Mensaje Soportados (MVP)

| Tipo | Manejo |
|------|--------|
| `text` | Se pasa directamente al hilo de OpenAI |
| `image` | Se descarga del CDN de Meta, se sube a OpenAI, se agrega como contenido de visión |
| `document` (PDF) | Se descarga, se sube a archivos de OpenAI, se agrega como adjunto |
| `audio` | Respuesta: "Solo puedo responder mensajes de texto e imágenes por ahora." |
| `video` | Igual que audio — no soportado en el MVP |
| `sticker` | Se ignora silenciosamente |
| `location` | Se responde con la versión en texto de las coordenadas |

---

## 9. Fuera del Alcance (MVP)

- Enviar imágenes o medios de vuelta al usuario (solo respuestas de texto)
- Plantillas de mensajes / HSM (campañas salientes)
- Enrutamiento multi-agente en un mismo número
- Canal de Instagram DM o Messenger (futuro)
- Cola con BullMQ (agregar si el volumen lo requiere)
- Confirmaciones de lectura más allá del marcado básico
