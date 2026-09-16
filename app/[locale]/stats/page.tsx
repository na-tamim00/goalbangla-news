import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { toBengaliDigits } from '@/lib/i18n/numerals';
import { footballService } from '@/lib/football/service';
import { repo } from '@/lib/db';
import { BarChart3, Trophy, Medal, Camera, Play } from 'lucide-react';

interface StatsPageProps {
  params: { locale: Locale };
}

export const revalidate = 60;

export default async function StatsPage({ params }: StatsPageProps) {
  const { locale } = params;
  const dict = getDictionary(locale);

  const bplTable = await footballService.getLeagueStandings('bpl');
  const plTable = await footballService.getLeagueStandings('pl');
  const { posts } = await repo.getPosts({ status: 'PUBLISHED', limit: 30 });

  const galleryPosts = posts.filter((p) => p.type === 'GALLERY');
  const videoPosts = posts.filter((p) => p.type === 'VIDEO');

  const topScorers = [
    { rank: 1, name: 'Erling Haaland', team: 'Man City', league: 'PL', goals: 22 },
    { rank: 2, name: 'Kylian Mbappé', team: 'Real Madrid', league: 'La Liga', goals: 20 },
    { rank: 3, name: 'Mohamed Salah', team: 'Liverpool', league: 'PL', goals: 18 },
    { rank: 4, name: 'Rakib Hossain', team: 'Bashundhara Kings', league: 'BPL', goals: 14 },
    { rank: 5, name: 'Robert Lewandowski', team: 'Barcelona', league: 'La Liga', goals: 13 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-brand-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-brand-400 uppercase tracking-widest block mb-1">
            GoalBangla Archive & Records
          </span>
          <h1 className="font-headline font-black text-3xl sm:text-5xl uppercase tracking-tight">
            {dict.nav.stats}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-medium max-w-xl">
            {locale === 'bn'
              ? 'পয়েন্ট টেবিল, শীর্ষ গোলদাতা, ভিডিও ও ছবি আর্কাইভ'
              : 'Standings Comparison, Top Scorers, Photo Galleries, and Video Highlights'}
          </p>
        </div>
        <BarChart3 className="w-16 h-16 text-brand-600/40 hidden sm:block" />
      </div>

      {/* Top Scorers & Fast League Glance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Top Scorers */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b-2 border-brand-600">
            <Medal className="w-5 h-5 text-brand-500" />
            <h3 className="font-headline font-black text-lg text-zinc-900 dark:text-white uppercase tracking-wider">
              {locale === 'bn' ? 'শীর্ষ গোলদাতা' : 'Top Goalscorers'}
            </h3>
          </div>

          <div className="space-y-3 divide-y divide-zinc-100 dark:divide-zinc-800">
            {topScorers.map((s) => (
              <div key={s.rank} className="pt-3 first:pt-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-headline font-black text-lg text-brand-600 dark:text-brand-400 w-6 text-center">
                    {locale === 'bn' ? toBengaliDigits(s.rank) : s.rank}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{s.name}</h4>
                    <span className="text-[11px] text-zinc-400">{s.team} • {s.league}</span>
                  </div>
                </div>
                <span className="font-headline font-black text-xl text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded">
                  {locale === 'bn' ? toBengaliDigits(s.goals) : s.goals}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bangladesh Premier League Table Glance */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-brand-600">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-brand-500" />
              <h3 className="font-headline font-black text-lg text-zinc-900 dark:text-white uppercase tracking-wider">
                {dict.leagues.bpl}
              </h3>
            </div>
            <Link
              href={`/${locale}/leagues/bpl`}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline uppercase"
            >
              {dict.common.viewAll} →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-950/80 text-zinc-500 uppercase text-[11px] font-bold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-3 py-2 text-center">#</th>
                  <th className="px-3 py-2">Team</th>
                  <th className="px-2 py-2 text-center">{dict.stats.played}</th>
                  <th className="px-2 py-2 text-center">{dict.stats.won}</th>
                  <th className="px-2 py-2 text-center">{dict.stats.drawn}</th>
                  <th className="px-2 py-2 text-center">{dict.stats.lost}</th>
                  <th className="px-3 py-2 text-center font-bold text-brand-500">{dict.stats.points}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                {bplTable?.standings.slice(0, 5).map((r) => (
                  <tr key={r.rank}>
                    <td className="px-3 py-2 text-center font-bold text-zinc-400">
                      {locale === 'bn' ? toBengaliDigits(r.rank) : r.rank}
                    </td>
                    <td className="px-3 py-2 font-bold text-zinc-900 dark:text-zinc-100">{r.team.name}</td>
                    <td className="px-2 py-2 text-center text-zinc-500">{locale === 'bn' ? toBengaliDigits(r.played) : r.played}</td>
                    <td className="px-2 py-2 text-center text-zinc-500">{locale === 'bn' ? toBengaliDigits(r.won) : r.won}</td>
                    <td className="px-2 py-2 text-center text-zinc-500">{locale === 'bn' ? toBengaliDigits(r.drawn) : r.drawn}</td>
                    <td className="px-2 py-2 text-center text-zinc-500">{locale === 'bn' ? toBengaliDigits(r.lost) : r.lost}</td>
                    <td className="px-3 py-2 text-center font-black text-brand-600 dark:text-brand-400">
                      {locale === 'bn' ? toBengaliDigits(r.points) : r.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Photo Galleries Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b-2 border-brand-600">
          <Camera className="w-5 h-5 text-brand-500" />
          <h3 className="font-headline font-black text-2xl text-zinc-900 dark:text-white uppercase tracking-wider">
            {dict.nav.gallery}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryPosts.map((g) => {
            const trans = g.translations[locale] || g.translations.bn;
            return (
              <Link
                key={g.id}
                href={`/${locale}/news/${g.slug}`}
                className="group block bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-brand-500 transition-colors"
              >
                <div className="relative aspect-video w-full bg-zinc-800">
                  <Image
                    src={g.featuredImage || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80'}
                    alt={trans.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{g.galleryImages?.length || 3} Photos</span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-brand-500 transition-colors line-clamp-2">
                    {trans.title}
                  </h4>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
