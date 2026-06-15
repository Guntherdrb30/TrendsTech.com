# Wizard de Creación de Agentes — Chat Intake + Conocimiento

**Fecha:** 2026-06-14
**Estado:** Aprobado
**Alcance:** Rediseñar el wizard público de creación de agentes para que comience con una entrevista conversacional (chat-style) donde el sistema asesora al cliente, recopila información de la empresa, recomienda skills y procesa el conocimiento automáticamente.

---

## 1. Resumen

El wizard actual comienza pidiendo nombre/descripción/idioma. El nuevo flujo invierte la lógica: **el sistema entrevista primero, configura después**. Una interfaz de chat simula que el propio agente entrevista al cliente, recopila el contexto de la empresa (descripción, sitio web, objetivos), recomienda habilidades y sugiere el nombre del agente. Toda esa información se convierte en el conocimiento base del agente al crearlo.

---

## 2. Nuevo Flujo del Wizard

```
Paso 1: Chat Intake (NUEVO)
  → el "agente" entrevista al cliente con preguntas secuenciales
  → recopila: descripción empresa, URL web, objetivos, canal objetivo
  → al terminar: recomienda nombre, skills y muestra resumen

Paso 2: Skills (existente, mejorado)
  → pre-selecciona las skills recomendadas por el intake
  → cliente confirma o ajusta

Paso 3: Resumen (existente)
  → muestra configuración + conocimiento recopilado

Paso 4: Auth wall (existente)
  → "Crear cuenta para activar"
  → guarda todo en sessionStorage (config + conocimiento)

Post-login: RestoreHandler (mejorado)
  → crea AgentInstance
  → dispara ingesta de conocimiento (texto + URL si la hay)
  → muestra progreso de indexación
  → ofrece subir PDFs/Excel adicionales
  → ofrece selección de canal (Web snippet o WhatsApp)
```

---

## 3. Diseño del Chat Intake (Paso 1)

### 3.1 Interfaz

La pantalla parece un chat real:
- Burbujas del "agente" a la izquierda (fondo oscuro/teal, avatar de robot)
- Respuestas del cliente a la derecha
- Input de texto en la parte inferior
- Opciones de selección rápida (chips) cuando aplica
- Indicador de "escribiendo..." entre preguntas

El componente es completamente cliente (`'use client'`) con estado de máquina de pasos.

### 3.2 Secuencia de preguntas (guion)

**Mensaje de bienvenida:**
> "¡Hola! Soy tu asistente de configuración 🤖 Vamos a crear tu agente de IA juntos. Te haré unas preguntas rápidas para entender tu empresa y configurarlo perfectamente. ¿Empezamos?"
> [Botón: Sí, empecemos →]

**Pregunta 1 — Empresa:**
> "Primero, ¿a qué se dedica tu empresa? Cuéntame qué haces, qué vendes o qué servicio ofreces. Mientras más detalle, mejor configurado quedará tu agente."
> [Input de texto libre — mínimo 20 caracteres]

**Pregunta 2 — Sitio web:**
> "Perfecto, gracias. Ahora dime: ¿tienes un sitio web? Si me das la URL, lo reviso y extraigo toda la información automáticamente — así tu agente ya sabrá todo sobre tu empresa desde el primer minuto."
> [Opciones: "Sí, tengo web" | "No tengo sitio web"]
> — Si "Sí": muestra campo URL
> — Si "No": va directo a Pregunta 3b

**Pregunta 2b — Información adicional (si tiene web):**
> "Excelente, revisaré [URL]. ¿Hay información importante que no esté en tu web? Por ejemplo: precios especiales, políticas internas, datos de contacto adicionales o cualquier cosa que quieras que el agente conozca."
> [Textarea opcional — "Saltar si no aplica"]

**Pregunta 3 — Sin web (descripción detallada):**
> "No hay problema. Entonces cuéntame más: ¿qué productos o servicios ofreces, cuáles son tus precios aproximados, dónde operas y cómo pueden contactarte tus clientes?"
> [Textarea — guía de ejemplo visible como placeholder]

**Pregunta 4 — Objetivos:**
> "Casi listo. ¿Cuál es el objetivo principal de tu agente? Puedes elegir más de uno."
> [Chips multi-selección]:
> - 💬 Atender clientes 24/7
> - 📦 Recibir y gestionar pedidos
> - 💰 Responder preguntas de precios
> - 📅 Agendar citas o reuniones
> - 🔧 Soporte técnico
> - 📣 Ventas y cotizaciones
> - 📍 Informar sobre ubicación y horarios

**Pregunta 5 — Canal principal:**
> "¿Dónde quieres que opere principalmente tu agente?"
> [Opciones]: "En mi sitio web" | "En WhatsApp" | "En ambos"

**Mensaje de cierre + recomendación:**
> "¡Perfecto! Con lo que me contaste, ya tengo todo lo que necesito. Aquí está la configuración que te recomiendo:"
> [Muestra: nombre sugerido, skills recomendadas, resumen del conocimiento recopilado]
> [Botón: "Me gusta, continuar →" | "Ajustar manualmente"]

### 3.3 Estado que se guarda del intake

```typescript
type IntakeResult = {
  companyDescription: string        // Respuesta a pregunta 1
  websiteUrl: string | null         // URL si la proporcionó
  additionalInfo: string | null     // Info extra más allá de la web
  objectives: string[]              // Chips seleccionados
  targetChannel: 'web' | 'whatsapp' | 'both'
  suggestedAgentName: string        // Generado por lógica o GPT
  recommendedSkillKeys: string[]    // Basado en sector + objetivos
}
```

