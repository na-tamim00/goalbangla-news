import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { formatLocalizedDate } from '@/lib/i18n/numerals';
import { PostData } from '@/lib/db/types';
import { Play, Headphones, Camera, Clock } from 'lucide-react';

interface NewsGridProps {
  posts: PostData[];
  locale: Locale;
  title?: string;
}

export default function NewsGrid({ posts, locale, title }: NewsGridProps) {
  const dict = getDictionary(locale);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      {title && (
        <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-brand-600">
          <h2 className="font-headline font-black text-xl sm:text-2xl text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-brand-600 rounded-full" />
            <span>{title}</span>
          </h2>
          <Link
            href={`/${locale}/news`}
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline uppercase tracking-wider"
          >
            {dict.common.viewAll} →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => {
          const translation = post.translations[locale] || post.translations.bn;
          const postTitle = translation.title;
          const excerpt = translation.excerpt;
          const date = formatLocalizedDate(post.publishedAt || post.createdAt, locale);
          const categoryLabel = (dict.categories as any)[post.category] || post.category;

          return (
            <article
              key={post.id}
              className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group hover:border-brand-500/40"
            >
              <Link href={`/${locale}/news/${post.slug}`} className="block relative aspect-video w-full overflow-hidden bg-zinc-800">
                <Image
                  src={post.featuredImage || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80'}
                  alt={postTitle}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Post Type Badge */}
                <div className="absolute top-3 right-3">
                  {post.type === 'VIDEO' && (
                    <span className="p-1.5 bg-brand-600 text-white rounded-full shadow flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 fill-white" />
                    </span>
                  )}
                  {post.type === 'AUDIO' && (
                    <span className="p-1.5 bg-brand-600 text-white rounded-full shadow flex items-center justify-center">
                      <Headphones className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {post.type === 'GALLERY' && (
                    <span className="p-1.5 bg-brand-600 text-white rounded-full shadow flex items-center justify-center">
                      <Camera className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Category Badge */}
                <span className="absolute bottom-3 left-3 bg-zinc-900/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-zinc-700/50">
                  {categoryLabel}
                </span>
              </Link>

              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <Link href={`/${locale}/news/${post.slug}`}>
                    <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug mb-2">
                      {postTitle}
                    </h3>
                  </Link>

                  {excerpt && (
                    <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
                      {excerpt}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="font-medium text-zinc-500 dark:text-zinc-400">
                    {post.authorName || 'GoalBangla'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    {date}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}