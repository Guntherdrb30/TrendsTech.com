export const CASE_STUDY_SLUGS = ['carpihogar', 'luna-football'] as const;

export type CaseStudySlug = (typeof CASE_STUDY_SLUGS)[number];

type LocalizedValue = {
  es: string;
  en: string;
};

type LocalizedList = {
  es: string[];
  en: string[];
};

type CaseStudyDefinition = {
  slug: CaseStudySlug;
  name: string;
  product: string;
  externalUrl: string;
  accent: 'teal' | 'orange';
  heroImage: string;
  title: LocalizedValue;
  summary: LocalizedValue;
  challenge: LocalizedValue;
  solution: LocalizedValue;
  capabilities: LocalizedList;
  evidence: LocalizedList;
  outcomes: LocalizedList;
  workflow: LocalizedList;
  safeguards: LocalizedList;
  stack: string[];
  gallery: Array<{
    src: string;
    alt: LocalizedValue;
    caption: LocalizedValue;
  }>;
};

const CASE_STUDIES: Record<CaseStudySlug, CaseStudyDefinition> = {
  carpihogar: {
    slug: 'carpihogar',
    name: 'CarpiHogar',
    product: 'LUNA Commerce',
    externalUrl: 'https://carpihogar.com/',
    accent: 'teal',
    heroImage: '/screenshots/luna/carpihogar-real-mobile.jpg',
    title: {
      es: 'Carpihogar: comercio, operación e inteligencia conectados para dirigir el negocio completo',
      en: 'Carpihogar: commerce, operations, and intelligence connected to run the entire business',
    },
    summary: {
      es: 'La implementación que dio origen operativo a LUNA: una plataforma activa que conecta experiencia de compra, catálogo inteligente, ventas, clientes, inventario, compras, finanzas, logística, contenido, aliados e IA dentro de una misma arquitectura.',
      en: 'The implementation that became LUNA’s operating foundation: a live platform connecting shopping, an intelligent catalog, sales, customers, inventory, purchasing, finance, logistics, content, partners, and AI in one architecture.',
    },
    challenge: {
      es: 'Construir una operación digital capaz de vender, administrar y crecer sin separar la tienda pública del trabajo interno. El reto no era lanzar otro ecommerce, sino conectar productos, clientes, cotizaciones, ventas, existencias, compras, pagos, despachos, contenido y nuevos modelos comerciales con trazabilidad.',
      en: 'Build a digital operation capable of selling, managing, and growing without separating the public store from internal work. The challenge was not another ecommerce site, but connecting products, customers, quotations, sales, stock, purchasing, payments, dispatch, content, and new commercial models with traceability.',
    },
    solution: {
      es: 'Carpihogar opera como un sistema empresarial modular sobre LUNA. La experiencia PWA, el catálogo y los canales de conversión comparten contexto con ventas internas, clientes, inventario, compras, cobranzas, logística, paneles ejecutivos, contenido, programas de aliados e inversionistas, integraciones sociales y agentes de IA.',
      en: 'Carpihogar operates as a modular business system on LUNA. Its PWA experience, catalog, and conversion channels share context with internal sales, customers, inventory, purchasing, collections, logistics, executive dashboards, content, partner and investor programs, social integrations, and AI agents.',
    },
    capabilities: {
      es: [
        'Tienda PWA instalable con navegación, carrito y conversión por WhatsApp.',
        'Catálogo, productos, marcas, fichas, novedades y contenido comercial.',
        'Modo IA para búsqueda, recomendación y descubrimiento asistido.',
        'Cotizaciones, pedidos, ventas internas y seguimiento comercial.',
        'Clientes, perfiles, direcciones, historial y precios por contexto.',
        'Inventario, entradas, salidas, movimientos y disponibilidad operativa.',
        'Compras, proveedores, recepción y trazabilidad de abastecimiento.',
        'Pagos, cobranzas, cuentas por cobrar y cuentas por pagar.',
        'Despachos, entregas, responsables y seguimiento logístico.',
        'Paneles administrativos y ejecutivos con métricas del negocio.',
        'Mini tiendas, aliados marketing e inversionistas con trazabilidad.',
        'Agentes de IA para catálogo, marketing, soporte, manuales y análisis.',
      ],
      en: [
        'Installable PWA storefront with navigation, cart, and WhatsApp conversion.',
        'Catalog, products, brands, product pages, news, and commercial content.',
        'AI Mode for assisted search, recommendations, and discovery.',
        'Quotations, orders, internal sales, and commercial follow-up.',
        'Customers, profiles, addresses, history, and contextual pricing.',
        'Inventory, receipts, issues, movements, and operating availability.',
        'Purchasing, suppliers, receiving, and procurement traceability.',
        'Payments, collections, accounts receivable, and accounts payable.',
        'Dispatches, deliveries, owners, and logistics tracking.',
        'Administrative and executive dashboards with business metrics.',
        'Mini stores, marketing partners, and investors with traceability.',
        'AI agents for catalog, marketing, support, manuals, and analysis.',
      ],
    },
    evidence: {
      es: [
        'Sitio comercial activo y públicamente accesible.',
        'Experiencia instalable tipo PWA.',
        'Catálogo, marcas, mini tiendas y novedades dentro de la experiencia pública.',
        'Programa público de aliados e inversionistas con trazabilidad operativa.',
        'Integración tecnológica declarada con Instagram, Facebook y Meta Graph API.',
        'Identificación pública de LUNA y Trends172Tech como plataforma tecnológica.',
      ],
      en: [
        'Active, publicly accessible commerce site.',
        'Installable PWA experience.',
        'Catalog, brands, mini stores, and news in the public experience.',
        'Public partner and investor programs with operational traceability.',
        'Declared technology integration with Instagram, Facebook, and the Meta Graph API.',
        'Public identification of LUNA and Trends172Tech as the technology platform.',
      ],
    },
    outcomes: {
      es: [
        'Una fuente operativa compartida para comercio, clientes, venta, inventario y finanzas.',
        'Continuidad entre la intención del cliente, la cotización, el pedido, el cobro y el despacho.',
        'Administración de contenido, campañas y canales sociales sin aislarlos de la operación.',
        'Experiencias específicas por rol para clientes, ventas, administración, aliados y dirección.',
        'Lectura ejecutiva del negocio desde indicadores y consultas con contexto.',
        'Base modular reutilizable para adaptar LUNA a otros sectores y modelos comerciales.',
      ],
      en: [
        'A shared operating source for commerce, customers, sales, inventory, and finance.',
        'Continuity from customer intent through quotation, order, collection, and dispatch.',
        'Content, campaigns, and social channels managed without isolating them from operations.',
        'Role-specific experiences for customers, sales, administration, partners, and leadership.',
        'Executive visibility through contextual metrics and queries.',
        'A reusable modular foundation for adapting LUNA to other industries and commercial models.',
      ],
    },
    workflow: {
      es: [
        'El equipo configura productos, marcas, precios, contenido y disponibilidad.',
        'El cliente descubre, compara y consulta productos desde la PWA o el Modo IA.',
        'La intención se convierte en carrito, conversación, cotización o pedido.',
        'Ventas registra la operación con cliente, condiciones y precios correspondientes.',
        'Inventario, compras y proveedores sostienen disponibilidad y reposición.',
        'Pagos, cobranzas y despacho completan el ciclo con responsables y estados.',
        'Contenido, aliados y canales sociales amplían adquisición y distribución.',
        'Dirección consulta paneles y agentes de IA para comprender y priorizar la operación.',
      ],
      en: [
        'The team configures products, brands, prices, content, and availability.',
        'The customer discovers, compares, and explores products through the PWA or AI Mode.',
        'Intent becomes a cart, conversation, quotation, or order.',
        'Sales records the transaction with the right customer, conditions, and pricing.',
        'Inventory, purchasing, and suppliers sustain availability and replenishment.',
        'Payments, collections, and dispatch complete the cycle with owners and statuses.',
        'Content, partners, and social channels expand acquisition and distribution.',
        'Leadership uses dashboards and AI agents to understand and prioritize operations.',
      ],
    },
    safeguards: {
      es: [
        'Separación entre experiencia pública y funciones administrativas.',
        'Trazabilidad de procesos operativos sin publicar información sensible.',
        'Validación de entradas y protección frente a automatizaciones abusivas.',
        'Despliegue controlado y monitoreo de disponibilidad en producción.',
      ],
      en: [
        'Separation between the public experience and administrative functions.',
        'Operational traceability without publishing sensitive information.',
        'Input validation and protection against abusive automation.',
        'Controlled deployment and production availability monitoring.',
      ],
    },
    stack: ['LUNA', 'Next.js', 'TypeScript', 'PWA', 'PostgreSQL', 'Vercel', 'Meta Graph API', 'AI agents'],
    gallery: [
      {
        src: '/screenshots/luna/carpihogar-real-mobile.jpg',
        alt: {
          es: 'Tienda móvil real de CarpiHogar',
          en: 'Real CarpiHogar mobile storefront',
        },
        caption: {
          es: 'Experiencia pública de compra y descubrimiento de productos en producción.',
          en: 'Live public shopping and product-discovery experience.',
        },
      },
      {
        src: '/screenshots/luna/carpihogar-catalogo-inteligente-mobile.jpg',
        alt: {
          es: 'Catálogo inteligente real de CarpiHogar',
          en: 'Real CarpiHogar intelligent catalog',
        },
        caption: {
          es: 'Catálogo inteligente con novedades, rotación y contexto comercial.',
          en: 'Intelligent catalog with new products, turnover, and commercial context.',
        },
      },
      {
        src: '/screenshots/luna/carpihogar-panel-ejecutivo-mobile.jpg',
        alt: {
          es: 'Panel ejecutivo real de CarpiHogar',
          en: 'Real CarpiHogar executive dashboard',
        },
        caption: {
          es: 'Panel ejecutivo móvil para consultar ventas y estado operativo.',
          en: 'Mobile executive dashboard for sales and operating status.',
        },
      },
      {
        src: '/screenshots/luna/carpihogar-metricas-mobile.jpg',
        alt: {
          es: 'Métricas reales de inventario y cuentas de CarpiHogar',
          en: 'Real CarpiHogar inventory and account metrics',
        },
        caption: {
          es: 'Métricas consolidadas de inventario y seguimiento financiero.',
          en: 'Consolidated inventory and financial monitoring metrics.',
        },
      },
    ],
  },
  'luna-football': {
    slug: 'luna-football',
    name: 'LUNA Football',
    product: 'LUNA Football',
    externalUrl: 'https://cdebarinasef.com/',
    accent: 'orange',
    heroImage: '/cases/luna-football/luna-football-operations.svg',
    title: {
      es: 'LUNA Football: plataforma IA-nativa para operar escuelas, academias y clubes de fútbol',
      en: 'LUNA Football: an AI-native platform for football academies, schools, and clubs',
    },
    summary: {
      es: 'Producto deportivo de Trends172Tech construido sobre LUNA para digitalizar inscripciones, jugadores, representantes, pagos, equipos, entrenadores, inventario, carnetización y planificación de entrenamientos en una operación trazable. El Club Español E.F. de Barinas funciona como primera implementación pública en producción.',
      en: 'A Trends172Tech sports product built on LUNA to digitize enrollment, players, guardians, payments, teams, coaches, inventory, ID cards, and training planning in one traceable operation. Club Español E.F. in Barinas is the first public production implementation.',
    },
    challenge: {
      es: 'Muchas organizaciones deportivas gestionan inscripciones, mensualidades, jugadores, representantes, uniformidad, entrenamientos y administración en herramientas separadas. Eso limita la trazabilidad, duplica trabajo y dificulta que la dirección tenga una lectura clara de la operación.',
      en: 'Many sports organizations manage enrollment, tuition, players, guardians, uniforms, training sessions, and administration across disconnected tools. That limits traceability, duplicates work, and makes it harder for leadership to understand the operation clearly.',
    },
    solution: {
      es: 'LUNA Football convierte la operación deportiva en un sistema comercializable y adaptable: portal público, registro de jugadores, control administrativo, seguimiento de pagos, equipos y categorías, inventario deportivo, carnetización y planificación asistida de entrenamientos. El caso CDE Barinas demuestra la plataforma aplicada en una organización real sin exponer datos sensibles.',
      en: 'LUNA Football turns sports operations into a marketable and adaptable system: public portal, player registration, administrative control, payment tracking, teams and categories, sports inventory, ID cards, and assisted training planning. The CDE Barinas case shows the platform applied to a real organization without exposing sensitive data.',
    },
    capabilities: {
      es: [
        'Inscripción digital y expediente operativo de jugadores.',
        'Gestión de representantes, categorías, equipos y entrenadores.',
        'Control de mensualidades, solvencia y seguimiento administrativo.',
        'Inventario de uniformes, equipamiento y recursos deportivos.',
        'Nómina, empleados, carnetización y procesos internos del club.',
        'Portal público para información, torneos, noticias y captación.',
        'Planificación asistida de entrenamientos modulares con revisión humana.',
      ],
      en: [
        'Digital enrollment and operational player records.',
        'Management of guardians, categories, teams, and coaches.',
        'Tuition, payment status, and administrative follow-up.',
        'Inventory for uniforms, equipment, and sports resources.',
        'Payroll, employees, ID cards, and internal club processes.',
        'Public portal for information, tournaments, news, and lead capture.',
        'Assisted modular training planning with human review.',
      ],
    },
    evidence: {
      es: [
        'Portal activo del Club Español E.F. en Barinas como primera implementación pública.',
        'Flujos públicos para inscripción, consulta de pagos, torneos y noticias.',
        'Módulos deportivos y administrativos presentados sin revelar datos personales ni financieros.',
        'Atribución pública del desarrollo a Trends172Tech y base tecnológica LUNA.',
      ],
      en: [
        'Active Club Español E.F. portal in Barinas as the first public implementation.',
        'Public flows for enrollment, payment checks, tournaments, and news.',
        'Sports and administrative modules presented without revealing personal or financial data.',
        'Public attribution of the development to Trends172Tech and the LUNA technology foundation.',
      ],
    },
    outcomes: {
      es: [
        'Una fuente operativa conectada alrededor de cada jugador, equipo y categoría.',
        'Menos dependencia de hojas de cálculo, mensajes dispersos y controles manuales.',
        'Seguimiento centralizado de mensualidades, recursos, personal y operación diaria.',
        'Producto reutilizable para adaptar LUNA Football a nuevas academias, escuelas y clubes.',
      ],
      en: [
        'A connected operational source around each player, team, and category.',
        'Less dependence on spreadsheets, scattered messages, and manual controls.',
        'Centralized monitoring for tuition, resources, staff, and daily operations.',
        'A reusable product foundation for adapting LUNA Football to new academies, schools, and clubs.',
      ],
    },
    workflow: {
      es: [
        'La familia o representante inicia la inscripción y suministra los datos requeridos.',
        'La administración valida el expediente, organiza al jugador y controla mensualidades.',
        'Entrenadores y responsables trabajan con equipos, categorías, planificación y recursos.',
        'La dirección revisa trazabilidad, inventario, personal, pagos y estado operativo desde una misma base.',
      ],
      en: [
        'The family or guardian starts enrollment and provides the required information.',
        'Administration validates the record, organizes the player, and controls tuition.',
        'Coaches and managers work with teams, categories, planning, and resources.',
        'Leadership reviews traceability, inventory, staff, payments, and operational status from the same foundation.',
      ],
    },
    safeguards: {
      es: [
        'Separación clara entre portal público, consulta externa y gestión administrativa interna.',
        'Exposición mínima de datos personales, financieros y operativos sensibles.',
        'Trazabilidad de acciones relevantes para proteger procesos y responsabilidades.',
        'Automatización asistida por IA con revisión humana y control de la organización.',
      ],
      en: [
        'Clear separation between public portal, external queries, and internal administration.',
        'Minimal exposure of personal, financial, and sensitive operational data.',
        'Traceability of relevant actions to protect processes and responsibilities.',
        'AI-assisted automation with human review and organizational control.',
      ],
    },
    stack: ['LUNA', 'Next.js', 'TypeScript', 'PWA', 'PostgreSQL', 'Vercel', 'AI-assisted workflows'],
    gallery: [
      {
        src: '/cases/luna-football/luna-football-player-flow.svg',
        alt: {
          es: 'Diagrama del flujo de jugadores en LUNA Football',
          en: 'Player workflow diagram in LUNA Football',
        },
        caption: {
          es: 'Del registro inicial al expediente operativo, categoría, equipo y seguimiento administrativo.',
          en: 'From initial registration to operational record, category, team, and administrative follow-up.',
        },
      },
      {
        src: '/cases/luna-football/luna-football-payments.svg',
        alt: {
          es: 'Panel conceptual de pagos de LUNA Football',
          en: 'Conceptual LUNA Football payment dashboard',
        },
        caption: {
          es: 'Mensualidades, solvencia y seguimiento centralizado para la administración.',
          en: 'Tuition, payment status, and centralized follow-up for administration.',
        },
      },
      {
        src: '/cases/luna-football/luna-football-training.svg',
        alt: {
          es: 'Constructor de entrenamientos modulares de LUNA Football',
          en: 'LUNA Football modular training builder',
        },
        caption: {
          es: 'Planificación modular asistida para apoyar el trabajo del entrenador sin perder control humano.',
          en: 'Assisted modular planning to support the coach’s workflow while preserving human control.',
        },
      },
    ],
  },
};

export function getCaseStudy(slug: string) {
  return CASE_STUDIES[slug as CaseStudySlug];
}

export function localizeCaseStudy(caseStudy: CaseStudyDefinition, locale: string) {
  const language = locale.startsWith('es') ? 'es' : 'en';

  return {
    ...caseStudy,
    title: caseStudy.title[language],
    summary: caseStudy.summary[language],
    challenge: caseStudy.challenge[language],
    solution: caseStudy.solution[language],
    capabilities: caseStudy.capabilities[language],
    evidence: caseStudy.evidence[language],
    outcomes: caseStudy.outcomes[language],
    workflow: caseStudy.workflow[language],
    safeguards: caseStudy.safeguards[language],
    gallery: caseStudy.gallery.map((item) => ({
      src: item.src,
      alt: item.alt[language],
      caption: item.caption[language],
    })),
  };
}
