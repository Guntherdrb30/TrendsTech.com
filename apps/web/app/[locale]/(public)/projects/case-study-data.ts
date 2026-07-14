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
    product: 'LUNA Sports',
    externalUrl: 'https://cdebarinasef.com/',
    accent: 'orange',
    heroImage: '/cases/luna-football/luna-football-operations.svg',
    title: {
      es: 'Gestión integral para una escuela de fútbol con operación y trazabilidad reales',
      en: 'End-to-end management for a football academy with real operations and traceability',
    },
    summary: {
      es: 'Plataforma deportiva activa en el Club Español E.F. de Barinas para conectar jugadores, equipos, entrenadores, pagos, inventario, empleados, carnetización y planificación de entrenamientos.',
      en: 'An active sports platform at Club Español E.F. in Barinas connecting players, teams, coaches, payments, inventory, employees, ID cards, and training planning.',
    },
    challenge: {
      es: 'Concentrar en una sola operación el ciclo completo de la escuela: captación e inscripción, control de jugadores, organización deportiva, pagos, recursos internos y seguimiento administrativo.',
      en: 'Bring the academy’s complete cycle into one operation: enrollment, player control, sports organization, payments, internal resources, and administrative monitoring.',
    },
    solution: {
      es: 'Una adaptación deportiva de LUNA que combina portal público, módulos administrativos, trazabilidad por persona y equipo, control financiero-operativo y herramientas asistidas para estructurar entrenamientos modulares.',
      en: 'A sports adaptation of LUNA combining a public portal, administrative modules, person-and-team traceability, financial and operational control, and assisted tools for structuring modular training sessions.',
    },
    capabilities: {
      es: [
        'Inscripciones y expediente operativo de jugadores.',
        'Control de mensualidades y estado de pagos.',
        'Trazabilidad de equipos, categorías y entrenadores.',
        'Inventario de equipamiento deportivo.',
        'Nómina, empleados y procesos de carnetización.',
        'Creación asistida de entrenamientos modulares.',
      ],
      en: [
        'Enrollment and operational player records.',
        'Tuition control and payment status.',
        'Traceability for teams, categories, and coaches.',
        'Sports equipment inventory.',
        'Payroll, employees, and ID card processes.',
        'Assisted creation of modular training sessions.',
      ],
    },
    evidence: {
      es: [
        'Portal activo del Club Español E.F. en Barinas.',
        'Flujos públicos de inscripción y consulta de pagos.',
        'Módulos visibles para torneos, noticias y operación diaria.',
        'Atribución pública del desarrollo a Trends172Tech.',
      ],
      en: [
        'Active portal for Club Español E.F. in Barinas.',
        'Public enrollment and payment-checking flows.',
        'Visible modules for tournaments, news, and daily operations.',
        'Public attribution of the development to Trends172Tech.',
      ],
    },
    outcomes: {
      es: [
        'Historial operativo conectado alrededor de cada jugador.',
        'Mayor orden entre administración, cuerpo técnico y equipos.',
        'Seguimiento de mensualidades y recursos desde una misma plataforma.',
        'Planificación deportiva asistida sin perder control humano.',
      ],
      en: [
        'Connected operational history around each player.',
        'Better coordination across administration, coaching staff, and teams.',
        'Tuition and resource monitoring from the same platform.',
        'Assisted sports planning while preserving human control.',
      ],
    },
    workflow: {
      es: [
        'La familia inicia la inscripción y suministra los datos requeridos.',
        'La administración valida, organiza al jugador y controla mensualidades.',
        'Entrenadores y responsables trabajan con equipos, categorías y planificación.',
        'La dirección consulta trazabilidad, inventario, personal y estado operativo.',
      ],
      en: [
        'The family starts enrollment and provides the required information.',
        'Administration validates, organizes the player, and controls tuition.',
        'Coaches and managers work with teams, categories, and planning.',
        'Leadership reviews traceability, inventory, staff, and operational status.',
      ],
    },
    safeguards: {
      es: [
        'Acceso diferenciado para información pública y gestión interna.',
        'Exposición mínima de datos personales y financieros.',
        'Trazabilidad de acciones relevantes dentro de la operación.',
        'Automatización asistida con revisión y decisión humana.',
      ],
      en: [
        'Differentiated access for public information and internal management.',
        'Minimal exposure of personal and financial data.',
        'Traceability for relevant actions within the operation.',
        'Assisted automation with human review and decision-making.',
      ],
    },
    stack: ['LUNA', 'Next.js', 'TypeScript', 'PWA', 'PostgreSQL', 'Vercel'],
    gallery: [
      {
        src: '/cases/luna-football/luna-football-player-flow.svg',
        alt: {
          es: 'Diagrama del flujo de jugadores en LUNA Football',
          en: 'Player workflow diagram in LUNA Football',
        },
        caption: {
          es: 'Del registro inicial a la trazabilidad deportiva y administrativa.',
          en: 'From initial registration to sports and administrative traceability.',
        },
      },
      {
        src: '/cases/luna-football/luna-football-payments.svg',
        alt: {
          es: 'Panel conceptual de pagos de LUNA Football',
          en: 'Conceptual LUNA Football payment dashboard',
        },
        caption: {
          es: 'Mensualidades, estados y seguimiento operativo centralizado.',
          en: 'Tuition, statuses, and centralized operational monitoring.',
        },
      },
      {
        src: '/cases/luna-football/luna-football-training.svg',
        alt: {
          es: 'Constructor de entrenamientos modulares de LUNA Football',
          en: 'LUNA Football modular training builder',
        },
        caption: {
          es: 'Planificación modular asistida para el trabajo del entrenador.',
          en: 'Assisted modular planning for the coach’s workflow.',
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
