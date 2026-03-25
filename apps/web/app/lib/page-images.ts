import { list } from "@vercel/blob";
import { getPageImagePageDefinition, PAGE_IMAGE_REGISTRY, type PageImagePageId } from "./page-image-registry";

const MANIFEST_PATH = "page-images/manifest.json";

export type PageImageManifestAsset = {
  pageId: PageImagePageId;
  slotId: string;
  imageUrl: string;
  blobUrl: string | null;
  alt: string | null;
  updatedAt: string;
};

type PageImageManifest = {
  version: 1;
  updatedAt: string;
  assets: PageImageManifestAsset[];
};

export type PageImageResolvedSlot = {
  slotId: string;
  imageUrl: string;
  blobUrl: string | null;
  alt: string;
};

export type PageImageAdminSlot = {
  slotId: string;
  label: string;
  description: string;
  recommended: string;
  defaultImageUrl: string;
  defaultAlt: string;
  currentImageUrl: string;
  currentBlobUrl: string | null;
  currentAlt: string;
  hasOverride: boolean;
  updatedAt: string | null;
};

export type PageImageAdminPage = {
  pageId: PageImagePageId;
  title: string;
  description: string;
  publicPath: string;
  slots: PageImageAdminSlot[];
};

function getManifestDefault(): PageImageManifest {
  return {
    version: 1,
    updatedAt: new Date(0).toISOString(),
    assets: []
  };
}

async function readManifest(): Promise<PageImageManifest> {
  try {
    const response = await list({
      prefix: MANIFEST_PATH,
      limit: 10
    });
    const manifestBlob = response.blobs.find((blob) => blob.pathname === MANIFEST_PATH) ?? response.blobs[0];

    if (!manifestBlob) {
      return getManifestDefault();
    }

    const manifestResponse = await fetch(manifestBlob.url, { cache: "no-store" });
    if (!manifestResponse.ok) {
      return getManifestDefault();
    }

    const payload = (await manifestResponse.json()) as Partial<PageImageManifest>;
    if (!payload || !Array.isArray(payload.assets)) {
      return getManifestDefault();
    }

    return {
      version: 1,
      updatedAt: typeof payload.updatedAt === "string" ? payload.updatedAt : new Date().toISOString(),
      assets: payload.assets.filter(
        (asset): asset is PageImageManifestAsset =>
          Boolean(
            asset &&
              typeof asset.pageId === "string" &&
              typeof asset.slotId === "string" &&
              typeof asset.imageUrl === "string"
          )
      )
    };
  } catch {
    return getManifestDefault();
  }
}

export async function getPageImageManifest() {
  return readManifest();
}

export async function getResolvedPageImageSlots(pageId: PageImagePageId, locale: string) {
  const page = getPageImagePageDefinition(pageId);
  if (!page) {
    return {} as Record<string, PageImageResolvedSlot>;
  }

  const isEs = locale.startsWith("es");
  const manifest = await getPageImageManifest();
  const assetMap = new Map(
    manifest.assets
      .filter((asset) => asset.pageId === pageId)
      .map((asset) => [`${asset.pageId}:${asset.slotId}`, asset] as const)
  );

  return Object.fromEntries(
    page.slots.map((slot) => {
      const current = assetMap.get(`${pageId}:${slot.id}`);
      return [
        slot.id,
        {
          slotId: slot.id,
          imageUrl: current?.imageUrl ?? slot.defaultImageUrl,
          blobUrl: current?.blobUrl ?? null,
          alt: current?.alt ?? (isEs ? slot.defaultAltEs : slot.defaultAltEn)
        }
      ];
    })
  ) as Record<string, PageImageResolvedSlot>;
}

export async function getPageImageAdminPages(locale: string): Promise<PageImageAdminPage[]> {
  const isEs = locale.startsWith("es");
  const manifest = await getPageImageManifest();
  const assetMap = new Map(
    manifest.assets.map((asset) => [`${asset.pageId}:${asset.slotId}`, asset] as const)
  );

  return PAGE_IMAGE_REGISTRY.map((page) => ({
    pageId: page.id,
    title: isEs ? page.titleEs : page.titleEn,
    description: isEs ? page.descriptionEs : page.descriptionEn,
    publicPath: page.publicPath,
    slots: page.slots.map((slot) => {
      const current = assetMap.get(`${page.id}:${slot.id}`);
      return {
        slotId: slot.id,
        label: isEs ? slot.labelEs : slot.labelEn,
        description: isEs ? slot.descriptionEs : slot.descriptionEn,
        recommended: slot.recommended,
        defaultImageUrl: slot.defaultImageUrl,
        defaultAlt: isEs ? slot.defaultAltEs : slot.defaultAltEn,
        currentImageUrl: current?.imageUrl ?? slot.defaultImageUrl,
        currentBlobUrl: current?.blobUrl ?? null,
        currentAlt: current?.alt ?? (isEs ? slot.defaultAltEs : slot.defaultAltEn),
        hasOverride: Boolean(current),
        updatedAt: current?.updatedAt ?? null
      };
    })
  }));
}
