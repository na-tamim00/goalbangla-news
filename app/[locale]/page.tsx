import React from 'react';
import Link from 'next/link';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { repo } from '@/lib/db';
import HeroStory from '@/components/HeroStory';
import NewsGrid from '@/components/NewsGrid';
import TrendingSidebar from '@/components/TrendingSidebar';
import WeekendPreview from '@/components/Widgets/WeekendPreview';
import TeamOfTheWeek from '@/components/Widgets/TeamOfTheWeek';
import TransferRumourMill from '@/components/Widgets/TransferRumourMill';
import { Play, Headphones, ArrowRight, Flame } from 'lucide-react';

interface HomePageProps {
  params: { locale: Locale };
}

export const revalidate = 60; // ISR revalidate every minute

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = params;
  const dict = getDictionary(locale);

  const { posts } = await repo.getPosts({ status: 'PUBLISHED', limit: 20 });

  const leadStory = posts[0];
  const secondaryStories = posts.slice(1, 7);
  const mediaStories = posts.filter((p) => p.type === 'VIDEO' || p.type === 'AUDIO');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10">
      {/* 1. Hero Lead Section & Quick Highlights */}
      {leadStory && (
        <section className="w-full">
          <HeroStory post={leadStory} locale={locale} />
        </section>
      )}

      {/* 2. Main Content Grid: Latest News Grid (Left) + Trending & Weekend Preview (Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Latest News Feed */}
        <div className="lg:col-span-2 space-y-8">
          <NewsGrid
            posts={secondaryStories}
            locale={locale}
            title={dict.sections.latestNews}
          />

          {/* Multimedia Spotlight Banner (Video & Podcasts) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-brand-600 rounded-lg text-white">
                  <Play className="w-4 h-4 fill-white" />
                </span>
                <h3 className="font-headline font-black text-xl uppercase tracking-wider">
                  {dict.sections.videoHighlights}
                </h3>
              </div>
              <Link
                href={`/${locale}/stats`}
                className="text-xs font-bold text-brand-400 hover:text-brand-300 uppercase tracking-wider"
              >
                {dict.common.viewAll} →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {mediaStories.map((item) => {
                const trans = item.translations[locale] || item.translations.bn;
                return (
                  <Link
                    key={item.id}
                    href={`/${locale}/news/${item.slug}`}
                    className="group block bg-zinc-950/80 rounded-xl overflow-hidden border border-zinc-800/80 hover:border-brand-500/50 transition-colors"
                  >
                    <div className="relative aspect-video w-full bg-zinc-800 overflow-hidden">
                      <img
                        src={item.featuredImage || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80'}
                        alt={trans.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          {item.type === 'VIDEO' ? (
                            <Play className="w-5 h-5 fill-white ml-0.5" />
                          ) : (
                            <Headphones className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-3.5">
                      <h4 className="font-bold text-sm text-zinc-100 group-hover:text-brand-400 transition-colors line-clamp-2">
                        {trans.title}
                      </h4>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Trending & Widgets */}
        <div className="space-y-8">
          {/* Trending Reads */}
          <TrendingSidebar posts={posts} locale={locale} />

          {/* Weekend Preview Blockbuster Matches */}
          <WeekendPreview locale={locale} />

          {/* Transfer Rumour Mill */}
          <TransferRumourMill locale={locale} />

          {/* Team of the Week Pitch Interactive Widget */}
          <TeamOfTheWeek locale={locale} />
        </div>
      </section>
    </div>
  );
}