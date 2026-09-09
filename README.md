# GoalBangla — Multilingual Football News Portal & Editorial CMS
> **ফুটবলের নির্ভীক কণ্ঠস্বর • Football's Trusted Voice**

GoalBangla is a complete, dynamic, production-ready bilingual football news portal built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM** (PostgreSQL / Supabase / Neon compatible). It delivers pitch-side excitement, breaking news, transfer buzz, match center analytics, and tactical breakdowns in both **Bengali (বাংলা)** and **English**.

---

## 🌟 Key Features

### 1. 🇧🇩 Full Bilingual Experience (Bengali & English)
- **Primary Language: Bengali (`bn`)** by default across all UI navigation, article bodies, categories, and match metadata.
- **English (`en`)** bilingual toggle in header with cookie persistence (`goalbangla_locale`).
- **Bengali Numerals Formatter:** Dynamic conversion for scores (e.g. `৩ - ১`), match minutes (`৭৪'`), points, and dates (`৯ সেপ্টেম্বর, ২০২৬`).
- Zero hardcoded UI strings (modular dictionary system ready for more languages).

### 2. ⚡ Live Match Center & Sticky Ticker
- **Sticky Live Score Ticker:** Stays pinned during match hours with pulsing live status and active minute tracking.
- **Match Center:** Real-time scores, lineups, possession bars, shot charts, and event timelines across the Premier League, La Liga, Champions League, and **Bangladesh Premier League (BPL)**.
- **Sports Data Abstraction:** `FootballDataService` supports RapidAPI / API-Football integration with automatic cache and high-fidelity fallback.

### 3. 📰 Sports-Newsroom Visual Design
- **Theme:** High-contrast Crimson Red (`#E11D48`), Pitch Black (`#09090B`), and Clean Slate.
- **Typography:** `Hind Siliguri` for Bengali script, `Oswald` for scoreboard and headline punch, and `Inter` for body copy.
- **Dark Mode Toggle:** Smooth transition persisted via localStorage and cookie.
- **Widgets:**
  - **Weekend Preview:** Curated blockbuster matches.
  - **Team of the Week:** Interactive tactical 4-3-3 pitch board with player ratings and position badges.
  - **Transfer Rumour Mill:** Transfer radar with reliability meter (Verified, Strong Link, Rumour).

### 4. 🛠️ Complete Editorial CMS (`/admin`)
- **Role-Based Access Control (RBAC):** Admin, Editor, and Contributor roles with secure JWT authentication.
- **Unified 4-in-1 Post Types:**
  - **Articles:** Bilingual fields with Markdown editor, tags, categories, and SEO fields.
  - **Video Posts:** Direct video or YouTube/Vimeo/Facebook embeds with video transcript field for SEO.
  - **Audio Posts / Podcasts:** Built-in audio player with show notes and guest bios.
  - **Photo Galleries:** Multi-image albums with per-image Bengali and English captions.
- **Publishing States:** Draft → In Review → Scheduled (with date-time picker) → Published.
- **Central Media Library:** Browse, upload, preview, and 1-click copy asset URLs.
- **Auto Match Report Generator:** Pulls finished match scores and statistics to auto-generate draft articles for human editorial approval.
- **Standings Override Manager:** Emergency manual points/goal difference override if external sports APIs report delays.

### 5. 📲 Social Sharing & SEO
- **Dynamic Open Graph & Twitter Cards:** Per-post, per-language `og:title`, `og:description`, `og:image`, `og:type` (1200x630).
- **On-Page Sharing:** 1-click share buttons for Facebook, WhatsApp, X (Twitter), and Copy Link.
- **Admin Facebook Share:** Pre-filled Facebook share dialog for rapid social media distribution.
- **Structured Data:** JSON-LD schema for `NewsArticle` and `NewsMediaOrganization`.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ or 20+ (Tested on Node.js v24.18.0)
- npm 9+ (Tested on npm 11.16.0)

### 1. Clone or Open Project
```bash
cd C:\Users\nurul\.gemini\antigravity\scratch\goalbangla
```

### 2. Install Dependencies
```bash
npm run install # or npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The app redirects to the default Bengali homepage (`/bn`).

---

## 🔑 Demo Newsroom Credentials

You can test the CMS immediately by visiting `/admin/login`. One-click demo login buttons are provided on the login screen:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@goalbangla.com` | `admin123` | Full access to posts, media, standings override |
| **Editor** | `editor@goalbangla.com` | `editor123` | Can edit/approve any post, auto-match reports |
| **Contributor** | `writer@goalbangla.com` | `writer123` | Can create and edit own posts |

---

## ⚙️ Environment Variables

| Variable | Description | Required? |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon / Supabase / local) | Optional in dev (falls back to pre-seeded repository) |
| `RAPIDAPI_KEY` | RapidAPI API-Football Key | Optional (falls back to realistic built-in simulator) |
| `RAPIDAPI_HOST` | RapidAPI Host (default: `api-football-v1.p.rapidapi.com`) | Optional |
| `JWT_SECRET` | Secret key for signing admin authentication tokens | Recommended |
| `NEXT_PUBLIC_SITE_URL` | Canonical public URL (e.g. `https://goalbangla.netlify.app`) | Recommended |
| `NEXT_PUBLIC_GA_ID` | Google Analytics Measurement ID (e.g. `G-XXXXXXXXXX`) | Optional |

---

## 🌐 Netlify Deployment

This project includes a ready-to-deploy `netlify.toml` configured for `@netlify/plugin-nextjs`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

To deploy:
1. Connect your repository to Netlify.
2. In Netlify Site Settings, add your environment variables (`DATABASE_URL`, `JWT_SECRET`, etc.).
3. Netlify will automatically build and deploy the Next.js App Router application with edge rendering and serverless API handlers.

---

## 📁 Directory Structure

```
goalbangla/
├── app/
│   ├── [locale]/             # Multilingual routes (/bn and /en)
│   │   ├── page.tsx          # Homepage (Hero, News Grid, Widgets)
│   │   ├── matches/          # Live Scores & Match Center
│   │   ├── news/[slug]/      # Article page with SEO & Share buttons
│   │   ├── leagues/[league]/ # Standings, fixtures, and league news
│   │   ├── editorial/        # Tactical analyses & columnists
│   │   ├── stats/            # Standings archive, top scorers, gallery
│   │   ├── search/           # Bilingual search
│   │   ├── about/            # About GoalBangla & contact
│   │   └── layout.tsx        # Locale root layout
│   ├── admin/                # Editorial CMS Panel
│   │   ├── login/            # Admin login
│   │   ├── posts/            # Post list view & filters
│   │   ├── posts/new/        # Post creation
│   │   ├── posts/[id]/edit/  # Post editor
│   │   ├── auto-reports/     # AI Match Report generator
│   │   ├── media/            # Media library
│   │   └── standings-override/# Standings emergency manager
│   └── api/                  # REST API Route Handlers
├── components/               # Reusable UI widgets & layout blocks
├── lib/
│   ├── auth/                 # JWT & RBAC utilities
│   ├── db/                   # Repository & seed data
│   ├── football/             # Football data service abstraction
│   └── i18n/                 # Dictionaries & Bengali numerals
├── prisma/
│   └── schema.prisma         # Portable PostgreSQL schema
├── public/                   # SVG logo, favicon, og-image
└── netlify.toml              # Netlify deployment configuration
```