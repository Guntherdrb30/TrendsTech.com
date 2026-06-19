# Agent Creator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el Agent Creator — experiencia principal de Trends172Tech donde el usuario elige skills especializadas, ve el precio en tiempo real y obtiene su snippet de instalación.

**Architecture:** Wizard multi-step cliente (4 pasos: info → skills → resumen → snippet) con server actions en Next.js 15 App Router. El schema se extiende con dos nuevos modelos (`Skill`, `AgentSkill`) sin tocar ningún modelo existente. El `contextBuilder.ts` recibe una modificación mínima para inyectar las skills activas en el `system_context` del orquestador.

**Tech Stack:** Next.js 15 App Router, TypeScript estricto, Prisma 5 + PostgreSQL, shadcn/ui (Button, Card, Input, Label), Tailwind CSS, BullMQ no involucrado.

---

## Mapa de archivos

| Operación | Ruta |
|---|---|
| **Modificar** | `packages/db/prisma/schema.prisma` |
| **Crear** | `packages/db/prisma/seeds/skills.ts` |
| **Modificar** | `packages/db/prisma/seed.ts` |
| **Crear** | `apps/web/app/[locale]/(app)/dashboard/agents/create/actions.ts` |
| **Crear** | `apps/web/app/[locale]/(app)/dashboard/agents/create/skill-card.tsx` |
| **Crear** | `apps/web/app/[locale]/(app)/dashboard/agents/create/price-sidebar.tsx` |
| **Crear** | `apps/web/app/[locale]/(app)/dashboard/agents/create/agent-creator-client.tsx` |
| **Crear** | `apps/web/app/[locale]/(app)/dashboard/agents/create/page.tsx` |
| **Modificar** | `apps/web/app/lib/orchestrator/contextBuilder.ts` |
| **Crear** | `apps/web/app/[locale]/(public)/skills/page.tsx` |

---

## Task 1: Schema — Agregar Skill, AgentSkill y relación en AgentInstance

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (al final del archivo + en AgentInstance)

- [ ] **Step 1: Agregar los dos modelos al final de schema.prisma**

Abrir `packages/db/prisma/schema.prisma`. Localizar la última línea (`}`  del modelo `DevUsageMetric`, línea ~1422) y agregar los modelos justo después:

```prisma
model Skill {
  id            String   @id @default(cuid())
  key           String   @unique
  name          String
  nameEn        String
  industry      String
  industryEn    String
  icon          String
  description   String
  descriptionEn String
  promptJson    Json
  mapJson       Json
  questionsJson Json
  priceMonthly  Float    @default(15)
  isActive      Boolean  @default(true)
  isFeatured    Boolean  @default(false)
  sortOrder     Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  agentSkills AgentSkill[]
}

model AgentSkill {
  id              String   @id @default(cuid())
  agentInstanceId String
  skillId         String
  isEnabled       Boolean  @default(true)
  configJson      Json?
  createdAt       DateTime @default(now())

  agentInstance AgentInstance @relation(fields: [agentInstanceId], references: [id], onDelete: Cascade)
  skill         Skill         @relation(fields: [skillId], references: [id])

  @@unique([agentInstanceId, skillId])
  @@index([agentInstanceId])
  @@index([skillId])
}
```

- [ ] **Step 2: Agregar la relación skills en AgentInstance**

En el modelo `AgentInstance` (línea ~383), justo después de `accessLogs AccessLog[]`, agregar:

```prisma
  skills          AgentSkill[]
```

El modelo debe quedar así al final del bloque de relaciones:

```prisma
  whatsappChannel WhatsAppChannel?
  knowledge       KnowledgeSource[]
  installs        Install[]
  knowledgeChunks KnowledgeChunk[]
  tokenUsageLogs  TokenUsageLog[]
  agentSessions   AgentSession[]
  accesses        AgentAccess[]
  accessLogs      AccessLog[]
  skills          AgentSkill[]
```

- [ ] **Step 3: Ejecutar la migración**

```bash
cd d:\trends172tech.com\trends172tech
npm run db:migrate -- --name agent_creator_skills
```

Salida esperada: `✔ Your database is now in sync with your schema.`

- [ ] **Step 4: Verificar que el cliente Prisma se regeneró**

```bash
npm run prisma -- generate
```

Verificar que no hay errores de tipo.

---

## Task 2: Seed de Skills (18 skills en 5 industrias)

**Files:**
- Create: `packages/db/prisma/seeds/skills.ts`
- Modify: `packages/db/prisma/seed.ts`

- [ ] **Step 1: Crear el directorio y archivo del seed de skills**

Crear `packages/db/prisma/seeds/skills.ts` con el contenido completo:

