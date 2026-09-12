# GoalBangla production deployment

GoalBangla is a full-stack Next.js application. Its pages, API routes, CMS, authentication,
and database access belong in one deployment. Do not run the UI on Netlify while treating a
second copy on Vercel as the backend. That duplicates the server runtime and breaks the expected
same-origin session and data model.

## Recommended topology

- Application: Vercel (`goalbangla.com` and `www.goalbangla.com`)
- PostgreSQL: Neon or Supabase
- Media: Cloudinary
- Live football: API-Football through RapidAPI
- Transactional email: Resend

Netlify can host the entire application instead of Vercel, but should not be an additional
frontend deployment. Pick one production application host.

## Required environment variables

Copy the names from `.env.example` into the production project. At minimum configure:

- `DATABASE_URL` — pooled PostgreSQL URL with SSL enabled
- `JWT_SECRET` — cryptographically random secret of at least 32 characters
- `NEXT_PUBLIC_SITE_URL=https://goalbangla.com`
- `RAPIDAPI_KEY` and `RAPIDAPI_HOST`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY` and `RESEND_FROM_EMAIL`

## Database setup

After creating the database, run once from a trusted terminal:

```bash
npx prisma db push
```

Then deploy. Visit `/admin/setup` once to create the founding administrator. After that account
exists, the setup route locks itself.

## Domain setup (Namecheap + Vercel)

1. Add `goalbangla.com` and `www.goalbangla.com` to the Vercel project.
2. In Namecheap Advanced DNS, use the exact records Vercel displays. Vercel's domain screen is
   authoritative for the required A/CNAME values.
3. Remove conflicting parking or redirect records for `@` and `www`.
4. Make `goalbangla.com` primary and redirect `www` to it.
5. Wait for Vercel to validate both domains and issue TLS.

## Release checks

- `/api/auth/setup` changes from `initialized: false` to `true` after first setup.
- Admin login, published articles, users, media records, and overrides survive redeployment.
- Media uploads return Cloudinary HTTPS URLs.
- `/api/matches?status=LIVE` returns provider data, or an empty array when no match is live.
- Bengali and English URLs, metadata, search, and mobile navigation work.
