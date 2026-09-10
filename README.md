# GoalBangla — Multilingual Football News Portal & Editorial CMS
> **ফুটবলের নির্ভীক কণ্ঠস্বর • Football's Trusted Voice**

GoalBangla is a complete, dynamic, production-ready bilingual football news portal built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM** (PostgreSQL / Supabase / Neon compatible). It delivers pitch-side excitement, breaking news, transfer buzz, match center analytics, and tactical breakdowns in both **Bengali (বাংলা)** and **English**.

---

## 🌟 Key Features & CMS Architecture

### 1. 🇧🇩 Full Bilingual Experience (Bengali & English)
- **Primary Language: Bengali (`bn`)** by default across all UI navigation, article bodies, categories, and match metadata.
- **English (`en`)** bilingual toggle in header with cookie persistence (`goalbangla_locale`).
- **Bengali Numerals Formatter:** Dynamic conversion for scores (e.g. `৩ - ১`), match minutes (`৭৪'`), points, and dates (`৯ সেপ্টেম্বর, ২০২৬`).
- Zero hardcoded UI strings (modular dictionary system ready for more languages).

### 2. 🛡️ Role-Based Access Control (RBAC)
- **ADMIN**: Full control — create/edit/delete/publish ANY post regardless of author, manage user accounts (create/edit/deactivate accounts, change roles), manage media library, manage standings overrides, view analytics.
- **EDITOR**: Create/edit/publish/delete ANY post regardless of author, manage media library, auto match reports. Cannot manage users.
- **CONTRIBUTOR**: Create/edit their OWN posts only, can submit to "In Review", cannot delete posts, cannot publish directly (publishing requires an Editor or Admin).

### 3. ✍️ Editorial CMS (`/admin`)
- **Consistent Post-Login Dashboard:** All roles land on the same "Editorial Post Manager" (`/admin/posts`) with permission-aware tabs, action buttons, and navigation sidebar.
- **Publisher / Author Reassignment (Ghost & WordPress Pattern):**
  - Metadata panel includes an "Author / Publisher" field.
  - Admin/Editor: searchable dropdown of all registered newsroom members to reassign article attribution.
  - Contributor: locked to themselves (read-only with author name badge).
  - Selected author name displays on the public article byline and news cards.
- **Strapi-Inspired Media Picker:**
  - Replaces raw URL text inputs with a 3-tab upload-or-select component:
    1. **Upload new file:** Drag-and-drop or browse, real-time progress bar (0% - 100%), auto-uploads and auto-fills field.
    2. **Choose from Media Library:** Searchable visual grid of previously uploaded assets with thumbnails.
    3. **Paste external URL:** Fallback for YouTube/Vimeo/Facebook embeds or external CDN URLs.
  - Multi-image **Photo Gallery Manager** with drag-and-drop sequencing, Move Up/Down controls, and bilingual captions.
- **Auto Match Report Generator:** Pulls finished match scores and statistics to auto-generate draft articles for human editorial approval.
- **Standings Override Manager:** Emergency manual points/goal difference override if external sports APIs report delays.

### 4. ⚡ Live Match Center & Sticky Ticker
- **Sticky Live Score Ticker:** Stays pinned during match hours with pulsing live status and active minute tracking.
- **Match Center:** Real-time scores, lineups, possession bars, shot charts, and event timelines across Premier League, La Liga, Champions League, and **Bangladesh Premier League (BPL)**.
- **Sports Data Abstraction:** `FootballDataService` supports RapidAPI / API-Football integration with automatic cache and high-fidelity fallback simulator.

### 5. 📲 Social Sharing & SEO
- **Dynamic Open Graph & Twitter Cards:** Per-post, per-language `og:title`, `og:description`, `og:image`, `og:type` (1200x630).
- **On-Page Sharing:** 1-click share buttons for Facebook, WhatsApp, X (Twitter), and Copy Link.
- **Admin Facebook Share:** Pre-filled Facebook share dialog for rapid social media distribution.
- **Structured Data:** JSON-LD schema for `NewsArticle` and `NewsMediaOrganization`.

---

## 🔑 Demo Newsroom Credentials

