import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Smile, Moon, Activity, BookHeart, Target, Sparkles, ArrowRight, Brain } from "lucide-react";
import { format, subDays, parseISO } from "date-fns";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import {
  computeStreak, listGoals, listHabitLogs, listHabits, listJournals, listMoods, listSleep,
  type Goal, type HabitLog, type Habit, type Journal, type Mood, type Sleep,
} from "@/lib/api";

export default function Dashboard() {
  const { user } = useAuth();
  const name = (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? "there";

  const [moods, setMoods] = useState<Mood[]>([]);
  const [sleep, setSleep] = useState<Sleep[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);

  useEffect(() => {
    (async () => {
      const [m, s, h, l, g, j] = await Promise.all([listMoods(100), listSleep(7), listHabits(), listHabitLogs(7), listGoals(), listJournals(30)]);
      if (m.data) setMoods(m.data as Mood[]);
      if (s.data) setSleep(s.data as Sleep[]);
      if (h.data) setHabits(h.data as Habit[]);
      if (l.data) setLogs(l.data as HabitLog[]);
      if (g.data) setGoals(g.data as Goal[]);
      if (j.data) setJournals(j.data as Journal[]);
    })();
  }, []);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayMood = moods.find((m) => m.created_at.startsWith(today));
  const lastSleep = sleep[sleep.length - 1];
  const habitsDoneToday = logs.filter((l) => l.date === today).length;
  const activeGoals = goals.filter((g) => g.status === "active").length;
  const journalStreak = computeStreak(journals.map((j) => j.created_at));
  const moodStreak = computeStreak(moods.map((m) => m.created_at));

  const moodTrend = (() => {
    const map = new Map<string, { sum: number; n: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd");
      map.set(d, { sum: 0, n: 0 });
    }
    moods.forEach((m) => {
      const d = m.created_at.slice(0, 10);
      const row = map.get(d);
      if (row) { row.sum += m.score; row.n++; }
    });
    return Array.from(map.entries()).map(([d, v]) => ({ date: format(parseISO(d), "EE"), mood: v.n ? v.sum / v.n : null }));
  })();

  const wellnessScore = (() => {
    const m = moods.slice(0, 7).reduce((s, x) => s + x.score, 0) / Math.max(1, Math.min(7, moods.length));
    const sl = sleep.slice(-7).reduce((s, x) => s + Number(x.hours), 0) / Math.max(1, sleep.length);
    const h = habits.length ? habitsDoneToday / habits.length : 0;
    const norm = ((m / 5) * 0.5 + Math.min(1, sl / 8) * 0.3 + h * 0.2) * 100;
    return moods.length ? Math.round(norm) : null;
  })();

  const cards = [
    { label: "Today's mood", value: todayMood?.emoji ?? "—", hint: todayMood ? "Logged" : "Log your mood", icon: Smile, to: "/mood", accent: "from-violet-500/15 to-fuchsia-500/15" },
    { label: "Wellness score", value: wellnessScore !== null ? `${wellnessScore}` : "—", hint: "Mood × sleep × habits", icon: Sparkles, to: "/analytics", accent: "from-cyan-500/15 to-emerald-500/15" },
    { label: "Sleep last night", value: lastSleep ? `${lastSleep.hours}h` : "—", hint: lastSleep ? `Quality ${lastSleep.quality ?? "—"}/5` : "Log sleep", icon: Moon, to: "/sleep", accent: "from-indigo-500/15 to-sky-500/15" },
    { label: "Journal streak", value: `${journalStreak}d`, hint: "Keep the thread alive", icon: BookHeart, to: "/journal", accent: "from-rose-500/15 to-orange-500/15" },
    { label: "Habits today", value: `${habitsDoneToday}/${habits.length}`, hint: "Tiny wins", icon: Activity, to: "/habits", accent: "from-emerald-500/15 to-teal-500/15" },
    { label: "Active goals", value: String(activeGoals), hint: "Gentle pursuits", icon: Target, to: "/goals", accent: "from-amber-500/15 to-yellow-500/15" },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div>
        <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d")}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Hi {name}, <span className="text-muted-foreground">take a breath.</span>
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Mood streak: <span className="font-medium text-foreground">{moodStreak} days</span>. Small daily moments add up.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.04 * i }}
          >
            <Link to={c.to} className="group relative block overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5">
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${c.accent} blur-2xl`} />
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.label}</div>
                  <div className="mt-2 text-3xl font-bold">{c.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{c.hint}</div>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                  <c.icon className="h-5 w-5" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Mood this week</h2>
            <Link to="/mood" className="text-xs text-[var(--primary)] hover:underline">Open <ArrowRight className="inline h-3 w-3" /></Link>
          </div>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moodTrend}>
                <defs>
                  <linearGradient id="dashMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="mood" stroke="var(--primary)" fill="url(#dashMood)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-gradient-to-br from-[var(--primary)]/10 to-transparent p-6 shadow-soft">
          <Brain className="h-6 w-6 text-[var(--primary)]" />
          <h3 className="mt-3 text-lg font-semibold">Take a mindful minute</h3>
          <p className="mt-1 text-sm text-muted-foreground">A 3-minute breathing reset, or a 5-minute meditation.</p>
          <div className="mt-4 flex flex-col gap-2">
            <Link to="/breathing" className="inline-flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted">
              Breathing <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/meditate" className="inline-flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted">
              Meditate <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/assistant" className="inline-flex items-center justify-between rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:opacity-90">
              Talk to assistant <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
