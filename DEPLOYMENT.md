# GoalBangla — Hybrid Deployment Guide: Netlify (Frontend) + Vercel (Backend)

This guide walks you through deploying **GoalBangla** with:
- **Backend API & Database:** Hosted on **Vercel** (Serverless Route Handlers & Edge Functions)
- **Frontend Portal & CMS:** Hosted on **Netlify** (Global Edge CDN, High-Performance SSR/SSG)

---

## Architecture Overview

```
[ User Browser ]
       │
       ▼
[ Netlify Edge CDN ] (Frontend: https://goalbangla.netlify.app)
       │
       │ Proxies /api/* transparently (via Next.js rewrites)
       ▼
[ Vercel Serverless ] (Backend API: https://goalbangla-backend.vercel.app)
       │
       ▼
[ PostgreSQL Database ] (Supabase / Neon / Render)
```

---

## Prerequisites
1. Free accounts on:
   - [GitHub](https://github.com)
   - [Vercel](https://vercel.com)
   - [Netlify](https://netlify.com)
   - [Neon](https://neon.tech) or [Supabase](https://supabase.com) (for free managed PostgreSQL)
2. Git repository pushed to GitHub.

---

## Step 1: Push Code to GitHub

In your project directory (`C:\Users\nurul\.gemini\antigravity\scratch\goalbangla`):

```bash
# Repo is already linked and pushed to:
# https://github.com/na-tamim00/goalbangla-news.git
git push -u origin main
```

---

## Step 2: Deploy Backend to Vercel

1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** > **"Project"**.
3. Import your **`goalbangla-news`** GitHub repository.
4. Name the project: `goalbangla-backend` (or `goalbangla-api`).
5. Framework Preset: **Next.js** (detected automatically).
6. Under **Environment Variables**, add:
   | Variable | Value | Description |
   |---|---|---|
   | `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` | Neon or Supabase PostgreSQL connection string |
   | `JWT_SECRET` | `your-random-32-char-secret-key-12345!` | Secret used to sign admin session tokens |
   | `RAPIDAPI_KEY` | *(Optional)* Your API-Football key | If left blank, mock football simulator is used |
   | `NEXT_PUBLIC_SITE_URL` | `https://<YOUR_NETLIFY_SUBDOMAIN>.netlify.app` | Netlify frontend URL |

7. Click **Deploy**.
8. Once deployment completes, Vercel gives you your backend URL, for example:
   `https://goalbangla-backend.vercel.app`
9. Test that your backend is alive by visiting in your browser:
   `https://goalbangla-backend.vercel.app/api/matches`
   It should return JSON match data!

---

## Step 3: Deploy Frontend to Netlify

1. Log into your [Netlify Dashboard](https://app.netlify.com).
2. Click **"Add new site"** > **"Import an existing project"**.
3. Select **GitHub** and authorize access to your `goalbangla` repository.
4. Netlify will detect the configuration automatically via `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Plugin:** `@netlify/plugin-nextjs`
5. Under **Environment Variables**, add:
   | Variable | Value | Description |
   |---|---|---|
   | `BACKEND_VERCEL_URL` | `https://goalbangla-backend.vercel.app` | **Your Vercel backend URL from Step 2** |
   | `NEXT_PUBLIC_API_URL` | `https://goalbangla-backend.vercel.app` | Public API URL |
   | `NEXT_PUBLIC_SITE_URL` | `https://<YOUR_NETLIFY_SITE_NAME>.netlify.app` | Your Netlify site URL |
   | `JWT_SECRET` | `your-random-32-char-secret-key-12345!` | Same secret as Vercel for session checks |
   | `NODE_VERSION` | `20` | Node.js runtime version |

6. Click **Deploy goalbangla**.
7. Once deployed, your site will be live at:
   `https://<YOUR_SITE_NAME>.netlify.app`

---

## How It Works Seamlessly

- **Zero CORS Headaches:**
  When a user visits `https://goalbangla.netlify.app`, requests to `/api/*` are transparently proxied by Next.js rewrites to `https://goalbangla-backend.vercel.app/api/*`.
- **First-Party Cookies:**
  Because the browser communicates with `https://goalbangla.netlify.app`, the `goalbangla_session` JWT authentication cookie works with zero cross-site cookie blocking.
- **Direct Access Enabled:**
  If you prefer to call the Vercel backend directly, `vercel.json` and `middleware.ts` provide full CORS headers with credentials enabled (`Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials: true`).

---

## Quick CLI Deployment (Alternative Option)

If you prefer deploying via terminal CLI:

### Deploy Backend to Vercel:
```bash
npx vercel
# Follow prompts to link and deploy project as "goalbangla-backend"
# Set environment variables:
npx vercel env add DATABASE_URL production
npx vercel env add JWT_SECRET production
npx vercel --prod
```

### Deploy Frontend to Netlify:
```bash
# Link or create Netlify site
npx netlify init
# Set the backend URL
npx netlify env:set BACKEND_VERCEL_URL https://goalbangla-backend.vercel.app
npx netlify env:set JWT_SECRET your-random-secret
# Deploy production build
npx netlify deploy --build --prod
```
