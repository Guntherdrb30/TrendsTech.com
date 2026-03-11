import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { z } from "zod";
import { AuthError, requireRole } from "@/lib/auth/guards";

const uploadSchema = z.object({
  section: z.string().trim().min(1).max(60),
  language: z.string().trim().min(2).max(10)
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
    await requireRole("TENANT_ADMIN");

    const formData = await request.formData();
    const file = formData.get("file");
    const parsed = uploadSchema.safeParse({
      section: formData.get("section"),
      language: formData.get("language")
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Selecciona una imagen valida." }, { status: 400 });
    }

    const extension = file.name.includes(".") ? file.name.split(".").pop() ?? "png" : "png";
    const safeName = slugify(file.name.replace(/\.[^.]+$/, "")) || "asset";
    const blobPath = [
      "site-assets",
      slugify(parsed.data.section),
      slugify(parsed.data.language),
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
