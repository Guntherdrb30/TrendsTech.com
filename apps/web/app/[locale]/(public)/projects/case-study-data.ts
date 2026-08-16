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
    heroImage: '/cases/carpihogar/carpihogar-pwa-home.svg',
    title: {
      es: 'Comercio digital y operación empresarial conectados en una sola plataforma',
      en: 'Digital commerce and business operations connected in one platform',
    },
    summary: {
      es: 'Primer caso productivo de Trends172Tech: una operación comercial activa que conecta catálogo, ventas, inventario, contenido, administración y reportes sobre LUNA.',
      en: 'Trends172Tech’s first production case: an active commercial operation connecting catalog, sales, inventory, content, administration, and reporting on LUNA.',
    },
    challenge: {
      es: 'Unificar la experiencia de compra pública con el control interno del negocio, evitando que productos, existencias, ventas y contenido comercial funcionaran como procesos aislados.',
      en: 'Unify the public shopping experience with internal business control, preventing products, stock, sales, and commercial content from operating as isolated processes.',
    },
    solution: {
      es: 'Una PWA comercial respaldada por módulos operativos de LUNA. La misma base organiza la tienda, el catálogo, las ventas, el inventario, los carruseles, las novedades, la administración y la lectura ejecutiva de la operación.',
      en: 'A commerce PWA backed by LUNA operational modules. The same foundation organizes the store, catalog, sales, inventory, carousels, news, administration, and executive visibility of the operation.',
    },
    capabilities: {
      es: [
        'Catálogo, productos, marcas y fichas comerciales.',
        'Ventas conectadas con el movimiento de inventario.',
        'Carruseles, novedades y contenido administrable.',
        'Panel administrativo para la operación cotidiana.',
        'Reportes ejecutivos y lectura centralizada del negocio.',
        'Funciones inteligentes aplicadas a contenido y procesos internos.',
      ],
      en: [
        'Catalog, products, brands, and commercial product pages.',
        'Sales connected to inventory movement.',
        'Carousels, news, and manageable content.',
        'Administration dashboard for daily operations.',
        'Executive reports and centralized business visibility.',
        'Intelligent features applied to content and internal workflows.',
      ],
    },
    evidence: {
      es: [
        'Sitio comercial activo y públicamente accesible.',
        'Experiencia instalable tipo PWA.',
        'Programa público de aliados e inversionistas con trazabilidad operativa.',
        'Identificación pública de LUNA y Trends172Tech como plataforma tecnológica.',
      ],
      en: [
        'Active, publicly accessible commerce site.',
        'Installable PWA experience.',
        'Public partner and investor programs with operational traceability.',
        'Public identification of LUNA and Trends172Tech as the technology platform.',
      ],
    },
    outcomes: {
      es: [
        'Una fuente operativa compartida para catálogo, venta e inventario.',
        'Administración de contenido sin separar la operación comercial.',
        'Experiencia consistente entre móvil, tableta y escritorio.',
        'Base reutilizable para adaptar LUNA a nuevos modelos de negocio.',
      ],
      en: [
        'A shared operational source for catalog, sales, and inventory.',
        'Content management without separating it from commercial operations.',
        'Consistent experience across mobile, tablet, and desktop.',
        'A reusable foundation for adapting LUNA to new business models.',
      ],
    },
    workflow: {
      es: [
        'El equipo administra productos, marcas, contenido y disponibilidad.',
        'El cliente explora el catálogo y completa su recorrido comercial.',
        'La operación registra ventas y mantiene la trazabilidad del inventario.',
        'Los paneles consolidan información útil para seguimiento y decisiones.',
      ],
      en: [
        'The team manages products, brands, content, and availability.',
        'The customer explores the catalog and completes the commercial journey.',
        'Operations register sales and preserve inventory traceability.',
        'Dashboards consolidate useful information for monitoring and decisions.',
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
    stack: ['LUNA', 'Next.js', 'TypeScript', 'PWA', 'PostgreSQL', 'Vercel'],
    gallery: [
      {
        src: '/cases/carpihogar/carpihogar-catalog-grid.svg',
        alt: {
          es: 'Vista conceptual del catálogo de CarpiHogar',
          en: 'Conceptual view of the CarpiHogar catalog',
        },
        caption: {
          es: 'Catálogo y presentación comercial conectados con la operación.',
          en: 'Catalog and commercial presentation connected to operations.',
        },
      },
      {
        src: '/cases/carpihogar/carpihogar-sales-form.svg',
        alt: {
          es: 'Vista conceptual del registro de ventas de CarpiHogar',
          en: 'Conceptual view of CarpiHogar sales registration',
        },
        caption: {
          es: 'Registro comercial y seguimiento del flujo de venta.',
          en: 'Commercial registration and sales-flow tracking.',
        },
      },
      {
        src: '/cases/carpihogar/carpihogar-exec-reports.svg',
        alt: {
          es: 'Vista conceptual de reportes ejecutivos de CarpiHogar',
          en: 'Conceptual view of CarpiHogar executive reports',
        },
        caption: {
          es: 'Información consolidada para seguimiento ejecutivo.',
          en: 'Consolidated information for executive monitoring.',
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
