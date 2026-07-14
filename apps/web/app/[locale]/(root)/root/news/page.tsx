import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Language, NewsPostStatus, prisma } from "@trends172tech/db";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNewsDate, getRootNewsPosts } from "@/lib/news";

export const dynamic = "force-dynamic";

const basePostSchema = z.object({
  locale: z.string().min(2).max(10),
  title: z.string().min(4).max(160),
  slug: z
    .string()
    .min(3)
    .max(160)
    .regex(/^[a-z0-9-]+$/, "Invalid slug."),
  category: z.string().min(2).max(60),
  language: z.nativeEnum(Language),
  status: z.nativeEnum(NewsPostStatus),
  summary: z.string().min(12).max(360),
  body: z.string().min(24).max(12000),
  featured: z.boolean().default(false)
});

const createPostSchema = basePostSchema;

const updatePostSchema = basePostSchema.extend({
  postId: z.string().min(1)
});

const deletePostSchema = z.object({
  locale: z.string().min(2).max(10),
  postId: z.string().min(1)
});

function parseCheckbox(value: FormDataEntryValue | null) {
  return value === "on";
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function revalidateNewsPaths(locale: string) {
  const locales = Array.from(new Set([locale, "es", "en"]));
  for (const currentLocale of locales) {
    revalidatePath(`/${currentLocale}`);
    revalidatePath(`/${currentLocale}/news`);
    revalidatePath(`/${currentLocale}/root/news`);
  }
}

async function createNewsPost(formData: FormData) {
  "use server";

  const user = await requireRole("ROOT");
  const parsed = createPostSchema.safeParse({
    locale: formData.get("locale"),
    title: formData.get("title"),
    slug: normalizeSlug(String(formData.get("slug") ?? "")),
    category: formData.get("category"),
    language: formData.get("language"),
    status: formData.get("status"),
    summary: formData.get("summary"),
    body: formData.get("body"),
    featured: parseCheckbox(formData.get("featured"))
  });

  if (!parsed.success) {
    throw new Error("Invalid news payload.");
  }

  const existing = await prisma.newsPost.findUnique({
    where: { slug: parsed.data.slug }
  });

  if (existing) {
    throw new Error("Slug already exists.");
  }

  const post = await prisma.newsPost.create({
    data: {
      slug: parsed.data.slug,
      title: parsed.data.title.trim(),
      summary: parsed.data.summary.trim(),
      body: parsed.data.body.trim(),
      category: parsed.data.category.trim(),
      language: parsed.data.language,
      status: parsed.data.status,
      featured: parsed.data.featured,
      publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
      authorUserId: user.id
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "NEWS_POST_CREATED",
      entity: "NewsPost",
      entityId: post.id,
      metaJson: {
        slug: post.slug,
        language: post.language,
        status: post.status,
        featured: post.featured
      }
    }
  });

  revalidateNewsPaths(parsed.data.locale);
  redirect(`/${parsed.data.locale}/root/news`);
}

async function updateNewsPost(formData: FormData) {
  "use server";

  const user = await requireRole("ROOT");
  const parsed = updatePostSchema.safeParse({
    locale: formData.get("locale"),
    postId: formData.get("postId"),
    title: formData.get("title"),
    slug: normalizeSlug(String(formData.get("slug") ?? "")),
    category: formData.get("category"),
    language: formData.get("language"),
    status: formData.get("status"),
    summary: formData.get("summary"),
    body: formData.get("body"),
    featured: parseCheckbox(formData.get("featured"))
  });

  if (!parsed.success) {
    throw new Error("Invalid news payload.");
  }

  const existing = await prisma.newsPost.findUnique({
    where: { id: parsed.data.postId }
  });

  if (!existing) {
    throw new Error("News post not found.");
  }

  const slugOwner = await prisma.newsPost.findUnique({
    where: { slug: parsed.data.slug }
  });

  if (slugOwner && slugOwner.id !== parsed.data.postId) {
    throw new Error("Slug already exists.");
  }

  const post = await prisma.newsPost.update({
    where: { id: parsed.data.postId },
    data: {
      slug: parsed.data.slug,
      title: parsed.data.title.trim(),
      summary: parsed.data.summary.trim(),
      body: parsed.data.body.trim(),
      category: parsed.data.category.trim(),
      language: parsed.data.language,
      status: parsed.data.status,
      featured: parsed.data.featured,
      publishedAt:
        parsed.data.status === "PUBLISHED"
          ? existing.publishedAt ?? new Date()
          : null,
      authorUserId: user.id
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "NEWS_POST_UPDATED",
      entity: "NewsPost",
      entityId: post.id,
      metaJson: {
        slug: post.slug,
        language: post.language,
        status: post.status,
        featured: post.featured
      }
    }
  });

  revalidateNewsPaths(parsed.data.locale);
  redirect(`/${parsed.data.locale}/root/news`);
}

async function deleteNewsPost(formData: FormData) {
  "use server";

  const user = await requireRole("ROOT");
  const parsed = deletePostSchema.safeParse({
    locale: formData.get("locale"),
    postId: formData.get("postId")
  });

  if (!parsed.success) {
    throw new Error("Invalid delete payload.");
  }

  const existing = await prisma.newsPost.findUnique({
    where: { id: parsed.data.postId }
  });

  if (!existing) {
    throw new Error("News post not found.");
  }

  await prisma.newsPost.delete({
    where: { id: parsed.data.postId }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "NEWS_POST_DELETED",
      entity: "NewsPost",
      entityId: parsed.data.postId,
      metaJson: {
        slug: existing.slug,
        language: existing.language
      }
    }
  });

  revalidateNewsPaths(parsed.data.locale);
  redirect(`/${parsed.data.locale}/root/news`);
}

