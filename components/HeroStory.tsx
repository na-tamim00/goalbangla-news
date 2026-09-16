import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { formatLocalizedDate, toBengaliDigits } from '@/lib/i18n/numerals';
import { PostData } from '@/lib/db/types';
import { Clock, User, ArrowUpRight, Flame } from 'lucide-react';

interface HeroStoryProps {
  post: PostData;
  locale: Locale;
}

export default function HeroStory({ post, locale }: HeroStoryProps) {
  const dict = getDictionary(locale);
  const translation = post.translations[locale] || post.translations.bn;
  const title = translation.title;
  const excerpt = translation.excerpt;
  const publishedDate = formatLocalizedDate(post.publishedAt || post.createdAt, locale);

  const categoryName = (dict.categories as any)[post.category] || post.category;

  return (
    <article className="relative w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800/80 shadow-2xl group transition-all duration-300 hover:border-brand-600/50">
      <Link href={`/${locale}/news/${post.slug}`} className="block">
        <div className="relative h-[420px] sm:h-[500px] lg:h-[560px] w-full overflow-hidden">
          {/* Background Image */}
          <Image
            src={post.featuredImage || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80'}
            alt={title}
            fill
            priority
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent hidden md:block" />

          {/* Top Left Badges */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 z-10">
            <span className="bg-brand-600 text-white font-extrabold text-xs uppercase px-3 py-1 rounded shadow-md tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              <span>{categoryName}</span>
            </span>
            <span className="bg-zinc-900/80 backdrop-blur text-zinc-300 text-xs font-bold px-2.5 py-1 rounded border border-zinc-700/60 uppercase">
              {post.leagueTag}
            </span>
          </div>

          {/* Headline & Details at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 lg:p-10 z-10 max-w-4xl">
            <h1 className="font-headline font-black text-2xl sm:text-4xl lg:text-5xl text-white leading-tight tracking-tight mb-3 group-hover:text-brand-300 transition-colors drop-shadow-md">
              {title}
            </h1>

            {excerpt && (
              <p className="text-zinc-300 text-sm sm:text-base line-clamp-2 sm:line-clamp-3 mb-4 leading-relaxed font-medium">
                {excerpt}
              </p>
            )}

            {/* Metadata Footer */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-400">
              <div className="flex items-center gap-1.5 text-zinc-200">
                <User className="w-3.5 h-3.5 text-brand-400" />
                <span>{post.authorName || 'GoalBangla News Desk'}</span>
              </div>

              <span>•</span>

              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>{publishedDate}</span>
              </div>

              <span>•</span>

              <span className="text-brand-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>{dict.common.readMore}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}