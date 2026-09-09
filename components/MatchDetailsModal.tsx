'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { formatMinute, formatScore, toBengaliDigits } from '@/lib/i18n/numerals';
import { Fixture } from '@/lib/football/types';
import { X, Trophy, Activity, Shield, Users, BarChart3, ExternalLink } from 'lucide-react';

interface MatchDetailsModalProps {
  match: Fixture;
  locale: Locale;
  onClose: () => void;
}

export default function MatchDetailsModal({ match, locale, onClose }: MatchDetailsModalProps) {
  const dict = getDictionary(locale);
  const [activeTab, setActiveTab] = useState<'stats' | 'events' | 'lineups'>('stats');

  const homePoss = match.stats?.possession[0] ?? 50;
  const awayPoss = match.stats?.possession[1] ?? 50;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-950 via-zinc-900 to-zinc-950 p-5 border-b border-zinc-800 flex items-center justify-between text-white relative">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-brand-500" />
            <span className="font-bold text-sm tracking-wide uppercase text-zinc-300">
              {match.competition}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scoreboard Board */}
        <div className="bg-zinc-900/60 p-6 border-b border-zinc-800/80">
          <div className="grid grid-cols-3 items-center text-center">
            {/* Home Team */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-brand-600/30 flex items-center justify-center font-black text-xl text-white shadow-lg mb-2">
                {match.homeTeam.shortName}
              </div>
              <h3 className="font-bold text-sm sm:text-base text-zinc-100">
                {match.homeTeam.name}
              </h3>
            </div>

            {/* Score & Status */}
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center gap-1.5 bg-brand-600/20 text-brand-400 border border-brand-500/30 px-3 py-0.5 rounded-full text-xs font-bold uppercase mb-2">
                <Activity className="w-3.5 h-3.5 animate-pulse text-brand-500" />
                <span>{match.status === 'LIVE' ? formatMinute(match.minute, locale) : match.status}</span>
              </div>
              <div className="font-headline font-black text-4xl sm:text-5xl text-white tracking-wider">
                {formatScore(match.homeScore, match.awayScore, locale)}
              </div>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-brand-600/30 flex items-center justify-center font-black text-xl text-white shadow-lg mb-2">
                {match.awayTeam.shortName}
              </div>
              <h3 className="font-bold text-sm sm:text-base text-zinc-100">
                {match.awayTeam.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-zinc-800 bg-zinc-950 px-4 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'stats'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{dict.stats.possession} & {dict.stats.shots}</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'events'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{dict.stats.events}</span>
          </button>

          <button
            onClick={() => setActiveTab('lineups')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'lineups'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{dict.stats.lineup}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-zinc-300 text-sm">
          {activeTab === 'stats' && (
            <div className="space-y-4">
              {/* Possession Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-400 mb-1.5">
                  <span>{locale === 'bn' ? `${toBengaliDigits(homePoss)}%` : `${homePoss}%`}</span>
                  <span className="uppercase text-zinc-300">{dict.stats.possession}</span>
                  <span>{locale === 'bn' ? `${toBengaliDigits(awayPoss)}%` : `${awayPoss}%`}</span>
                </div>
                <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                  <div style={{ width: `${homePoss}%` }} className="bg-brand-600 transition-all duration-500" />
                  <div style={{ width: `${awayPoss}%` }} className="bg-zinc-600 transition-all duration-500" />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="space-y-3 pt-2">
                {[
                  {
                    label: dict.stats.shots,
                    home: match.stats?.shots[0] ?? 0,
                    away: match.stats?.shots[1] ?? 0,
                  },
                  {
                    label: dict.stats.shotsOnTarget,
                    home: match.stats?.shotsOnTarget[0] ?? 0,
                    away: match.stats?.shotsOnTarget[1] ?? 0,
                  },
                  {
                    label: dict.stats.corners,
                    home: match.stats?.corners[0] ?? 0,
                    away: match.stats?.corners[1] ?? 0,
                  },
                  {
                    label: dict.stats.fouls,
                    home: match.stats?.fouls[0] ?? 0,
                    away: match.stats?.fouls[1] ?? 0,
                  },
                  {
                    label: dict.stats.yellowCards,
                    home: match.stats?.yellowCards[0] ?? 0,
                    away: match.stats?.yellowCards[1] ?? 0,
                  },
                ].map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs border-b border-zinc-800/60 pb-2">
                    <span className="font-bold text-zinc-200 text-sm w-8 text-left">
                      {locale === 'bn' ? toBengaliDigits(stat.home) : stat.home}
                    </span>
                    <span className="text-zinc-400 font-medium">{stat.label}</span>
                    <span className="font-bold text-zinc-200 text-sm w-8 text-right">
                      {locale === 'bn' ? toBengaliDigits(stat.away) : stat.away}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-3">
              {(!match.events || match.events.length === 0) && (
                <div className="text-center py-6 text-zinc-500 text-xs">
                  {dict.common.noResults}
                </div>
              )}
              {(match.events || []).map((event, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-2.5 rounded-lg border ${
                    event.type === 'GOAL'
                      ? 'bg-brand-950/40 border-brand-800/60 text-white'
                      : 'bg-zinc-900/40 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <span className="font-headline font-bold text-brand-500 px-2 py-0.5 bg-zinc-900 rounded text-xs">
                    {formatMinute(event.minute, locale)}
                  </span>
                  <div className="flex-1">
                    <div className="font-bold text-sm flex items-center gap-2">
                      {event.type === 'GOAL' && <span>⚽</span>}
                      {event.type === 'YELLOW_CARD' && <span>🟨</span>}
                      {event.type === 'RED_CARD' && <span>🟥</span>}
                      <span>{event.player}</span>
                      <span className="text-xs text-zinc-400 font-normal">
                        ({event.team === 'home' ? match.homeTeam.name : match.awayTeam.name})
                      </span>
                    </div>
                    {event.detail && (
                      <p className="text-xs text-zinc-400 mt-0.5">{event.detail}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'lineups' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Home Starting XI */}
              <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                <div className="font-bold text-brand-400 mb-2 border-b border-zinc-800 pb-1 flex justify-between">
                  <span>{match.homeTeam.name}</span>
                  <span>{match.lineup?.home?.formation || '4-3-3'}</span>
                </div>
                <div className="space-y-1.5">
                  {(match.lineup?.home?.startingXI || []).map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-zinc-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-5 text-zinc-500 font-mono">
                          {locale === 'bn' ? toBengaliDigits(p.number) : p.number}
                        </span>
                        <span>{p.name}</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 uppercase">{p.position}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Away Starting XI */}
              <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                <div className="font-bold text-brand-400 mb-2 border-b border-zinc-800 pb-1 flex justify-between">
                  <span>{match.awayTeam.name}</span>
                  <span>{match.lineup?.away?.formation || '4-3-3'}</span>
                </div>
                <div className="space-y-1.5">
                  {(match.lineup?.away?.startingXI || []).map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-zinc-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-5 text-zinc-500 font-mono">
                          {locale === 'bn' ? toBengaliDigits(p.number) : p.number}
                        </span>
                        <span>{p.name}</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 uppercase">{p.position}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Link */}
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex justify-end">
          <Link
            href={`/${locale}/matches`}
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors uppercase"
          >
            <span>{dict.ticker.viewAllMatches}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}