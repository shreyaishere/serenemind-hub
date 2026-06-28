import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { format, parseISO, subDays } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { listMoods, listSleep, listHabitLogs, listHabits, listMeditations, computeStreak,
  type Mood, type Sleep, type HabitLog, type Habit, type Meditation } from "@/lib/api";

const COLORS = ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalyticsPage() {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [sleep, setSleep] = useState<Sleep[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [meds, setMeds] = useState<Meditation[]>([]);

  useEffect(() => {
    (async () => {
      const [m, s, l, h, md] = await Promise.all([listMoods(200), listSleep(30), listHabitLogs(30), listHabits(), listMeditations(60)]);
      if (m.data) setMoods(m.data as Mood[]);
      if (s.data) setSleep(s.data as Sleep[]);
      if (l.data) setLogs(l.data as HabitLog[]);
      if (h.data) setHabits(h.data as Habit[]);
      if (md.data) setMeds(md.data as Meditation[]);
    })();
  }, []);

  const combined = (() => {
    const map = new Map<string, { date: string; mood: number | null; sleep: number | null; habits: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd");
      map.set(d, { date: format(parseISO(d), "MMM d"), mood: null, sleep: null, habits: 0 });
    }
    moods.forEach((m) => {
      const d = m.created_at.slice(0, 10);
      const row = map.get(d);
      if (row) row.mood = ((row.mood ?? 0) + m.score) / (row.mood ? 2 : 1);
    });
    sleep.forEach((s) => { const r = map.get(s.date); if (r) r.sleep = Number(s.hours); });
    logs.forEach((l) => { const r = map.get(l.date); if (r) r.habits++; });
    return Array.from(map.values());
  })();

  const habitBreakdown = habits.map((h) => ({
    name: h.name,
    value: logs.filter((l) => l.habit_id === h.id).length,
  })).filter((x) => x.value > 0);

  const moodStreak = computeStreak(moods.map((m) => m.created_at));
  const journalStreak = 0;
  const totalMinutes = Math.round(meds.reduce((s, m) => s + m.duration_seconds, 0) / 60);

  const stats = [
    { label: "Mood check-in streak", value: `${moodStreak}d` },
    { label: "Sleep avg (30d)", value: sleep.length ? `${(sleep.reduce((s, l) => s + Number(l.hours), 0) / sleep.length).toFixed(1)}h` : "—" },
    { label: "Habits done (30d)", value: String(logs.length) },
    { label: "Meditation total", value: `${totalMinutes}m` },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader icon={BarChart3} title="Analytics" subtitle="Your wellness, by the numbers." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-3xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Mood & sleep — 30 days</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combined}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="mood" stroke="#7c3aed" fill="url(#g1)" />
                <Area type="monotone" dataKey="sleep" stroke="#06b6d4" fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Habit breakdown</h2>
          <div className="mt-4 h-72">
            {habitBreakdown.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={habitBreakdown} dataKey="value" nameKey="name" outerRadius={80} innerRadius={45}>
                    {habitBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">Log habits to see distribution.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