### 3.4 Lógica de recomendación de skills

Al terminar el intake, una llamada a `/api/intake/recommend` (o lógica cliente simple) mapea:
- Objetivo "pedidos" → skill `order_management`
- Objetivo "citas" → skill `appointment_booking`
- Objetivo "precios" → skill `price_inquiry`
- Objetivo "soporte" → skill `technical_support`
- Sector detectado (palabras clave en descripción) → skills de industria

Para el nombre sugerido: se genera con una llamada ligera a GPT-4o-mini pasando la descripción de la empresa, devuelve un nombre corto y profesional para el agente.

---

## 4. Conocimiento Recopilado

### 4.1 Qué se guarda en sessionStorage

```typescript
// Se agrega a pendingAgentConfig en sessionStorage
type PendingKnowledge = {
  textContent: string | null       // descripción + additionalInfo concatenados
  websiteUrl: string | null        // URL para indexar
}
```

### 4.2 Procesamiento post-login en RestoreHandler

Después de crear el `AgentInstance`, el RestoreHandler:

1. Si hay `textContent`:
   - Llama server action `createKnowledgeSource({ type: 'TEXT', rawText: textContent, agentInstanceId })`
   - El pipeline de BullMQ existente lo procesa (chunking + embeddings)

2. Si hay `websiteUrl`:
   - Llama server action `createKnowledgeSource({ type: 'URL', url: websiteUrl, agentInstanceId })`
   - El worker existente lo indexa (respetando robots.txt, hasta N páginas)

3. Muestra barra de progreso en tiempo real (polling cada 3s al estado del `KnowledgeSource`)

4. Mientras indexa, muestra el resto del flujo (canal, snippet, PDFs adicionales) — no bloquea

### 4.3 UI post-login mejorada

El estado `done` del RestoreHandler se convierte en una pantalla de 3 secciones:

**Sección 1 — Conocimiento:**
- Badge "Indexando..." con spinner mientras procesa
- Al terminar: "✅ Tu agente ya conoce tu empresa"
- Botones: Subir PDF | Subir Excel | Agregar URL | Agregar texto

**Sección 2 — Canal:**
- "¿Dónde lo despliegas?" con las dos opciones (Web + WhatsApp)
- Si en intake eligió canal, ese aparece pre-seleccionado
- Web: muestra snippet copiable
- WhatsApp: link → /dashboard/agents/[id]/channels/connect-whatsapp

**Sección 3 — Siguiente paso:**
- Link al dashboard del agente para configuración avanzada

---

## 5. Cambios en Componentes Existentes

### 5.1 `public-agent-wizard.tsx`

- Se agregan 2 "pre-pasos" antes del wizard actual: `intake-chat`
- Al completar el intake, los campos `name`, `description`, `language` del wizard se pre-rellenan con los valores sugeridos
- La pantalla de skills muestra pre-seleccionadas las `recommendedSkillKeys` del intake
- El resumen muestra también el conocimiento recopilado

### 5.2 `pendingAgentConfig` en sessionStorage

Se extiende con:
```typescript
{
  // campos existentes
  name: string
  description: string
  language: 'ES' | 'EN'
  skillIds: string[]
  // campos nuevos
  knowledge: {
    textContent: string | null
    websiteUrl: string | null
  }
  targetChannel: 'web' | 'whatsapp' | 'both'
}
```

### 5.3 `restore-handler.tsx`

- Lee `knowledge` de la config guardada
- Llama `createKnowledgeFromSession(input)` server action (nueva)
- Muestra sección de estado de indexación con polling
- Reemplaza el estado `done` actual con la UI de 3 secciones descrita arriba

---

## 6. Nuevo componente: `IntakeChatWizard`

Archivo: `apps/web/app/[locale]/(public)/crear-agente/intake-chat.tsx`

- `'use client'`
- Estado: `messages: ChatMessage[]`, `step: number`, `answers: Partial<IntakeResult>`
- Renderiza burbujas de chat con animación de "escribiendo..."
- Delay de 600-800ms entre mensaje del agente y siguiente input para sentirse natural
- Al completar: llama al callback `onIntakeComplete(result: IntakeResult)`
- `PublicAgentWizard` recibe el resultado y salta directo al paso de skills con datos pre-cargados

---

## 7. Nueva Server Action

```typescript
// apps/web/app/[locale]/(public)/crear-agente/actions.ts (agregar)

export async function createKnowledgeFromSession(input: {
  agentInstanceId: string
  textContent: string | null
  websiteUrl: string | null
}): Promise<{ sourceIds: string[] }>
// Crea KnowledgeSource records y encola los jobs de procesamiento
```

---

## 8. API Route para Recomendación (opcional, ligera)

```
POST /api/intake/recommend
Body: { description: string, objectives: string[] }
Response: { suggestedName: string, skillKeys: string[] }
```

Usa GPT-4o-mini con prompt simple. Costo ~$0.0001 por llamada. Si falla, usa lógica de palabras clave como fallback.

---

## 9. Fuera del Alcance (MVP)

- Subir PDFs/Excel en el intake antes del login (requiere autenticación)
- Indexación en tiempo real durante el chat (se hace post-login)
- Base de datos externa como fuente de conocimiento (futuro)
- Múltiples URLs durante el intake (solo una; más se agregan desde el dashboard)
- Procesamiento de audio/video como fuente de conocimiento
