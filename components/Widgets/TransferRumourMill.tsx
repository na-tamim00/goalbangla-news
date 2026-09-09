import React from 'react';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { RefreshCw, ArrowRight } from 'lucide-react';

interface TransferRumourMillProps {
  locale: Locale;
}

export default function TransferRumourMill({ locale }: TransferRumourMillProps) {
  const dict = getDictionary(locale);

  const rumours = [
    {
      player: 'Rodri',
      from: 'Man City',
      to: 'Real Madrid',
      fee: '€120M',
      confidence: 85,
      statusBn: 'উন্নত আলোচনা চলছে',
      statusEn: 'Advanced Talks',
      tagColor: 'bg-emerald-950 text-emerald-400 border-emerald-800',
    },
    {
      player: 'Robinho',
      from: 'Bashundhara Kings',
      to: 'Al-Rayyan SC',
      fee: '$2.5M',
      confidence: 70,
      statusBn: 'প্রস্তাব বিবেচনাধীন',
      statusEn: 'Bid Submitted',
      tagColor: 'bg-amber-950 text-amber-400 border-amber-800',
    },
    {
      player: 'Rafael Leão',
      from: 'AC Milan',
      to: 'PSG',
      fee: '€130M',
      confidence: 50,
      statusBn: 'প্রাথমিক গুঞ্জন',
      statusEn: 'Early Speculation',
      tagColor: 'bg-rose-950 text-rose-400 border-rose-800',
    }
  ];

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-white shadow-md">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-800">
        <RefreshCw className="w-5 h-5 text-brand-500 animate-spin-slow" />
        <h3 className="font-headline font-black text-lg uppercase tracking-wider text-white">
          {dict.sections.transferRumourMill}
        </h3>
      </div>

      <div className="space-y-3.5">
        {rumours.map((r, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-sm text-zinc-100">{r.player}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${r.tagColor}`}>
                {locale === 'bn' ? r.statusBn : r.statusEn}
              </span>
            </div>

            {/* Club A -> Club B */}
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 mb-2">
              <span>{r.from}</span>
              <ArrowRight className="w-3 h-3 text-brand-500" />
              <span className="text-brand-400">{r.to}</span>
              <span className="ml-auto text-zinc-400 font-mono">{r.fee}</span>
            </div>

            {/* Reliability Progress Bar */}
            <div>
              <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                <span>{locale === 'bn' ? 'বিশ্বাসযোগ্যতা' : 'Reliability'}</span>
                <span>{r.confidence}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${r.confidence}%` }}
                  className="h-full bg-gradient-to-r from-brand-600 to-amber-500 rounded-full"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}