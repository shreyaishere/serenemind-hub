# Mindful — AI Wellness Tracker

A modern, full-stack mental-wellness app built with **React + Vite + TypeScript + Tailwind CSS v4** on the frontend and **Supabase** (Postgres, Auth, Storage, RLS) on the backend. Deploys cleanly to **Vercel**.

## Features

- 🔐 **Auth** — Email/password + Google OAuth, password reset, protected routes
- 🧑 **Profile** — Editable profile, avatar upload to Supabase Storage
- 😊 **Mood** — Daily check-ins, emoji + tags + notes, 14-day trend chart
- 📓 **Journal** — Prompts, sentiment heuristic, history
- 🌙 **Sleep** — Hours + quality logging, 30-day bar chart
- 🌿 **Habits** — Weekly grid tracker with archive
- 🎯 **Goals** — Progress sliders, statuses, deadlines
- 📊 **Analytics** — Mood × sleep overlay, habit pie, streaks
- 🧘 **Meditate** — Timer with breathing visual + session history
- 💨 **Breathing** — Box, 4-7-8, and coherent patterns
- ✨ **AI Assistant** — Empathetic wellness chat (OpenAI-compatible)
- 👥 **Community** — Anonymous, pseudonymous posts with likes
- 🆘 **Emergency** — Crisis hotlines + trusted contacts
- ⚙️ **Settings** — Light/dark themes, account, privacy
- 🎨 **Design** — Glassmorphism, framer-motion, fully responsive, dark mode

## Setup

### 1. Install
```bash
npm install
```

### 2. Supabase
1. Create a new project at https://supabase.com.
2. Open **SQL Editor** → paste the contents of `supabase-schema.sql` → **Run**.
3. (Optional) Enable Google OAuth in **Authentication → Providers**.
4. Copy your project URL and anon key.

### 3. Environment
```bash
cp .env.example .env
# fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
# (optional) VITE_AI_API_KEY for the wellness assistant
```

### 4. Run
```bash
npm run dev
```
Visit http://localhost:5173.

## Deploy to Vercel
1. Push the repo to GitHub.
2. Import the repo in Vercel.
3. Add env vars in **Settings → Environment Variables**.
4. Deploy — `vercel.json` configures SPA fallback routing.

## AI Assistant Security
`VITE_AI_API_KEY` is exposed to the browser by Vite convention. For production, replace the client-side call in `src/pages/Assistant.tsx` with a request to a Vercel Edge Function that holds the key server-side.

## Stack
- React 19, Vite 8, TypeScript 5
- Tailwind CSS v4 (OKLCH tokens)
- React Router 6, Zustand, React Hook Form + Zod
- Framer Motion, Recharts, Lucide
- Supabase JS v2
