'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { formatLocalizedDate } from '@/lib/i18n/numerals';
import { PostData } from '@/lib/db/types';
import { Search, Clock, ArrowRight, Frown } from 'lucide-react';

interface SearchPageProps {
  params: { locale: Locale };
}

function SearchContent({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function executeSearch() {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/posts?search=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.posts || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(executeSearch, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="font-headline font-black text-3xl sm:text-4xl text-zinc-950 dark:text-white uppercase tracking-tight mb-2">
          {dict.nav.search}
        </h1>
        <p className="text-sm text-zinc-500 font-medium">
          {locale === 'bn'
            ? 'খেলোয়াড়, ক্লাব, কৌশল বা যেকোনো ফুটবল শিরোনাম বাংলায় বা ইংরেজিতে খুঁজুন'
            : 'Search articles, players, tactics, and club records in Bengali or English'}
        </p>
      </div>

      {/* Big Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.common.searchPlaceholder}
          className="w-full bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl pl-12 pr-4 py-3.5 text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-brand-500 shadow-sm transition-colors"
          autoFocus
        />
        <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
      </div>

      {/* Results Feed */}
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-10 text-zinc-400 text-sm font-semibold">
            {locale === 'bn' ? 'অনুসন্ধান চলছে...' : 'Searching archives...'}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
            <Frown className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
            <p className="font-bold text-base text-zinc-700 dark:text-zinc-300 mb-1">
              {dict.common.noResults}
            </p>
            <p className="text-xs text-zinc-500">
              {locale === 'bn'
                ? 'বানান সঠিক আছে কিনা দেখুন বা অন্য কোনো শব্দ দিয়ে চেষ্টা করুন।'
                : 'Try different keywords or check spelling.'}
            </p>
          </div>
        )}

        {results.map((post) => {
          const trans = post.translations[locale] || post.translations.bn;
          const date = formatLocalizedDate(post.publishedAt || post.createdAt, locale);

          return (
            <Link
              key={post.id}
              href={`/${locale}/news/${post.slug}`}
              className="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-brand-500 rounded-xl p-5 shadow-sm transition-all group"
            >
              <div className="flex items-center gap-2 text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">
                <span>{post.category}</span>
                <span>•</span>
                <span className="text-zinc-400">{post.leagueTag}</span>
              </div>

              <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 group-hover:text-brand-500 transition-colors mb-2 leading-snug">
                {trans.title}
              </h3>

              {trans.excerpt && (
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                  {trans.excerpt}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {date}
                </span>
                <span className="font-bold text-brand-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  {dict.common.readMore} <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function SearchPage({ params }: SearchPageProps) {
  return (
    <Suspense fallback={<div className="py-20 text-center text-zinc-500">Loading Search...</div>}>
      <SearchContent locale={params.locale} />
    </Suspense>
  );
}