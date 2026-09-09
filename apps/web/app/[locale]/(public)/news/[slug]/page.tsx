import Link from "next/link";
import { notFound } from "next/navigation";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { formatNewsDate, getPublishedNewsPostBySlug, splitNewsBody } from "@/lib/news";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-body" });

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const post = await getPublishedNewsPostBySlug(locale, slug);
  if (!post) return {};
  return {
    title: `${post.title} | Trends172Tech`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString()
    }
  };
}

export default async function NewsArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const post = await getPublishedNewsPostBySlug(locale, slug);
  if (!post) notFound();
  const isEs = locale.toLowerCase().startsWith("es");

  return (
    <article className={`${display.variable} ${body.variable} mx-auto max-w-4xl space-y-10 font-[var(--font-body)]`}>
      <header className="space-y-6 rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-950 sm:px-10">
        <Link href={`/${locale}/news`} className="text-sm font-semibold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
          {isEs ? "← Volver a noticias" : "← Back to news"}
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 dark:border-slate-700 dark:text-slate-200">{post.category}</span>
          {post.featured ? <span>{isEs ? "Destacado" : "Featured"}</span> : null}
          <span>{formatNewsDate(post.publishedAt, locale)}</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-[var(--font-display)] font-semibold leading-tight text-slate-950 dark:text-white sm:text-5xl">{post.title}</h1>
          <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">{post.summary}</p>
        </div>
      </header>

      <div className="space-y-5 px-1 text-base leading-8 text-slate-700 dark:text-slate-300 sm:px-6">
        {splitNewsBody(post.body).map((paragraph, index) => <p key={`${post.id}-${index}`}>{paragraph}</p>)}
      </div>

      <footer className="border-t border-slate-200 pt-6 dark:border-slate-800">
        <Link href={`/${locale}/news`} className="text-sm font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
          {isEs ? "Ver todas las noticias" : "View all news"}
        </Link>
      </footer>
    </article>
  );
}
