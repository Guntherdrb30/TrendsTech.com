# WhatsApp WABA Integration — Design Spec

**Date:** 2026-06-14  
**Status:** Approved  
**Scope:** Enable clients to connect their own WhatsApp Business API (WABA) numbers to their agents, with persistent conversation memory and image/document processing.

---

## 1. Overview

Clients who create an agent via the `/crear-agente` wizard can connect their own Meta WABA phone number so their end-users can chat with the agent directly on WhatsApp. The agent remembers conversation context per user (OpenAI thread per user phone number) and can process images sent by end-users using GPT-4o vision.

---

## 2. Architecture

**Pattern:** Global webhook + internal routing + OpenAI threads per user

```
End User → WhatsApp → Meta Cloud API → POST /api/webhooks/whatsapp
  → lookup WhatsAppChannel by phoneNumberId
  → get or create WhatsAppThread (channelId, userPhone) → OpenAI threadId
  → [if image] download from Meta CDN → upload to OpenAI
  → add message to thread → run assistant
  → send text response via Meta sendMessage API
  → End User receives reply
```

Meta sends all webhook events to a single URL registered per Meta App. The system routes by `entry[0].changes[0].value.metadata.phone_number_id`.

---

## 3. Database Schema

### WhatsAppChannel (extend existing model)

Add the following fields to the existing `WhatsAppChannel` model:

| Field | Type | Description |
|-------|------|-------------|
| `phoneNumberId` | String unique | Meta internal phone number ID (from Business Manager) |
| `displayName` | String? | Display name of the phone number |
| `accessTokenEnc` | String | AES-encrypted permanent system user access token |
| `businessAccountId` | String | Meta WABA Business Account ID |

The existing `webhookSecret` field is repurposed as the HMAC-SHA256 signing secret (per-channel, set by Meta).

### WhatsAppThread (new model)

```prisma
model WhatsAppThread {
  id             String          @id @default(cuid())
  channelId      String
  userPhone      String          // End-user's WhatsApp phone number (E.164)
  openaiThreadId String          // OpenAI beta thread ID
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

## 4. Backend Components

### 4.1 Prisma Migration
- Add `phoneNumberId`, `displayName`, `accessTokenEnc`, `businessAccountId` to `WhatsAppChannel`
- Add `threads` relation to `WhatsAppChannel`
- Add `WhatsAppThread` model
- Run `prisma migrate dev`

### 4.2 Webhook Endpoint — `apps/web/app/api/webhooks/whatsapp/route.ts`

**GET** — Meta verification handshake:
- Reads `hub.mode`, `hub.verify_token`, `hub.challenge` from query params
- Validates `hub.verify_token === process.env.WHATSAPP_VERIFY_TOKEN`
- Returns `hub.challenge` as plain text with 200

**POST** — Receive messages:
1. Read raw body as text (needed for HMAC validation — do NOT parse as JSON yet)
2. Extract `phoneNumberId` from raw body via `JSON.parse(rawBody).entry[0].changes[0].value.metadata.phone_number_id`
3. Fetch `WhatsAppChannel` by `phoneNumberId` to get `webhookSecret`
4. Validate HMAC-SHA256 signature: `X-Hub-Signature-256` header vs `hmac(webhookSecret, rawBody)` — return 403 on mismatch
5. Now parse full message from `entry[0].changes[0].value.messages[0]`
4. Ignore non-message events (status updates, etc.)
5. Send immediate 200 OK to Meta (must respond within 20s)
6. Process asynchronously:
   - Get or create `WhatsAppThread` for (channelId, from)
   - Decrypt `accessTokenEnc` to get raw token
   - If image/document: download from Meta CDN, upload to OpenAI files API
   - Add message to OpenAI thread (text + optional file attachment)
   - Run OpenAI assistant (agentInstance's baseAgentKey config)
   - Get response text
   - Call `sendTextMessage` to send reply via Meta API
   - Update `WhatsAppThread.lastMessageAt` and `messageCount`

**Note on async processing:** Next.js serverless functions terminate when the response is sent, which would kill async work. Use Next.js `unstable_after` (available in Next.js 15) to schedule work that continues after the response:
```typescript
import { unstable_after as after } from 'next/server';
// Inside POST handler:
after(async () => { await processWhatsAppMessage(...) });
return new Response('OK', { status: 200 });
```
This keeps the function alive for the background work without holding the response.

### 4.3 Meta API Client — `apps/web/lib/meta-api.ts`

```typescript
// Send a text message
sendTextMessage(phoneNumberId: string, accessToken: string, to: string, text: string): Promise<void>

// Get media download URL from media ID
getMediaUrl(mediaId: string, accessToken: string): Promise<string>

// Download media binary from URL
downloadMedia(url: string, accessToken: string): Promise<Buffer>

// Mark message as read (optional UX improvement)
markAsRead(phoneNumberId: string, accessToken: string, messageId: string): Promise<void>
```

All functions call `https://graph.facebook.com/v20.0/...` with the channel's access token as Bearer.

### 4.4 WhatsApp Agent Runner — `apps/web/lib/whatsapp-agent-runner.ts`

```typescript
runWhatsAppMessage(input: {
  agentInstance: AgentInstance & { skills: AgentSkill[] }
  thread: WhatsAppThread
  messageText: string | null
  mediaBuffer: Buffer | null    // null if text-only
  mediaType: string | null      // 'image/jpeg', 'application/pdf', etc.
}): Promise<string>             // returns agent response text
```