export default async function RootNewsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEs = locale.startsWith("es");
  const tr = (es: string, en: string) => (isEs ? es : en);
  await requireRole("ROOT");
  const posts = await getRootNewsPosts();

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <Link
          href={`/${locale}/root`}
          className="inline-flex text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          {tr("Volver al panel root", "Back to root panel")}
        </Link>
        <h1 className="text-2xl font-semibold">{tr("Gestion de novedades", "News management")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {tr("Crea, edita, publica y elimina noticias para la vitrina corporativa.", "Create, edit, publish and delete news for the corporate website.")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle>{tr("Nueva publicacion", "New post")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createNewsPost} className="space-y-4">
              <input type="hidden" name="locale" value={locale} />
              <div className="grid gap-2">
                <Label htmlFor="title">{tr("Titulo", "Title")}</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" placeholder="nuevo-lanzamiento-luna" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">{tr("Categoria", "Category")}</Label>
                <Input id="category" name="category" placeholder="Lanzamiento" required />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="language">{tr("Idioma", "Language")}</Label>
                  <select
                    id="language"
                    name="language"
                    defaultValue="ES"
                    className="h-9 rounded border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="ES">ES</option>
                    <option value="EN">EN</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">{tr("Estado", "Status")}</Label>
                  <select
                    id="status"
                    name="status"
                    defaultValue="DRAFT"
                    className="h-9 rounded border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="DRAFT">{tr("Borrador", "Draft")}</option>
                    <option value="PUBLISHED">{tr("Publicado", "Published")}</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input type="checkbox" name="featured" className="h-4 w-4" />
                {tr("Marcar como destacado", "Mark as featured")}
              </label>
              <div className="grid gap-2">
                <Label htmlFor="summary">{tr("Resumen", "Summary")}</Label>
                <textarea
                  id="summary"
                  name="summary"
                  required
                  rows={4}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="body">{tr("Contenido", "Content")}</Label>
                <textarea
                  id="body"
                  name="body"
                  required
                  rows={10}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
              <Button type="submit">{tr("Guardar publicacion", "Save post")}</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-sm text-slate-500 dark:text-slate-400">
                {tr("Todavia no hay publicaciones creadas.", "No posts have been created yet.")}
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle>{post.title}</CardTitle>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        /{post.slug} · {post.language} · {post.category}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.2em]">
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        {post.status}
                      </span>
                      {post.featured ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                          {tr("Destacado", "Featured")}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <p>{post.summary}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span>{tr("Publicado", "Published")}: {formatNewsDate(post.publishedAt, locale) ?? "-"}</span>
                      <span>
                        {tr("Autor", "Author")}: {post.author?.name ?? post.author?.email ?? tr("Sin autor", "No author")}
                      </span>
                      <span>{tr("Actualizado", "Updated")}: {formatNewsDate(post.updatedAt, locale) ?? "-"}</span>
                    </div>
                  </div>

                  <details className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                    <summary className="cursor-pointer text-sm font-semibold text-slate-900 dark:text-white">
                      {tr("Editar publicacion", "Edit post")}
                    </summary>
                    <form action={updateNewsPost} className="mt-4 space-y-4">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="postId" value={post.id} />
                      <div className="grid gap-2">
                        <Label htmlFor={`title-${post.id}`}>{tr("Titulo", "Title")}</Label>
                        <Input id={`title-${post.id}`} name="title" defaultValue={post.title} required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`slug-${post.id}`}>Slug</Label>
                        <Input id={`slug-${post.id}`} name="slug" defaultValue={post.slug} required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`category-${post.id}`}>{tr("Categoria", "Category")}</Label>
                        <Input
                          id={`category-${post.id}`}
                          name="category"
                          defaultValue={post.category}
                          required
                        />
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor={`language-${post.id}`}>{tr("Idioma", "Language")}</Label>
                          <select
                            id={`language-${post.id}`}
                            name="language"
                            defaultValue={post.language}
                            className="h-9 rounded border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                          >
                            <option value="ES">ES</option>
                            <option value="EN">EN</option>
                          </select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`status-${post.id}`}>{tr("Estado", "Status")}</Label>
                          <select
                            id={`status-${post.id}`}
                            name="status"
                            defaultValue={post.status}
                            className="h-9 rounded border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                          >
                            <option value="DRAFT">{tr("Borrador", "Draft")}</option>
                            <option value="PUBLISHED">{tr("Publicado", "Published")}</option>
                          </select>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <input type="checkbox" name="featured" defaultChecked={post.featured} className="h-4 w-4" />
                        {tr("Marcar como destacado", "Mark as featured")}
                      </label>
                      <div className="grid gap-2">
                        <Label htmlFor={`summary-${post.id}`}>{tr("Resumen", "Summary")}</Label>
                        <textarea
                          id={`summary-${post.id}`}
                          name="summary"
                          defaultValue={post.summary}
                          required
                          rows={4}
                          className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`body-${post.id}`}>{tr("Contenido", "Content")}</Label>
                        <textarea
                          id={`body-${post.id}`}
                          name="body"
                          defaultValue={post.body}
                          required
                          rows={10}
                          className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                        />
                      </div>
                      <Button type="submit" size="sm">
                        {tr("Guardar cambios", "Save changes")}
                      </Button>
                    </form>
                    <form action={deleteNewsPost} className="mt-3">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="postId" value={post.id} />
                      <Button type="submit" size="sm" variant="outline">
                        {tr("Eliminar", "Delete")}
                      </Button>
                    </form>
                  </details>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
