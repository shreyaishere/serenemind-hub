# Mindful — AI-Powered Mental Wellness Tracker

A calm, modern wellness companion. Track mood, journal, sleep, habits, and grow with AI-guided insight.

**Stack:** React 19 · Vite · TypeScript · Tailwind v4 · React Router DOM · Supabase (Auth, DB, Storage) · Framer Motion · React Hook Form + Zod · Recharts · Zustand · Lucide · react-hot-toast.

## Phase 1 (this build)

- Design system (light + dark)
- Email / password auth + Google OAuth
- Forgot / reset password
- Protected routes + session persistence
- Profile module with avatar upload (Supabase Storage)
- Dashboard shell with animated cards

Phases 2–4 (mood, journal, sleep, habits, goals, meditation, AI assistant, analytics, emergency) build on this foundation.

## Getting started

```bash
npm install        # or bun install / pnpm install
cp .env.example .env   # then fill in your Supabase values
npm run dev
```

Open http://localhost:8080.

## Supabase setup

1. Create a free project at https://supabase.com.
2. **Project Settings → API** — copy the project URL and `anon` public key into `.env`:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
3. **SQL editor** — paste and run `supabase/migrations/0001_init.sql`. This creates the `profiles` table with Row Level Security, the avatar storage bucket, and the auto-profile trigger.
4. **Authentication → Providers** — enable Email. To enable Google:
   - Toggle Google on.
   - Create OAuth credentials in Google Cloud Console.
   - Set the authorized redirect URI to `https://YOUR_PROJECT.supabase.co/auth/v1/callback`.
   - Paste the client ID + secret into Supabase.
5. **Authentication → URL Configuration** — add your dev and production URLs (e.g. `http://localhost:8080`, `https://your-app.vercel.app`) to both Site URL and Redirect URLs.

## Deploy to Vercel

1. Push to GitHub.
2. Import the repo into Vercel — framework preset auto-detects Vite.
3. Add the two `VITE_SUPABASE_*` env vars in the Vercel project settings.
4. Deploy. SPA routing is handled by `vercel.json`.

## Project structure

```
src/
├── components/      # reusable UI (AuthShell, ProtectedRoute, ThemeToggle, ui/*)
├── contexts/        # AuthContext, ThemeContext
├── layouts/         # AppLayout (sidebar shell for protected pages)
├── lib/             # supabase client, utils
├── pages/           # route components (Landing, Login, Signup, Dashboard, Profile, …)
├── styles/          # globals.css (Tailwind v4 + design tokens)
└── main.tsx
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start Vite dev server on port 8080 |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