Internally:
1. If `mediaBuffer`: upload to OpenAI Files API, create `image_url` or file content block
2. Add user message to `thread.openaiThreadId` via `openai.beta.threads.messages.create`
3. Create run: `openai.beta.threads.runs.createAndPoll` with the agent's assistant ID (or inline instructions from skills)
4. Extract text from run's messages
5. Return final assistant message text

### 4.5 Token Encryption — `apps/web/lib/crypto.ts` (extend existing or new)

```typescript
encryptToken(plaintext: string): string   // AES-256-GCM, returns base64
decryptToken(ciphertext: string): string  // reverse
```

Uses `process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY` (32-byte hex string).

### 4.6 Server Actions — `apps/web/app/[locale]/(dashboard)/agents/[id]/channels/actions.ts`

```typescript
createWhatsAppChannel(input: {
  agentInstanceId: string
  phoneNumberId: string
  phoneNumber: string
  displayName: string
  accessToken: string       // plain — will be encrypted before saving
  businessAccountId: string
  webhookSecret: string
}): Promise<{ channelId: string }>

deleteWhatsAppChannel(channelId: string): Promise<void>

getAgentChannels(agentInstanceId: string): Promise<ChannelSummary[]>

sendTestMessage(channelId: string): Promise<{ ok: boolean; error?: string }>
```

---

## 5. Frontend Components

### 5.1 RestoreHandler Update (`restore-handler.tsx`)

In the `done` state (agent created with credits), add below the snippet:

```
[Divider]
"¿Quieres recibir mensajes por WhatsApp?"
[Botón] → Conectar WhatsApp Business → /[locale]/dashboard/agents/[agentId]/channels/connect-whatsapp
```

The `no_credits` state also shows the WhatsApp option but grayed with tooltip "Necesitas créditos activos".

### 5.2 WABA Connect Wizard — `/dashboard/agents/[id]/channels/connect-whatsapp`

3-step client-side wizard (`'use client'`):

**Step 1 — Instrucciones:**
- Explains what the user needs from Meta Business Manager
- Numbered guide:
  1. Go to business.facebook.com
  2. WhatsApp Manager → Phone Numbers
  3. Create a System User with `whatsapp_business_messaging` permission
  4. Generate a permanent token (never expires)
  5. Copy: Phone Number ID, Permanent Token, Business Account ID
- "Ya tengo mis credenciales →" button to Step 2

**Step 2 — Credenciales:**
Form fields:
- Phone Number ID (from Meta, numeric string)
- Phone Number (display, e.g. +58412...)
- Display Name
- Access Token (permanent system user token)
- Business Account ID
- Webhook Secret (shown as auto-generated, user can override — this is the App Secret from Meta)

On submit: calls `createWhatsAppChannel` server action → saves channel with encrypted token → advances to Step 3.

**Step 3 — Verificación:**
- Calls `sendTestMessage(channelId)` server action
- Shows spinner while waiting
- Success: "✅ Mensaje de prueba enviado. Revisa tu WhatsApp y confirma."
- [Confirmar] button → marks channel `ACTIVE` → shows "Canal conectado" 
- [No lo recibí] → troubleshooting tips (check token permissions, verify webhook URL)

**Webhook URL shown to user:** `https://trends172tech.com/api/webhooks/whatsapp`

### 5.3 Dashboard Agent Detail — Canales Tab

Route: `/dashboard/agents/[id]` — add `canales` tab

Renders `AgentChannelsPanel` ('use client'):
- Lists channels from `getAgentChannels(agentId)`
- Each row: icon + phone number + status badge + Edit / Delete buttons
- "Añadir canal" button → /channels/connect-whatsapp
- Edit: opens inline form to update displayName or replace token
- Delete: confirm dialog → `deleteWhatsAppChannel`

---

## 6. Environment Variables

| Variable | Description |
|----------|-------------|
| `WHATSAPP_VERIFY_TOKEN` | Global verify token registered in Meta App webhook config |
| `WHATSAPP_TOKEN_ENCRYPTION_KEY` | 32-byte hex key for AES-256-GCM encryption of access tokens |

---

## 7. Meta App Setup (one-time, done by Trends172Tech)

1. Create a Meta Developer App at developers.facebook.com
2. Add "WhatsApp" product to the app
3. Register webhook URL: `https://trends172tech.com/api/webhooks/whatsapp`
4. Set Verify Token = `WHATSAPP_VERIFY_TOKEN` env value
5. Subscribe to `messages` webhook field
6. Each client adds their WABA phone number to the Trends172Tech app (or uses their own app — this is configurable)

---

## 8. Message Type Support (MVP)

| Type | Handling |
|------|----------|
| `text` | Pass directly to OpenAI thread |
| `image` | Download from Meta CDN, upload to OpenAI, add as vision content |
| `document` (PDF) | Download, upload to OpenAI files, add as file attachment |
| `audio` | Respond: "Solo puedo responder mensajes de texto e imágenes por ahora." |
| `video` | Same as audio — not supported in MVP |
| `sticker` | Ignore silently |
| `location` | Respond with text version of coordinates |

---

## 9. Out of Scope (MVP)

- Sending images or media back to users (text-only responses)
- Message templates / HSM (outbound campaigns)
- Multi-agent routing within one number
- Instagram DM or Messenger channels (future)
- BullMQ queuing (add if throughput demands it)
- Read receipts beyond basic marking
