import { supabase } from "./supabase";
import { format, subDays, startOfDay } from "date-fns";

export type Mood = { id: string; user_id: string; score: number; emoji: string | null; tags: string[]; note: string | null; created_at: string };
export type Journal = { id: string; user_id: string; title: string | null; content: string; sentiment: string | null; word_count: number; created_at: string; updated_at: string };
export type Sleep = { id: string; user_id: string; date: string; hours: number; quality: number | null; note: string | null; created_at: string };
export type Habit = { id: string; user_id: string; name: string; emoji: string; color: string; target_per_week: number; archived: boolean; created_at: string };
export type HabitLog = { id: string; user_id: string; habit_id: string; date: string; created_at: string };
export type Goal = { id: string; user_id: string; title: string; description: string | null; target_value: number; current_value: number; unit: string; due_date: string | null; status: "active" | "completed" | "paused"; created_at: string };
export type Meditation = { id: string; user_id: string; kind: string; duration_seconds: number; completed: boolean; created_at: string };
export type Post = { id: string; user_id: string; pseudonym: string; content: string; mood: number | null; likes: number; created_at: string };
export type Contact = { id: string; user_id: string; name: string; relation: string | null; phone: string | null; email: string | null; created_at: string };
export type ChatMsg = { id: string; user_id: string; role: "user" | "assistant" | "system"; content: string; created_at: string };

export const today = () => format(new Date(), "yyyy-MM-dd");

export const listMoods = (limit = 50) =>
  supabase.from("moods").select("*").order("created_at", { ascending: false }).limit(limit);

export const addMood = (m: { user_id: string; score: number; emoji?: string; tags?: string[]; note?: string }) =>
  supabase.from("moods").insert(m);

export const listJournals = (limit = 100) =>
  supabase.from("journal_entries").select("*").order("created_at", { ascending: false }).limit(limit);

export const addJournal = (j: { user_id: string; title?: string; content: string; sentiment?: string }) =>
  supabase.from("journal_entries").insert({ ...j, word_count: j.content.trim().split(/\s+/).length });

export const deleteJournal = (id: string) => supabase.from("journal_entries").delete().eq("id", id);

export const listSleep = (days = 30) =>
  supabase.from("sleep_logs").select("*").gte("date", format(subDays(new Date(), days), "yyyy-MM-dd")).order("date", { ascending: true });

export const upsertSleep = (s: { user_id: string; date: string; hours: number; quality?: number; note?: string }) =>
  supabase.from("sleep_logs").upsert(s, { onConflict: "user_id,date" });

export const listHabits = () => supabase.from("habits").select("*").eq("archived", false).order("created_at");
export const addHabit = (h: { user_id: string; name: string; emoji?: string; color?: string }) => supabase.from("habits").insert(h);
export const deleteHabit = (id: string) => supabase.from("habits").update({ archived: true }).eq("id", id);

export const listHabitLogs = (days = 30) =>
  supabase.from("habit_logs").select("*").gte("date", format(subDays(new Date(), days), "yyyy-MM-dd"));

export const toggleHabitLog = async (user_id: string, habit_id: string, date: string) => {
  const { data } = await supabase.from("habit_logs").select("id").eq("habit_id", habit_id).eq("date", date).maybeSingle();
  if (data) return supabase.from("habit_logs").delete().eq("id", data.id);
  return supabase.from("habit_logs").insert({ user_id, habit_id, date });
};

export const listGoals = () => supabase.from("goals").select("*").order("created_at", { ascending: false });
export const addGoal = (g: { user_id: string; title: string; description?: string; target_value?: number; unit?: string; due_date?: string }) =>
  supabase.from("goals").insert(g);
export const updateGoal = (id: string, patch: Partial<Goal>) => supabase.from("goals").update(patch).eq("id", id);
export const deleteGoal = (id: string) => supabase.from("goals").delete().eq("id", id);

export const addMeditation = (m: { user_id: string; kind: string; duration_seconds: number }) =>
  supabase.from("meditation_sessions").insert(m);
export const listMeditations = (limit = 30) =>
  supabase.from("meditation_sessions").select("*").order("created_at", { ascending: false }).limit(limit);

export const listPosts = (limit = 50) =>
  supabase.from("community_posts").select("*").order("created_at", { ascending: false }).limit(limit);
export const addPost = (p: { user_id: string; pseudonym?: string; content: string; mood?: number }) =>
  supabase.from("community_posts").insert(p);
export const deletePost = (id: string) => supabase.from("community_posts").delete().eq("id", id);
export const togglePostLike = async (user_id: string, post_id: string) => {
  const { data } = await supabase.from("community_likes").select("user_id").eq("user_id", user_id).eq("post_id", post_id).maybeSingle();
  if (data) {
    await supabase.from("community_likes").delete().eq("user_id", user_id).eq("post_id", post_id);
    return supabase.rpc("noop").then(async () => {
      const { data: p } = await supabase.from("community_posts").select("likes").eq("id", post_id).maybeSingle();
      return supabase.from("community_posts").update({ likes: Math.max(0, (p?.likes ?? 1) - 1) }).eq("id", post_id);
    });
  }
  await supabase.from("community_likes").insert({ user_id, post_id });
  const { data: p } = await supabase.from("community_posts").select("likes").eq("id", post_id).maybeSingle();
  return supabase.from("community_posts").update({ likes: (p?.likes ?? 0) + 1 }).eq("id", post_id);
};

export const listContacts = () => supabase.from("emergency_contacts").select("*").order("created_at");
export const addContact = (c: { user_id: string; name: string; relation?: string; phone?: string; email?: string }) =>
  supabase.from("emergency_contacts").insert(c);
export const deleteContact = (id: string) => supabase.from("emergency_contacts").delete().eq("id", id);

export const listChat = (limit = 100) =>
  supabase.from("chat_messages").select("*").order("created_at", { ascending: true }).limit(limit);
export const addChat = (m: { user_id: string; role: "user" | "assistant" | "system"; content: string }) =>
  supabase.from("chat_messages").insert(m);
export const clearChat = (user_id: string) => supabase.from("chat_messages").delete().eq("user_id", user_id);

// Simple sentiment heuristic — no AI needed
export const quickSentiment = (text: string): "positive" | "neutral" | "negative" => {
  const t = text.toLowerCase();
  const pos = ["happy", "grateful", "calm", "joy", "love", "great", "good", "excited", "peace", "hopeful", "proud"];
  const neg = ["sad", "anxious", "angry", "tired", "stress", "fear", "lonely", "bad", "upset", "overwhelm", "hate"];
  const p = pos.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0);
  const n = neg.reduce((n2, w) => n2 + (t.includes(w) ? 1 : 0), 0);
  if (p > n) return "positive";
  if (n > p) return "negative";
  return "neutral";
};

export const computeStreak = (dates: string[]): number => {
  if (!dates.length) return 0;
  const set = new Set(dates.map((d) => d.slice(0, 10)));
  let streak = 0;
  let cur = startOfDay(new Date());
  while (set.has(format(cur, "yyyy-MM-dd"))) {
    streak++;
    cur = subDays(cur, 1);
  }
  return streak;
};
