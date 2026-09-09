'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { Mail, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  locale: Locale;
}

export default function Footer({ locale }: FooterProps) {
  const dict = getDictionary(locale);

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 text-zinc-400 text-sm mt-16">
      {/* Top Banner with Newsletter */}
      <div className="bg-gradient-to-r from-brand-950 via-zinc-900 to-zinc-950 border-b border-zinc-800/80 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <h3 className="font-headline font-black text-2xl text-white uppercase tracking-wider mb-2">
              {dict.footer.newsletterTitle}
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm">
              {dict.footer.newsletterDesc}
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="flex w-full md:w-auto gap-2">
            <input
              type="email"
              placeholder={dict.footer.newsletterPlaceholder}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-brand-500 w-full sm:w-72"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shrink-0"
            >
              {dict.footer.subscribe}
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand & Bio */}
        <div className="md:col-span-2 space-y-4">
          <div className="relative h-12 w-48">
            <Image
              src="/goalbangla-logo.svg"
              alt="GoalBangla Logo"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-zinc-400 max-w-md">
            {dict.footer.aboutText}
          </p>
          <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-zinc-300">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              <span>{locale === 'bn' ? 'স্বতন্ত্র সাংবাদিকতা' : 'Independent Journalism'}</span>
            </span>
            <span>•</span>
            <span>{locale === 'bn' ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh'}</span>
          </div>
        </div>

        {/* Col 2: Featured Leagues */}
        <div>
          <h4 className="font-headline font-bold text-sm text-zinc-200 uppercase tracking-wider mb-3">
            {dict.footer.popularLeagues}
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href={`/${locale}/leagues/bpl`} className="hover:text-brand-400 transition-colors">
                {dict.leagues.bpl}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/leagues/premier-league`} className="hover:text-brand-400 transition-colors">
                {dict.leagues.pl}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/leagues/laliga`} className="hover:text-brand-400 transition-colors">
                {dict.leagues.laliga}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/leagues/ucl`} className="hover:text-brand-400 transition-colors">
                {dict.leagues.ucl}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/matches`} className="hover:text-brand-400 transition-colors font-bold text-brand-500">
                {dict.nav.liveScores} →
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Navigation & Legal */}
        <div>
          <h4 className="font-headline font-bold text-sm text-zinc-200 uppercase tracking-wider mb-3">
            {dict.footer.quickLinks}
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href={`/${locale}/editorial`} className="hover:text-brand-400 transition-colors">
                {dict.nav.editorial}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/stats`} className="hover:text-brand-400 transition-colors">
                {dict.nav.stats}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/about`} className="hover:text-brand-400 transition-colors">
                {locale === 'bn' ? 'আমাদের সম্পর্কে ও যোগাযোগ' : 'About & Contact'}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-zinc-950 border-t border-zinc-900 py-6 px-4 text-center text-xs text-zinc-500">
        <p>{dict.footer.copyright}</p>
      </div>
    </footer>
  );
}