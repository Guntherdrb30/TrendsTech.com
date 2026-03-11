import { Language, SiteAssetSection, prisma, type Prisma } from "@trends172tech/db";

export type SiteAssetRecord = {
  id: string;
  section: SiteAssetSection;
  language: Language;
  eyebrow: string | null;
  badge: string | null;
  title: string;
  body: string;
  imageUrl: string;
  blobUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  highlights: string[];
  sortOrder: number;
  isActive: boolean;
  updatedByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function normalizeLanguage(locale: string) {
  return locale.toLowerCase().startsWith("en") ? Language.EN : Language.ES;
}

function parseHighlights(value: Prisma.JsonValue | null) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function mapAsset(asset: {
  id: string;
  section: SiteAssetSection;
  language: Language;
  eyebrow: string | null;
  badge: string | null;
  title: string;
  body: string;
  imageUrl: string;
  blobUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  highlightsJson: Prisma.JsonValue | null;
  sortOrder: number;
  isActive: boolean;
  updatedByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): SiteAssetRecord {
  return {
    id: asset.id,
    section: asset.section,
    language: asset.language,
    eyebrow: asset.eyebrow,
    badge: asset.badge,
    title: asset.title,
    body: asset.body,
    imageUrl: asset.imageUrl,
    blobUrl: asset.blobUrl,
    ctaLabel: asset.ctaLabel,
    ctaHref: asset.ctaHref,
    highlights: parseHighlights(asset.highlightsJson),
    sortOrder: asset.sortOrder,
    isActive: asset.isActive,
    updatedByUserId: asset.updatedByUserId,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt
  };
}

export async function getEditableSiteAssets() {
  try {
    const assets = await prisma.siteAsset.findMany({
      orderBy: [{ section: "asc" }, { language: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }]
    });

    return assets.map(mapAsset);
  } catch (error) {
    console.error("Failed to load editable site assets", error);
    return [];
  }
}

export async function getPublicSiteAssets(section: SiteAssetSection, locale: string) {
  const language = normalizeLanguage(locale);
  try {
    const assets = await prisma.siteAsset.findMany({
      where: {
        section,
        language,
        isActive: true
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
    });

    return assets.map(mapAsset);
  } catch (error) {
    console.error("Failed to load public site assets", error);
    return [];
  }
}
