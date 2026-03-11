import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { Language, SiteAssetSection, prisma } from "@trends172tech/db";
import { z } from "zod";
import { AuthError, requireRole } from "@/lib/auth/guards";
import { getEditableSiteAssets } from "@/lib/site-assets";

const optionalTrimmedString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().nullable().optional()
);

const siteAssetSchema = z.object({
  id: z.string().trim().min(1).optional(),
  section: z.nativeEnum(SiteAssetSection),
  language: z.nativeEnum(Language),
  eyebrow: optionalTrimmedString,
  badge: optionalTrimmedString,
  title: z.string().trim().min(3).max(180),
  body: z.string().trim().min(8).max(5000),
  imageUrl: z.string().trim().url(),
  blobUrl: optionalTrimmedString,
  ctaLabel: optionalTrimmedString,
  ctaHref: optionalTrimmedString,
  highlights: z.array(z.string().trim().min(1).max(180)).max(8).default([]),
  sortOrder: z.number().int().min(0).max(1000),
  isActive: z.boolean()
});

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
}

function revalidateSitePaths() {
  revalidatePath("/es");
  revalidatePath("/en");
  revalidatePath("/es/dashboard/site-media");
  revalidatePath("/en/dashboard/site-media");
  revalidatePath("/es/root");
  revalidatePath("/en/root");
}

export async function GET() {
  try {
    await requireRole("TENANT_ADMIN");
    const assets = await getEditableSiteAssets();
    return NextResponse.json({ data: assets });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole("TENANT_ADMIN");
    const body = await request.json();
    const parsed = siteAssetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = {
      section: parsed.data.section,
      language: parsed.data.language,
      eyebrow: parsed.data.eyebrow ?? null,
      badge: parsed.data.badge ?? null,
      title: parsed.data.title,
      body: parsed.data.body,
      imageUrl: parsed.data.imageUrl,
      blobUrl: parsed.data.blobUrl ?? null,
      ctaLabel: parsed.data.ctaLabel ?? null,
      ctaHref: parsed.data.ctaHref ?? null,
      highlightsJson: parsed.data.highlights,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
      updatedByUserId: user.id
    };

    const asset = parsed.data.id
      ? await prisma.siteAsset.update({
          where: { id: parsed.data.id },
          data
        })
      : await prisma.siteAsset.create({
          data
        });

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: parsed.data.id ? "SITE_ASSET_UPDATED" : "SITE_ASSET_CREATED",
        entity: "SiteAsset",
        entityId: asset.id,
        metaJson: {
          section: asset.section,
          language: asset.language,
          title: asset.title,
          sortOrder: asset.sortOrder,
          isActive: asset.isActive
        }
      }
    });

    revalidateSitePaths();

    return NextResponse.json({ data: asset });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireRole("TENANT_ADMIN");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing asset id" }, { status: 400 });
    }

    const asset = await prisma.siteAsset.findUnique({
      where: { id }
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    await prisma.siteAsset.delete({ where: { id } });

    if (asset.blobUrl) {
      try {
        await del(asset.blobUrl);
      } catch {
        // Ignore blob deletion failures to avoid blocking content cleanup.
      }
    }

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "SITE_ASSET_DELETED",
        entity: "SiteAsset",
        entityId: asset.id,
        metaJson: {
          section: asset.section,
          language: asset.language,
          title: asset.title
        }
      }
    });

    revalidateSitePaths();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