You can test each role immediately by visiting `/admin/login`. One-click demo login buttons are provided on the login screen:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@goalbangla.com` | `admin123` | Full access: all posts, user accounts, media, standings override |
| **Editor** | `editor@goalbangla.com` | `editor123` | Edit/publish/delete any post, reassign authors, media library |
| **Contributor** | `writer@goalbangla.com` | `writer123` | Draft & submit own posts for review; no publish or delete privileges |

---

## 🚀 Dual Deployment (Vercel & Netlify from One GitHub Repo)

This is ONE unified Next.js application (no backend/frontend split). It can be deployed simultaneously to both **Vercel** and **Netlify** from the same GitHub repository:

### Repository
- **GitHub Repo:** `https://github.com/na-tamim00/goalbangla-news.git`
- **Branch:** `main`

---

### Step 1: Connect to Vercel
1. Go to **[vercel.com/new](https://vercel.com/new)**.
2. Select your `goalbangla-news` repository.
3. Project Name: `goalbangla` (or `goalbangla-pro`).
4. Framework Preset: **Next.js** (detected automatically).
5. Add the Environment Variables (see table below).
6. Click **Deploy**. Vercel will build and host both the frontend and serverless API handlers on its Edge network.

---

### Step 2: Connect to Netlify
1. Go to **[app.netlify.com/start](https://app.netlify.com/start)**.
2. Select **GitHub** and authorize your `goalbangla-news` repository.
3. Netlify will auto-detect configuration from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Plugin:** `@netlify/plugin-nextjs`
4. Add the Environment Variables (see table below).
5. Click **Deploy Site**.

---

## ⚙️ Unified Environment Variables Table

Enter these environment variables in **BOTH** Vercel and Netlify dashboards (under Project Settings ➔ Environment Variables):

| Variable | Description | Required? | Example Value |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon / Supabase / Render) | Recommended | `postgresql://user:pass@ep-cool-cloud.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | Secret key for signing admin session tokens (32+ chars) | Required | `goalbangla-super-secret-jwt-key-change-in-production-2026` |
| `RAPIDAPI_KEY` | RapidAPI Football key | Optional | `6c94f52dd5msh660ca367b6efd2ep1f9a0djsn88a9e1afd474` |
| `RAPIDAPI_HOST` | RapidAPI Host domain | Optional | `free-api-live-football-data.p.rapidapi.com` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name for media uploads | Optional | `my-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | Optional | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | Optional | `your-cloudinary-secret` |
| `NEXT_PUBLIC_SITE_URL` | Public site domain URL | Recommended | `https://goalbangla.netlify.app` |
| `NODE_VERSION` | Node.js runtime version | Required on Netlify | `20` |

> [!NOTE]
> If no Cloudinary keys are provided, media uploads automatically use local disk storage in development (`public/uploads`) and inline data URIs on serverless platforms, ensuring zero-configuration operation.

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
│   │   ├── (dashboard)/      # Protected dashboard route group
│   │   │   ├── layout.tsx    # Server-side JWT auth guard
│   │   │   ├── AdminShell.tsx# Role-aware navigation sidebar
│   │   │   ├── posts/        # Editorial post manager (permissions & quick actions)
│   │   │   ├── posts/new/    # Post creation with MediaPicker
│   │   │   ├── posts/[id]/edit/ # Post editor with Author reassignment
│   │   │   ├── users/        # Newsroom user management (Admin only)
│   │   │   ├── auto-reports/ # AI Match Report generator
│   │   │   ├── media/        # Central media library with file uploader
│   │   │   └── standings-override/ # Standings emergency manager
│   │   └── page.tsx          # Redirect to /admin/posts
│   └── api/                  # REST API Route Handlers
│       ├── auth/             # Login, logout, session verification
│       ├── posts/            # CRUD operations with role enforcement
│       ├── users/            # Newsroom user administration
│       ├── media/            # Media library & file uploads
│       └── matches/          # Live scores & match reports
├── components/               # Reusable UI widgets & layout blocks
│   ├── AdminUserContext.tsx  # React context for dashboard role & user state
│   ├── MediaPicker.tsx       # 3-tab upload/library/URL media selector
│   ├── GalleryEditor.tsx     # Multi-image photo gallery manager
│   ├── PostEditor.tsx        # Post editor with author attribution & media fields
│   ├── Header.tsx            # Public navigation & language switcher
│   └── Footer.tsx            # Public footer
├── lib/
│   ├── auth/                 # JWT & RBAC utilities
│   ├── db/                   # Repository, seed data & types
│   ├── football/             # Football data service abstraction
│   └── i18n/                 # Dictionaries & Bengali numerals
├── prisma/
│   └── schema.prisma         # Portable PostgreSQL schema
├── public/                   # SVG logo, favicon, og-image, uploads
├── netlify.toml              # Netlify deployment configuration
└── vercel.json               # Vercel deployment configuration
```