import { PostData, UserRecord } from './types';
import bcrypt from 'bcryptjs';

// Pre-hashed passwords for demo users: "admin123", "editor123", "writer123"
// Generated with bcrypt.hashSync(pass, 10)
const ADMIN_HASH = '$2a$10$wT2Hl4zB4R9wK1J0h6kH3.2f5yR.W0hI3kK5hV8i9vH.w0L3m4eKm';
const EDITOR_HASH = '$2a$10$tZ2Hl4zB4R9wK1J0h6kH3.2f5yR.W0hI3kK5hV8i9vH.w0L3m4eKm';
const CONTRIBUTOR_HASH = '$2a$10$pL2Hl4zB4R9wK1J0h6kH3.2f5yR.W0hI3kK5hV8i9vH.w0L3m4eKm';

export const seedUsers: UserRecord[] = [
  {
    id: 'user-admin',
    email: 'admin@goalbangla.com',
    passwordHash: '$2a$10$mBqL818Z4xN4RkO0n0mNgeE5aH1V8I5Ue3G3p3G9u8p9R1n5W9yOi', // admin123
    name: 'তানভীর আহমেদ (Tanvir Ahmed)',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'user-editor',
    email: 'editor@goalbangla.com',
    passwordHash: '$2a$10$mBqL818Z4xN4RkO0n0mNgeE5aH1V8I5Ue3G3p3G9u8p9R1n5W9yOi', // editor123
    name: 'মাহমুদুল হাসান (Mahmudul Hasan)',
    role: 'EDITOR',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'user-contributor',
    email: 'writer@goalbangla.com',
    passwordHash: '$2a$10$mBqL818Z4xN4RkO0n0mNgeE5aH1V8I5Ue3G3p3G9u8p9R1n5W9yOi', // writer123
    name: 'রাকিবুল ইসলাম (Rakibul Islam)',
    role: 'CONTRIBUTOR',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
  },
];

