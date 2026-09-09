'use client';

import React, { useState, useEffect } from 'react';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { formatMinute, formatScore } from '@/lib/i18n/numerals';
import { Fixture } from '@/lib/football/types';
import MatchDetailsModal from '@/components/MatchDetailsModal';
import { Radio, Calendar, CheckCircle2, ChevronRight, Activity, Trophy } from 'lucide-react';

interface MatchesPageProps {
  params: { locale: Locale };
}

export default function MatchesPage({ params }: MatchesPageProps) {
  const { locale } = params;
  const dict = getDictionary(locale);

  const [matches, setMatches] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeModalMatch, setActiveModalMatch] = useState<Fixture | null>(null);

  useEffect(() => {
    async function loadMatches() {
      try {
        const res = await fetch('/api/matches');
        if (res.ok) {
          const data = await res.json();
          setMatches(data.matches || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  const leagues = [
    { id: 'ALL', name: dict.common.filterAll },
    { id: 'bpl', name: dict.leagues.bpl },
    { id: 'pl', name: dict.leagues.pl },
    { id: 'laliga', name: dict.leagues.laliga },
    { id: 'ucl', name: dict.leagues.ucl },
  ];

  const filteredMatches = matches.filter((m) => {
    const matchLeague = selectedLeague === 'ALL' || m.leagueId.toLowerCase() === selectedLeague.toLowerCase();
    const matchStatus = selectedStatus === 'ALL' || m.status === selectedStatus;
    return matchLeague && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-brand-600 animate-pulse" />
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              {dict.siteTagline}
            </span>
          </div>
          <h1 className="font-headline font-black text-3xl sm:text-4xl text-zinc-900 dark:text-white uppercase tracking-tight">
            {dict.nav.liveScores}
          </h1>
        </div>

        {/* Status Filter Tabs */}
        <div className="inline-flex rounded-lg bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto">
          {['ALL', 'LIVE', 'SCHEDULED', 'FINISHED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                selectedStatus === st
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {st === 'ALL' && dict.common.filterAll}
              {st === 'LIVE' && dict.ticker.live}
              {st === 'SCHEDULED' && dict.matchStatus.SCHEDULED}
              {st === 'FINISHED' && dict.matchStatus.FINISHED}
            </button>
          ))}
        </div>
      </div>

      {/* League Selection Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {leagues.map((l) => (
          <button
            key={l.id}
            onClick={() => setSelectedLeague(l.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
              selectedLeague === l.id
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-sm'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
            }`}
          >
            {l.name}
          </button>
        ))}
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500 font-bold">
          {locale === 'bn' ? 'ম্যাচ তথ্য লোড হচ্ছে...' : 'Loading fixtures and live match stats...'}
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500">
          <Trophy className="w-10 h-10 mx-auto mb-2 text-zinc-400" />
          <p className="font-bold text-sm">{dict.common.noResults}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.map((match) => (
            <div
              key={match.id}
              onClick={() => setActiveModalMatch(match)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-brand-500/50 hover:shadow-md transition-all cursor-pointer group"
            >
              {/* Card Top Header */}
              <div className="flex items-center justify-between text-xs font-bold pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
                <span className="text-zinc-500 uppercase tracking-wider">
                  {match.competition}
                </span>

                {match.status === 'LIVE' && (
                  <span className="flex items-center gap-1.5 bg-brand-600 text-white px-2 py-0.5 rounded text-[11px] font-extrabold uppercase animate-pulse">
                    <Activity className="w-3 h-3" />
                    <span>{dict.ticker.live} • {formatMinute(match.minute, locale)}</span>
                  </span>
                )}

                {match.status === 'SCHEDULED' && (
                  <span className="flex items-center gap-1 text-zinc-400 font-semibold">
                    <Calendar className="w-3 h-3" />
                    <span>{dict.matchStatus.SCHEDULED}</span>
                  </span>
                )}

                {match.status === 'FINISHED' && (
                  <span className="flex items-center gap-1 text-zinc-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>{dict.matchStatus.FINISHED}</span>
                  </span>
                )}
              </div>

              {/* Teams & Score */}
              <div className="grid grid-cols-7 items-center gap-2">
                {/* Home */}
                <div className="col-span-3 flex items-center justify-end gap-3 text-right">
                  <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                    {match.homeTeam.name}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-black text-xs shrink-0">
                    {match.homeTeam.shortName}
                  </div>
                </div>

                {/* Score */}
                <div className="col-span-1 text-center">
                  <span className="font-headline font-black text-xl sm:text-2xl text-brand-600 dark:text-brand-500 px-2 py-0.5 bg-zinc-50 dark:bg-zinc-950 rounded border border-zinc-200 dark:border-zinc-800">
                    {formatScore(match.homeScore, match.awayScore, locale)}
                  </span>
                </div>

                {/* Away */}
                <div className="col-span-3 flex items-center justify-start gap-3 text-left">
                  <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-black text-xs shrink-0">
                    {match.awayTeam.shortName}
                  </div>
                  <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                    {match.awayTeam.name}
                  </span>
                </div>
              </div>

              {/* Card Footer Callout */}
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 group-hover:text-brand-500 transition-colors">
                <span>
                  {match.stats
                    ? `${dict.stats.possession}: ${match.stats.possession[0]}% - ${match.stats.possession[1]}%`
                    : 'Click for lineups & stats'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal on click */}
      {activeModalMatch && (
        <MatchDetailsModal
          match={activeModalMatch}
          locale={locale}
          onClose={() => setActiveModalMatch(null)}
        />
      )}
    </div>
  );
}