'use client';

import React, { useState } from 'react';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { ShieldCheck, Star } from 'lucide-react';

interface TeamOfTheWeekProps {
  locale: Locale;
}

export default function TeamOfTheWeek({ locale }: TeamOfTheWeekProps) {
  const dict = getDictionary(locale);
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);

  const players = [
    // GK
    { name: 'Alisson', club: 'Liverpool', pos: 'GK', rating: 8.8, x: 50, y: 88 },
    // Defenders
    { name: 'White', club: 'Arsenal', pos: 'RB', rating: 8.4, x: 82, y: 70 },
    { name: 'Topu Barman', club: 'Bashundhara Kings', pos: 'CB', rating: 8.7, x: 62, y: 73 },
    { name: 'Saliba', club: 'Arsenal', pos: 'CB', rating: 8.9, x: 38, y: 73 },
    { name: 'Gvardiol', club: 'Man City', pos: 'LB', rating: 8.5, x: 18, y: 70 },
    // Midfielders
    { name: 'Rodri', club: 'Man City', pos: 'DM', rating: 9.2, x: 50, y: 52 },
    { name: 'De Bruyne', club: 'Man City', pos: 'CM', rating: 9.0, x: 74, y: 46 },
    { name: 'Robinho', club: 'Bashundhara Kings', pos: 'CM', rating: 8.9, x: 26, y: 46 },
    // Forwards
    { name: 'Saka', club: 'Arsenal', pos: 'RW', rating: 9.1, x: 80, y: 22 },
    { name: 'Haaland', club: 'Man City', pos: 'ST', rating: 9.6, x: 50, y: 16 },
    { name: 'Rakib Hossain', club: 'Bashundhara Kings', pos: 'LW', rating: 9.3, x: 20, y: 22 },
  ];

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-white shadow-md flex flex-col">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="font-headline font-black text-lg uppercase tracking-wider text-white">
            {dict.sections.teamOfTheWeek}
          </h3>
        </div>
        <span className="text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded">
          4-3-3
        </span>
      </div>

      {/* Football Pitch Graphic */}
      <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-emerald-900 via-emerald-950 to-zinc-950 rounded-xl border-2 border-emerald-600/40 overflow-hidden shadow-inner flex items-center justify-center select-none">
        {/* Pitch markings */}
        <div className="absolute inset-2 border border-white/20 rounded-lg pointer-events-none" />
        <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-white/20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-white/20 rounded-full pointer-events-none" />
        {/* Penalty boxes */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-36 h-16 border-b border-x border-white/20 pointer-events-none" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-16 border-t border-x border-white/20 pointer-events-none" />

        {/* Players on Pitch */}
        {players.map((p, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedPlayer(p)}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer focus:outline-none"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-900 border-2 border-amber-400 text-amber-300 flex items-center justify-center font-bold text-[10px] sm:text-xs shadow-lg group-hover:scale-110 group-hover:bg-brand-600 group-hover:border-white transition-all">
              {p.pos}
            </div>
            <span className="mt-0.5 bg-black/80 backdrop-blur px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-white rounded whitespace-nowrap shadow">
              {p.name.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Player Detail Card */}
      <div className="mt-3 bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 flex items-center justify-between text-xs">
        {selectedPlayer ? (
          <>
            <div>
              <span className="font-bold text-sm text-zinc-100 block">
                {selectedPlayer.name}
              </span>
              <span className="text-[11px] text-zinc-400">
                {selectedPlayer.club} • {selectedPlayer.pos}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-amber-500/20 text-amber-400 font-bold px-2 py-1 rounded border border-amber-500/30">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{selectedPlayer.rating}</span>
            </div>
          </>
        ) : (
          <span className="text-zinc-500 italic text-center w-full">
            {locale === 'bn' ? 'খেলোয়াড়ের তথ্যের জন্য একাদশে ক্লিক করুন' : 'Click on any position to view details'}
          </span>
        )}
      </div>
    </div>
  );
}