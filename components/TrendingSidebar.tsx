import React from 'react';
import Link from 'next/link';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { toBengaliDigits } from '@/lib/i18n/numerals';
import { PostData } from '@/lib/db/types';
import { Flame } from 'lucide-react';

interface TrendingSidebarProps {
  posts: PostData[];
  locale: Locale;
}

export default function TrendingSidebar({ posts, locale }: TrendingSidebarProps) {
  const dict = getDictionary(locale);
  // Take top 5
  const trending = posts.slice(0, 5);

  return (
    <aside className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b-2 border-brand-600">
        <Flame className="w-5 h-5 text-brand-600 dark:text-brand-500 fill-brand-600" />
        <h3 className="font-headline font-black text-lg text-zinc-900 dark:text-white uppercase tracking-wider">
          {dict.sections.trending}
        </h3>
      </div>

      <div className="space-y-4 divide-y divide-zinc-100 dark:divide-zinc-800/80">
        {trending.map((post, idx) => {
          const translation = post.translations[locale] || post.translations.bn;
          const rank = locale === 'bn' ? toBengaliDigits(idx + 1) : idx + 1;

          return (
            <div key={post.id} className="pt-3 first:pt-0 flex items-start gap-3.5 group">
              <span className="font-headline font-black text-2xl text-brand-600 dark:text-brand-500 w-6 shrink-0 text-center">
                {rank}
              </span>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  {post.leagueTag}
                </span>
                <Link
                  href={`/${locale}/news/${post.slug}`}
                  className="font-bold text-sm text-zinc-800 dark:text-zinc-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug"
                >
                  {translation.title}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}