```typescript
import { PrismaClient } from '@prisma/client';

const SKILLS = [
  // ─── HOGAR Y CONSTRUCCIÓN ────────────────────────────────────────────────
  {
    key: 'cocina',
    name: 'Cocina',
    nameEn: 'Kitchen',
    industry: 'hogar',
    industryEn: 'Home & Construction',
    icon: '🍳',
    description: 'Asesoría experta en diseño y configuración de cocinas: materiales, colores, presupuesto.',
    descriptionEn: 'Expert advisory for kitchen design and configuration: materials, colors, budget.',
    priceMonthly: 15,
    isFeatured: true,
    sortOrder: 1,
    promptJson: {
      system: 'Eres un asesor experto en diseño de cocinas. Ayudas a los clientes a planificar su cocina ideal, eligiendo materiales, acabados, configuración de espacios y presupuesto. Siempre haces preguntas de levantamiento antes de recomendar.',
      instructions: [
        'Pregunta siempre las dimensiones del espacio antes de recomendar',
        'Ofrece opciones en diferentes rangos de precio',
        'Explica ventajas de cada material y acabado',
        'Ayuda a priorizar elementos según el presupuesto'
      ]
    },
    mapJson: {
      secciones: [
        'muebles_superiores', 'muebles_inferiores', 'perfil_gola',
        'meson_superficie', 'fregadero_griferia', 'accesorios_internos',
        'iluminacion', 'piso', 'revestimiento_paredes', 'isla',
        'electrodomesticos', 'electrico', 'tornilleria', 'decoracion'
      ]
    },
    questionsJson: [
      { id: 'dimensiones', question: '¿Cuáles son las dimensiones del espacio (largo x ancho)?', type: 'text' },
      { id: 'presupuesto', question: '¿Cuál es tu presupuesto estimado?', type: 'text' },
      { id: 'estilo', question: '¿Qué estilo prefieres? (moderno, clásico, rústico, minimalista)', type: 'select', options: ['moderno', 'clasico', 'rustico', 'minimalista'] },
      { id: 'electrodomesticos', question: '¿Incluyes electrodomésticos en el proyecto?', type: 'boolean' },
      { id: 'isla', question: '¿El espacio permite incluir una isla central?', type: 'boolean' },
      { id: 'plazo', question: '¿En cuánto tiempo necesitas el proyecto terminado?', type: 'text' }
    ]
  },
  {
    key: 'bano',
    name: 'Baño',
    nameEn: 'Bathroom',
    industry: 'hogar',
    industryEn: 'Home & Construction',
    icon: '🚿',
    description: 'Diseño y asesoría en remodelación de baños: griferías, revestimientos, sanitarios.',
    descriptionEn: 'Bathroom remodeling advisory: fixtures, tiles, sanitary ware.',
    priceMonthly: 15,
    isFeatured: false,
    sortOrder: 2,
    promptJson: {
      system: 'Eres un asesor experto en diseño de baños. Ayudas a los clientes a planificar remodelaciones completas o parciales, eligiendo griferías, revestimientos, sanitarios y accesorios.',
      instructions: [
        'Pregunta si es remodelación total o parcial',
        'Consulta el presupuesto disponible antes de recomendar',
        'Explica diferencias entre materiales (porcelana, cerámica, piedra)',
        'Sugiere tendencias de diseño según el estilo preferido'
      ]
    },
    mapJson: {
      secciones: ['sanitarios', 'griferia', 'revestimiento_piso', 'revestimiento_paredes', 'mueble_vanidad', 'espejo', 'accesorios', 'iluminacion', 'ventilacion']
    },
    questionsJson: [
      { id: 'tipo', question: '¿Es baño principal, secundario o de servicio?', type: 'select', options: ['principal', 'secundario', 'servicio'] },
      { id: 'remodelacion', question: '¿Remodelación total o parcial?', type: 'select', options: ['total', 'parcial'] },
      { id: 'dimensiones', question: '¿Dimensiones aproximadas del baño?', type: 'text' },
      { id: 'presupuesto', question: '¿Cuál es tu presupuesto?', type: 'text' }
    ]
  },
  {
    key: 'closet',
    name: 'Clóset',
    nameEn: 'Closet',
    industry: 'hogar',
    industryEn: 'Home & Construction',
    icon: '👔',
    description: 'Asesoría en diseño de clósets y vestidores a medida: distribución, materiales y accesorios.',
    descriptionEn: 'Custom closet and dressing room design: layout, materials, accessories.',
    priceMonthly: 15,
    isFeatured: false,
    sortOrder: 3,
    promptJson: {
      system: 'Eres un asesor experto en diseño de clósets y vestidores a medida. Ayudas a optimizar el espacio disponible con soluciones funcionales y estéticas.',
      instructions: [
        'Pregunta dimensiones y tipo de apertura (puertas corredizas, abatibles, sin puertas)',
        'Consulta qué se va a guardar (ropa, zapatos, accesorios, ropa de cama)',
        'Propón distribución de cajones, colgadores, estantes y zapateras',
        'Sugiere materiales según presupuesto'
      ]
    },
    mapJson: {
      secciones: ['colgadores', 'cajones', 'estantes', 'zapatera', 'accesorios_internos', 'puertas', 'iluminacion', 'espejo']
    },
    questionsJson: [
      { id: 'dimensiones', question: '¿Dimensiones del espacio (largo x alto x fondo)?', type: 'text' },
      { id: 'tipo_apertura', question: '¿Tipo de apertura?', type: 'select', options: ['corredizas', 'abatibles', 'sin_puertas', 'walk_in'] },
      { id: 'uso', question: '¿Para cuántas personas es?', type: 'text' },
      { id: 'presupuesto', question: '¿Presupuesto disponible?', type: 'text' }
    ]
  },
  {
    key: 'sala_tv',
    name: 'Sala / Mueble TV',
    nameEn: 'Living Room / TV Cabinet',
    industry: 'hogar',
    industryEn: 'Home & Construction',
    icon: '🛋️',
    description: 'Diseño de salas de estar y muebles para TV: sofás, mesas, estanterías y decoración.',
    descriptionEn: 'Living room and TV cabinet design: sofas, tables, shelving, decoration.',
    priceMonthly: 15,
    isFeatured: false,
    sortOrder: 4,
    promptJson: {
      system: 'Eres un asesor experto en diseño de salas de estar y muebles para TV. Ayudas a crear espacios confortables y estéticos adaptados al tamaño del televisor y del ambiente.',
      instructions: [
        'Pregunta el tamaño del televisor y la distancia de visualización ideal',
        'Consulta si el mueble es solo para TV o incluye almacenamiento',
        'Sugiere combinaciones de materiales y colores',
        'Considera el flujo de personas en el espacio'
      ]
    },
    mapJson: {
      secciones: ['mueble_tv', 'sofa', 'mesa_centro', 'estanteria', 'iluminacion', 'decoracion', 'alfombra']
    },
    questionsJson: [
      { id: 'dimension_tv', question: '¿Tamaño del televisor (pulgadas)?', type: 'text' },
      { id: 'dimensiones_sala', question: '¿Dimensiones de la sala?', type: 'text' },
      { id: 'estilo', question: '¿Estilo preferido?', type: 'select', options: ['moderno', 'clasico', 'minimalista', 'industrial'] },
      { id: 'almacenamiento', question: '¿Necesitas almacenamiento adicional?', type: 'boolean' }
    ]
  },
  {
    key: 'dormitorio',
    name: 'Dormitorio',
    nameEn: 'Bedroom',
    industry: 'hogar',
    industryEn: 'Home & Construction',
    icon: '🛏️',
    description: 'Diseño completo de dormitorios: camas, mesas de noche, cómodas y ambiente.',
    descriptionEn: 'Complete bedroom design: beds, nightstands, dressers, ambiance.',
    priceMonthly: 15,
    isFeatured: false,
    sortOrder: 5,
    promptJson: {
      system: 'Eres un asesor experto en diseño de dormitorios. Ayudas a crear espacios de descanso confortables, funcionales y estéticamente agradables.',
      instructions: [
        'Pregunta si es dormitorio principal, infantil o de huéspedes',
        'Consulta dimensiones y orientación del cuarto',
        'Sugiere distribución óptima del mobiliario',
        'Recomienda paleta de colores para el descanso'
      ]
    },
    mapJson: {
      secciones: ['cama', 'cabecero', 'mesitas_noche', 'comoda', 'espejo', 'iluminacion', 'cortinas', 'alfombra', 'closet']
    },
    questionsJson: [
      { id: 'tipo', question: '¿Tipo de dormitorio?', type: 'select', options: ['principal', 'infantil', 'huespedes'] },
      { id: 'dimensiones', question: '¿Dimensiones del cuarto?', type: 'text' },
      { id: 'cama', question: '¿Tamaño de cama?', type: 'select', options: ['sencilla', 'doble', 'queen', 'king'] },
      { id: 'presupuesto', question: '¿Presupuesto disponible?', type: 'text' }
    ]
  },

  // ─── SALUD ──────────────────────────────────────────────────────────────
  {
    key: 'odontologia',
    name: 'Odontología',
    nameEn: 'Dentistry',
    industry: 'salud',
    industryEn: 'Health',
    icon: '🦷',
    description: 'Recepcionista virtual para consultorios: citas, tratamientos, preguntas frecuentes.',
    descriptionEn: 'Virtual receptionist for dental offices: appointments, treatments, FAQ.',
    priceMonthly: 15,
    isFeatured: true,
    sortOrder: 1,
    promptJson: {
      system: 'Eres el asistente virtual de un consultorio odontológico. Atiendes consultas sobre tratamientos, agendas citas, respondes preguntas frecuentes y orientas a los pacientes sobre preparativos y cuidados.',
      instructions: [
        'Nunca des diagnósticos médicos, solo orienta sobre los servicios del consultorio',
        'Siempre ofrece agendar una cita ante cualquier síntoma',
        'Informa sobre tratamientos disponibles con descripción amable',
        'Recuerda a los pacientes llevar su seguro médico si aplica'
      ]
    },
    mapJson: {
      servicios: ['limpieza', 'blanqueamiento', 'ortodoncia', 'implantes', 'extracciones', 'endodoncia', 'protesis', 'cirugia_oral']
    },
    questionsJson: [
      { id: 'motivo', question: '¿Cuál es el motivo de tu consulta?', type: 'text' },
      { id: 'primera_vez', question: '¿Es tu primera visita a nuestra clínica?', type: 'boolean' },
      { id: 'urgencia', question: '¿Estás experimentando dolor o urgencia?', type: 'boolean' }
    ]
  },
  {
    key: 'medicina_general',
    name: 'Medicina General',
    nameEn: 'General Medicine',
    industry: 'salud',
    industryEn: 'Health',
    icon: '🩺',
    description: 'Asistente para consultorios médicos: citas, información sobre servicios y orientación básica.',
    descriptionEn: 'Assistant for medical offices: appointments, service information, basic guidance.',
    priceMonthly: 15,
    isFeatured: false,
    sortOrder: 2,
    promptJson: {
      system: 'Eres el asistente virtual de un consultorio de medicina general. Orientas a los pacientes, agendas citas y brindas información sobre los servicios médicos disponibles.',
      instructions: [
        'Nunca diagnostiques enfermedades',
        'Ante cualquier síntoma, recomienda una consulta presencial',
        'Informa sobre los horarios y especialidades disponibles',
        'Explica cómo prepararse para exámenes de laboratorio si te preguntan'
      ]
    },
    mapJson: {
      servicios: ['consulta_general', 'examenes_laboratorio', 'vacunacion', 'medicina_preventiva', 'certificados_medicos', 'referencias']
    },
    questionsJson: [
      { id: 'motivo', question: '¿Cuál es el motivo de tu consulta?', type: 'text' },
      { id: 'primera_vez', question: '¿Es tu primera vez con nosotros?', type: 'boolean' }
    ]
  },
  {
    key: 'nutricion',
    name: 'Nutrición',
    nameEn: 'Nutrition',
    industry: 'salud',
    industryEn: 'Health',
    icon: '🥗',
    description: 'Orientación nutricional: planes de alimentación, consultas de seguimiento y hábitos saludables.',
    descriptionEn: 'Nutritional guidance: meal plans, follow-up consultations, healthy habits.',
    priceMonthly: 15,
    isFeatured: false,
    sortOrder: 3,
    promptJson: {
      system: 'Eres el asistente de un consultorio de nutrición. Orientas a los clientes sobre los servicios disponibles, agendas citas y brindas información general sobre hábitos saludables.',
      instructions: [
        'No diseñes planes de alimentación sin una consulta profesional previa',
        'Ofrece información motivacional sobre nutrición y hábitos saludables',
        'Agenda citas de consulta inicial y seguimiento',
        'Informa sobre los programas disponibles (pérdida de peso, nutrición deportiva, etc.)'
      ]
    },
    mapJson: {
      servicios: ['consulta_inicial', 'plan_alimentacion', 'seguimiento', 'nutricion_deportiva', 'perdida_peso', 'nutricion_clinica']
    },
    questionsJson: [
      { id: 'objetivo', question: '¿Cuál es tu objetivo nutricional principal?', type: 'select', options: ['perder_peso', 'ganar_masa', 'mejorar_habitos', 'condicion_clinica', 'rendimiento_deportivo'] },
      { id: 'primera_vez', question: '¿Es tu primera consulta con un nutricionista?', type: 'boolean' }
    ]
  },

  // ─── INMOBILIARIA ────────────────────────────────────────────────────────
  {
    key: 'compra_venta_inmueble',
    name: 'Compra y Venta',
    nameEn: 'Buy & Sell',
    industry: 'inmobiliaria',
    industryEn: 'Real Estate',
    icon: '🏠',
    description: 'Asesor inmobiliario para compra y venta: búsqueda, filtros, financiamiento y cierre.',
    descriptionEn: 'Real estate advisor for buying and selling: search, filters, financing, closing.',
    priceMonthly: 15,
    isFeatured: true,
    sortOrder: 1,
    promptJson: {
      system: 'Eres un asesor inmobiliario experto en compra y venta de inmuebles. Ayudas a los clientes a encontrar la propiedad ideal según su presupuesto, ubicación preferida y tipo de inmueble.',
      instructions: [
        'Siempre pregunta el presupuesto y zona de interés antes de mostrar opciones',
        'Explica el proceso de compra paso a paso cuando el cliente lo solicite',
        'Informa sobre opciones de financiamiento disponibles',
        'Agenda visitas a propiedades con el equipo comercial'
      ]
    },
    mapJson: {
      tipos_inmueble: ['apartamento', 'casa', 'local_comercial', 'oficina', 'terreno', 'galpon'],
      etapas: ['busqueda', 'visita', 'oferta', 'documentacion', 'cierre']
    },
    questionsJson: [
      { id: 'operacion', question: '¿Deseas comprar o vender?', type: 'select', options: ['comprar', 'vender', 'ambos'] },
      { id: 'tipo', question: '¿Qué tipo de inmueble?', type: 'select', options: ['apartamento', 'casa', 'local', 'oficina', 'terreno'] },
      { id: 'zona', question: '¿En qué zona o ciudad?', type: 'text' },
      { id: 'presupuesto', question: '¿Cuál es tu presupuesto?', type: 'text' }
    ]
  },
  {
    key: 'alquiler_temporal',
    name: 'Alquiler Temporal',
    nameEn: 'Short-Term Rental',
    industry: 'inmobiliaria',
    industryEn: 'Real Estate',
    icon: '🗓️',
    description: 'Gestión de alquileres temporales: disponibilidad, tarifas, check-in y soporte al huésped.',
    descriptionEn: 'Short-term rental management: availability, rates, check-in, guest support.',
    priceMonthly: 15,
    isFeatured: false,
    sortOrder: 2,
    promptJson: {
      system: 'Eres el asistente de una agencia de alquileres temporales. Informas sobre disponibilidad, tarifas y amenidades de las propiedades, y apoyas al huésped durante su estadía.',
      instructions: [
        'Siempre consulta fechas de entrada y salida y número de huéspedes',
        'Informa sobre las normas de la propiedad (mascotas, fumado, horario silencio)',
        'Explica el proceso de reserva y métodos de pago',
        'Ofrece asistencia ante cualquier inconveniente durante la estadía'
      ]
    },
    mapJson: {
      etapas: ['consulta_disponibilidad', 'cotizacion', 'reserva', 'check_in', 'estadía', 'check_out', 'valoracion'],
      amenidades: ['wifi', 'estacionamiento', 'piscina', 'gym', 'cocina', 'lavanderia']
    },
    questionsJson: [
      { id: 'fechas', question: '¿Cuáles son tus fechas de entrada y salida?', type: 'text' },
      { id: 'huespedes', question: '¿Número de huéspedes?', type: 'text' },
      { id: 'tipo', question: '¿Buscas apartamento, casa o habitación?', type: 'select', options: ['apartamento', 'casa', 'habitacion'] }
    ]
  },

  // ─── RETAIL ─────────────────────────────────────────────────────────────
  {
    key: 'ferreteria',
    name: 'Ferretería',
    nameEn: 'Hardware Store',
    industry: 'retail',
    industryEn: 'Retail',
    icon: '🔨',
    description: 'Asistente para ferreterías: consultas de productos, stock, precios y proyectos de obra.',
    descriptionEn: 'Hardware store assistant: product queries, stock, prices, construction projects.',
    priceMonthly: 15,
    isFeatured: false,
    sortOrder: 1,
    promptJson: {
      system: 'Eres el asistente virtual de una ferretería. Ayudas a los clientes a encontrar los productos que necesitan, explicas usos y diferencias técnicas, y orientas en proyectos de construcción o remodelación.',
      instructions: [
        'Pregunta para qué proyecto o uso necesita el producto',
        'Explica diferencias técnicas entre opciones (marcas, calibres, materiales)',
        'Informa sobre disponibilidad y tiempos de entrega cuando te pregunten',
        'Sugiere productos complementarios o herramientas necesarias'
      ]
    },
    mapJson: {
      categorias: ['herramientas_manuales', 'herramientas_electricas', 'materiales_construccion', 'plomeria', 'electricidad', 'pintura', 'fijaciones', 'jardineria', 'seguridad']
    },
    questionsJson: [
      { id: 'proyecto', question: '¿Para qué proyecto o uso necesitas el producto?', type: 'text' },
      { id: 'producto', question: '¿Qué producto o categoría buscas?', type: 'text' }
    ]
  },
  {
    key: 'ropa_calzado',
    name: 'Ropa y Calzado',
    nameEn: 'Clothing & Footwear',
    industry: 'retail',
    industryEn: 'Retail',
    icon: '👗',
    description: 'Asesor de moda para tiendas de ropa y calzado: tallas, estilos, disponibilidad y tendencias.',
    descriptionEn: 'Fashion advisor for clothing and footwear stores: sizes, styles, availability, trends.',
    priceMonthly: 15,
    isFeatured: false,
    sortOrder: 2,
    promptJson: {
      system: 'Eres el asistente de moda de una tienda de ropa y calzado. Ayudas a los clientes a encontrar prendas y zapatos de su talla, estilo y presupuesto, y asesoras sobre combinaciones y tendencias.',
      instructions: [
        'Pregunta talla, estilo preferido y ocasión (casual, formal, deportivo)',
        'Sugiere combinaciones completas cuando el cliente lo solicite',
        'Informa sobre disponibilidad de tallas y colores',
        'Comparte las últimas tendencias de temporada cuando sea relevante'
      ]
    },
    mapJson: {
      categorias: ['camisas', 'pantalones', 'vestidos', 'faldas', 'ropa_deportiva', 'calzado_casual', 'calzado_formal', 'calzado_deportivo', 'accesorios']
    },
    questionsJson: [
      { id: 'genero', question: '¿Para quién es? (hombre, mujer, niño/niña)', type: 'select', options: ['hombre', 'mujer', 'nino', 'nina'] },
      { id: 'talla', question: '¿Cuál es tu talla aproximada?', type: 'text' },
      { id: 'ocasion', question: '¿Para qué ocasión?', type: 'select', options: ['casual', 'formal', 'deportivo', 'playa', 'trabajo'] },
      { id: 'presupuesto', question: '¿Cuál es tu presupuesto?', type: 'text' }
    ]
  },
  {
    key: 'farmacia',
    name: 'Farmacia',
    nameEn: 'Pharmacy',
    industry: 'retail',
    industryEn: 'Retail',
    icon: '💊',
    description: 'Asistente farmacéutico: disponibilidad de medicamentos, información general y orientación.',
    descriptionEn: 'Pharmacy assistant: medication availability, general information, guidance.',
    priceMonthly: 15,
    isFeatured: false,
    sortOrder: 3,
    promptJson: {
      system: 'Eres el asistente de una farmacia. Orientas a los clientes sobre disponibilidad de medicamentos, productos de cuidado personal y parafarmacia. Nunca reemplazas la consulta médica ni recomiendas medicamentos sin receta.',
      instructions: [
        'Nunca recomiendas medicamentos de prescripción sin indicación médica',
        'Informa sobre disponibilidad y precios cuando te pregunten',
        'Orienta sobre productos de cuidado personal, vitaminas y suplementos',
        'Ante síntomas, siempre recomienda consultar al médico'
      ]
    },
    mapJson: {
      categorias: ['medicamentos_otc', 'vitaminas_suplementos', 'cuidado_personal', 'bebe', 'dermatologia', 'ortopedia', 'equipos_medicos']
    },
    questionsJson: [
      { id: 'producto', question: '¿Qué producto o medicamento buscas?', type: 'text' },
      { id: 'receta', question: '¿Tienes receta médica?', type: 'boolean' }
    ]
  },
  {
    key: 'electrodomesticos_retail',
    name: 'Electrodomésticos',
    nameEn: 'Home Appliances',
    industry: 'retail',
    industryEn: 'Retail',
    icon: '📺',
    description: 'Asesor de electrodomésticos y tecnología: características, comparativas y garantías.',
    descriptionEn: 'Appliance and technology advisor: features, comparisons, warranties.',
    priceMonthly: 15,
    isFeatured: false,
    sortOrder: 4,
    promptJson: {
      system: 'Eres el asesor de ventas de una tienda de electrodomésticos y tecnología. Ayudas a los clientes a elegir el producto ideal según sus necesidades, comparas modelos y explicas características técnicas de forma sencilla.',
      instructions: [
        'Pregunta para qué uso y espacio disponible tiene',
        'Compara modelos con sus pros y contras en lenguaje sencillo',
        'Informa sobre garantía y servicio técnico disponible',
        'Sugiere accesorios o productos complementarios relevantes'
      ]
    },
    mapJson: {
      categorias: ['televisores', 'refrigeradores', 'lavadoras', 'aires_acondicionados', 'microondas', 'computadoras', 'celulares', 'audio', 'cocinas']
    },
    questionsJson: [
      { id: 'producto', question: '¿Qué electrodoméstico o equipo buscas?', type: 'text' },
      { id: 'uso', question: '¿Para qué uso o espacio?', type: 'text' },
      { id: 'presupuesto', question: '¿Cuál es tu presupuesto?', type: 'text' }
    ]
  },

  // ─── EMPRESAS CON EQUIPOS ────────────────────────────────────────────────
  {
    key: 'ventas_foraneas',
    name: 'Ventas Foráneas',
    nameEn: 'Field Sales',
    industry: 'empresas',
    industryEn: 'Enterprise Teams',
    icon: '🚗',
    description: 'Coordinador de equipo de ventas en campo: rutas, pedidos, reportes y seguimiento.',
    descriptionEn: 'Field sales team coordinator: routes, orders, reports, follow-up.',
    priceMonthly: 25,
    isFeatured: true,
    sortOrder: 1,
    promptJson: {
      system: 'Eres el coordinador virtual del equipo de ventas foráneas. Apoyás a los representantes con registro de pedidos, consulta de stock, rutas y reportes de visita.',
      instructions: [
        'Registra pedidos con cliente, productos, cantidades y fecha de entrega',
        'Consulta disponibilidad de productos antes de confirmar pedidos',
        'Registra el resultado de cada visita (pedido, sin pedido, cita futura)',
        'Genera resúmenes de visitas del día al final de la jornada'
      ]
    },
    mapJson: {
      flujo: ['apertura_ruta', 'visita_cliente', 'toma_pedido', 'registro_resultado', 'cierre_ruta'],
      reportes: ['pedidos_dia', 'clientes_visitados', 'efectividad', 'cobranzas']
    },
    questionsJson: [
      { id: 'vendedor', question: '¿Cuál es tu nombre y zona de trabajo?', type: 'text' },
      { id: 'cliente', question: '¿Con qué cliente estás?', type: 'text' },
      { id: 'tipo_registro', question: '¿Qué deseas registrar?', type: 'select', options: ['pedido', 'visita_sin_pedido', 'cobranza', 'incidencia'] }
    ]
  },
  {
    key: 'pedidos_internos',
    name: 'Gestión de Pedidos',
    nameEn: 'Order Management',
    industry: 'empresas',
    industryEn: 'Enterprise Teams',
    icon: '📦',
    description: 'Gestión de pedidos internos: registro, seguimiento de estado y coordinación entre áreas.',
    descriptionEn: 'Internal order management: registration, status tracking, cross-team coordination.',
    priceMonthly: 25,
    isFeatured: false,
    sortOrder: 2,
    promptJson: {
      system: 'Eres el asistente de gestión de pedidos internos de la empresa. Ayudás a registrar solicitudes, consultar estados y coordinar entre áreas de producción, almacén y despacho.',
      instructions: [
        'Registra pedidos con solicitante, área, productos y urgencia',
        'Consulta el estado de pedidos en curso cuando te lo pidan',
        'Notifica al área correspondiente sobre pedidos urgentes',
        'Resume los pedidos pendientes por área al inicio del día'
      ]
    },
    mapJson: {
      estados: ['recibido', 'en_proceso', 'listo_despacho', 'despachado', 'entregado', 'cancelado'],
      areas: ['produccion', 'almacen', 'despacho', 'compras', 'calidad']
    },
    questionsJson: [
      { id: 'solicitante', question: '¿Quién solicita y de qué área?', type: 'text' },
      { id: 'productos', question: '¿Qué productos o materiales necesitas?', type: 'text' },
      { id: 'urgencia', question: '¿Es urgente?', type: 'boolean' },
      { id: 'fecha_requerida', question: '¿Fecha requerida de entrega?', type: 'text' }
    ]
  },
  {
    key: 'soporte_cliente',
    name: 'Soporte al Cliente',
    nameEn: 'Customer Support',
    industry: 'empresas',
    industryEn: 'Enterprise Teams',
    icon: '🎧',
    description: 'Agente de soporte técnico y servicio al cliente: tickets, seguimiento y resolución.',
    descriptionEn: 'Technical support and customer service agent: tickets, tracking, resolution.',
    priceMonthly: 20,
    isFeatured: false,
    sortOrder: 3,
    promptJson: {
      system: 'Eres el agente de soporte al cliente de la empresa. Gestionas consultas, quejas, solicitudes y tickets de soporte técnico, orientando a los clientes hacia soluciones rápidas y eficaces.',
      instructions: [
        'Escucha el problema completo antes de ofrecer soluciones',
        'Registra número de ticket y descripción del problema',
        'Escala al equipo técnico cuando el problema supere tu alcance',
        'Haz seguimiento proactivo a tickets abiertos por más de 24 horas'
      ]
    },
    mapJson: {
      tipos_ticket: ['consulta', 'queja', 'solicitud', 'soporte_tecnico', 'devolucion', 'facturacion'],
      estados: ['abierto', 'en_proceso', 'escalado', 'resuelto', 'cerrado']
    },
    questionsJson: [
      { id: 'nombre', question: '¿Tu nombre y número de cliente o contrato?', type: 'text' },
      { id: 'tipo', question: '¿Tipo de solicitud?', type: 'select', options: ['consulta', 'queja', 'soporte_tecnico', 'devolucion', 'facturacion'] },
      { id: 'descripcion', question: '¿Describe brevemente el problema o solicitud:', type: 'text' }
    ]
  },
  {
    key: 'rrhh',
    name: 'Recursos Humanos',
    nameEn: 'Human Resources',
    industry: 'empresas',
    industryEn: 'Enterprise Teams',
    icon: '👥',
    description: 'Asistente de RRHH: consultas de empleados, vacaciones, permisos y documentación.',
    descriptionEn: 'HR assistant: employee queries, vacations, leave requests, documentation.',
    priceMonthly: 20,
    isFeatured: false,
    sortOrder: 4,
    promptJson: {
      system: 'Eres el asistente de Recursos Humanos de la empresa. Orientas a los empleados sobre políticas, gestionas solicitudes de vacaciones, permisos y constancias, y apoyas en procesos de onboarding.',
      instructions: [
        'Responde consultas sobre políticas de vacaciones, permisos y beneficios',
        'Registra solicitudes de vacaciones con empleado, fechas y tipo',
        'Informa sobre el proceso de onboarding a nuevos empleados',
        'Orienta sobre la documentación necesaria para trámites de RRHH'
      ]
    },
    mapJson: {
      tramites: ['vacaciones', 'permiso_medico', 'permiso_personal', 'constancia_trabajo', 'constancia_ingresos', 'actualizacion_datos', 'onboarding'],
      politicas: ['horarios', 'beneficios', 'codigo_conducta', 'evaluacion_desempeno']
    },
    questionsJson: [
      { id: 'empleado', question: '¿Cuál es tu nombre y departamento?', type: 'text' },
      { id: 'tramite', question: '¿Qué trámite o consulta necesitas?', type: 'select', options: ['vacaciones', 'permiso', 'constancia', 'consulta_politica', 'otro'] }
    ]
  }
];

export async function seedSkills(prisma: PrismaClient) {
  console.log('🌱 Seeding skills...');

  for (const skill of SKILLS) {
    await prisma.skill.upsert({
      where: { key: skill.key },
      update: {
        name: skill.name,
        nameEn: skill.nameEn,
        industry: skill.industry,
        industryEn: skill.industryEn,
        icon: skill.icon,
        description: skill.description,
        descriptionEn: skill.descriptionEn,
        promptJson: skill.promptJson,
        mapJson: skill.mapJson,
        questionsJson: skill.questionsJson,
        priceMonthly: skill.priceMonthly,
        isFeatured: skill.isFeatured,
        sortOrder: skill.sortOrder,
        isActive: true,
      },
      create: skill,
    });
  }

  console.log(`✔ ${SKILLS.length} skills seeded`);
}
```