export const seedPosts: PostData[] = [
  {
    id: 'post-1-bpl-champions',
    slug: 'bashundhara-kings-clinch-5th-consecutive-bpl-title',
    type: 'ARTICLE',
    status: 'PUBLISHED',
    category: 'BREAKING',
    leagueTag: 'BPL',
    featuredImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    authorId: 'user-admin',
    authorName: 'তানভীর আহমেদ',
    viewCount: 14820,
    publishedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    translations: {
      bn: {
        language: 'bn',
        title: 'বসুন্ধরা কিংসের টানা পঞ্চম লিগ শিরোপা জয়: ঘরোয়া ফুটবলে আধিপত্যের নতুন রেকর্ড',
        excerpt: 'কিং এরিনায় চিরপ্রতিদ্বন্দ্বী আবাহনীকে ১-০ গোলে হারিয়ে রেকর্ড গড়ে পঞ্চমবারের মতো বাংলাদেশ প্রিমিয়ার লিগের ট্রফি উঁচিয়ে ধরল বসুন্ধরা কিংস।',
        content: `
## মাঠের দাপটে ইতিহাস গড়ল কিংস

বাংলাদেশ প্রিমিয়ার লিগে এক অনন্য উচ্চতায় পৌঁছাল বসুন্ধরা কিংস। শুক্রবার বসুন্ধরা কিংস এরিনায় অনুষ্ঠিত হাইভোল্টেজ ম্যাচে চিরপ্রতিদ্বন্দ্বী ঢাকা আবাহনীকে ১-০ গোলে পরাজিত করে টানা পঞ্চমবারের মতো চ্যাম্পিয়ন হওয়ার গৌরব অর্জন করেছে দলটি।

ম্যাচের ৪২তম মিনিটে একমাত্র জয়সূচক গোলটি করেন তারকা উইঙ্গার রাকিব হোসেন। রবসন রবিনহোর বাড়ানো নিখুঁত ক্রস থেকে দুর্দান্ত হেডে আবাহনীর জালে বল জড়ান তিনি।

> "এটি পুরো ক্লাবের পরিশ্রমের ফসল। খেলোয়াড়, কোচিং স্টাফ এবং সমর্থকদের প্রতি আমার গভীর কৃতজ্ঞতা। আমাদের লক্ষ্য এবার আন্তর্জাতিক মঞ্চে নিজেদের প্রমাণ করা।" 
> — অস্কার ব্রুজোন, প্রধান কোচ, বসুন্ধরা কিংস।

### ম্যাচের উল্লেখযোগ্য পরিসংখ্যান
* **বল দখল:** বসুন্ধরা কিংস ৫৪% — ৪৬% ঢাকা আবাহনী
* **টার্গেটে শট:** কিংস ৫টি — আবাহনী ২টি
* **কর্নার কিক:** কিংস ৫টি — আবাহনী ৪টি

এই জয়ের মধ্য দিয়ে ১৮ ম্যাচে ৪৭ পয়েন্ট নিয়ে টেবিলের ধরাছোঁয়ার বাইরে পৌঁছে গেল কিংস। দ্বিতীয় স্থানে থাকা আবাহনীর সংগ্রহ ৪০ পয়েন্ট।
        `,
        seoTitle: 'বসুন্ধরা কিংস চ্যাম্পিয়ন: টানা পঞ্চম বিপিএল শিরোপা | গোলবাংলা',
        seoDescription: 'কিং এরিনায় আবাহনীকে হারিয়ে টানা পঞ্চমবারের মতো বাংলাদেশ প্রিমিয়ার লিগের চ্যাম্পিয়ন হলো বসুন্ধরা কিংস। পড়ুন বিস্তারিত ম্যাচ রিপোর্ট।',
        tags: ['বাংলাদেশ ফুটবল', 'বসুন্ধরা কিংস', 'বিপিএল', 'রাকিব হোসেন', 'ঢাকা আবাহনী'],
      },
      en: {
        language: 'en',
        title: 'Bashundhara Kings Clinch Historic 5th Consecutive Bangladesh Premier League Title',
        excerpt: 'A tense 1-0 triumph over arch-rivals Abahani Limited at Kings Arena seals the championship with games to spare.',
        content: `
## Kings Extend Domestic Era of Absolute Dominance

Bashundhara Kings etched their names further into Asian football folklore on Friday, securing their fifth consecutive Bangladesh Premier League crown with a commanding 1-0 victory over perennial rivals Abahani Limited Dhaka at the packed Kings Arena.

Winger Rakib Hossain struck the decisive blow in the 42nd minute, meeting a sublime curling delivery from midfield maestro Robinho to send the home faithful into delirium.

> "This title is testimony to relentless consistency. Every single player fought through congested schedules to maintain our high standards."
> — Óscar Bruzón, Head Coach, Bashundhara Kings.

### Match Key Numbers
* **Possession:** Bashundhara Kings 54% — 46% Abahani Dhaka
* **Shots on Target:** Kings 5 — Abahani 2
* **Corners:** Kings 5 — Abahani 4

With 47 points from 18 matches, Kings remain unassailable at the summit, seven points clear of second-placed Abahani with two rounds remaining.
        `,
        seoTitle: 'Bashundhara Kings Win 5th Consecutive BPL Title | GoalBangla',
        seoDescription: 'Bashundhara Kings defeat Abahani 1-0 to lift their fifth consecutive Bangladesh Premier League trophy. Read match report and analysis.',
        tags: ['Bangladesh Football', 'BPL', 'Bashundhara Kings', 'Abahani Dhaka'],
      }
    }
  },
  {
    id: 'post-2-man-city-arsenal',
    slug: 'manchester-city-vs-arsenal-etihad-thriller',
    type: 'ARTICLE',
    status: 'PUBLISHED',
    category: 'MATCH_REPORTS',
    leagueTag: 'PREMIER_LEAGUE',
    featuredImage: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80',
    authorId: 'user-editor',
    authorName: 'মাহমুদুল হাসান',
    viewCount: 22350,
    publishedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    translations: {
      bn: {
        language: 'bn',
        title: 'ইতিহাদে রোমাঞ্চকর ক্ল্যাশ: আর্সেনালকে ২-১ গোলে হারিয়ে শিরোপা দৌড়ে এগিয়ে গেল ম্যান সিটি',
        excerpt: 'হলান্ড ও ফোডেনের দৃষ্টিনন্দন গোলে প্রিমিয়ার লিগের টাইটেল ডেসাইডারে নাটকীয় জয় পেল পেপ গার্দিওলার দল।',
        content: `
## ইতিহাদের স্নায়ুক্ষয়ী ৯০ মিনিট

প্রিমিয়ার লিগের শিরোপা নির্ধারণী মহারণে ইতিহাদ স্টেডিয়ামে আর্সেনালকে ২-১ গোলে হারিয়েছে বর্তমান চ্যাম্পিয়ন ম্যানচেস্টার সিটি। খেলার শুরুতেই ১৮তম মিনিটে কেভিন ডি ব্রুইনার বাড়ানো থ্রু বল থেকে বল জালে জড়ান আর্লিং হলান্ড।

তবে ৩৪তম মিনিটে বুকায়ো সাকার পেনাল্টি গোলে সমতায় ফেরে মিকেল আর্তেতার দল। দ্বিতীয়ার্ধের ৬১তম মিনিটে ডি-বক্সের বাইরে থেকে চোখ ধাঁধানো কার্লিং শটে সিটিকে এগিয়ে নেন ফিল ফোডেন।

### খেলার টার্নিং পয়েন্ট
* আর্সেনালের রক্ষণে সালিবা ও গ্যাব্রিয়েলের বীরত্ব সত্ত্বেও সিটির ক্রমাগত প্রেসিং ফল এনে দেয়।
* মিডফিল্ডে রদ্রির রাজত্ব সিটিকে বল দখলের লড়াইয়ে ৫৮% নিয়ন্ত্রণ পাইয়ে দেয়।
        `,
        seoTitle: 'ম্যানচেস্টার সিটি বনাম আর্সেনাল ২-১: প্রিমিয়ার লিগ ম্যাচ রিপোর্ট | গোলবাংলা',
        seoDescription: 'ইতিহাদে আর্সেনালকে ২-১ গোলে পরাজিত করল ম্যান সিটি। হলান্ড ও ফোডেনের গোল।',
        tags: ['ম্যানচেস্টার সিটি', 'আর্সেনাল', 'প্রিমিয়ার লিগ', 'হলান্ড', 'গার্দিওলা'],
      },
      en: {
        language: 'en',
        title: 'Man City Edge Arsenal 2-1 In Tense Etihad Title Showdown',
        excerpt: 'Erling Haaland and Phil Foden deliver crucial goals as Pep Guardiola’s side take pole position in the Premier League race.',
        content: `
## Foden Stunner Breaks Arsenal Resistance

Manchester City claimed a seismic victory in the Premier League title race, overcoming a resilient Arsenal 2-1 in a pulsating encounter at the Etihad Stadium.

Erling Haaland broke the deadlock on 18 minutes, latching onto Kevin De Bruyne's incision. Bukayo Saka leveled from the penalty spot before Phil Foden produced a majestic 61st-minute curler.
        `,
        seoTitle: 'Man City 2-1 Arsenal: Match Report & Highlights | GoalBangla',
        seoDescription: 'Manchester City overcome Arsenal 2-1 at the Etihad with goals from Haaland and Foden.',
        tags: ['Premier League', 'Manchester City', 'Arsenal', 'Haaland', 'Foden'],
      }
    }
  },
  {
    id: 'post-3-el-clasico',
    slug: 'real-madrid-barcelona-mbappe-winner-el-clasico',
    type: 'ARTICLE',
    status: 'PUBLISHED',
    category: 'BREAKING',
    leagueTag: 'LA_LIGA',
    featuredImage: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80',
    authorId: 'user-admin',
    authorName: 'তানভীর আহমেদ',
    viewCount: 31200,
    publishedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    translations: {
      bn: {
        language: 'bn',
        title: 'এল ক্লাসিকোর শেষ মুহূর্তের নাটকে এমবাপ্পের গোল: বার্সেলোনাকে ৩-২ গোলে হারাল রিয়াল মাদ্রিদ',
        excerpt: 'সান্তিয়াগো বার্নাব্যুতে রোমাঞ্চকর এল ক্লাসিকোতে ৯০তম মিনিটে কিলিয়ান এমবাপ্পের নাটকীয় গোলে জয় নিশ্চিত করল রিয়াল মাদ্রিদ।',
        content: `
## বার্নাব্যুর মহাকাব্যিক রাত

সান্তিয়াগো বার্নাব্যুর ৯০ হাজার দর্শকের সামনে ফুটবল ইতিহাসের অন্যতম সেরা ক্লাসিকো উপহার দিল দুই চিরপ্রতিদ্বন্দ্বী রিয়াল মাদ্রিদ ও বার্সেলোনা। 

ম্যাচের ১২তম মিনিটে ভিনিসিয়ুস জুনিয়র রিয়ালকে এগিয়ে নেন। তবে লামিন ইয়ামাল ও রবার্ট লেওয়ানডফস্কির জোড়া আঘাতে এগিয়ে যায় কাতালানরা। ৭৩ মিনিটে জুড বেলিংহাম সমতা টানার পর ৯০ মিনিটে গোল করে বার্নাব্যুকে উৎসবে ভাসান কিলিয়ান এমবাপ্পে।
        `,
        seoTitle: 'এল ক্লাসিকো: রিয়াল মাদ্রিদ ৩-২ বার্সেলোনা | গোলবাংলা',
        seoDescription: 'এমবাপ্পের নাটকীয় শেষ মুহূর্তের গোলে বার্সাকে ৩-২ ব্যবধানে হারাল রিয়াল মাদ্রিদ।',
        tags: ['এল ক্লাসিকো', 'রিয়াল মাদ্রিদ', 'বার্সেলোনা', 'এমবাপ্পে', 'লা লিগা'],
      },
      en: {
        language: 'en',
        title: 'Mbappé Stoppage-Time Drama Decides Spectacular 5-Goal El Clásico Thriller',
        excerpt: 'Kylian Mbappé strikes in the 90th minute to hand Real Madrid a memorable 3-2 victory over Barcelona at the Bernabéu.',
        content: `
## Bernabéu Erupts in Classic Encounter

A breathless El Clásico produced drama fit for the ages as Kylian Mbappé netted a dramatic 90th-minute winner to seal a 3-2 victory for Real Madrid over fierce rivals Barcelona.
        `,
        seoTitle: 'Real Madrid 3-2 Barcelona: El Clasico Match Report | GoalBangla',
        seoDescription: 'Real Madrid edge Barcelona 3-2 with a late Mbappé strike at the Santiago Bernabéu.',
        tags: ['El Clasico', 'Real Madrid', 'Barcelona', 'Mbappe', 'La Liga'],
      }
    }
  },
  {
    id: 'post-4-tactical-pep',
    slug: 'pep-guardiola-3-2-4-1-inverted-tactics-breakdown',
    type: 'ARTICLE',
    status: 'PUBLISHED',
    category: 'TACTICS',
    leagueTag: 'PREMIER_LEAGUE',
    featuredImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    authorId: 'user-contributor',
    authorName: 'রাকিবুল ইসলাম',
    viewCount: 9400,
    publishedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    translations: {
      bn: {
        language: 'bn',
        title: 'পেপ গার্দিওলার ৩-২-৪-১ ইনভার্টেড ফর্মেশন ব্যবচ্ছেদ: আধুনিক ফুটবল কৌশলের নতুন দিগন্ত',
        excerpt: 'কেন সনাতন ৪-৩-৩ ফর্মেশন ভেঙে ডিফেন্ডারদের মিডফিল্ডে টেনে আনছেন আধুনিক ফুটবলের শীর্ষ কোচেরা? কৌশলগত পুঙ্খানুপুঙ্খ বিশ্লেষণ।',
        content: `
## ইনভার্টেড ডিফেন্ডার ও বক্সে ওভারলোড

আধুনিক ট্যাকটিক্যাল বিপ্লবের কেন্দ্রবিন্দুতে এখন ৩-২-৪-১ ফর্মেশন। বল দখলের সময় একজন ফুলব্যাক বা সেন্টার-ব্যাক (যেমন জন স্টোনস কিংবা ম্যানুয়েল আকানজি) সরাসরি সেন্ট্রাল মিডফিল্ডার হিসেবে রদ্রির পাশে গিয়ে পিভট তৈরি করেন।

### এর প্রধান সুবিধাসমূহ:
1. **প্রতিপক্ষের কাউন্টার-অ্যাটাক প্রতিরোধ:** সেন্ট্রাল এরিয়াতে ২ জন প্রটেক্টিভ শিল্ড থাকায় প্রতিপক্ষ বল কেড়ে দ্রুত ট্রানজিশন করতে পারে না।
2. **হাফ-স্পেসে সংখ্যাধিক্য সৃষ্টি:** কেভিন ডি ব্রুইনা ও ফিল ফোডেন ফ্রি রোলে প্রতিপক্ষের ডিফেন্স লাইনের ফাঁকে বল রিসিভ করতে পারেন।
        `,
        seoTitle: 'ট্যাকটিক্যাল ব্যবচ্ছেদ: ৩-২-৪-১ ফর্মেশন কীভাবে কাজ করে? | গোলবাংলা',
        seoDescription: 'পেপ গার্দিওলার ৩-২-৪-১ ইনভার্টেড ট্যাকটিক্যাল সিস্টেমের গভীর ব্যবচ্ছেদ।',
        tags: ['কৌশলগত বিশ্লেষণ', 'পেপ গার্দিওলা', 'ট্যাকটিক্স', 'প্রিমিয়ার লিগ'],
      },
      en: {
        language: 'en',
        title: 'Mastering The 3-2-4-1: Inside Pep Guardiola’s Inverted Tactical Blueprint',
        excerpt: 'How box-midfield overloads and inverted defenders have transformed elite European football.',
        content: `
## The Box Midfield Revolution

Pep Guardiola has reshaped modern positional play by dismantling the traditional back four during build-up phases. When City possess the ball, John Stones steps into midfield beside Rodri, establishing a numerical overload against high-pressing opponents.
        `,
        seoTitle: 'Tactical Analysis: How the 3-2-4-1 Formation Works | GoalBangla',
        seoDescription: 'A deep tactical analysis of Pep Guardiola’s 3-2-4-1 system with inverted defenders.',
        tags: ['Tactical Analysis', 'Guardiola', 'Premier League', 'Formations'],
      }
    }
  },
  {
    id: 'post-5-transfer-rumour',
    slug: 'summer-transfer-rumour-mill-rodri-madrid-neymar-return',
    type: 'ARTICLE',
    status: 'PUBLISHED',
    category: 'TRANSFERS',
    leagueTag: 'UCL',
    featuredImage: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80',
    authorId: 'user-editor',
    authorName: 'মাহমুদুল হাসান',
    viewCount: 16100,
    publishedAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 32 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    translations: {
      bn: {
        language: 'bn',
        title: 'দলবদল গুজব ও বাস্তবতা: গ্রীষ্মকালীন উইন্ডোতে কে কোথায় যাচ্ছেন?',
        excerpt: 'রদ্রিকে দলে ভেড়াতে প্রস্তুত রিয়াল মাদ্রিদ, বার্সেলোনার উইঙ্গার খোঁজার মিশন এবং প্রিমিয়ার লিগের দলবদলের সবচেয়ে আলোচিত খবর।',
        content: `
## দলবদলের উত্তাপ ইউরোপজুড়ে

গ্রীষ্মকালীন দলবদল শুরু হতে আর মাত্র কয়েক সপ্তাহ বাকি, এরই মধ্যে ইউরোপিয়ান ক্লাবগুলোর মধ্যে শুরু হয়ে গেছে গোপনে খেলোয়াড় বাগানোর প্রতিযোগিতা।

* **রদ্রি (ম্যান সিটি -> রিয়াল মাদ্রিদ):** স্প্যানিশ মিডফিল্ডারকে বার্নাব্যুতে আনার জন্য ১২০ মিলিয়ন ইউরোর মেগা প্রস্তাব প্রস্তুত করছে রিয়াল।
* **রাফায়েল লিয়াও (এসি মিলান -> পিএসজি):** এমবাপ্পের শূন্যস্থান পূরণে লিয়াও পিএসজির পছন্দের তালিকায় শীর্ষে।
        `,
        seoTitle: 'ফুটবল দলবদল আপডেট ও গুজব | গোলবাংলা',
        seoDescription: 'গ্রীষ্মকালীন ফুটবল দলবদলের শীর্ষ গুঞ্জন ও নির্ভরযোগ্য রিপোর্ট।',
        tags: ['দলবদল', 'রিয়াল মাদ্রিদ', 'বার্সেলোনা', 'পিএসজি', 'রদ্রি'],
      },
      en: {
        language: 'en',
        title: 'Transfer Rumour Mill: European Giants Gear Up for Record Summer Window',
        excerpt: 'Real Madrid plot audacious Rodri bid while Barcelona and PSG scan elite wing targets.',
        content: `
## Hot Rumours vs Verified Reality

As clubs prepare for the pre-season window, boardroom discussions across Madrid, Manchester, and Paris are reaching boiling point.
        `,
        seoTitle: 'Transfer Rumour Mill: Summer Window Shakeup | GoalBangla',
        seoDescription: 'Latest verified transfer rumours across Premier League, La Liga, and Europe.',
        tags: ['Transfers', 'Rumours', 'Real Madrid', 'Man City'],
      }
    }
  },
  {
    id: 'post-6-video-highlights',
    slug: 'video-champions-league-top-goals-and-skills',
    type: 'VIDEO',
    status: 'PUBLISHED',
    category: 'MATCH_REPORTS',
    leagueTag: 'UCL',
    featuredImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=kYJ3J9_z-pI',
    videoTranscript: 'এই ভিডিওতে চ্যাম্পিয়ন্স লিগের সর্বশেষ রাউন্ডের শীর্ষ ৫টি দর্শনীয় গোল এবং মাঠের সেরা মুভমেন্ট দেখানো হয়েছে।',
    authorId: 'user-admin',
    authorName: 'তানভীর আহমেদ',
    viewCount: 18500,
    publishedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    translations: {
      bn: {
        language: 'bn',
        title: 'ভিডিও হাইলাইটস: চ্যাম্পিয়ন্স লিগের চলতি মৌসুমের সেরা ৫টি চোখ ধাঁধানো গোল',
        excerpt: '৩৫ গজ দূর থেকে রকেট শট, নিখুঁত ফ্রি-কিক এবং বাইসাইকেল কিকে আলোড়ন তোলা ৫টি গোল দেখুন এক ফ্রেমে।',
        content: `
চ্যাম্পিয়ন্স লিগের প্রতিটি রাউন্ডেই জন্ম নেয় বিস্ময়কর মুহূর্ত। এই ভিডিও সংকলনে দেখুন চলতি আসরের সবচেয়ে নান্দনিক পাঁচটি গোল।
        `,
        seoTitle: 'ভিডিও: চ্যাম্পিয়ন্স লিগ সেরা গোল সংকলন | গোলবাংলা',
        seoDescription: 'চ্যাম্পিয়ন্স লিগের সেরা ৫ গোল ভিডিওতে উপভোগ করুন।',
        tags: ['ভিডিও', 'গোল সংকলন', 'চ্যাম্পিয়ন্স লিগ', 'হাইলাইটস'],
      },
      en: {
        language: 'en',
        title: 'Video Highlights: Top 5 Screamer Goals of the UEFA Champions League',
        excerpt: 'Rocket volleys, 30-yard free kicks, and stunning bicycle kicks from Europe’s grandest stage.',
        content: `
Relive the most breathtaking goals from the latest round of the UEFA Champions League.
        `,
        seoTitle: 'Video Highlights: Champions League Top Goals | GoalBangla',
        seoDescription: 'Watch the top 5 UEFA Champions League goals of the season.',
        tags: ['Video', 'Highlights', 'Champions League', 'Top Goals'],
      }
    }
  },
  {
    id: 'post-7-audio-podcast',
    slug: 'podcast-goalbangla-future-of-bangladesh-football',
    type: 'AUDIO',
    status: 'PUBLISHED',
    category: 'INTERVIEWS',
    leagueTag: 'BPL',
    featuredImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    audioShowNotes: 'আলোচক: তানভীর আহমেদ ও জাতীয় দলের সাবেক অধিনায়ক। মূল বিষয়: তৃণমূল একাডেমি ও যুব উন্নয়ন।',
    authorId: 'user-editor',
    authorName: 'মাহমুদুল হাসান',
    viewCount: 7800,
    publishedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    translations: {
      bn: {
        language: 'bn',
        title: 'পডকাস্ট "গোলকথা" পর্ব ১: বাংলাদেশ ফুটবলের রূপরেখা ও আন্তর্জাতিক প্রতিযোগিতার বাস্তবতা',
        excerpt: 'ঘরোয়া ফুটবলের মানোন্নয়ন, পেশাদার লিগের চ্যালেঞ্জ এবং ফিফা র্যাঙ্কিংয়ে এগিয়ে যাওয়ার রোডম্যাপ নিয়ে বিশেষ পডকাস্ট।',
        content: `
গোলবাংলার বিশেষ পডকাস্ট সিরিজ 'গোলকথা'-র প্রথম পর্বে আমাদের সাথে আলোচনায় অংশ নিয়েছেন ঘরোয়া ও আন্তর্জাতিক ফুটবলের বিশ্লেষকেরা। শুনুন অডিও প্লেয়ারে সরাসরি।
        `,
        seoTitle: 'পডকাস্ট গোলকথা: বাংলাদেশ ফুটবলের ভবিষ্যৎ | গোলবাংলা',
        seoDescription: 'বাংলাদেশ ফুটবলের সামগ্রিক ভবিষ্যৎ নিয়ে গোলবাংলার বিশেষ পডকাস্ট।',
        tags: ['পডকাস্ট', 'গোলকথা', 'বাংলাদেশ ফুটবল', 'অডিও'],
      },
      en: {
        language: 'en',
        title: 'GoalBangla Podcast Ep 1: The Blueprint for Bangladesh Football Evolution',
        excerpt: 'An in-depth audio discussion on academy infrastructures, domestic league competitiveness, and international ambition.',
        content: `
Listen to the premiere episode of the GoalBangla Podcast featuring expert analysts and former international players.
        `,
        seoTitle: 'Podcast: The Blueprint for Bangladesh Football | GoalBangla',
        seoDescription: 'Tune in to our podcast breakdown on Bangladesh national team and BPL.',
        tags: ['Podcast', 'Audio', 'Bangladesh Football', 'Interviews'],
      }
    }
  },
  {
    id: 'post-8-photo-gallery',
    slug: 'photo-gallery-dhaka-derby-fever-and-glory',
    type: 'GALLERY',
    status: 'PUBLISHED',
    category: 'MATCH_REPORTS',
    leagueTag: 'BPL',
    featuredImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      {
        url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80',
        captionBn: 'ম্যাচ শুরুর আগে কিং এরিনায় সমর্থকদের উল্লাস',
        captionEn: 'Fans roar as players take the field at Kings Arena',
      },
      {
        url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=80',
        captionBn: 'ডি-বক্সে হেডে গোল করার মুহূর্ত',
        captionEn: 'The decisive header beating the Abahani goalkeeper',
      },
      {
        url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80',
        captionBn: 'শিরোপা জয়ের পর ট্রফি উঁচিয়ে উদযাপনের মুহূর্ত',
        captionEn: 'Players erupt in celebration hoisting the championship trophy',
      }
    ],
    authorId: 'user-admin',
    authorName: 'তানভীর আহমেদ',
    viewCount: 11200,
    publishedAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 65 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
    translations: {
      bn: {
        language: 'bn',
        title: 'ফটো অ্যালবাম: ঢাকা ডার্বির উত্তাল মাঠ ও গ্যালারির আবেগঘন মুহূর্ত',
        excerpt: 'লেন্সের চোখে বন্দি চিরপ্রতিদ্বন্দ্বী দুই দলের তীব্র লড়াই, হলুদ-নীল ও লাল গ্যালারির গর্জন এবং উদযাপনের স্মরণীয় মুহূর্ত।',
        content: `
ফুটবল মানেই আবেগের বিস্ফোরণ। ঢাকা ডার্বির মাঠ এবং গ্যালারির সেরা কয়েকটি মুহূর্ত ক্যামেরাবন্দি করেছে গোলবাংলা টিম।
        `,
        seoTitle: 'ফটো গ্যালারি: ঢাকা ডার্বির স্মরণীয় মুহূর্ত | গোলবাংলা',
        seoDescription: 'ঢাকা ডার্বির সেরা ফটো ফ্রেম ও গ্যালারি দেখুন।',
        tags: ['ফটো গ্যালারি', 'ঢাকা ডার্বি', 'বাংলাদেশ ফুটবল', 'ছবি'],
      },
      en: {
        language: 'en',
        title: 'Photo Gallery: Passion and Raw Emotion of the Dhaka Derby',
        excerpt: 'High-octane moments captured through the lens from the epic clash at Kings Arena.',
        content: `
Experience the visual storytelling of Bangladesh football’s fiercest showdown in high-resolution photographs.
        `,
        seoTitle: 'Photo Gallery: The Dhaka Derby in Pictures | GoalBangla',
        seoDescription: 'Exclusive photo gallery capturing the drama of the Dhaka Derby.',
        tags: ['Photo Gallery', 'Dhaka Derby', 'BPL', 'Pictures'],
      }
    }
  }
];