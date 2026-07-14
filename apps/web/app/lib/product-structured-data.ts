import { localizedPath, siteUrl } from './seo';

const organizationId = new URL('/#organization', siteUrl).toString();

function localizedUrl(locale: string, pathname: string) {
  return new URL(localizedPath(locale, pathname), siteUrl).toString();
}

export function buildLunaStructuredData(locale: string) {
  const isEs = locale.startsWith('es');

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${siteUrl.origin}/#luna`,
    name: 'LUNA',
    alternateName: 'LUNA ERP AI',
    url: localizedUrl(locale, 'systems/luna'),
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, PWA',
    inLanguage: isEs ? 'es-VE' : 'en-US',
    description: isEs
      ? 'Plataforma empresarial adaptable para ventas, inventario, compras, facturación, comercio digital, logística, nómina, reportes y automatización inteligente.'
      : 'Adaptable business platform for sales, inventory, purchasing, invoicing, digital commerce, logistics, payroll, reporting, and intelligent automation.',
    provider: { '@id': organizationId },
    featureList: isEs
      ? [
          'Ventas y facturación',
          'Inventario y compras',
          'Tienda online PWA',
          'Logística y envíos',
          'Nómina y recursos humanos',
          'Reportes ejecutivos',
          'Automatización y agentes inteligentes',
        ]
      : [
          'Sales and invoicing',
          'Inventory and purchasing',
          'PWA online store',
          'Logistics and shipping',
          'Payroll and human resources',
          'Executive reporting',
          'Automation and intelligent agents',
        ],
  };
}

export function buildProductionCasesStructuredData(locale: string) {
  const isEs = locale.startsWith('es');
  const projectsUrl = localizedUrl(locale, 'projects');
  const carpihogar = {
    '@type': 'SoftwareApplication',
    '@id': `${siteUrl.origin}/#carpihogar`,
    name: 'CarpiHogar',
    url: localizedUrl(locale, 'projects/carpihogar'),
    sameAs: 'https://carpihogar.com/',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, PWA',
    inLanguage: 'es-VE',
    description: isEs
      ? 'Primer caso productivo de Trends172Tech para comercio digital y control operativo de productos, ventas, inventario, contenido comercial y reportes.'
      : 'Trends172Tech\'s first production case for digital commerce and operational control of products, sales, inventory, commercial content, and reporting.',
    provider: { '@id': organizationId },
    featureList: isEs
      ? [
          'Catálogo y productos',
          'Ventas e inventario',
          'Carruseles y contenido comercial',
          'Panel administrativo',
          'Reportes ejecutivos',
          'Funciones inteligentes aplicadas a la operación',
        ]
      : [
          'Catalog and products',
          'Sales and inventory',
          'Carousels and commercial content',
          'Administration dashboard',
          'Executive reporting',
          'Intelligent features applied to operations',
        ],
  };
  const lunaFootball = {
    '@type': 'SoftwareApplication',
    '@id': `${siteUrl.origin}/#luna-football`,
    name: 'LUNA Football',
    url: localizedUrl(locale, 'projects/luna-football'),
    sameAs: 'https://cdebarinasef.com/',
    applicationCategory: 'SportsApplication',
    operatingSystem: 'Web, PWA',
    inLanguage: 'es-VE',
    description: isEs
      ? 'Plataforma deportiva en producción para controlar jugadores, equipos, entrenadores, empleados, matrículas, mensualidades, inventario, nómina, carnetización y entrenamientos modulares asistidos.'
      : 'Production sports platform for managing players, teams, coaches, employees, registrations, tuition payments, inventory, payroll, ID cards, and assisted modular training plans.',
    provider: { '@id': organizationId },
    featureList: isEs
      ? [
          'Trazabilidad de jugadores, equipos y entrenadores',
          'Inscripciones y pagos de mensualidades',
          'Inventario de equipamiento deportivo',
          'Nómina y control de empleados',
          'Carnetización',
          'Entrenamientos modulares asistidos',
        ]
      : [
          'Player, team, and coach traceability',
          'Registration and tuition payments',
          'Sports equipment inventory',
          'Payroll and employee management',
          'ID card management',
          'Assisted modular training plans',
        ],
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      carpihogar,
      lunaFootball,
      {
        '@type': 'ItemList',
        '@id': `${projectsUrl}#production-cases`,
        name: isEs ? 'Casos productivos de Trends172Tech' : 'Trends172Tech production cases',
        url: projectsUrl,
        numberOfItems: 2,
        itemListElement: [
          { '@type': 'ListItem', position: 1, item: { '@id': carpihogar['@id'] } },
          { '@type': 'ListItem', position: 2, item: { '@id': lunaFootball['@id'] } },
        ],
      },
    ],
  };
}

export function buildProductionCaseStructuredData(
  locale: string,
  slug: 'carpihogar' | 'luna-football'
) {
  const isEs = locale.startsWith('es');
  const casePageUrl = localizedUrl(locale, `projects/${slug}`);
  const projectsUrl = localizedUrl(locale, 'projects');
  const cases = {
    carpihogar: {
      id: `${siteUrl.origin}/#carpihogar`,
      name: 'CarpiHogar',
      externalUrl: 'https://carpihogar.com/',
      category: 'BusinessApplication',
      description: isEs
        ? 'Caso productivo de comercio digital y control operativo conectado sobre LUNA.'
        : 'Production case study for connected digital commerce and operational control on LUNA.',
      features: isEs
        ? ['Catálogo y productos', 'Ventas e inventario', 'Contenido comercial', 'Administración', 'Reportes ejecutivos']
        : ['Catalog and products', 'Sales and inventory', 'Commercial content', 'Administration', 'Executive reporting'],
    },
    'luna-football': {
      id: `${siteUrl.origin}/#luna-football`,
      name: 'LUNA Football',
      externalUrl: 'https://cdebarinasef.com/',
      category: 'SportsApplication',
      description: isEs
        ? 'Caso productivo de gestión deportiva para jugadores, equipos, pagos, inventario, personal y entrenamientos modulares.'
        : 'Production sports-management case study for players, teams, payments, inventory, staff, and modular training.',
      features: isEs
        ? ['Jugadores y equipos', 'Inscripciones y mensualidades', 'Inventario deportivo', 'Personal y carnetización', 'Entrenamientos modulares asistidos']
        : ['Players and teams', 'Enrollment and tuition', 'Sports inventory', 'Staff and ID cards', 'Assisted modular training'],
    },
  } as const;
  const item = cases[slug];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': item.id,
        name: item.name,
        url: casePageUrl,
        sameAs: item.externalUrl,
        applicationCategory: item.category,
        operatingSystem: 'Web, PWA',
        inLanguage: isEs ? 'es-VE' : 'en-US',
        description: item.description,
        provider: { '@id': organizationId },
        featureList: item.features,
      },
      {
        '@type': 'WebPage',
        '@id': `${casePageUrl}#webpage`,
        url: casePageUrl,
        name: isEs ? `${item.name} | Caso productivo` : `${item.name} | Production case study`,
        description: item.description,
        inLanguage: isEs ? 'es-VE' : 'en-US',
        about: { '@id': item.id },
        isPartOf: { '@id': new URL('/#website', siteUrl).toString() },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${casePageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: isEs ? 'Inicio' : 'Home',
            item: localizedUrl(locale, ''),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: isEs ? 'Casos productivos' : 'Production case studies',
            item: projectsUrl,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: item.name,
            item: casePageUrl,
          },
        ],
      },
    ],
  };
}