- [ ] **Step 2: Importar y llamar seedSkills en seed.ts**

Abrir `packages/db/prisma/seed.ts`. Agregar al final del archivo, justo antes del `main()` o dentro del bloque principal:

```typescript
// Al inicio del archivo, agregar el import:
import { seedSkills } from './seeds/skills';

// Al final de la función main(), agregar:
await seedSkills(prisma);
```

La función `main()` al final de `seed.ts` debe quedar con esta llamada incluida.

- [ ] **Step 3: Ejecutar el seed**

```bash
npm run db:seed
```

Salida esperada: `✔ 18 skills seeded`

---

## Task 3: Server Actions — createAgentWithSkills, getAvailableSkills, calculateAgentPrice

**Files:**
- Create: `apps/web/app/[locale]/(app)/dashboard/agents/create/actions.ts`

- [ ] **Step 1: Crear el archivo de server actions**

Crear `apps/web/app/[locale]/(app)/dashboard/agents/create/actions.ts`:

```typescript
'use server';

import { randomUUID } from 'crypto';
import { prisma } from '@trends172tech/db';
import { requireTenant } from '@/lib/auth/guards';

// Tipos exportados para uso en los componentes cliente
export type SkillItem = {
  id: string;
  key: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  descriptionEn: string;
  priceMonthly: number;
  isFeatured: boolean;
};

export type SkillGroup = {
  industry: string;
  industryEn: string;
  skills: SkillItem[];
};

export type CreateAgentInput = {
  name: string;
  description: string;
  language: 'ES' | 'EN';
  skillIds: string[];
};

export type CreateAgentResult = {
  agentId: string;
  installPublicKey: string;
  selectedSkills: Array<{ key: string; name: string; nameEn: string }>;
};

// Retorna todas las skills activas agrupadas por industria
export async function getAvailableSkills(): Promise<SkillGroup[]> {
  const skills = await prisma.skill.findMany({
    where: { isActive: true },
    orderBy: [{ industry: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      key: true,
      name: true,
      nameEn: true,
      industry: true,
      industryEn: true,
      icon: true,
      description: true,
      descriptionEn: true,
      priceMonthly: true,
      isFeatured: true,
    },
  });

  // Agrupar por industria manteniendo el orden de aparición
  const map = new Map<string, SkillGroup>();
  for (const skill of skills) {
    if (!map.has(skill.industry)) {
      map.set(skill.industry, {
        industry: skill.industry,
        industryEn: skill.industryEn,
        skills: [],
      });
    }
    map.get(skill.industry)!.skills.push(skill);
  }

  return Array.from(map.values());
}

// Calcula precio total: $29 base + priceMonthly de cada skill seleccionada
export async function calculateAgentPrice(skillIds: string[]): Promise<{
  base: number;
  skillsTotal: number;
  total: number;
}> {
  const BASE = 29;
  if (skillIds.length === 0) {
    return { base: BASE, skillsTotal: 0, total: BASE };
  }
  const skills = await prisma.skill.findMany({
    where: { id: { in: skillIds }, isActive: true },
    select: { priceMonthly: true },
  });
  const skillsTotal = skills.reduce((sum, s) => sum + s.priceMonthly, 0);
  return { base: BASE, skillsTotal, total: BASE + skillsTotal };
}

// Crea AgentInstance con sus skills, AgentAccess e Install en una transacción
export async function createAgentWithSkills(
  input: CreateAgentInput
): Promise<CreateAgentResult> {
  const user = await requireTenant();
  const tenantId = user.tenantId!;

  // Verificar skills activas
  const skills = await prisma.skill.findMany({
    where: { id: { in: input.skillIds }, isActive: true },
    select: { id: true, key: true, name: true, nameEn: true },
  });

  const { agentInstance, install } = await prisma.$transaction(async (tx) => {
    // 1. Crear instancia del agente
    const agentInstance = await tx.agentInstance.create({
      data: {
        tenantId,
        name: input.name,
        baseAgentKey: 'skill_agent',
        languageDefault: input.language,
        status: 'ACTIVE',
        featuresJson: { description: input.description },
      },
    });

    // 2. Crear relaciones AgentSkill
    if (skills.length > 0) {
      await tx.agentSkill.createMany({
        data: skills.map((s) => ({
          agentInstanceId: agentInstance.id,
          skillId: s.id,
          isEnabled: true,
        })),
      });
    }

    // 3. Crear AgentAccess inicial (canal web embebido, dominios abiertos)
    await tx.agentAccess.create({
      data: {
        tenantId,
        agentId: agentInstance.id,
        name: `${input.name} — Web`,
        channel: 'embedded_web',
        allowedDomains: [],
        isActive: true,
      },
    });

    // 4. Crear Install con publicKey único (token del widget)
    const install = await tx.install.create({
      data: {
        tenantId,
        agentInstanceId: agentInstance.id,
        publicKey: randomUUID(),
        allowedDomains: [],
        status: 'ACTIVE',
      },
    });

    return { agentInstance, install };
  });

  return {
    agentId: agentInstance.id,
    installPublicKey: install.publicKey,
    selectedSkills: skills,
  };
}
```

