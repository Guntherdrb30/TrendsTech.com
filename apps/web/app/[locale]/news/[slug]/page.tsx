import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatNewsDate, getPublishedNewsPostBySlug, splitNewsBody } from '@/lib/news';
import { getNewsMediaBySlug } from '@/lib/news-media';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const [post, media] = await Promise.all([getPublishedNewsPostBySlug(locale, slug), getNewsMediaBySlug(slug)]);
  if (!post) return {};
  return {
    title: `${post.title} | Trends172Tech`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      images: media?.coverImageUrl ? [{ url: media.coverImageUrl, alt: media.coverAlt ?? post.title }] : undefined
    }
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  const [post, media] = await Promise.all([getPublishedNewsPostBySlug(locale, slug), getNewsMediaBySlug(slug)]);
  if (!post) notFound();
  const isEs = locale.startsWith('es');
  const paragraphs = splitNewsBody(post.body);

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:py-16">
      <Link href={`/${locale}/news`} className="text-sm font-semibold text-slate-500 transition hover:text-slate-950">
        {isEs ? '← Volver a noticias' : '← Back to news'}
      </Link>
      <article className="mt-8 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        {media?.coverImageUrl ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
            <Image src={media.coverImageUrl} alt={media.coverAlt ?? post.title} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 960px" />
          </div>
        ) : null}
        <div className="px-6 py-8 sm:px-10 sm:py-12">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>{post.category}</span>
            <span>•</span>
            <time>{formatNewsDate(post.publishedAt, locale)}</time>
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{post.title}</h1>
          <p className="mt-6 text-xl leading-8 text-slate-600">{post.summary}</p>
          <div className="mt-10 space-y-6 text-[17px] leading-8 text-slate-700">
            {paragraphs.map((paragraph, index) => <p key={`${post.id}-${index}`}>{paragraph}</p>)}
          </div>
          {media?.gallery?.length ? (
            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {media.gallery.map((asset, index) => (
                <div key={`${asset.imageUrl}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                  <Image src={asset.imageUrl} alt={asset.alt ?? post.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 480px" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    </main>
  );
}
