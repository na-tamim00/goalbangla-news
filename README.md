# GoalBangla — Multilingual Football News Portal & Editorial CMS
> **ফুটবলের নির্ভীক কণ্ঠস্বর • Football's Trusted Voice**

GoalBangla is a complete, dynamic, production-ready bilingual football news portal built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM** (PostgreSQL / Supabase / Neon compatible). It delivers pitch-side excitement, breaking news, transfer buzz, match center analytics, and tactical breakdowns in both **Bengali (বাংলা)** and **English**.

---

## 🌟 Key Features & CMS Architecture

### 1. 🇧🇩 Full Bilingual Experience (Bengali & English)
- **Primary Language: Bengali (`bn`)** by default across all UI navigation, article bodies, categories, and match metadata.
- **English (`en`)** bilingual toggle in header with cookie persistence (`goalbangla_locale`).
- **Bengali Numerals Formatter:** Dynamic conversion for scores (e.g. `৩ - ১`), match minutes (`৭৪'`), points, and dates (`১২ সেপ্টেম্বর, ২০২৬`).
- Zero hardcoded UI strings (modular dictionary system).

### 2. 🛡️ Hierarchical Role Model & Decoupled Byline Titles
- **ADMIN (Single Super Admin):**
  - The founding owner and sole administrator.
  - Has unconstrained authority across the portal: can create **Sub-Admin** and **Contributor** accounts.
  - Creating a second Admin is prohibited across forms and APIs. Super Admin rights can only be passed via a deliberate **"Transfer Super Admin Ownership"** confirmation flow.
- **SUB_ADMIN:**
  - Content authority: can create, edit, approve, publish, and delete any post across the newsroom.
  - Can access the Media Library, Auto Match Reports, and Standings Overrides.
  - **Account Creation Privileges:** Can create new **Contributor** accounts (enforced server-side: rejected with `403 Forbidden` if attempting to create Sub-Admins or Admins).
- **CONTRIBUTOR:**
  - Can only draft and edit their own articles.
  - Must submit articles to **In Review** for editorial approval (cannot publish directly or delete articles).
- **Decoupled Public Byline Title (`displayTitle`):**
  - Free-text designation (e.g. *"Senior Football Correspondent"*, *"Tactical Analyst"*, *"Staff Columnist"*, *"Contributing Author"*).
  - Decoupled from permission roles: a user with Contributor-tier permissions can be displayed as "Author" on public bylines without granting destructive publish/delete privileges.

---

### 3. 🚀 Zero-Credential First-Run Setup (`/admin/setup`)
- **No hardcoded demo passwords or seeded logins in production code.**
- On initial startup, the application checks if zero users exist in the database.
- If zero users exist, any visit to `/admin` or `/admin/login` redirects to `/admin/setup` (**"Create Your Admin Account"**).
- Prompts for Full Name (default prefilled to *"Habibur Rahman Khan"*), Gmail address (`@gmail.com`), and a secure password.
- Upon submission, creates the founding Super Admin with `status: ACTIVE` and logs them straight into the dashboard.
- Once an administrator exists, `/admin/setup` is permanently unreachable (redirects to `/admin/login`).

---

### 4. ✉️ Gmail 6-Digit Verification Code Flow
- **Transactional Delivery:**
  - Powered by an `EmailService` provider abstraction with **Resend** as the default provider (`RESEND_API_KEY`).
  - Delivers a single-use 6-digit numeric verification code (hashed, valid for 15 minutes, max 3 attempts).
- **Environment Safeguards:**
  - **In Development / Local:** If `RESEND_API_KEY` is not set, the code is logged clearly to the server console and displayed in an interactive test banner in the Admin UI.
  - **In Production:** If `RESEND_API_KEY` is not configured, account creation is blocked with a clear error rather than creating an unverifiable account.
- **Account Verification Page (`/admin/verify-email`):**
  - Unverified accounts (`PENDING_VERIFICATION`) cannot sign in with passwords until their 6-digit code is confirmed.
  - Includes code entry, invalid attempt counters, and a **"Resend Code"** action.
  - Administrators and Sub-Admins can also click **"Resend Code"** directly from the `/admin/users` management table.

---