---

## Task 4: Componentes del Agent Creator Wizard

**Files:**
- Create: `apps/web/app/[locale]/(app)/dashboard/agents/create/skill-card.tsx`
- Create: `apps/web/app/[locale]/(app)/dashboard/agents/create/price-sidebar.tsx`
- Create: `apps/web/app/[locale]/(app)/dashboard/agents/create/agent-creator-client.tsx`
- Create: `apps/web/app/[locale]/(app)/dashboard/agents/create/page.tsx`

- [ ] **Step 1: Crear skill-card.tsx**

```tsx
'use client';

import type { SkillItem } from './actions';

type Props = {
  skill: SkillItem;
  selected: boolean;
  onToggle: (id: string) => void;
  isEs: boolean;
};

export function SkillCard({ skill, selected, onToggle, isEs }: Props) {
  return (
    <button
      type="button"
      onClick={() => onToggle(skill.id)}
      className={[
        'interactive-panel w-full rounded-[24px] border p-5 text-left transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2',
        selected
          ? 'border-slate-900 bg-slate-950 text-white shadow-[0_20px_50px_-30px_rgba(15,23,42,0.5)]'
          : 'border-black/8 bg-white/92 hover:border-slate-300 hover:shadow-[0_12px_30px_-20px_rgba(15,23,42,0.15)] dark:border-slate-800 dark:bg-slate-950/70',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-2xl leading-none">{skill.icon}</span>
        {/* Indicador de selección */}
        <div
          className={[
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
            selected
              ? 'border-white bg-white'
              : 'border-slate-300 dark:border-slate-600',
          ].join(' ')}
        >
          {selected && (
            <svg className="h-3 w-3 text-slate-950" fill="currentColor" viewBox="0 0 12 12">
              <path d="M10.28 2.28L4 8.56 1.72 6.28a1 1 0 00-1.44 1.44l3 3a1 1 0 001.44 0l7-7a1 1 0 00-1.44-1.44z" />
            </svg>
          )}
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <p className={['text-sm font-semibold', selected ? 'text-white' : 'text-slate-900 dark:text-white'].join(' ')}>
          {isEs ? skill.name : skill.nameEn}
        </p>
        <p className={['text-xs leading-relaxed', selected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'].join(' ')}>
          {isEs ? skill.description : skill.descriptionEn}
        </p>
      </div>
      <div className={['mt-4 text-xs font-semibold', selected ? 'text-slate-300' : 'text-slate-500'].join(' ')}>
        ${skill.priceMonthly}/{isEs ? 'mes' : 'mo'}
      </div>
    </button>
  );
}
```

