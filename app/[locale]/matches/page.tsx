'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Locale } from '@/lib/i18n/config';

interface MatchesPageProps {
  params: { locale: Locale };
}

export default function MatchesPage({ params }: MatchesPageProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${params.locale}`);
  }, [router, params.locale]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
    </div>
  );
}