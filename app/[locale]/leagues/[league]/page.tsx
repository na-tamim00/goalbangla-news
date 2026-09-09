import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { toBengaliDigits, formatScore, formatMinute } from '@/lib/i18n/numerals';
import { footballService } from '@/lib/football/service';
import { repo } from '@/lib/db';
import NewsGrid from '@/components/NewsGrid';
import { Trophy, Calendar, Activity, CheckCircle2 } from 'lucide-react';

interface LeaguePageProps {
  params: {
    locale: Locale;
    league: string;
  };
}

export async function generateMetadata({
  params,
}: LeaguePageProps): Promise<Metadata> {
  const dict = getDictionary(params.locale);
  const leagueName = (dict.leagues as any)[params.league] || params.league.toUpperCase();
  return {
    title: `${leagueName} — Standings, Fixtures & News | GoalBangla`,
    description: `Complete coverage of ${leagueName} including live standings table, fixtures schedule, results, and breaking news.`,
  };
}

export default async function LeaguePage({ params }: LeaguePageProps) {
  const { locale, league } = params;
  const dict = getDictionary(locale);

  // Normalize league key
  const leagueKey = league === 'premier-league' ? 'pl' : league;
  const leagueName = (dict.leagues as any)[leagueKey] || (dict.leagues as any)[league] || league.toUpperCase();

  // Load standings & fixtures & news
  const table = await footballService.getLeagueStandings(leagueKey);
  const fixtures = await footballService.getLeagueFixtures(leagueKey);
  const { posts } = await repo.getPosts({
    leagueTag: leagueKey.toUpperCase() === 'PL' ? 'PREMIER_LEAGUE' : leagueKey.toUpperCase(),
    limit: 6,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* League Header Banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-brand-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 text-white flex items-center justify-between shadow-xl">
        <div>
          <span className="text-xs font-bold text-brand-400 uppercase tracking-widest block mb-1">
            {dict.nav.leagues}
          </span>
          <h1 className="font-headline font-black text-3xl sm:text-5xl uppercase tracking-tight">
            {leagueName}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-medium">
            {locale === 'bn'
              ? 'পয়েন্ট টেবিল, পূর্ণাঙ্গ সময়সূচী ও সর্বশেষ সংবাদ আপডেট'
              : 'Official Standings, Fixtures, and Breaking News Hub'}
          </p>
        </div>
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-900 border-2 border-brand-500/40 flex items-center justify-center font-headline font-black text-2xl sm:text-3xl text-brand-500 shadow-lg shrink-0">
          {leagueKey.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Standings Table & Fixtures */}
        <div className="lg:col-span-2 space-y-8">
          {/* Standings Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-headline font-black text-lg text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4 text-brand-500" />
                <span>{dict.stats.standings} ({table?.season || '2025/26'})</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-950/80 text-zinc-500 uppercase text-[11px] font-bold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-3 py-3 text-center w-10">#</th>
                    <th className="px-4 py-3">{locale === 'bn' ? 'দল' : 'Team'}</th>
                    <th className="px-2 py-3 text-center">{dict.stats.played}</th>
                    <th className="px-2 py-3 text-center">{dict.stats.won}</th>
                    <th className="px-2 py-3 text-center">{dict.stats.drawn}</th>
                    <th className="px-2 py-3 text-center">{dict.stats.lost}</th>
                    <th className="px-2 py-3 text-center">{dict.stats.gd}</th>
                    <th className="px-3 py-3 text-center font-black text-brand-600 dark:text-brand-400">
                      {dict.stats.points}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                  {(!table || table.standings.length === 0) ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-zinc-500">
                        {dict.common.noResults}
                      </td>
                    </tr>
                  ) : (
                    table.standings.map((row) => (
                      <tr
                        key={row.rank}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="px-3 py-3 text-center font-bold text-zinc-400">
                          {locale === 'bn' ? toBengaliDigits(row.rank) : row.rank}
                        </td>
                        <td className="px-4 py-3 font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[10px] font-black flex items-center justify-center">
                            {row.team.shortName}
                          </span>
                          <span>{row.team.name}</span>
                        </td>
                        <td className="px-2 py-3 text-center text-zinc-500">
                          {locale === 'bn' ? toBengaliDigits(row.played) : row.played}
                        </td>
                        <td className="px-2 py-3 text-center text-zinc-500">
                          {locale === 'bn' ? toBengaliDigits(row.won) : row.won}
                        </td>
                        <td className="px-2 py-3 text-center text-zinc-500">
                          {locale === 'bn' ? toBengaliDigits(row.drawn) : row.drawn}
                        </td>
                        <td className="px-2 py-3 text-center text-zinc-500">
                          {locale === 'bn' ? toBengaliDigits(row.lost) : row.lost}
                        </td>
                        <td className="px-2 py-3 text-center font-semibold">
                          {locale === 'bn' ? toBengaliDigits(row.goalDifference) : row.goalDifference}
                        </td>
                        <td className="px-3 py-3 text-center font-black text-brand-600 dark:text-brand-400">
                          {locale === 'bn' ? toBengaliDigits(row.points) : row.points}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* League News Feed */}
          <div>
            <NewsGrid
              posts={posts}
              locale={locale}
              title={`${leagueName} ${locale === 'bn' ? 'সংবাদ' : 'News'}`}
            />
          </div>
        </div>

        {/* Right 1 Col: Fixtures Schedule */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-200 dark:border-zinc-800">
              <Calendar className="w-5 h-5 text-brand-500" />
              <h3 className="font-headline font-black text-lg uppercase tracking-wider text-zinc-900 dark:text-white">
                {dict.sections.fixturesSummary}
              </h3>
            </div>

            <div className="space-y-3">
              {fixtures.length === 0 ? (
                <p className="text-xs text-zinc-500 italic text-center py-4">
                  {dict.common.noResults}
                </p>
              ) : (
                fixtures.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 mb-2">
                      <span>{m.status === 'LIVE' ? dict.ticker.live : m.status}</span>
                      {m.status === 'LIVE' && (
                        <span className="text-brand-500 flex items-center gap-1 font-bold">
                          <Activity className="w-3 h-3 animate-pulse" />
                          {formatMinute(m.minute, locale)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      <span>{m.homeTeam.name}</span>
                      <span className="font-headline text-brand-500 font-black">
                        {formatScore(m.homeScore, m.awayScore, locale)}
                      </span>
                      <span>{m.awayTeam.name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}