- [ ] **Step 2: Crear price-sidebar.tsx**

```tsx
'use client';

import type { SkillItem } from './actions';

type Props = {
  selectedSkills: SkillItem[];
  isEs: boolean;
  onCreateClick: () => void;
  isPending: boolean;
  currentStep: number;
};

const BASE_PRICE = 29;

export function PriceSidebar({ selectedSkills, isEs, onCreateClick, isPending, currentStep }: Props) {
  const skillsTotal = selectedSkills.reduce((sum, s) => sum + s.priceMonthly, 0);
  const total = BASE_PRICE + skillsTotal;

  return (
    <div className="interactive-panel sticky top-6 rounded-[32px] border border-black/8 bg-white/92 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.32)] dark:border-slate-800 dark:bg-slate-950/70">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        {isEs ? 'Resumen de precio' : 'Price summary'}
      </p>

      {/* Plan base */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {isEs ? 'Plan base' : 'Base plan'}
        </span>
        <span className="text-sm font-semibold text-slate-900 dark:text-white">${BASE_PRICE}/mes</span>
      </div>

      {/* Skills seleccionadas */}
      {selectedSkills.length > 0 && (
        <div className="mt-3 space-y-2">
          {selectedSkills.map((skill) => (
            <div key={skill.id} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>{skill.icon}</span>
                <span>{isEs ? skill.name : skill.nameEn}</span>
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                +${skill.priceMonthly}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Separador */}
      <div className="my-4 border-t border-black/8 dark:border-slate-800" />

      {/* Total */}
      <div className="flex items-end justify-between">
        <span className="text-sm font-semibold text-slate-900 dark:text-white">
          {isEs ? 'Total mensual' : 'Monthly total'}
        </span>
        <div className="text-right">
          <span className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
            ${total}
          </span>
          <span className="ml-1 text-xs text-slate-400">/mes</span>
        </div>
      </div>

      {/* Botón crear — visible en paso 3 */}
      {currentStep === 3 && (
        <button
          type="button"
          onClick={onCreateClick}
          disabled={isPending}
          className="interactive-chip mt-5 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_-24px_rgba(15,23,42,0.45)] transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {isPending
            ? (isEs ? 'Creando agente...' : 'Creating agent...')
            : (isEs ? 'Crear agente' : 'Create agent')}
        </button>
      )}

      {/* Nota de skills */}
      {selectedSkills.length === 0 && (
        <p className="mt-4 text-xs text-slate-400">
          {isEs ? 'Selecciona al menos una skill para empezar.' : 'Select at least one skill to get started.'}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Crear agent-creator-client.tsx**

```tsx
'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SkillCard } from './skill-card';
import { PriceSidebar } from './price-sidebar';
import type { SkillGroup, SkillItem, CreateAgentResult } from './actions';
import { createAgentWithSkills } from './actions';

