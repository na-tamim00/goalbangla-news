'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Locale, locales } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { formatLocalizedDate } from '@/lib/i18n/numerals';
import { useTheme } from './ThemeProvider';
import {
  Search,
  Sun,
  Moon,
  Menu,
  X,
  Radio,
  Flame,
  ShieldAlert,
  User,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  locale: Locale;
}

export default function Header({ locale }: HeaderProps) {
  const dict = getDictionary(locale);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Switch locale
  const switchLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;
    document.cookie = `goalbangla_locale=${newLocale}; path=/; max-age=31536000`;
    
    // Replace locale prefix in path
    const segments = pathname.split('/');
    if (segments[1] === 'bn' || segments[1] === 'en') {
      segments[1] = newLocale;
      router.push(segments.join('/'));
    } else {
      router.push(`/${newLocale}`);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const today = formatLocalizedDate(new Date(), locale);

  return (
    <header className="w-full bg-zinc-950 border-b border-zinc-800/80 text-white select-none">
      {/* Top Bar: Date, Trending Flag, Language & Dark Mode */}
      <div className="bg-zinc-900/90 border-b border-zinc-800/50 py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          {/* Left: Date & Newsroom Badge */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-zinc-300 hidden sm:inline">{today}</span>
            <span className="hidden sm:inline text-zinc-700">|</span>
            <div className="flex items-center gap-1.5 text-brand-400 font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
              <span>{locale === 'bn' ? 'তাজা খবর ও সরাসরি সম্প্রচার' : '24/7 Football Breaking Desk'}</span>
            </div>
          </div>

          {/* Right: Language Switcher, Theme Toggle, Admin */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="inline-flex items-center rounded-md bg-zinc-950 p-0.5 border border-zinc-800">
              <button
                onClick={() => switchLocale('bn')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  locale === 'bn'
                    ? 'bg-brand-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => switchLocale('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  locale === 'en'
                    ? 'bg-brand-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={dict.common.themeToggle}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-zinc-300" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Branding & Search Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-3 shrink-0 group">
          <div className="relative h-12 w-48 sm:h-14 sm:w-56">
            <Image
              src="/goalbangla-logo.svg"
              alt="GoalBangla Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Quick Search */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center relative w-72 lg:w-96">
          <input
            type="text"
            placeholder={dict.common.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
        </form>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href={`/${locale}/search`}
            className="p-2 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white"
          >
            <Search className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Navigation League Bar */}
      <nav className="bg-zinc-900/60 border-t border-zinc-800/80 px-4 sm:px-6 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-1 font-bold text-xs uppercase tracking-wider py-1">
            <Link
              href={`/${locale}`}
              className="px-3 py-2 text-zinc-300 hover:text-brand-400 hover:bg-zinc-800/50 rounded transition-colors"
            >
              {dict.nav.home}
            </Link>

            <Link
              href={`/${locale}/leagues/bpl`}
              className="px-3 py-2 text-zinc-300 hover:text-brand-400 hover:bg-zinc-800/50 rounded transition-colors"
            >
              {dict.leagues.bpl}
            </Link>

            <Link
              href={`/${locale}/leagues/premier-league`}
              className="px-3 py-2 text-zinc-300 hover:text-brand-400 hover:bg-zinc-800/50 rounded transition-colors"
            >
              {dict.leagues.pl}
            </Link>

            <Link
              href={`/${locale}/leagues/laliga`}
              className="px-3 py-2 text-zinc-300 hover:text-brand-400 hover:bg-zinc-800/50 rounded transition-colors"
            >
              {dict.leagues.laliga}
            </Link>

            <Link
              href={`/${locale}/leagues/ucl`}
              className="px-3 py-2 text-zinc-300 hover:text-brand-400 hover:bg-zinc-800/50 rounded transition-colors"
            >
              {dict.leagues.ucl}
            </Link>

            <Link
              href={`/${locale}/editorial`}
              className="px-3 py-2 text-zinc-300 hover:text-brand-400 hover:bg-zinc-800/50 rounded transition-colors"
            >
              {dict.nav.editorial}
            </Link>

            <Link
              href={`/${locale}/stats`}
              className="px-3 py-2 text-zinc-300 hover:text-brand-400 hover:bg-zinc-800/50 rounded transition-colors"
            >
              {dict.nav.stats}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-t border-zinc-800 px-5 py-4 space-y-3 font-bold text-sm">
          <Link
            href={`/${locale}`}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-zinc-200 border-b border-zinc-900"
          >
            {dict.nav.home}
          </Link>
          <Link
            href={`/${locale}/leagues/bpl`}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-zinc-300 border-b border-zinc-900"
          >
            {dict.leagues.bpl}
          </Link>
          <Link
            href={`/${locale}/leagues/premier-league`}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-zinc-300 border-b border-zinc-900"
          >
            {dict.leagues.pl}
          </Link>
          <Link
            href={`/${locale}/leagues/laliga`}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-zinc-300 border-b border-zinc-900"
          >
            {dict.leagues.laliga}
          </Link>
          <Link
            href={`/${locale}/editorial`}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-zinc-300 border-b border-zinc-900"
          >
            {dict.nav.editorial}
          </Link>
          <Link
            href={`/${locale}/stats`}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-zinc-300"
          >
            {dict.nav.stats}
          </Link>
        </div>
      )}
    </header>
  );
}