### 5. ✍️ Editorial Post Manager & Strapi Media Picker
- **Strapi-Inspired 3-Tab Media Picker:**
  1. **Upload New File:** Drag-and-drop or file browse with real-time upload progress indicator.
  2. **Media Library:** Searchable visual thumbnail grid of existing assets.
  3. **Paste URL:** Fallback for YouTube/Vimeo/Facebook embeds or external CDNs.
- **Photo Gallery Manager:** Multi-image gallery builder with drag-and-drop sequencing and bilingual captions.
- **Ghost/WordPress Author Selector:** Searchable dropdown for Admins and Sub-Admins to attribute articles to any registered newsroom member.

---

## ⚙️ Unified Environment Variables Table

Set these environment variables identically on **BOTH** Vercel and Netlify dashboards (Project Settings ➔ Environment Variables):

| Variable | Description | Required? | Example Value |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string (**MUST be identical on both platforms**) | **Required** | `postgresql://user:pass@ep-cool-cloud.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | Secret key for signing admin session tokens (32+ characters) | **Required** | `goalbangla-super-secret-production-jwt-key-2026-min32` |
| `RESEND_API_KEY` | Resend API Key for sending Gmail verification codes | **Required** | `re_123456789_abcdefghijklmnopqrstuvwxyz` |
| `RESEND_FROM_EMAIL` | Sender email address for transactional codes | Optional | `GoalBangla Newsroom <onboarding@resend.dev>` |
| `NEXT_PUBLIC_SITE_URL`| Canonical domain URL | Recommended | `https://goalbangla.netlify.app` |
| `RAPIDAPI_KEY` | RapidAPI Football key for live match scores | Optional | `6c94f52dd5msh660ca367b6efd2ep1f9a0djsn88a9e1afd474` |
| `RAPIDAPI_HOST` | RapidAPI Host domain | Optional | `free-api-live-football-data.p.rapidapi.com` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name for image uploads | Optional | `my-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | Optional | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | Optional | `your-cloudinary-secret` |
| `NODE_VERSION` | Node.js runtime version | Required on Netlify | `20` |

> [!CRITICAL]
> **Database Unification Rule:**
> You must enter the **exact same `DATABASE_URL`** on both Vercel and Netlify. If different databases are used, articles and users created on one platform will not exist on the other.

---

## 🚀 Dual Deployment (Vercel & Netlify from One GitHub Repo)

This is a single unified Next.js application (no frontend/backend code split) deploying to two platforms from the same repository:
- **Repository:** `https://github.com/na-tamim00/goalbangla-news.git`
- **Branch:** `main`

### Step 1: Deploy to Vercel
1. Go to **[vercel.com/new](https://vercel.com/new)**.
2. Import the `na-tamim00/goalbangla-news` repository.
3. Framework Preset: **Next.js** (detected automatically).
4. Enter the Environment Variables from the table above (`DATABASE_URL`, `JWT_SECRET`, `RESEND_API_KEY`, etc.).
5. Click **Deploy**. Vercel will build and assign a live `*.vercel.app` URL.

### Step 2: Deploy to Netlify
1. Go to **[app.netlify.com/start](https://app.netlify.com/start)**.
2. Select **GitHub** and authorize `na-tamim00/goalbangla-news`.
3. Netlify will auto-detect settings from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Plugin:** `@netlify/plugin-nextjs`
4. Enter the exact same Environment Variables from the table above.
5. Click **Deploy Site**. Netlify will build and assign a live `*.netlify.app` URL.

---

## 🧪 Testing Checklist on Fresh Deployment
1. **First-Run Screen:** Navigate to `/admin` on your live URL. If your database is fresh, you will see the **"Create Your Super Admin Account"** screen.
2. **Setup Admin:** Create your founding admin account with Habibur Rahman Khan and your Gmail. You will be logged straight into `/admin/posts`.
3. **Lockout Check:** Open an incognito window and visit `/admin/setup` — confirm it redirects to `/admin/login`.
4. **Hierarchical Accounts:** Go to `/admin/users` and create a Sub-Admin account. Confirm the 6-digit code is dispatched via Resend.
5. **Verification:** Try logging in as the Sub-Admin before entering the code (confirm 403 blocks entry), then enter the 6-digit code on `/admin/verify-email` to unlock.