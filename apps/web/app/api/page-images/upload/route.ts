import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { z } from "zod";
import { AuthError, requireRole } from "@/lib/auth/guards";
import { getPageImagePageDefinition, type PageImagePageId } from "@/lib/page-image-registry";

const uploadSchema = z.object({
  pageId: z.custom<PageImagePageId>((value) => typeof value === "string"),
  slotId: z.string().trim().min(1).max(80)
});

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function POST(request: Request) {
  try {
    await requireRole("ROOT");

    const formData = await request.formData();
    const file = formData.get("file");
    const parsed = uploadSchema.safeParse({
      pageId: formData.get("pageId"),
      slotId: formData.get("slotId")
    });

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

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Selecciona una imagen valida." }, { status: 400 });
    }

    const extension = file.name.includes(".") ? file.name.split(".").pop() ?? "png" : "png";
    const safeName = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
    const blobPath = [
      "page-images",
      slugify(parsed.data.pageId),
      slugify(parsed.data.slotId),
      `${Date.now()}-${safeName}.${extension.toLowerCase()}`
    ].join("/");

    const blob = await put(blobPath, file, {
      access: "public",
      addRandomSuffix: false
    });

    return NextResponse.json({
      data: {
        url: blob.url,
        pathname: blob.pathname
      }
    });
  } catch (error) {
    return handleError(error);
  }
}
