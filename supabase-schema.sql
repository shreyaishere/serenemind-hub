-- Mindful — Full schema (Phases 1–4)
-- Paste into the Supabase SQL editor on a fresh project, then run.

create extension if not exists "pgcrypto";

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  age int,
  gender text,
  avatar_url text,
  occupation text,
  bio text,
  wellness_goals text,
  timezone text default 'UTC',
  privacy jsonb not null default '{"public_profile": false, "share_anonymously": true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profiles_rw_own" on public.profiles;
create policy "profiles_rw_own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. MOOD ENTRIES
-- ============================================================
create table if not exists public.moods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  score int not null check (score between 1 and 5),
  emoji text,
  tags text[] default '{}',
  note text,
  created_at timestamptz not null default now()
);
create index if not exists moods_user_created_idx on public.moods(user_id, created_at desc);
alter table public.moods enable row level security;
drop policy if exists "moods_rw_own" on public.moods;
create policy "moods_rw_own" on public.moods
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 3. JOURNAL
-- ============================================================
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  content text not null,
  sentiment text,
  word_count int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists journal_user_created_idx on public.journal_entries(user_id, created_at desc);
alter table public.journal_entries enable row level security;
drop policy if exists "journal_rw_own" on public.journal_entries;
create policy "journal_rw_own" on public.journal_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 4. SLEEP LOGS
-- ============================================================
create table if not exists public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  hours numeric(4,2) not null check (hours >= 0 and hours <= 24),
  quality int check (quality between 1 and 5),
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);
create index if not exists sleep_user_date_idx on public.sleep_logs(user_id, date desc);
alter table public.sleep_logs enable row level security;
drop policy if exists "sleep_rw_own" on public.sleep_logs;
create policy "sleep_rw_own" on public.sleep_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 5. HABITS
-- ============================================================
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  emoji text default '🌿',
  color text default '#7c3aed',
  target_per_week int default 7,
  archived boolean default false,
  created_at timestamptz not null default now()
);
create index if not exists habits_user_idx on public.habits(user_id);
alter table public.habits enable row level security;
drop policy if exists "habits_rw_own" on public.habits;
create policy "habits_rw_own" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);
create index if not exists habit_logs_user_date_idx on public.habit_logs(user_id, date desc);
alter table public.habit_logs enable row level security;
drop policy if exists "habit_logs_rw_own" on public.habit_logs;
create policy "habit_logs_rw_own" on public.habit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 6. GOALS
-- ============================================================
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  target_value numeric default 100,
  current_value numeric default 0,
  unit text default '%',
  due_date date,
  status text default 'active' check (status in ('active','completed','paused')),
  created_at timestamptz not null default now()
);
alter table public.goals enable row level security;
drop policy if exists "goals_rw_own" on public.goals;
create policy "goals_rw_own" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 7. MEDITATION SESSIONS
-- ============================================================
create table if not exists public.meditation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'mindfulness',
  duration_seconds int not null,
  completed boolean default true,
  created_at timestamptz not null default now()
);
create index if not exists meditation_user_idx on public.meditation_sessions(user_id, created_at desc);
alter table public.meditation_sessions enable row level security;
drop policy if exists "meditation_rw_own" on public.meditation_sessions;
create policy "meditation_rw_own" on public.meditation_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 8. AI CHAT MESSAGES
-- ============================================================
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists chat_user_created_idx on public.chat_messages(user_id, created_at);
alter table public.chat_messages enable row level security;
drop policy if exists "chat_rw_own" on public.chat_messages;
create policy "chat_rw_own" on public.chat_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 9. COMMUNITY POSTS (anonymous-friendly)
-- ============================================================
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pseudonym text not null default 'Anonymous',
  content text not null,
  mood int check (mood between 1 and 5),
  likes int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists community_created_idx on public.community_posts(created_at desc);
alter table public.community_posts enable row level security;
drop policy if exists "community_select_all" on public.community_posts;
create policy "community_select_all" on public.community_posts
  for select using (auth.role() = 'authenticated');
drop policy if exists "community_insert_own" on public.community_posts;
create policy "community_insert_own" on public.community_posts
  for insert with check (auth.uid() = user_id);
drop policy if exists "community_update_own" on public.community_posts;
create policy "community_update_own" on public.community_posts
  for update using (auth.uid() = user_id);
drop policy if exists "community_delete_own" on public.community_posts;
create policy "community_delete_own" on public.community_posts
  for delete using (auth.uid() = user_id);

create table if not exists public.community_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.community_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
alter table public.community_likes enable row level security;
drop policy if exists "likes_select_all" on public.community_likes;
create policy "likes_select_all" on public.community_likes
  for select using (auth.role() = 'authenticated');
drop policy if exists "likes_insert_own" on public.community_likes;
create policy "likes_insert_own" on public.community_likes
  for insert with check (auth.uid() = user_id);
drop policy if exists "likes_delete_own" on public.community_likes;
create policy "likes_delete_own" on public.community_likes
  for delete using (auth.uid() = user_id);

-- ============================================================
-- 10. EMERGENCY CONTACTS
-- ============================================================
create table if not exists public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  relation text,
  phone text,
  email text,
  created_at timestamptz not null default now()
);
alter table public.emergency_contacts enable row level security;
drop policy if exists "emergency_rw_own" on public.emergency_contacts;
create policy "emergency_rw_own" on public.emergency_contacts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- 11. AVATARS STORAGE
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');
drop policy if exists "avatars_user_write" on storage.objects;
create policy "avatars_user_write" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "avatars_user_update" on storage.objects;
create policy "avatars_user_update" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "avatars_user_delete" on storage.objects;
create policy "avatars_user_delete" on storage.objects
  for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
