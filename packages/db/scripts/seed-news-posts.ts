import { Language, NewsPostStatus, PrismaClient } from "@prisma/client";

if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const prisma = new PrismaClient();

const now = new Date();

const posts = [
  {
    slug: "luna-sistema-empresarial-lanzamiento-es",
    title: "LUNA ya forma parte de la vitrina oficial de Trends172 Tech",
    summary:
      "LUNA entra como sistema empresarial principal dentro del portafolio de Trends172 Tech, con enfoque en ventas, inventario, cobros, despachos, reportes, paneles por rol y experiencia PWA instalable.",
    body:
      "LUNA ya se presenta oficialmente como una de las lineas principales de negocio de Trends172 Tech. La propuesta se enfoca en empresas que necesitan mucho mas que una pagina informativa o una tienda basica.\n\nEl sistema integra ventas, inventario, clientes, cobros, despachos, reportes y paneles por rol dentro de una sola plataforma. Esto permite ordenar la operacion, reducir errores y mejorar la visibilidad del negocio.\n\nAdemas, una de sus funciones mas destacadas es la experiencia PWA instalable, que permite usar el sistema con sensacion de app, reforzando la adopcion del equipo y la continuidad operativa.",
    category: "Lanzamiento",
    language: Language.ES,
    status: NewsPostStatus.PUBLISHED,
    featured: true
  },
  {
    slug: "carpihogar-caso-real-pwa-es",
    title: "Carpihogar valida el sistema completo con operacion real y PWA",
    summary:
      "El caso Carpihogar se posiciona como respaldo real de LUNA, demostrando uso completo del sistema en ecommerce, backoffice, control operativo e instalacion tipo app mediante PWA.",
    body:
      "Carpihogar no se muestra solo como un proyecto bonito, sino como una implementacion real que sirvio para validar decisiones funcionales y comerciales del sistema.\n\nEn este caso se utilizo la operacion completa: ecommerce, gestion administrativa, control comercial, inventario, despachos y paneles por rol. Esto convierte a Carpihogar en una prueba concreta de que la plataforma responde a necesidades reales del dia a dia empresarial.\n\nTambien destaca el uso de la experiencia PWA instalable, una capacidad importante a la hora de vender el sistema a empresas que quieren una sensacion de app sin salir del ecosistema web.",
    category: "Caso real",
    language: Language.ES,
    status: NewsPostStatus.PUBLISHED,
    featured: true
  },
  {
    slug: "nueva-area-novedades-trends172-es",
    title: "Trends172 Tech activa una nueva area de novedades para su portafolio",
    summary:
      "La web ahora cuenta con una seccion administrable para comunicar mejoras, lanzamientos, casos reales y evolucion tecnologica de agentes IA y sistemas empresariales.",
    body:
      "Ya esta activa la nueva area de Novedades dentro del sitio corporativo de Trends172 Tech. Esta seccion fue creada para comunicar lanzamientos, mejoras de producto, casos reales y avances relevantes de la empresa.\n\nLa novedad no es solo visual. Ahora existe una estructura administrable desde el panel root para crear, editar, publicar y destacar noticias de forma controlada.\n\nCon esto, la marca gana una vitrina mas solida para sostener percepcion de evolucion continua y reforzar la venta de agentes IA, sistemas empresariales y casos de uso reales.",
    category: "Producto",
    language: Language.ES,
    status: NewsPostStatus.PUBLISHED,
    featured: false
  },
  {
    slug: "luna-business-system-launch-en",
    title: "LUNA is now part of the official Trends172 Tech showcase",
    summary:
      "LUNA enters the portfolio as the main business system offer, focused on sales, inventory, collections, dispatches, reporting, role-based workspaces, and an installable PWA experience.",
    body:
      "LUNA is now officially presented as one of the main business lines inside Trends172 Tech. The offer is aimed at companies that need much more than an informational site or a basic storefront.\n\nThe system brings together sales, inventory, customers, collections, dispatches, reporting, and role-based panels inside one platform. That gives the business more structure, fewer errors, and stronger visibility.\n\nOne of its most important highlights is the installable PWA experience, which gives teams an app-like workflow while staying inside the web ecosystem.",
    category: "Launch",
    language: Language.EN,
    status: NewsPostStatus.PUBLISHED,
    featured: true
  },
  {
    slug: "carpihogar-real-case-pwa-en",
    title: "Carpihogar validates the full system in a real operation with PWA",
    summary:
      "The Carpihogar case now supports the LUNA narrative as a real implementation covering ecommerce, backoffice, operational control, and installable PWA usage.",
    body:
      "Carpihogar is not positioned as a decorative portfolio piece. It is a real implementation that helped validate functional and commercial decisions behind the system.\n\nThe case covered the full operation: ecommerce, administration, commercial control, inventory, dispatch workflows, and role-based workspaces. That makes it concrete proof that the platform answers real day-to-day business needs.\n\nIt also highlights the installable PWA experience, which is especially valuable when selling the system to companies that want an app-like experience without leaving the web stack.",
    category: "Case Study",
    language: Language.EN,
    status: NewsPostStatus.PUBLISHED,
    featured: true
  },
  {
    slug: "newsroom-launched-trends172-en",
    title: "Trends172 Tech launches a new newsroom for products and updates",
    summary:
      "The site now includes an administrable newsroom to communicate launches, product improvements, real case studies, and the ongoing evolution of AI agents and business systems.",
    body:
      "The new News section is now active inside the Trends172 Tech corporate website. It was created to communicate launches, product improvements, real case studies, and relevant company progress.\n\nThis is not only a visual section. There is now a root-managed workflow to create, edit, publish, and feature updates in a controlled way.\n\nThat gives the brand a stronger showcase to sustain the perception of continuous evolution and support the sale of AI agents, business systems, and real implementation stories.",
    category: "Product",
    language: Language.EN,
    status: NewsPostStatus.PUBLISHED,
    featured: false
  }
];

async function main() {
  for (const post of posts) {
    await prisma.newsPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        summary: post.summary,
        body: post.body,
        category: post.category,
        language: post.language,
        status: post.status,
        featured: post.featured,
        publishedAt: now
      },
      create: {
        ...post,
        publishedAt: now
      }
    });
  }

  const counts = await prisma.newsPost.groupBy({
    by: ["language"],
    _count: { _all: true }
  });

  console.log(JSON.stringify(counts, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
