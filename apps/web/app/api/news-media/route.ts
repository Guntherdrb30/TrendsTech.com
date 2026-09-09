import { NextResponse } from 'next/server';
import { del, put } from '@vercel/blob';
import { z } from 'zod';
import { AuthError, requireRole } from '@/lib/auth/guards';
import { getNewsMediaManifest, type NewsMediaAsset } from '@/lib/news-media';

const MANIFEST_PATH = 'news-studio/manifest.json';

const assetSchema = z.object({
  slug: z.string().trim().min(3).max(160).regex(/^[a-z0-9-]+$/),
  coverImageUrl: z.string().url().nullable().optional(),
  coverBlobUrl: z.string().url().nullable().optional(),
  coverAlt: z.string().trim().max(240).nullable().optional(),
  gallery: z.array(z.object({
    imageUrl: z.string().url(),
    blobUrl: z.string().url().nullable().optional(),
    alt: z.string().trim().max(240).nullable().optional()
  })).max(12).default([]),
  instagramImageUrl: z.string().url().nullable().optional(),
  instagramBlobUrl: z.string().url().nullable().optional(),
  instagramCaption: z.string().trim().max(2200).nullable().optional()
});

function handleError(error: unknown) {
  if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
  console.error('[news-media] unexpected error', error);
  return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
}

async function writeManifest(assets: NewsMediaAsset[]) {
  const manifest = { version: 1 as const, updatedAt: new Date().toISOString(), assets };
  await put(MANIFEST_PATH, JSON.stringify(manifest, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json'
  });
  return manifest;
}

export async function GET() {
  try {
    await requireRole('ROOT');
    return NextResponse.json({ data: await getNewsMediaManifest() });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole('ROOT');
    const parsed = assetSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });

    const current = await getNewsMediaManifest();
    const previous = current.assets.find((asset) => asset.slug === parsed.data.slug);
    const next: NewsMediaAsset = {
      slug: parsed.data.slug,
      coverImageUrl: parsed.data.coverImageUrl ?? null,
      coverBlobUrl: parsed.data.coverBlobUrl ?? null,
      coverAlt: parsed.data.coverAlt ?? null,
      gallery: parsed.data.gallery.map((item) => ({ imageUrl: item.imageUrl, blobUrl: item.blobUrl ?? null, alt: item.alt ?? null })),
      instagramImageUrl: parsed.data.instagramImageUrl ?? null,
      instagramBlobUrl: parsed.data.instagramBlobUrl ?? null,
      instagramCaption: parsed.data.instagramCaption ?? null,
      updatedAt: new Date().toISOString()
    };

    const assets = [...current.assets.filter((asset) => asset.slug !== next.slug), next];
    await writeManifest(assets);

    const stale = [previous?.coverBlobUrl, previous?.instagramBlobUrl]
      .filter((value): value is string => Boolean(value))
      .filter((value) => value !== next.coverBlobUrl && value !== next.instagramBlobUrl);
    for (const url of stale) {
      try { await del(url); } catch { /* cleanup must not block save */ }
    }

    return NextResponse.json({ ok: true, data: next });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireRole('ROOT');
    const slug = new URL(request.url).searchParams.get('slug');
    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    const current = await getNewsMediaManifest();
    const previous = current.assets.find((asset) => asset.slug === slug);
    await writeManifest(current.assets.filter((asset) => asset.slug !== slug));
    const urls = [previous?.coverBlobUrl, previous?.instagramBlobUrl, ...(previous?.gallery.map((item) => item.blobUrl).filter(Boolean) ?? [])]
      .filter((value): value is string => Boolean(value));
    for (const url of urls) {
      try { await del(url); } catch { /* ignore cleanup failures */ }
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
