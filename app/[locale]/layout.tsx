import type { Metadata } from 'next';
import { Hind_Siliguri, Inter, Oswald } from 'next/font/google';
import { Locale, locales } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';
import LiveScoreTicker from '@/components/LiveScoreTicker';
import Footer from '@/components/Footer';
import { footballService } from '@/lib/football/service';

const bengaliFont = Hind_Siliguri({
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali', 'latin'],
  variable: '--font-bengali',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const oswald = Oswald({
  weight: ['600', '700'],
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
});

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const dict = getDictionary(params.locale);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${dict.siteName} — ${dict.siteTagline}`,
      template: `%s | ${dict.siteName}`,
    },
    description: dict.siteDescription,
    keywords: [
      'GoalBangla',
      'গোলবাংলা',
      'Football News Bengali',
      'Live Football Scores',
      'Bangladesh Premier League',
      'BPL Live',
      'Premier League Bangla',
      'La Liga Bangla',
      'Champions League Updates',
    ],
    authors: [{ name: 'GoalBangla Newsroom' }],
    alternates: {
      canonical: `/${params.locale}`,
      languages: {
        'bn-BD': '/bn',
        'en-US': '/en',
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },
    openGraph: {
      title: `${dict.siteName} — ${dict.siteTagline}`,
      description: dict.siteDescription,
      url: `${siteUrl}/${params.locale}`,
      siteName: dict.siteName,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${dict.siteName} Football Portal`,
        },
      ],
      locale: params.locale === 'bn' ? 'bn_BD' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${dict.siteName} — ${dict.siteTagline}`,
      description: dict.siteDescription,
      images: ['/og-image.png'],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const liveMatches = await footballService.getLiveScores();

  return (
    <div className={`${bengaliFont.variable} ${inter.variable} ${oswald.variable} font-bengali min-h-screen flex flex-col`}>
      <ThemeProvider>
        {/* Sticky live scores ticker bar */}
        <LiveScoreTicker locale={params.locale} initialMatches={liveMatches} />

        {/* Main Top Header */}
        <Header locale={params.locale} />

        {/* Page Content */}
        <main className="flex-1 w-full">{children}</main>

        {/* Footer */}
        <Footer locale={params.locale} />
      </ThemeProvider>
    </div>
  );
}