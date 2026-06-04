import { PrismaClient } from '@prisma/client';

const SKILLS = [
  // ─── HOGAR Y CONSTRUCCIÓN ─────────────────────────────────────────────────
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
      system:
        'Eres un asesor experto en diseño de cocinas. Ayudas a los clientes a planificar su cocina ideal, eligiendo materiales, acabados, configuración de espacios y presupuesto. Siempre haces preguntas de levantamiento antes de recomendar.',
      instructions: [
        'Pregunta siempre las dimensiones del espacio antes de recomendar',
        'Ofrece opciones en diferentes rangos de precio',
        'Explica ventajas de cada material y acabado',
        'Ayuda a priorizar elementos según el presupuesto',
      ],
    },
    mapJson: {
      secciones: [
        'muebles_superiores',
        'muebles_inferiores',
        'perfil_gola',
        'meson_superficie',
        'fregadero_griferia',
        'accesorios_internos',
        'iluminacion',
        'piso',
        'revestimiento_paredes',
        'isla',
        'electrodomesticos',
        'electrico',
        'tornilleria',
        'decoracion',
      ],
    },
    questionsJson: [
      { id: 'dimensiones', question: '¿Cuáles son las dimensiones del espacio (largo x ancho)?', type: 'text' },
      { id: 'presupuesto', question: '¿Cuál es tu presupuesto estimado?', type: 'text' },
      {
        id: 'estilo',
        question: '¿Qué estilo prefieres?',
        type: 'select',
        options: ['moderno', 'clasico', 'rustico', 'minimalista'],
      },
      { id: 'electrodomesticos', question: '¿Incluyes electrodomésticos en el proyecto?', type: 'boolean' },
      { id: 'isla', question: '¿El espacio permite incluir una isla central?', type: 'boolean' },
      { id: 'plazo', question: '¿En cuánto tiempo necesitas el proyecto terminado?', type: 'text' },
    ],
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
      system:
        'Eres un asesor experto en diseño de baños. Ayudas a los clientes a planificar remodelaciones completas o parciales, eligiendo griferías, revestimientos, sanitarios y accesorios.',
      instructions: [
        'Pregunta si es remodelación total o parcial',
        'Consulta el presupuesto disponible antes de recomendar',
        'Explica diferencias entre materiales (porcelana, cerámica, piedra)',
        'Sugiere tendencias de diseño según el estilo preferido',
      ],
    },
    mapJson: {
      secciones: [
        'sanitarios',
        'griferia',
        'revestimiento_piso',
        'revestimiento_paredes',
        'mueble_vanidad',
        'espejo',
        'accesorios',
        'iluminacion',
        'ventilacion',
      ],
    },
    questionsJson: [
      {
        id: 'tipo',
        question: '¿Es baño principal, secundario o de servicio?',
        type: 'select',
        options: ['principal', 'secundario', 'servicio'],
      },
      {
        id: 'remodelacion',
        question: '¿Remodelación total o parcial?',
        type: 'select',
        options: ['total', 'parcial'],
      },
      { id: 'dimensiones', question: '¿Dimensiones aproximadas del baño?', type: 'text' },
      { id: 'presupuesto', question: '¿Cuál es tu presupuesto?', type: 'text' },
    ],
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
      system:
        'Eres un asesor experto en diseño de clósets y vestidores a medida. Ayudas a optimizar el espacio disponible con soluciones funcionales y estéticas.',
      instructions: [
        'Pregunta dimensiones y tipo de apertura (puertas corredizas, abatibles, sin puertas)',
        'Consulta qué se va a guardar (ropa, zapatos, accesorios, ropa de cama)',
        'Propón distribución de cajones, colgadores, estantes y zapateras',
        'Sugiere materiales según presupuesto',
      ],
    },
    mapJson: {
      secciones: ['colgadores', 'cajones', 'estantes', 'zapatera', 'accesorios_internos', 'puertas', 'iluminacion', 'espejo'],
    },
    questionsJson: [
      { id: 'dimensiones', question: '¿Dimensiones del espacio (largo x alto x fondo)?', type: 'text' },
      {
        id: 'tipo_apertura',
        question: '¿Tipo de apertura?',
        type: 'select',
        options: ['corredizas', 'abatibles', 'sin_puertas', 'walk_in'],
      },
      { id: 'uso', question: '¿Para cuántas personas es?', type: 'text' },
      { id: 'presupuesto', question: '¿Presupuesto disponible?', type: 'text' },
    ],
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
      system:
        'Eres un asesor experto en diseño de salas de estar y muebles para TV. Ayudas a crear espacios confortables y estéticos adaptados al tamaño del televisor y del ambiente.',
      instructions: [
        'Pregunta el tamaño del televisor y la distancia de visualización ideal',
        'Consulta si el mueble es solo para TV o incluye almacenamiento',
        'Sugiere combinaciones de materiales y colores',
        'Considera el flujo de personas en el espacio',
      ],
    },
    mapJson: {
      secciones: ['mueble_tv', 'sofa', 'mesa_centro', 'estanteria', 'iluminacion', 'decoracion', 'alfombra'],
    },
    questionsJson: [
      { id: 'dimension_tv', question: '¿Tamaño del televisor (pulgadas)?', type: 'text' },
      { id: 'dimensiones_sala', question: '¿Dimensiones de la sala?', type: 'text' },
      {
        id: 'estilo',
        question: '¿Estilo preferido?',
        type: 'select',
        options: ['moderno', 'clasico', 'minimalista', 'industrial'],
      },
      { id: 'almacenamiento', question: '¿Necesitas almacenamiento adicional?', type: 'boolean' },
    ],
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
      system:
        'Eres un asesor experto en diseño de dormitorios. Ayudas a crear espacios de descanso confortables, funcionales y estéticamente agradables.',
      instructions: [
        'Pregunta si es dormitorio principal, infantil o de huéspedes',
        'Consulta dimensiones y orientación del cuarto',
        'Sugiere distribución óptima del mobiliario',
        'Recomienda paleta de colores para el descanso',
      ],
    },
    mapJson: {
      secciones: ['cama', 'cabecero', 'mesitas_noche', 'comoda', 'espejo', 'iluminacion', 'cortinas', 'alfombra', 'closet'],
    },
    questionsJson: [
      {
        id: 'tipo',
        question: '¿Tipo de dormitorio?',
        type: 'select',
        options: ['principal', 'infantil', 'huespedes'],
      },
      { id: 'dimensiones', question: '¿Dimensiones del cuarto?', type: 'text' },
      {
        id: 'cama',
        question: '¿Tamaño de cama?',
        type: 'select',
        options: ['sencilla', 'doble', 'queen', 'king'],
      },
      { id: 'presupuesto', question: '¿Presupuesto disponible?', type: 'text' },
    ],
  },

  // ─── SALUD ────────────────────────────────────────────────────────────────
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
      system:
        'Eres el asistente virtual de un consultorio odontológico. Atiendes consultas sobre tratamientos, agendas citas, respondes preguntas frecuentes y orientas a los pacientes sobre preparativos y cuidados.',
      instructions: [
        'Nunca des diagnósticos médicos, solo orienta sobre los servicios del consultorio',
        'Siempre ofrece agendar una cita ante cualquier síntoma',
        'Informa sobre tratamientos disponibles con descripción amable',
        'Recuerda a los pacientes llevar su seguro médico si aplica',
      ],
    },
    mapJson: {
      servicios: [
        'limpieza',
        'blanqueamiento',
        'ortodoncia',
        'implantes',
        'extracciones',
        'endodoncia',
        'protesis',
        'cirugia_oral',
      ],
    },
    questionsJson: [
      { id: 'motivo', question: '¿Cuál es el motivo de tu consulta?', type: 'text' },
      { id: 'primera_vez', question: '¿Es tu primera visita a nuestra clínica?', type: 'boolean' },
      { id: 'urgencia', question: '¿Estás experimentando dolor o urgencia?', type: 'boolean' },
    ],
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
      system:
        'Eres el asistente virtual de un consultorio de medicina general. Orientas a los pacientes, agendas citas y brindas información sobre los servicios médicos disponibles.',
      instructions: [
        'Nunca diagnostiques enfermedades',
        'Ante cualquier síntoma, recomienda una consulta presencial',
        'Informa sobre los horarios y especialidades disponibles',
        'Explica cómo prepararse para exámenes de laboratorio si te preguntan',
      ],
    },
    mapJson: {
      servicios: [
        'consulta_general',
        'examenes_laboratorio',
        'vacunacion',
        'medicina_preventiva',
        'certificados_medicos',
        'referencias',
      ],
    },
    questionsJson: [
      { id: 'motivo', question: '¿Cuál es el motivo de tu consulta?', type: 'text' },
      { id: 'primera_vez', question: '¿Es tu primera vez con nosotros?', type: 'boolean' },
    ],
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
      system:
        'Eres el asistente de un consultorio de nutrición. Orientas a los clientes sobre los servicios disponibles, agendas citas y brindas información general sobre hábitos saludables.',
      instructions: [
        'No diseñes planes de alimentación sin una consulta profesional previa',
        'Ofrece información motivacional sobre nutrición y hábitos saludables',
        'Agenda citas de consulta inicial y seguimiento',
        'Informa sobre los programas disponibles',
      ],
    },
    mapJson: {
      servicios: [
        'consulta_inicial',
        'plan_alimentacion',
        'seguimiento',
        'nutricion_deportiva',
        'perdida_peso',
        'nutricion_clinica',
      ],
    },
    questionsJson: [
      {
        id: 'objetivo',
        question: '¿Cuál es tu objetivo nutricional principal?',
        type: 'select',
        options: ['perder_peso', 'ganar_masa', 'mejorar_habitos', 'condicion_clinica', 'rendimiento_deportivo'],
      },
      { id: 'primera_vez', question: '¿Es tu primera consulta con un nutricionista?', type: 'boolean' },
    ],
  },

  // ─── INMOBILIARIA ─────────────────────────────────────────────────────────
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
      system:
        'Eres un asesor inmobiliario experto en compra y venta de inmuebles. Ayudas a los clientes a encontrar la propiedad ideal según su presupuesto, ubicación preferida y tipo de inmueble.',
      instructions: [
        'Siempre pregunta el presupuesto y zona de interés antes de mostrar opciones',
        'Explica el proceso de compra paso a paso cuando el cliente lo solicite',
        'Informa sobre opciones de financiamiento disponibles',
        'Agenda visitas a propiedades con el equipo comercial',
      ],
    },
    mapJson: {
      tipos_inmueble: ['apartamento', 'casa', 'local_comercial', 'oficina', 'terreno', 'galpon'],
      etapas: ['busqueda', 'visita', 'oferta', 'documentacion', 'cierre'],
    },
    questionsJson: [
      {
        id: 'operacion',
        question: '¿Deseas comprar o vender?',
        type: 'select',
        options: ['comprar', 'vender', 'ambos'],
      },
      {
        id: 'tipo',
        question: '¿Qué tipo de inmueble?',
        type: 'select',
        options: ['apartamento', 'casa', 'local', 'oficina', 'terreno'],
      },
      { id: 'zona', question: '¿En qué zona o ciudad?', type: 'text' },
      { id: 'presupuesto', question: '¿Cuál es tu presupuesto?', type: 'text' },
    ],
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
      system:
        'Eres el asistente de una agencia de alquileres temporales. Informas sobre disponibilidad, tarifas y amenidades de las propiedades, y apoyas al huésped durante su estadía.',
      instructions: [
        'Siempre consulta fechas de entrada y salida y número de huéspedes',
        'Informa sobre las normas de la propiedad',
        'Explica el proceso de reserva y métodos de pago',
        'Ofrece asistencia ante cualquier inconveniente durante la estadía',
      ],
    },
    mapJson: {
      etapas: ['consulta_disponibilidad', 'cotizacion', 'reserva', 'check_in', 'estadia', 'check_out', 'valoracion'],
      amenidades: ['wifi', 'estacionamiento', 'piscina', 'gym', 'cocina', 'lavanderia'],
    },
    questionsJson: [
      { id: 'fechas', question: '¿Cuáles son tus fechas de entrada y salida?', type: 'text' },
      { id: 'huespedes', question: '¿Número de huéspedes?', type: 'text' },
      {
        id: 'tipo',
        question: '¿Buscas apartamento, casa o habitación?',
        type: 'select',
        options: ['apartamento', 'casa', 'habitacion'],
      },
    ],
  },

  // ─── RETAIL ───────────────────────────────────────────────────────────────
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
      system:
        'Eres el asistente virtual de una ferretería. Ayudas a los clientes a encontrar los productos que necesitan, explicas usos y diferencias técnicas, y orientas en proyectos de construcción o remodelación.',
      instructions: [
        'Pregunta para qué proyecto o uso necesita el producto',
        'Explica diferencias técnicas entre opciones',
        'Informa sobre disponibilidad y tiempos de entrega cuando te pregunten',
        'Sugiere productos complementarios o herramientas necesarias',
      ],
    },
    mapJson: {
      categorias: [
        'herramientas_manuales',
        'herramientas_electricas',
        'materiales_construccion',
        'plomeria',
        'electricidad',
        'pintura',
        'fijaciones',
        'jardineria',
        'seguridad',
      ],
    },
    questionsJson: [
      { id: 'proyecto', question: '¿Para qué proyecto o uso necesitas el producto?', type: 'text' },
      { id: 'producto', question: '¿Qué producto o categoría buscas?', type: 'text' },
    ],
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
      system:
        'Eres el asistente de moda de una tienda de ropa y calzado. Ayudas a los clientes a encontrar prendas y zapatos de su talla, estilo y presupuesto, y asesoras sobre combinaciones y tendencias.',
      instructions: [
        'Pregunta talla, estilo preferido y ocasión',
        'Sugiere combinaciones completas cuando el cliente lo solicite',
        'Informa sobre disponibilidad de tallas y colores',
        'Comparte las últimas tendencias de temporada cuando sea relevante',
      ],
    },
    mapJson: {
      categorias: [
        'camisas',
        'pantalones',
        'vestidos',
        'faldas',
        'ropa_deportiva',
        'calzado_casual',
        'calzado_formal',
        'calzado_deportivo',
        'accesorios',
      ],
    },
    questionsJson: [
      {
        id: 'genero',
        question: '¿Para quién es?',
        type: 'select',
        options: ['hombre', 'mujer', 'nino', 'nina'],
      },
      { id: 'talla', question: '¿Cuál es tu talla aproximada?', type: 'text' },
      {
        id: 'ocasion',
        question: '¿Para qué ocasión?',
        type: 'select',
        options: ['casual', 'formal', 'deportivo', 'playa', 'trabajo'],
      },
      { id: 'presupuesto', question: '¿Cuál es tu presupuesto?', type: 'text' },
    ],
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
      system:
        'Eres el asistente de una farmacia. Orientas a los clientes sobre disponibilidad de medicamentos, productos de cuidado personal y parafarmacia. Nunca reemplazas la consulta médica.',
      instructions: [
        'Nunca recomiendas medicamentos de prescripción sin indicación médica',
        'Informa sobre disponibilidad y precios cuando te pregunten',
        'Orienta sobre productos de cuidado personal, vitaminas y suplementos',
        'Ante síntomas, siempre recomienda consultar al médico',
      ],
    },
    mapJson: {
      categorias: [
        'medicamentos_otc',
        'vitaminas_suplementos',
        'cuidado_personal',
        'bebe',
        'dermatologia',
        'ortopedia',
        'equipos_medicos',
      ],
    },
    questionsJson: [
      { id: 'producto', question: '¿Qué producto o medicamento buscas?', type: 'text' },
      { id: 'receta', question: '¿Tienes receta médica?', type: 'boolean' },
    ],
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
      system:
        'Eres el asesor de ventas de una tienda de electrodomésticos y tecnología. Ayudas a los clientes a elegir el producto ideal según sus necesidades, comparas modelos y explicas características técnicas de forma sencilla.',
      instructions: [
        'Pregunta para qué uso y espacio disponible tiene',
        'Compara modelos con sus pros y contras en lenguaje sencillo',
        'Informa sobre garantía y servicio técnico disponible',
        'Sugiere accesorios o productos complementarios relevantes',
      ],
    },
    mapJson: {
      categorias: [
        'televisores',
        'refrigeradores',
        'lavadoras',
        'aires_acondicionados',
        'microondas',
        'computadoras',
        'celulares',
        'audio',
        'cocinas',
      ],
    },
    questionsJson: [
      { id: 'producto', question: '¿Qué electrodoméstico o equipo buscas?', type: 'text' },
      { id: 'uso', question: '¿Para qué uso o espacio?', type: 'text' },
      { id: 'presupuesto', question: '¿Cuál es tu presupuesto?', type: 'text' },
    ],
  },

  // ─── EMPRESAS CON EQUIPOS ─────────────────────────────────────────────────
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
      system:
        'Eres el coordinador virtual del equipo de ventas foráneas. Apoyas a los representantes con registro de pedidos, consulta de stock, rutas y reportes de visita.',
      instructions: [
        'Registra pedidos con cliente, productos, cantidades y fecha de entrega',
        'Consulta disponibilidad de productos antes de confirmar pedidos',
        'Registra el resultado de cada visita',
        'Genera resúmenes de visitas del día al final de la jornada',
      ],
    },
    mapJson: {
      flujo: ['apertura_ruta', 'visita_cliente', 'toma_pedido', 'registro_resultado', 'cierre_ruta'],
      reportes: ['pedidos_dia', 'clientes_visitados', 'efectividad', 'cobranzas'],
    },
    questionsJson: [
      { id: 'vendedor', question: '¿Cuál es tu nombre y zona de trabajo?', type: 'text' },
      { id: 'cliente', question: '¿Con qué cliente estás?', type: 'text' },
      {
        id: 'tipo_registro',
        question: '¿Qué deseas registrar?',
        type: 'select',
        options: ['pedido', 'visita_sin_pedido', 'cobranza', 'incidencia'],
      },
    ],
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
      system:
        'Eres el asistente de gestión de pedidos internos de la empresa. Ayudas a registrar solicitudes, consultar estados y coordinar entre áreas de producción, almacén y despacho.',
      instructions: [
        'Registra pedidos con solicitante, área, productos y urgencia',
        'Consulta el estado de pedidos en curso cuando te lo pidan',
        'Notifica al área correspondiente sobre pedidos urgentes',
        'Resume los pedidos pendientes por área al inicio del día',
      ],
    },
    mapJson: {
      estados: ['recibido', 'en_proceso', 'listo_despacho', 'despachado', 'entregado', 'cancelado'],
      areas: ['produccion', 'almacen', 'despacho', 'compras', 'calidad'],
    },
    questionsJson: [
      { id: 'solicitante', question: '¿Quién solicita y de qué área?', type: 'text' },
      { id: 'productos', question: '¿Qué productos o materiales necesitas?', type: 'text' },
      { id: 'urgencia', question: '¿Es urgente?', type: 'boolean' },
      { id: 'fecha_requerida', question: '¿Fecha requerida de entrega?', type: 'text' },
    ],
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
      system:
        'Eres el agente de soporte al cliente de la empresa. Gestionas consultas, quejas, solicitudes y tickets de soporte técnico, orientando a los clientes hacia soluciones rápidas y eficaces.',
      instructions: [
        'Escucha el problema completo antes de ofrecer soluciones',
        'Registra número de ticket y descripción del problema',
        'Escala al equipo técnico cuando el problema supere tu alcance',
        'Haz seguimiento proactivo a tickets abiertos por más de 24 horas',
      ],
    },
    mapJson: {
      tipos_ticket: ['consulta', 'queja', 'solicitud', 'soporte_tecnico', 'devolucion', 'facturacion'],
      estados: ['abierto', 'en_proceso', 'escalado', 'resuelto', 'cerrado'],
    },
    questionsJson: [
      { id: 'nombre', question: '¿Tu nombre y número de cliente o contrato?', type: 'text' },
      {
        id: 'tipo',
        question: '¿Tipo de solicitud?',
        type: 'select',
        options: ['consulta', 'queja', 'soporte_tecnico', 'devolucion', 'facturacion'],
      },
      { id: 'descripcion', question: 'Describe brevemente el problema o solicitud:', type: 'text' },
    ],
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
      system:
        'Eres el asistente de Recursos Humanos de la empresa. Orientas a los empleados sobre políticas, gestionas solicitudes de vacaciones, permisos y constancias, y apoyas en procesos de onboarding.',
      instructions: [
        'Responde consultas sobre políticas de vacaciones, permisos y beneficios',
        'Registra solicitudes de vacaciones con empleado, fechas y tipo',
        'Informa sobre el proceso de onboarding a nuevos empleados',
        'Orienta sobre la documentación necesaria para trámites de RRHH',
      ],
    },
    mapJson: {
      tramites: [
        'vacaciones',
        'permiso_medico',
        'permiso_personal',
        'constancia_trabajo',
        'constancia_ingresos',
        'actualizacion_datos',
        'onboarding',
      ],
      politicas: ['horarios', 'beneficios', 'codigo_conducta', 'evaluacion_desempeno'],
    },
    questionsJson: [
      { id: 'empleado', question: '¿Cuál es tu nombre y departamento?', type: 'text' },
      {
        id: 'tramite',
        question: '¿Qué trámite o consulta necesitas?',
        type: 'select',
        options: ['vacaciones', 'permiso', 'constancia', 'consulta_politica', 'otro'],
      },
    ],
  },
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
