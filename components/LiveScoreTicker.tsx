'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { formatMinute, formatScore } from '@/lib/i18n/numerals';
import { Fixture } from '@/lib/football/types';
import { Activity, ChevronRight } from 'lucide-react';
import MatchDetailsModal from './MatchDetailsModal';

interface LiveScoreTickerProps {
  locale: Locale;
  initialMatches?: Fixture[];
}

export default function LiveScoreTicker({ locale, initialMatches }: LiveScoreTickerProps) {
  const dict = getDictionary(locale);
  const [matches, setMatches] = useState<Fixture[]>(initialMatches || []);
  const [selectedMatch, setSelectedMatch] = useState<Fixture | null>(null);

  // Poll live scores every 30 seconds
  useEffect(() => {
    async function fetchScores() {
      try {
        const res = await fetch('/api/matches?status=LIVE');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.matches)) setMatches(data.matches);
        }
      } catch (err) {
        // silent fallback to current matches
      }
    }
    fetchScores();
    const timer = setInterval(fetchScores, 30000);
    return () => clearInterval(timer);
  }, []);

  if (matches.length === 0) {
    return null;
  }

  return (
    <>
      <div className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur border-b border-brand-800/40 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center h-11 text-xs sm:text-sm">
          {/* Live Badge */}
          <div className="flex items-center gap-1.5 bg-brand-600 px-2.5 py-1 rounded font-bold text-white shrink-0 uppercase tracking-wider text-[11px] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>{dict.ticker.live}</span>
          </div>

          {/* Matches Horizontal Scroll */}
          <div className="flex-1 flex items-center overflow-x-auto no-scrollbar ml-3 space-x-3 divide-x divide-zinc-800">
            {matches.map((match) => (
              <button
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className="pl-3 first:pl-0 flex items-center gap-2 hover:bg-zinc-900/80 py-1 px-2 rounded transition-colors whitespace-nowrap group text-left"
              >
                <span className="text-[10px] uppercase font-semibold text-zinc-400 group-hover:text-brand-400">
                  {match.competition.split(' ')[0]}
                </span>
                
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-zinc-200">{match.homeTeam.shortName}</span>
                  <span className="text-brand-500 font-headline font-black text-sm px-1 bg-zinc-900 rounded border border-zinc-800">
                    {formatScore(match.homeScore, match.awayScore, locale)}
                  </span>
                  <span className="text-zinc-200">{match.awayTeam.shortName}</span>
                </div>

                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5">
                  <Activity className="w-3 h-3 animate-pulse text-emerald-400" />
                  {formatMinute(match.minute, locale)}
                </span>
              </button>
            ))}
          </div>

          {/* Match Center Link */}
          <Link
            href={`/${locale}/matches`}
            className="shrink-0 ml-3 flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-brand-400 transition-colors uppercase tracking-wider"
          >
            <span className="hidden sm:inline">{dict.ticker.viewAllMatches}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Match Details Modal */}
      {selectedMatch && (
        <MatchDetailsModal
          match={selectedMatch}
          locale={locale}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </>
  );
}
