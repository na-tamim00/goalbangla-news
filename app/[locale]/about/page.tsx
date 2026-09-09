'use client';
import React from 'react';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { ShieldCheck, Mail, MapPin, Phone, Users, CheckCircle } from 'lucide-react';

interface AboutPageProps {
  params: { locale: Locale };
}

export default function AboutPage({ params }: AboutPageProps) {
  const { locale } = params;
  const dict = getDictionary(locale);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
          {locale === 'bn' ? 'আমাদের পরিচিতি ও অঙ্গীকার' : 'About GoalBangla & Newsroom'}
        </span>
        <h1 className="font-headline font-black text-3xl sm:text-5xl text-zinc-950 dark:text-white uppercase tracking-tight">
          {locale === 'bn' ? 'ফুটবলের নির্ভীক স্বাধীন প্ল্যাটফর্ম' : "Football's Most Passionate Voice"}
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          {locale === 'bn'
            ? 'গোলবাংলা হলো বাংলাদেশের ফুটবল অনুরাগী পাঠকদের জন্য নির্মিত আধুনিক ডিজিটাল ক্রীড়া সাংবাদিকতার কেন্দ্র।'
            : 'GoalBangla is the premier digital newsroom dedicated to delivering authentic, tactical, and rapid football journalism in Bengali and English.'}
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
            {locale === 'bn' ? 'নির্ভরযোগ্য তথ্য' : 'Verified Accuracy'}
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {locale === 'bn'
              ? 'হলুদ সাংবাদিকতা কিংবা অনুমাননির্ভর ভুল খবরের বিপরীতে মাঠের প্রতিটি তথ্য আমরা যাচাই করে প্রকাশ করি।'
              : 'Every transfer rumour and tactical report is rigorously cross-verified by our editors.'}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
            {locale === 'bn' ? 'বাংলাদেশ ফুটবল অগ্রাধিকার' : 'BPL & Grassroots First'}
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {locale === 'bn'
              ? 'ইউরোপীয় ফুটবলের রোমাঞ্চের পাশাপাশি বাংলাদেশ প্রিমিয়ার লিগ ও জাতীয় দলের প্রতিটি মুহূর্তের পুঙ্খানুপুঙ্খ কাভারেজ।'
              : 'Dedicated on-the-ground reporting for the Bangladesh Premier League and national team.'}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
            {locale === 'bn' ? 'দ্বিভাষিক উন্মুক্ততা' : 'Full Bilingual Coverage'}
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {locale === 'bn'
              ? 'সহজ বাংলা ও সাবলীল ইংরেজিতে একই মানের কনটেন্ট পড়ার সম্পূর্ণ স্বাধীনতা।'
              : 'Seamless toggle between Bengali and English across articles, scores, and statistics.'}
          </p>
        </div>
      </div>

      {/* Editorial Masthead */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-white space-y-6">
        <h3 className="font-headline font-black text-2xl uppercase tracking-wider border-b border-zinc-800 pb-3">
          {locale === 'bn' ? 'সম্পাদকীয় প্যানেল ও নিউজরুম' : 'Editorial Masthead'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <span className="text-xs font-bold text-brand-400 uppercase block mb-1">Editor-in-Chief</span>
            <h4 className="font-bold text-base text-zinc-100">তানভীর আহমেদ (Tanvir Ahmed)</h4>
            <p className="text-xs text-zinc-400">tanvir@goalbangla.com</p>
          </div>
          <div>
            <span className="text-xs font-bold text-brand-400 uppercase block mb-1">Senior Match Analyst</span>
            <h4 className="font-bold text-base text-zinc-100">মাহমুদুল হাসান (Mahmudul Hasan)</h4>
            <p className="text-xs text-zinc-400">mahmud@goalbangla.com</p>
          </div>
          <div>
            <span className="text-xs font-bold text-brand-400 uppercase block mb-1">BPL & Domestic Desk</span>
            <h4 className="font-bold text-base text-zinc-100">রাকিবুল ইসলাম (Rakibul Islam)</h4>
            <p className="text-xs text-zinc-400">rakib@goalbangla.com</p>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm space-y-6">
        <div>
          <h3 className="font-headline font-black text-2xl text-zinc-900 dark:text-white uppercase tracking-tight mb-1">
            {locale === 'bn' ? 'যোগাযোগ ও সংবাদ টিপস পাঠান' : 'Contact Us & Send News Tips'}
          </h3>
          <p className="text-xs text-zinc-500">
            {locale === 'bn'
              ? 'আপনার কোনো পরামর্শ, প্রশ্ন বা মাঠে ঘটে যাওয়া ঘটনার খবর সরাসরি পাঠাতে পারেন আমাদের নিউজরুমে।'
              : 'Have a story lead, correction, or business inquiry? Reach our desk directly.'}
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                {locale === 'bn' ? 'আপনার নাম' : 'Your Name'}
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                {locale === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
              </label>
              <input
                type="email"
                placeholder="you@domain.com"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
              {locale === 'bn' ? 'বার্তা বা খবরের বিবরণ' : 'Message or Story Details'}
            </label>
            <textarea
              rows={4}
              placeholder={locale === 'bn' ? 'আপনার বার্তা এখানে লিখুন...' : 'Write your message here...'}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-md"
          >
            {locale === 'bn' ? 'বার্তা পাঠান' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}