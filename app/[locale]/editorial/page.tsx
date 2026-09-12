import React from 'react';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { repo } from '@/lib/db';
import NewsGrid from '@/components/NewsGrid';
import { BookOpen, Award, Compass } from 'lucide-react';

interface EditorialPageProps {
  params: { locale: Locale };
}

export const revalidate = 60;

export default async function EditorialPage({ params }: EditorialPageProps) {
  const { locale } = params;
  const dict = getDictionary(locale);

  const { posts } = await repo.getPosts({
    status: 'PUBLISHED',
    limit: 20,
  });

  const editorialPosts = posts.filter(
    (p) => p.category === 'OPINION' || p.category === 'TACTICS' || p.category === 'INTERVIEWS'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Editorial Header */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-brand-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-brand-400 uppercase tracking-widest block mb-1">
            GoalBangla Long-Reads & Analysis
          </span>
          <h1 className="font-headline font-black text-3xl sm:text-5xl uppercase tracking-tight">
            {dict.nav.editorial}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-medium max-w-xl">
            {locale === 'bn'
              ? 'কৌশলগত ব্যবচ্ছেদ, কলামিস্টদের কড়া মতামত, খেলোয়াড়দের জীবন ও ক্লাব ইতিহাসের বিশেষ প্রতিবেদন।'
              : 'Tactical breakdowns, opinion pieces, player profiles, and football history deep-dives.'}
          </p>
        </div>
        <BookOpen className="w-16 h-16 text-brand-600/40 hidden sm:block" />
      </div>

      {/* Editorial Grid */}
      <NewsGrid
        posts={editorialPosts.length > 0 ? editorialPosts : posts.slice(0, 6)}
        locale={locale}
        title={dict.nav.editorial}
      />
    </div>
  );
}
