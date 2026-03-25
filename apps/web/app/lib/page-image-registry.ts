export type PageImagePageId = "home" | "systems-luna";

export type PageImageSlotDefinition = {
  id: string;
  labelEs: string;
  labelEn: string;
  descriptionEs: string;
  descriptionEn: string;
  defaultImageUrl: string;
  defaultAltEs: string;
  defaultAltEn: string;
  recommended: string;
};

export type PageImagePageDefinition = {
  id: PageImagePageId;
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
  publicPath: string;
  slots: PageImageSlotDefinition[];
};

export const PAGE_IMAGE_REGISTRY: PageImagePageDefinition[] = [
  {
    id: "home",
    titleEs: "Home publica",
    titleEn: "Public home",
    descriptionEs: "Hero principal y bloques comerciales de la pagina inicial.",
    descriptionEn: "Main hero and commercial blocks for the landing page.",
    publicPath: "/",
    slots: [
      {
        id: "hero_01",
        labelEs: "Hero 01",
        labelEn: "Hero 01",
        descriptionEs: "Primer slide del hero principal.",
        descriptionEn: "First slide of the main hero.",
        defaultImageUrl: "/marketing/luna/luna-hero-dark.png",
        defaultAltEs: "Hero principal oscuro de LUNA",
        defaultAltEn: "Dark LUNA main hero",
        recommended: "16:10 o 16:9"
      },
      {
        id: "hero_02",
        labelEs: "Hero 02",
        labelEn: "Hero 02",
        descriptionEs: "Segundo slide del hero principal.",
        descriptionEn: "Second slide of the main hero.",
        defaultImageUrl: "/marketing/luna/luna-hero-light.png",
        defaultAltEs: "Hero principal claro de LUNA",
        defaultAltEn: "Light LUNA main hero",
        recommended: "16:10 o 16:9"
      },
      {
        id: "hero_03",
        labelEs: "Hero 03",
        labelEn: "Hero 03",
        descriptionEs: "Tercer slide del hero principal.",
        descriptionEn: "Third slide of the main hero.",
        defaultImageUrl: "/marketing/home/luna-operations-core.svg",
        defaultAltEs: "Core operativo de LUNA",
        defaultAltEn: "LUNA operations core",
        recommended: "16:10 o 16:9"
      },
      {
        id: "hero_04",
        labelEs: "Hero 04",
        labelEn: "Hero 04",
        descriptionEs: "Cuarto slide del hero principal.",
        descriptionEn: "Fourth slide of the main hero.",
        defaultImageUrl: "/marketing/home/luna-role-panels.svg",
        defaultAltEs: "Paneles por rol de LUNA",
        defaultAltEn: "LUNA role panels",
        recommended: "16:10 o 16:9"
      },
      {
        id: "hero_05",
        labelEs: "Hero 05",
        labelEn: "Hero 05",
        descriptionEs: "Quinto slide del hero principal.",
        descriptionEn: "Fifth slide of the main hero.",
        defaultImageUrl: "/marketing/home/luna-executive-intelligence.svg",
        defaultAltEs: "Inteligencia ejecutiva de LUNA",
        defaultAltEn: "LUNA executive intelligence",
        recommended: "16:10 o 16:9"
      },
      {
        id: "showcase_01",
        labelEs: "Showcase 01",
        labelEn: "Showcase 01",
        descriptionEs: "Primer bloque comercial de la home.",
        descriptionEn: "First commercial block on the home page.",
        defaultImageUrl: "/marketing/home/agent-sales-velocity.svg",
        defaultAltEs: "Bloque comercial de agentes",
        defaultAltEn: "Agent commercial block",
        recommended: "4:3 o 16:10"
      },
      {
        id: "showcase_02",
        labelEs: "Showcase 02",
        labelEn: "Showcase 02",
        descriptionEs: "Segundo bloque comercial de la home.",
        descriptionEn: "Second commercial block on the home page.",
        defaultImageUrl: "/marketing/home/case-carpihogar-pwa.svg",
        defaultAltEs: "Caso comercial Carpihogar",
        defaultAltEn: "Carpihogar commercial case",
        recommended: "4:3 o 16:10"
      },
      {
        id: "showcase_03",
        labelEs: "Showcase 03",
        labelEn: "Showcase 03",
        descriptionEs: "Tercer bloque comercial de la home.",
        descriptionEn: "Third commercial block on the home page.",
        defaultImageUrl: "/marketing/home/case-executive-reporting.svg",
        defaultAltEs: "Bloque ejecutivo de la home",
        defaultAltEn: "Home executive block",
        recommended: "4:3 o 16:10"
      }
    ]
  },
  {
    id: "systems-luna",
    titleEs: "Sistema LUNA",
    titleEn: "LUNA system",
    descriptionEs: "Cabecera y galeria visual de la pagina de sistema LUNA.",
    descriptionEn: "Header and visual gallery for the LUNA system page.",
    publicPath: "/systems/luna",
    slots: [
      {
        id: "hero_primary",
        labelEs: "Hero principal",
        labelEn: "Primary hero",
        descriptionEs: "Visual principal de la cabecera de LUNA.",
        descriptionEn: "Main visual in the LUNA header.",
        defaultImageUrl: "/marketing/luna/luna-hero-light.png",
        defaultAltEs: "Vista premium de LUNA en desktop y mobile",
        defaultAltEn: "Premium LUNA preview across desktop and mobile",
        recommended: "16:10 o 16:9"
      },
      {
        id: "gallery_01",
        labelEs: "Galeria 01",
        labelEn: "Gallery 01",
        descriptionEs: "Primera imagen de la galeria de LUNA.",
        descriptionEn: "First image in the LUNA gallery.",
        defaultImageUrl: "/marketing/luna/luna-hero-dark.png",
        defaultAltEs: "Vista comercial principal de LUNA",
        defaultAltEn: "Primary LUNA commercial view",
        recommended: "4:3"
      },
      {
        id: "gallery_02",
        labelEs: "Galeria 02",
        labelEn: "Gallery 02",
        descriptionEs: "Segunda imagen de la galeria de LUNA.",
        descriptionEn: "Second image in the LUNA gallery.",
        defaultImageUrl: "/marketing/luna/luna-hero-light.png",
        defaultAltEs: "Vista premium del sistema LUNA",
        defaultAltEn: "Premium LUNA system view",
        recommended: "4:3"
      },
      {
        id: "gallery_03",
        labelEs: "Galeria 03",
        labelEn: "Gallery 03",
        descriptionEs: "Tercera imagen de la galeria de LUNA.",
        descriptionEn: "Third image in the LUNA gallery.",
        defaultImageUrl: "/cases/carpihogar/carpihogar-pwa-home.svg",
        defaultAltEs: "Galeria LUNA 03",
        defaultAltEn: "LUNA gallery 03",
        recommended: "4:3"
      },
      {
        id: "gallery_04",
        labelEs: "Galeria 04",
        labelEn: "Gallery 04",
        descriptionEs: "Cuarta imagen de la galeria de LUNA.",
        descriptionEn: "Fourth image in the LUNA gallery.",
        defaultImageUrl: "/cases/carpihogar/carpihogar-catalog-grid.svg",
        defaultAltEs: "Galeria LUNA 04",
        defaultAltEn: "LUNA gallery 04",
        recommended: "4:3"
      },
      {
        id: "gallery_05",
        labelEs: "Galeria 05",
        labelEn: "Gallery 05",
        descriptionEs: "Quinta imagen de la galeria de LUNA.",
        descriptionEn: "Fifth image in the LUNA gallery.",
        defaultImageUrl: "/cases/carpihogar/carpihogar-product-detail.svg",
        defaultAltEs: "Galeria LUNA 05",
        defaultAltEn: "LUNA gallery 05",
        recommended: "4:3"
      },
      {
        id: "gallery_06",
        labelEs: "Galeria 06",
        labelEn: "Gallery 06",
        descriptionEs: "Sexta imagen de la galeria de LUNA.",
        descriptionEn: "Sixth image in the LUNA gallery.",
        defaultImageUrl: "/cases/carpihogar/carpihogar-news.svg",
        defaultAltEs: "Galeria LUNA 06",
        defaultAltEn: "LUNA gallery 06",
        recommended: "4:3"
      },
      {
        id: "gallery_07",
        labelEs: "Galeria 07",
        labelEn: "Gallery 07",
        descriptionEs: "Septima imagen de la galeria de LUNA.",
        descriptionEn: "Seventh image in the LUNA gallery.",
        defaultImageUrl: "/cases/carpihogar/carpihogar-admin-dashboard.svg",
        defaultAltEs: "Galeria LUNA 07",
        defaultAltEn: "LUNA gallery 07",
        recommended: "4:3"
      },
      {
        id: "gallery_08",
        labelEs: "Galeria 08",
        labelEn: "Gallery 08",
        descriptionEs: "Octava imagen de la galeria de LUNA.",
        descriptionEn: "Eighth image in the LUNA gallery.",
        defaultImageUrl: "/cases/carpihogar/carpihogar-sales-form.svg",
        defaultAltEs: "Galeria LUNA 08",
        defaultAltEn: "LUNA gallery 08",
        recommended: "4:3"
      },
      {
        id: "gallery_09",
        labelEs: "Galeria 09",
        labelEn: "Gallery 09",
        descriptionEs: "Novena imagen de la galeria de LUNA.",
        descriptionEn: "Ninth image in the LUNA gallery.",
        defaultImageUrl: "/cases/carpihogar/carpihogar-ai-modules.svg",
        defaultAltEs: "Galeria LUNA 09",
        defaultAltEn: "LUNA gallery 09",
        recommended: "4:3"
      },
      {
        id: "gallery_10",
        labelEs: "Galeria 10",
        labelEn: "Gallery 10",
        descriptionEs: "Decima imagen de la galeria de LUNA.",
        descriptionEn: "Tenth image in the LUNA gallery.",
        defaultImageUrl: "/cases/carpihogar/carpihogar-exec-reports.svg",
        defaultAltEs: "Galeria LUNA 10",
        defaultAltEn: "LUNA gallery 10",
        recommended: "4:3"
      }
    ]
  }
];

export function getPageImagePageDefinition(pageId: PageImagePageId) {
  return PAGE_IMAGE_REGISTRY.find((page) => page.id === pageId) ?? null;
}

