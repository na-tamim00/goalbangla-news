import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { formatLocalizedDate } from '@/lib/i18n/numerals';
import { repo } from '@/lib/db';
import SocialShare from '@/components/SocialShare';
import { Clock, User, ArrowLeft, Play, Headphones, Camera, Tag, Flame } from 'lucide-react';

interface ArticlePageProps {
  params: {
    locale: Locale;
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const post = await repo.getPostBySlug(params.slug);
  if (!post) return { title: 'Article Not Found | GoalBangla' };

  const trans = post.translations[params.locale] || post.translations.bn;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const canonicalUrl = `${siteUrl}/${params.locale}/news/${post.slug}`;
  const imageUrl = post.featuredImage || `${siteUrl}/og-image.png`;

  return {
    title: trans.seoTitle || `${trans.title} | GoalBangla`,
    description: trans.seoDescription || trans.excerpt || trans.title,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'bn-BD': `${siteUrl}/bn/news/${post.slug}`,
        'en-US': `${siteUrl}/en/news/${post.slug}`,
      },
    },
    openGraph: {
      title: trans.title,
      description: trans.excerpt || trans.title,
      url: canonicalUrl,
      siteName: 'GoalBangla',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: trans.title,
        },
      ],
      type: 'article',
      publishedTime: post.publishedAt || post.createdAt,
      authors: [post.authorName || 'GoalBangla News Desk'],
      tags: trans.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: trans.title,
      description: trans.excerpt || trans.title,
      images: [imageUrl],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { locale, slug } = params;
  const dict = getDictionary(locale);

  const post = await repo.getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  // Increment view count asynchronously
  repo.incrementViewCount(slug);

  const trans = post.translations[locale] || post.translations.bn;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const articleUrl = `${siteUrl}/${locale}/news/${post.slug}`;
  const publishedDate = formatLocalizedDate(post.publishedAt || post.createdAt, locale);

  const { posts: relatedPosts } = await repo.getPosts({
    category: post.category,
    limit: 4,
  });
  const filteredRelated = relatedPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  // Extract YouTube ID if video
  const getYouTubeEmbed = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const ytEmbed = getYouTubeEmbed(post.videoUrl);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: trans.title,
            image: [post.featuredImage || `${siteUrl}/og-image.png`],
            datePublished: post.publishedAt || post.createdAt,
            dateModified: post.updatedAt,
            author: [
              {
                '@type': 'Person',
                name: post.authorName || 'GoalBangla Reporter',
              },
            ],
            publisher: {
              '@type': 'NewsMediaOrganization',
              name: 'GoalBangla',
              logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/goalbangla-logo.svg`,
              },
            },
            description: trans.excerpt,
          }),
        }}
      />

      {/* Back to Home / Category Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
        <Link href={`/${locale}`} className="hover:text-brand-500 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{dict.nav.home}</span>
        </Link>
        <span>/</span>
        <span className="text-brand-600 dark:text-brand-400">
          {(dict.categories as any)[post.category] || post.category}
        </span>
        <span>/</span>
        <span className="text-zinc-400">{post.leagueTag}</span>
      </div>

      {/* Headline & Subtitle */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2">
          <span className="bg-brand-600 text-white font-black text-xs uppercase px-2.5 py-1 rounded">
            {(dict.categories as any)[post.category] || post.category}
          </span>
          <span className="text-xs font-bold text-zinc-500 uppercase">
            {post.leagueTag}
          </span>
        </div>

        <h1 className="font-headline font-black text-3xl sm:text-5xl text-zinc-950 dark:text-white leading-tight tracking-tight">
          {trans.title}
        </h1>

        {trans.excerpt && (
          <p className="text-zinc-700 dark:text-zinc-300 text-lg sm:text-xl font-medium leading-relaxed border-l-4 border-brand-600 pl-4 py-1">
            {trans.excerpt}
          </p>
        )}

        {/* Byline & Date */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold">
            <User className="w-4 h-4 text-brand-500 shrink-0" />
            <span>
              {locale === 'bn' ? 'প্রতিবেদক ও প্রকাশক:' : 'Published by:'}{' '}
              <span className="text-zinc-950 dark:text-white font-extrabold">{post.authorName || 'GoalBangla News Desk'}</span>
              {post.authorTitle && (
                <span className="text-brand-600 dark:text-brand-400 font-medium ml-1.5 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px]">
                  {post.authorTitle}
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{dict.common.publishedOn} {publishedDate}</span>
          </div>
        </div>

        {/* Top Social Share Buttons */}
        <SocialShare title={trans.title} url={articleUrl} locale={locale} />
      </header>

      {/* Featured Media / Player Embeds */}
      <div className="space-y-6">
        {/* Video Post Type */}
        {post.type === 'VIDEO' && (
          <div className="rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-xl">
            {ytEmbed ? (
              <div className="aspect-video w-full">
                <iframe
                  src={ytEmbed}
                  title={trans.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <video controls className="w-full aspect-video">
                <source src={post.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            {post.videoTranscript && (
              <div className="p-4 bg-zinc-900/90 text-xs text-zinc-400 border-t border-zinc-800">
                <span className="font-bold text-zinc-200 uppercase block mb-1">ভিডিও বিবরণ / Transcript:</span>
                <p>{post.videoTranscript}</p>
              </div>
            )}
          </div>
        )}

        {/* Audio / Podcast Post Type */}
        {post.type === 'AUDIO' && (
          <div className="p-6 bg-gradient-to-r from-zinc-900 to-zinc-950 border border-brand-800/40 rounded-2xl shadow-xl text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-600 rounded-xl">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                  GoalBangla Podcast Player
                </span>
                <h3 className="font-bold text-lg text-white">{trans.title}</h3>
              </div>
            </div>

            <audio controls className="w-full">
              <source src={post.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>

            {post.audioShowNotes && (
              <div className="p-3.5 bg-zinc-900/90 rounded-lg text-xs text-zinc-300 border border-zinc-800">
                <span className="font-bold text-amber-400 block mb-1">Show Notes:</span>
                <p>{post.audioShowNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* Standard Featured Image */}
        {post.type !== 'VIDEO' && post.featuredImage && (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-xl bg-zinc-900">
            <Image
              src={post.featuredImage}
              alt={trans.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        )}

        {/* Photo Gallery Post Type */}
        {post.type === 'GALLERY' && post.galleryImages && (
          <div className="space-y-4 pt-4">
            <h3 className="font-headline font-black text-xl text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-5 h-5 text-brand-500" />
              <span>{locale === 'bn' ? 'ফটো অ্যালবাম গ্যালারি' : 'Matchday Photo Album'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {post.galleryImages.map((img, i) => (
                <div key={i} className="rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group">
                  <div className="relative aspect-video w-full">
                    <Image
                      src={img.url}
                      alt={img.captionBn || `Gallery item ${i + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {(img.captionBn || img.captionEn) && (
                    <p className="p-3 text-xs text-zinc-400 bg-zinc-950 font-medium">
                      {locale === 'bn' ? img.captionBn : img.captionEn}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Article Body (Rich Typography) */}
      <div className="prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal text-base sm:text-lg space-y-4">
        {trans.content.split('\n\n').map((paragraph, idx) => {
          if (paragraph.startsWith('## ')) {
            return (
              <h2
                key={idx}
                className="font-headline font-black text-2xl sm:text-3xl text-zinc-950 dark:text-white mt-8 mb-4 border-b pb-2 border-zinc-200 dark:border-zinc-800"
              >
                {paragraph.replace('## ', '')}
              </h2>
            );
          }
          if (paragraph.startsWith('### ')) {
            return (
              <h3
                key={idx}
                className="font-headline font-bold text-xl text-zinc-900 dark:text-zinc-100 mt-6 mb-3"
              >
                {paragraph.replace('### ', '')}
              </h3>
            );
          }
          if (paragraph.startsWith('> ')) {
            return (
              <blockquote
                key={idx}
                className="border-l-4 border-brand-600 bg-zinc-100 dark:bg-zinc-900/60 p-4 rounded-r-lg my-6 text-zinc-700 dark:text-zinc-300 italic"
              >
                {paragraph.replace('> ', '')}
              </blockquote>
            );
          }
          return <p key={idx}>{paragraph}</p>;
        })}
      </div>

      {/* Tags Section */}
      {trans.tags && trans.tags.length > 0 && (
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="w-4 h-4 text-brand-500 mr-1" />
            {trans.tags.map((tag, i) => (
              <Link
                key={i}
                href={`/${locale}/search?q=${encodeURIComponent(tag)}`}
                className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-brand-600 hover:text-white text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Editorial Author & Publisher Attribution Box */}
      <div className="my-8 p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-brand-600/10 dark:bg-brand-600/20 border-2 border-brand-500 flex items-center justify-center text-brand-600 dark:text-brand-400 font-black text-xl shrink-0">
          {(post.authorName || 'G').charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              {locale === 'bn' ? 'লেখক ও প্রকাশক' : 'Author & Publisher'}
            </span>
            <span className="text-zinc-400 dark:text-zinc-600">•</span>
            <span className="text-[11px] text-zinc-500 font-medium">GoalBangla Editorial Desk</span>
          </div>
          <h3 className="font-headline font-bold text-lg text-zinc-950 dark:text-white leading-snug">
            {post.authorName || 'Md Habibur Rahman Khan'}
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 font-medium">
            {post.authorTitle || (locale === 'bn' ? 'প্রধান সম্পাদক ও ফুটবল বিশ্লেষক' : 'Chief Football Editor & Analyst')}
          </p>
        </div>
        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 bg-white dark:bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shrink-0 font-medium">
          <Clock className="w-3.5 h-3.5 text-brand-500" />
          <span>{publishedDate}</span>
        </div>
      </div>

      {/* Bottom Share Buttons */}
      <div className="pt-2">
        <SocialShare title={trans.title} url={articleUrl} locale={locale} />
      </div>

      {/* Related Stories */}
      {filteredRelated.length > 0 && (
        <div className="pt-10 border-t-2 border-brand-600 space-y-6">
          <h3 className="font-headline font-black text-2xl text-zinc-950 dark:text-white uppercase tracking-wider">
            {locale === 'bn' ? 'সম্পর্কিত অন্যান্য সংবাদ' : 'Related Stories'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {filteredRelated.map((rel) => {
              const relTrans = rel.translations[locale] || rel.translations.bn;
              return (
                <Link
                  key={rel.id}
                  href={`/${locale}/news/${rel.slug}`}
                  className="group block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:border-brand-500 transition-colors"
                >
                  <div className="relative aspect-video w-full bg-zinc-800">
                    <Image
                      src={rel.featuredImage || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80'}
                      alt={relTrans.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3.5">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-brand-500 transition-colors line-clamp-2">
                      {relTrans.title}
                    </h4>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}