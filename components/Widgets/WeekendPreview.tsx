import React from 'react';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { Calendar, Clock, Trophy } from 'lucide-react';

interface WeekendPreviewProps {
  locale: Locale;
}

export default function WeekendPreview({ locale }: WeekendPreviewProps) {
  const dict = getDictionary(locale);

  const blockbusters = [
    {
      competition: 'Premier League',
      match: 'Liverpool vs Chelsea',
      timeBn: 'শনিবার রাত ১০:৩০',
      timeEn: 'Saturday 10:30 PM BST',
      stadium: 'Anfield',
      hypeBn: 'শীর্ষ চারের লড়াইয়ে মোহামেদ সালাহ বনাম কোল পালমার',
      hypeEn: 'Top-four clash featuring Salah vs Cole Palmer',
    },
    {
      competition: 'Bangladesh Premier League',
      match: 'Dhaka Derby: Abahani vs Mohammedan',
      timeBn: 'রবিবার বিকাল ৩:৪৫',
      timeEn: 'Sunday 3:45 PM BST',
      stadium: 'Bangabandhu Stadium',
      hypeBn: 'ঐতিহ্যবাহী দুই চিরপ্রতিদ্বন্দ্বীর মর্যাদার লড়াই',
      hypeEn: 'Historic grudge match for domestic supremacy',
    },
    {
      competition: 'La Liga',
      match: 'Atlético Madrid vs Real Madrid',
      timeBn: 'রবিবার রাত ১:০০',
      timeEn: 'Sunday 1:00 AM BST',
      stadium: 'Metropolitano',
      hypeBn: 'মাদ্রিদ ডার্বিতে ডিয়েগো সিমিওনের রক্ষণের পরীক্ষা',
      hypeEn: 'Madrid Derby fireworks in the Spanish capital',
    }
  ];

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-5 text-white shadow-md">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-zinc-800">
        <Calendar className="w-5 h-5 text-brand-500" />
        <h3 className="font-headline font-black text-lg uppercase tracking-wider text-white">
          {dict.sections.weekendPreview}
        </h3>
      </div>

      <div className="space-y-3.5">
        {blockbusters.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80 hover:border-brand-600/50 transition-colors"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-brand-400 mb-1">
              <span className="flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                {item.competition}
              </span>
              <span className="text-zinc-400 font-normal">{item.stadium}</span>
            </div>

            <h4 className="font-bold text-sm text-zinc-100 mb-1">{item.match}</h4>

            <p className="text-xs text-zinc-400 mb-2">
              {locale === 'bn' ? item.hypeBn : item.hypeEn}
            </p>

            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
              <Clock className="w-3 h-3" />
              <span>{locale === 'bn' ? item.timeBn : item.timeEn}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}