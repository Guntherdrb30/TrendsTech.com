import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { del, put } from "@vercel/blob";
import { z } from "zod";
import { AuthError, requireRole } from "@/lib/auth/guards";
import { getPageImageAdminPages, getPageImageManifest, type PageImageManifestAsset } from "@/lib/page-images";
import { getPageImagePageDefinition, type PageImagePageId } from "@/lib/page-image-registry";

const MANIFEST_PATH = "page-images/manifest.json";

const saveSchema = z.object({
  locale: z.string().trim().min(2).max(10),
  pageId: z.custom<PageImagePageId>((value) => typeof value === "string"),
  slotId: z.string().trim().min(1).max(80),
  imageUrl: z.string().trim().url(),
  blobUrl: z.string().trim().url().nullable().optional(),
  alt: z.string().trim().min(2).max(240)
});

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
}

function buildManifest(assets: PageImageManifestAsset[]) {
  return {
    version: 1 as const,
    updatedAt: new Date().toISOString(),
    assets
  };
}

async function writeManifest(assets: PageImageManifestAsset[]) {
  const manifest = buildManifest(assets);
  await put(MANIFEST_PATH, JSON.stringify(manifest, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json"
  });
  return manifest;
}

function revalidatePageImagePaths(pageId: PageImagePageId) {
  const page = getPageImagePageDefinition(pageId);
  const localizedPath = page?.publicPath ?? "/";

  revalidatePath("/es/root");
  revalidatePath("/en/root");
  revalidatePath("/es/root/site-media");
  revalidatePath("/en/root/site-media");
  revalidatePath(`/es${localizedPath}`);
  revalidatePath(`/en${localizedPath}`);
}

export async function GET(request: Request) {
  try {
    await requireRole("ROOT");
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") ?? "es";
    const pages = await getPageImageAdminPages(locale);
    return NextResponse.json({ data: pages });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole("ROOT");
    const body = await request.json();
    const parsed = saveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const page = getPageImagePageDefinition(parsed.data.pageId);
    const slot = page?.slots.find((item) => item.id === parsed.data.slotId);

    if (!page || !slot) {
      return NextResponse.json({ error: "Invalid page or slot." }, { status: 400 });
    }

    const manifest = await getPageImageManifest();
    const nextAssets = manifest.assets.filter(
      (asset) => !(asset.pageId === parsed.data.pageId && asset.slotId === parsed.data.slotId)
    );
    const previous = manifest.assets.find(
      (asset) => asset.pageId === parsed.data.pageId && asset.slotId === parsed.data.slotId
    );

    nextAssets.push({
      pageId: parsed.data.pageId,
      slotId: parsed.data.slotId,
      imageUrl: parsed.data.imageUrl,
      blobUrl: parsed.data.blobUrl ?? null,
      alt: parsed.data.alt,
      updatedAt: new Date().toISOString()
    });

    await writeManifest(nextAssets);

    if (
      previous?.blobUrl &&
      parsed.data.blobUrl &&
      previous.blobUrl !== parsed.data.blobUrl
    ) {
      try {
        await del(previous.blobUrl);
      } catch {
        // Ignore cleanup failures to avoid blocking a save.
      }
    }

    revalidatePageImagePaths(parsed.data.pageId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireRole("ROOT");
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId") as PageImagePageId | null;
    const slotId = searchParams.get("slotId");

    if (!pageId || !slotId) {
      return NextResponse.json({ error: "Missing pageId or slotId." }, { status: 400 });
    }

    const manifest = await getPageImageManifest();
    const existing = manifest.assets.find((asset) => asset.pageId === pageId && asset.slotId === slotId);

    if (!existing) {
      return NextResponse.json({ ok: true });
    }

    const nextAssets = manifest.assets.filter(
      (asset) => !(asset.pageId === pageId && asset.slotId === slotId)
    );

    await writeManifest(nextAssets);

    if (existing.blobUrl) {
      try {
        await del(existing.blobUrl);
      } catch {
        // Ignore cleanup failures to avoid blocking a reset.
      }
    }

    revalidatePageImagePaths(pageId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
