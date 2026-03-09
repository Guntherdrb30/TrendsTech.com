import { Language, NewsPostStatus, prisma } from "@trends172tech/db";

export function localeToLanguage(locale: string) {
  return locale.toLowerCase().startsWith("en") ? Language.EN : Language.ES;
}

export async function getPublishedNewsPosts(locale: string, limit?: number) {
  return prisma.newsPost.findMany({
    where: {
      language: localeToLanguage(locale),
      status: NewsPostStatus.PUBLISHED,
      publishedAt: { not: null }
    },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      body: true,
      category: true,
      featured: true,
      publishedAt: true,
      updatedAt: true
    }
  });
}

export async function getRootNewsPosts() {
  return prisma.newsPost.findMany({
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
}

export function formatNewsDate(value: Date | null | undefined, locale: string) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(locale.toLowerCase().startsWith("en") ? "en-US" : "es-VE", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(value);
}

export function splitNewsBody(body: string) {
  return body
    .split(/\r?\n\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}