type Props = {
  skillGroups: SkillGroup[];
  locale: string;
};

type Step = 1 | 2 | 3 | 4;

export function AgentCreatorClient({ skillGroups, locale }: Props) {
  const isEs = locale.startsWith('es');
  const [step, setStep] = useState<Step>(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Estado del formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<'ES' | 'EN'>('ES');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<CreateAgentResult | null>(null);

  // Lista plana de skills para el sidebar
  const allSkills = skillGroups.flatMap((g) => g.skills);
  const selectedSkills: SkillItem[] = allSkills.filter((s) => selectedIds.has(s.id));

  function toggleSkill(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleCreate() {
    if (!name.trim()) {
      setError(isEs ? 'El nombre del agente es obligatorio.' : 'Agent name is required.');
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const res = await createAgentWithSkills({
          name: name.trim(),
          description: description.trim(),
          language,
          skillIds: Array.from(selectedIds),
        });
        setResult(res);
        setStep(4);
      } catch (e) {
        setError(isEs ? 'Error al crear el agente. Intenta de nuevo.' : 'Error creating agent. Please try again.');
        console.error(e);
      }
    });
  }

  function copySnippet() {
    if (!result) return;
    const snippet = buildSnippet(result);
    navigator.clipboard.writeText(snippet).catch(() => {});
  }

  function buildSnippet(r: CreateAgentResult): string {
    const skillKeys = r.selectedSkills.map((s) => s.key).join(',');
    const dataSkills = skillKeys ? `\n  data-skills="${skillKeys}"` : '';
    return `<script\n  src="https://cdn.trends172tech.com/widget.js"\n  data-token="${r.installPublicKey}"${dataSkills}\n  async\n></script>`;
  }

  const copy = {
    step1Title: isEs ? 'Información del agente' : 'Agent information',
    step2Title: isEs ? 'Elige las skills' : 'Choose skills',
    step3Title: isEs ? 'Confirmar y crear' : 'Confirm & create',
    step4Title: isEs ? '¡Agente creado!' : 'Agent created!',
    namePlaceholder: isEs ? 'Ej: Agente de Cocinas' : 'E.g.: Kitchen Agent',
    descPlaceholder: isEs ? 'Describe brevemente tu negocio...' : 'Briefly describe your business...',
    next: isEs ? 'Continuar' : 'Next',
    back: isEs ? 'Atrás' : 'Back',
    copySnippet: isEs ? 'Copiar snippet' : 'Copy snippet',
    snippetInfo: isEs
      ? 'Pega este código antes del </body> en tu sitio web para activar el widget.'
      : 'Paste this code before </body> on your website to activate the widget.',
    goToDashboard: isEs ? 'Ir al dashboard' : 'Go to dashboard',
  };

  // Indicador de pasos
  const steps = [
    { n: 1, label: isEs ? 'Info' : 'Info' },
    { n: 2, label: isEs ? 'Skills' : 'Skills' },
    { n: 3, label: isEs ? 'Resumen' : 'Summary' },
    { n: 4, label: isEs ? 'Snippet' : 'Snippet' },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      {/* Columna principal */}
      <div className="space-y-6">
        {/* Indicador de pasos */}
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  step === s.n
                    ? 'bg-slate-950 text-white'
                    : step > s.n
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'border border-black/10 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900',
                ].join(' ')}
              >
                {step > s.n ? '✓' : s.n}
              </div>
              <span
                className={[
                  'text-xs font-medium',
                  step === s.n ? 'text-slate-900 dark:text-white' : 'text-slate-400',
                ].join(' ')}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className="mx-1 h-px w-6 bg-slate-200 dark:bg-slate-700" />
              )}
            </div>
          ))}
        </div>

        {/* Error global */}
        {error && (
          <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        {/* ── PASO 1: Información ─────────────────────────────────── */}
        {step === 1 && (
          <Card className="interactive-panel">
            <CardHeader>
              <CardTitle>{copy.step1Title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="agent-name">
                  {isEs ? 'Nombre del agente' : 'Agent name'} *
                </Label>
                <Input
                  id="agent-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={copy.namePlaceholder}
                  maxLength={80}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-desc">
                  {isEs ? 'Descripción del negocio' : 'Business description'}
                </Label>
                <textarea
                  id="agent-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={copy.descPlaceholder}
                  maxLength={500}
                  rows={4}
                  className="w-full rounded-[14px] border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label>{isEs ? 'Idioma por defecto' : 'Default language'}</Label>
                <div className="flex gap-3">
                  {(['ES', 'EN'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguage(lang)}
                      className={[
                        'interactive-chip rounded-full border px-5 py-2 text-sm font-semibold transition',
                        language === lang
                          ? 'border-slate-900 bg-slate-950 text-white'
                          : 'border-black/8 bg-white/90 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
                      ].join(' ')}
                    >
                      {lang === 'ES' ? '🇪🇸 Español' : '🇺🇸 English'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!name.trim()) {
                      setError(isEs ? 'El nombre del agente es obligatorio.' : 'Agent name is required.');
                      return;
                    }
                    setError(null);
                    setStep(2);
                  }}
                  className="interactive-chip inline-flex rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
                >
                  {copy.next} →
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── PASO 2: Selección de skills ──────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            {skillGroups.map((group) => (
              <Card key={group.industry} className="interactive-panel">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="rounded-full border border-black/8 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                      {isEs ? group.industry : group.industryEn}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {group.skills.map((skill) => (
                      <SkillCard
                        key={skill.id}
                        skill={skill}
                        selected={selectedIds.has(skill.id)}
                        onToggle={toggleSkill}
                        isEs={isEs}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="interactive-chip inline-flex rounded-full border border-black/8 bg-white/90 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                ← {copy.back}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="interactive-chip inline-flex rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
              >
                {copy.next} →
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 3: Resumen ─────────────────────────────────────── */}
        {step === 3 && (
          <Card className="interactive-panel">
            <CardHeader>
              <CardTitle>{copy.step3Title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2 rounded-[20px] border border-black/8 bg-slate-50/80 px-5 py-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                <p><span className="font-semibold">{isEs ? 'Nombre:' : 'Name:'}</span> {name}</p>
                {description && <p><span className="font-semibold">{isEs ? 'Descripción:' : 'Description:'}</span> {description}</p>}
                <p><span className="font-semibold">{isEs ? 'Idioma:' : 'Language:'}</span> {language}</p>
                <p>
                  <span className="font-semibold">{isEs ? 'Skills:' : 'Skills:'}</span>{' '}
                  {selectedSkills.length > 0
                    ? selectedSkills.map((s) => `${s.icon} ${isEs ? s.name : s.nameEn}`).join(', ')
                    : (isEs ? 'Ninguna' : 'None')}
                </p>
              </div>
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="interactive-chip inline-flex rounded-full border border-black/8 bg-white/90 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  ← {copy.back}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── PASO 4: Snippet ─────────────────────────────────────── */}
        {step === 4 && result && (
          <Card className="interactive-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                {copy.step4Title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-slate-600 dark:text-slate-300">{copy.snippetInfo}</p>
              <div className="relative rounded-[18px] border border-black/8 bg-slate-950 p-5 dark:border-slate-700">
                <pre className="overflow-x-auto text-xs leading-relaxed text-emerald-400">
                  {buildSnippet(result)}
                </pre>
                <button
                  type="button"
                  onClick={copySnippet}
                  className="interactive-chip absolute right-3 top-3 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/16 focus-visible:outline-none"
                >
                  {copy.copySnippet}
                </button>
              </div>
              <div className="rounded-[18px] border border-black/8 bg-white/90 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/60">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Token</p>
                <p className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-300">
                  {result.installPublicKey}
                </p>
              </div>
              <a
                href={`/${locale}/dashboard/agents/${result.agentId}`}
                className="interactive-chip inline-flex rounded-full border border-black/8 bg-white/90 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
              >
                {copy.goToDashboard} →
              </a>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar de precio (columna derecha) */}
      {step < 4 && (
        <PriceSidebar
          selectedSkills={selectedSkills}
          isEs={isEs}
          onCreateClick={handleCreate}
          isPending={isPending}
          currentStep={step}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Crear la página principal page.tsx**

```tsx
import { requireAuth } from '@/lib/auth/guards';
import { resolveTenantFromUser } from '@/lib/tenant';
import { getAvailableSkills } from './actions';
import { AgentCreatorClient } from './agent-creator-client';

export const dynamic = 'force-dynamic';

type PageParams = { locale: string };

export default async function AgentCreatePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale } = await params;
  const isEs = locale.startsWith('es');

  const user = await requireAuth();
  const tenant = await resolveTenantFromUser(user);

  if (!tenant) {
    return (
      <section className="space-y-6">
        <div className="interactive-panel premium-noise overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-7 shadow-[0_35px_100px_-72px_rgba(15,23,42,0.35)] sm:px-8">
          <p className="text-sm text-slate-500">
            {isEs ? 'No hay tenant asignado.' : 'No tenant assigned.'}
          </p>
        </div>
      </section>
    );
  }

  const skillGroups = await getAvailableSkills();

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="interactive-panel premium-noise overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-7 shadow-[0_35px_100px_-72px_rgba(15,23,42,0.35)] sm:px-8">
        <div className="space-y-3">
          <div className="inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            {isEs ? 'Nuevo agente' : 'New agent'}
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              {isEs ? 'Crear agente con skills' : 'Create agent with skills'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isEs
                ? 'Elige las habilidades especializadas de tu agente y obtén tu snippet de instalación.'
                : 'Choose your agent specialized skills and get your installation snippet.'}
            </p>
          </div>
        </div>
      </div>

      {/* Wizard */}
      <AgentCreatorClient skillGroups={skillGroups} locale={locale} />
    </section>
  );
}
```

- [ ] **Step 5: Verificar compilación**

```bash
cd d:\trends172tech.com\trends172tech
npm run typecheck
```

Salida esperada: sin errores de TypeScript.

---

## Task 5: Actualizar contextBuilder.ts con skills activas

**Files:**
- Modify: `apps/web/app/lib/orchestrator/contextBuilder.ts`

Esta es la única modificación al orquestador. Es mínima y no toca `engine.ts` ni `types.ts`.

- [ ] **Step 1: Agregar el tipo SkillContextItem y actualizar SystemContext**

En `contextBuilder.ts`, modificar el tipo `SystemContext` para agregar el campo `skills`:

```typescript
// Antes (línea ~19-35):
type SystemContext = {
  business_profile: { ... };
  features: Record<string, unknown>;
  branding: Record<string, unknown>;
  language: string;
  channel: string;
  compliance: Record<string, unknown>;
  knowledge: Array<{ content: string; score: number; meta: Record<string, unknown> }>;
};

// Después — agregar skills al final del tipo:
type SystemContext = {
  business_profile: {
    tenant_id: string;
    name: string;
    mode: string;
  };
  features: Record<string, unknown>;
  branding: Record<string, unknown>;
  language: string;
  channel: string;
  compliance: Record<string, unknown>;
  knowledge: Array<{
    content: string;
    score: number;
    meta: Record<string, unknown>;
  }>;
  skills: Array<{
    key: string;
    name: string;
    prompt: unknown;
    map: unknown;
    questions: unknown;
  }>;
};
```

- [ ] **Step 2: Actualizar loadAgentData para incluir las skills activas**

Reemplazar la función `loadAgentData`:

```typescript
// Antes:
async function loadAgentData(agentInstanceId: string, tenantId: string) {
  const agentInstance = await prisma.agentInstance.findFirst({
    where: { id: agentInstanceId, tenantId },
    include: { endCustomer: true }
  });
  if (!agentInstance) {
    throw new Error('Agent instance not found');
  }
  return agentInstance;
}

// Después:
async function loadAgentData(agentInstanceId: string, tenantId: string) {
  const agentInstance = await prisma.agentInstance.findFirst({
    where: { id: agentInstanceId, tenantId },
    include: {
      endCustomer: true,
      skills: {
        where: { isEnabled: true },
        include: { skill: true },
      },
    },
  });
  if (!agentInstance) {
    throw new Error('Agent instance not found');
  }
  return agentInstance;
}
```

- [ ] **Step 3: Actualizar buildSystemContext para mapear las skills**

Reemplazar la función `buildSystemContext`:

```typescript
// Antes — firma sin agentInstance.skills
function buildSystemContext(
  tenant: Tenant,
  agentInstance: AgentInstance,
  knowledge: Array<{ content: string; score: number; metaJson: Record<string, unknown> | null }>,
  channel?: string
): SystemContext {
  return {
    business_profile: { tenant_id: tenant.id, name: tenant.name, mode: tenant.mode },
    features: safeJson(agentInstance.featuresJson, {}),
    branding: safeJson(agentInstance.brandingJson, {}),
    language: agentInstance.languageDefault,
    channel: channel ?? 'web',
    compliance: {},
    knowledge: knowledge.map((item) => ({
      content: item.content,
      score: item.score,
      meta: item.metaJson ?? {}
    }))
  };
}

// Después — agregar skills en el return:
function buildSystemContext(
  tenant: Tenant,
  agentInstance: AgentInstance & {
    skills: Array<{ skill: { key: string; name: string; promptJson: unknown; mapJson: unknown; questionsJson: unknown } }>;
  },
  knowledge: Array<{ content: string; score: number; metaJson: Record<string, unknown> | null }>,
  channel?: string
): SystemContext {
  return {
    business_profile: {
      tenant_id: tenant.id,
      name: tenant.name,
      mode: tenant.mode
    },
    features: safeJson(agentInstance.featuresJson, {}),
    branding: safeJson(agentInstance.brandingJson, {}),
    language: agentInstance.languageDefault,
    channel: channel ?? 'web',
    compliance: {},
    knowledge: knowledge.map((item) => ({
      content: item.content,
      score: item.score,
      meta: item.metaJson ?? {}
    })),
    skills: agentInstance.skills.map(({ skill }) => ({
      key: skill.key,
      name: skill.name,
      prompt: skill.promptJson,
      map: skill.mapJson,
      questions: skill.questionsJson,
    })),
  };
}
```

- [ ] **Step 4: Eliminar el import de `AgentInstance` en la firma de `buildSystemContext` que ya no encaja**

El import en la línea 2 es `import type { AgentInstance, EndCustomer, Tenant } from '@prisma/client';`
— `AgentInstance` sigue siendo usado en `buildConversationContext`, así que NO se elimina. Solo se amplía la firma en `buildSystemContext` con el intersection type `AgentInstance & { skills: ... }`.

- [ ] **Step 5: Verificar compilación**

```bash
npm run typecheck
```

Salida esperada: sin errores.

---

## Task 6: Página pública de Skills (marketing)

**Files:**
- Create: `apps/web/app/[locale]/(public)/skills/page.tsx`

- [ ] **Step 1: Crear la página pública**

```tsx
import Link from 'next/link';
import { prisma } from '@trends172tech/db';
import { IBM_Plex_Sans, Space_Grotesk } from 'next/font/google';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display'
});
const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body'
});

type PageParams = { locale: string };

export const dynamic = 'force-dynamic';

export default async function SkillsPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale } = await params;
  const isEs = locale.startsWith('es');
  const base = `/${locale}`;

  // Cargar skills activas agrupadas por industria
  const skills = await prisma.skill.findMany({
    where: { isActive: true },
    orderBy: [{ industry: 'asc' }, { sortOrder: 'asc' }],
    select: {
      id: true,
      key: true,
      name: true,
      nameEn: true,
      industry: true,
      industryEn: true,
      icon: true,
      description: true,
      descriptionEn: true,
      priceMonthly: true,
      isFeatured: true,
    },
  });

  // Agrupar por industria
  const groups = new Map<string, typeof skills>();
  for (const skill of skills) {
    const key = `${skill.industry}|||${skill.industryEn}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(skill);
  }

  const copy = {
    eyebrow: isEs ? 'HABILIDADES DISPONIBLES' : 'AVAILABLE SKILLS',
    title: isEs ? 'El agente que se adapta a tu negocio' : 'The agent that adapts to your business',
    subtitle: isEs
      ? 'Elige las habilidades especializadas que necesita tu equipo. Cada skill entrena a tu agente con el conocimiento profundo de tu industria.'
      : 'Choose the specialized skills your team needs. Each skill trains your agent with deep knowledge of your industry.',
    ctaPrimary: isEs ? 'Crear mi agente' : 'Create my agent',
    ctaSecondary: isEs ? 'Ver precios' : 'View pricing',
    perMonth: isEs ? '/mes' : '/mo',
    featured: isEs ? 'Destacado' : 'Featured',
  };

  return (
    <div className={`${display.variable} ${body.variable} space-y-16 font-[var(--font-body)]`}>
      {/* Hero */}
      <section className="premium-spotlight relative overflow-hidden border-y border-black/8 bg-[linear-gradient(180deg,#f4f7fb_0%,#ffffff_28%,#f7fafc_100%)] px-6 py-14 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="premium-grid absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1760px] space-y-6">
          <div className="inline-flex rounded-full border border-black/8 bg-white/88 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            {copy.eyebrow}
          </div>
          <h1 className="max-w-3xl text-4xl font-[var(--font-display)] font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
            {copy.title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {copy.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`${base}/dashboard/agents/create`}
              className="interactive-chip inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_20px_45px_-24px_rgba(15,23,42,0.45)] transition hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
            >
              {copy.ctaPrimary}
            </Link>
            <Link
              href={`${base}/pricing`}
              className="interactive-chip inline-flex items-center justify-center rounded-full border border-black/8 bg-white/86 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-2"
            >
              {copy.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* Skills por industria */}
      <section className="px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px] space-y-14">
          {Array.from(groups.entries()).map(([groupKey, groupSkills]) => {
            const [industry, industryEn] = groupKey.split('|||');
            return (
              <div key={groupKey} className="space-y-6">
                <div className="inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {isEs ? industry : industryEn}
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {groupSkills.map((skill) => (
                    <article
                      key={skill.id}
                      className="interactive-panel overflow-hidden rounded-[28px] border border-black/8 bg-white/92 p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.2)] transition hover:shadow-[0_28px_70px_-42px_rgba(15,23,42,0.28)]"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-3xl">{skill.icon}</span>
                        {skill.isFeatured && (
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
                            {copy.featured}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-3 text-base font-semibold tracking-[-0.02em] text-slate-950">
                        {isEs ? skill.name : skill.nameEn}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-500">
                        {isEs ? skill.description : skill.descriptionEn}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-lg font-semibold tracking-[-0.02em] text-slate-950">
                          ${skill.priceMonthly}
                          <span className="text-xs font-normal text-slate-400">{copy.perMonth}</span>
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 pb-16 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="mx-auto max-w-[1760px]">
          <div className="interactive-panel overflow-hidden rounded-[34px] border border-black/8 bg-slate-950 px-8 py-10 text-center shadow-[0_40px_100px_-70px_rgba(15,23,42,0.6)]">
            <h2 className="text-2xl font-[var(--font-display)] font-semibold tracking-[-0.04em] text-white sm:text-3xl">
              {isEs ? '¿Listo para crear tu agente?' : 'Ready to create your agent?'}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              {isEs
                ? 'Configura tu agente en minutos, elige las skills que necesitas y obtén tu snippet de instalación.'
                : 'Configure your agent in minutes, choose the skills you need, and get your installation snippet.'}
            </p>
            <Link
              href={`${base}/dashboard/agents/create`}
              className="interactive-chip mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {copy.ctaPrimary} →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verificar compilación final**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add packages/db/prisma/schema.prisma
git add packages/db/prisma/seeds/skills.ts
git add packages/db/prisma/seed.ts
git add "apps/web/app/[locale]/(app)/dashboard/agents/create/"
git add apps/web/app/lib/orchestrator/contextBuilder.ts
git add "apps/web/app/[locale]/(public)/skills/page.tsx"
git commit -m "feat: agent creator — Skill model, seed, wizard UI, context integration"
```

---

## Self-Review

### Spec coverage checklist

| Requisito | Tarea |
|---|---|
| Modelos Skill + AgentSkill en schema | Task 1 |
| Relación `skills AgentSkill[]` en AgentInstance | Task 1 |
| Migración `db:migrate` | Task 1 |
| Seed 18 skills en 5 industrias | Task 2 |
| `createAgentWithSkills` server action | Task 3 |
| `getAvailableSkills` server action | Task 3 |
| `calculateAgentPrice` server action | Task 3 |
| Paso 1: info del agente (nombre, desc, idioma) | Task 4 |
| Paso 2: cards de skills agrupadas por industria | Task 4 |
| Paso 3: resumen + precio en tiempo real | Task 4 |
| Paso 4: snippet de instalación con botón copiar | Task 4 |
| Precio base $29 + skills en sidebar sticky | Task 4 |
| NO modificar engine.ts ni types.ts | ✓ (Task 5 solo toca contextBuilder) |
| Skills en system_context del orquestador | Task 5 |
| Página pública /skills con hero + grid | Task 6 |
| multi-tenant (siempre filtrar por tenantId) | ✓ (actions.ts usa requireTenant) |
| TypeScript estricto | ✓ todos los archivos |
| Comentarios en español | ✓ acciones y seeds |

### Placeholders scan
Ninguno encontrado — todos los pasos incluyen código completo.

### Type consistency
- `SkillItem`, `SkillGroup`, `CreateAgentResult` definidos en `actions.ts` y reutilizados en todos los componentes.
- `buildSystemContext` recibe `AgentInstance & { skills: [...] }` que es exactamente lo que retorna Prisma con el `include` de Task 5.
- `agentInstance.skills` en `buildContext` (que usa `loadAgentData`) coincide con la firma actualizada de `buildSystemContext`.

---

## Instrucciones para probar localmente

```bash
# 1. Aplicar migración
npm run db:migrate -- --name agent_creator_skills

# 2. Ejecutar seed de skills
npm run db:seed

# 3. Levantar la app
npm run dev

# 4. Navegar a:
#    /es/dashboard/agents/create   → Agent Creator wizard
#    /es/skills                    → Página pública de skills

# 5. Flujo de prueba:
#    - Ingresar nombre y descripción del agente
#    - Seleccionar 2–3 skills de diferentes industrias
#    - Verificar que el precio se actualiza en tiempo real
#    - Hacer clic en "Crear agente"
#    - Verificar el snippet con data-token y data-skills
#    - Copiar snippet al portapapeles
```
