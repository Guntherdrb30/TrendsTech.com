import { list } from '@vercel/blob';

const MANIFEST_PATH = 'news-studio/manifest.json';

export type NewsMediaAsset = {
  slug: string;
  coverImageUrl: string | null;
  coverBlobUrl: string | null;
  coverAlt: string | null;
  gallery: Array<{ imageUrl: string; blobUrl: string | null; alt: string | null }>;
  instagramImageUrl: string | null;
  instagramBlobUrl: string | null;
  instagramCaption: string | null;
  updatedAt: string;
};

type NewsMediaManifest = {
  version: 1;
  updatedAt: string;
  assets: NewsMediaAsset[];
};

function emptyManifest(): NewsMediaManifest {
  return { version: 1, updatedAt: new Date(0).toISOString(), assets: [] };
}

export async function getNewsMediaManifest(): Promise<NewsMediaManifest> {
  try {
    const response = await list({ prefix: MANIFEST_PATH, limit: 10 });
    const blob = response.blobs.find((item) => item.pathname === MANIFEST_PATH) ?? response.blobs[0];
    if (!blob) return emptyManifest();
    const fetched = await fetch(blob.url, { cache: 'no-store' });
    if (!fetched.ok) return emptyManifest();
    const payload = (await fetched.json()) as Partial<NewsMediaManifest>;
    if (!payload || !Array.isArray(payload.assets)) return emptyManifest();
    return {
      version: 1,
      updatedAt: typeof payload.updatedAt === 'string' ? payload.updatedAt : new Date().toISOString(),
      assets: payload.assets.filter((asset): asset is NewsMediaAsset => Boolean(asset && typeof asset.slug === 'string'))
    };
  } catch {
    return emptyManifest();
  }
}

export async function getNewsMediaBySlug(slug: string) {
  const manifest = await getNewsMediaManifest();
  return manifest.assets.find((asset) => asset.slug === slug) ?? null;
}
