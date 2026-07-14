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
    url: 'https://carpihogar.com/',
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
    url: 'https://cdebarinasef.com/',
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
