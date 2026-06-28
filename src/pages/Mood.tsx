import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Smile, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format, parseISO, subDays } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { addMood, listMoods, type Mood as MoodType } from "@/lib/api";

const MOODS = [
  { score: 1, emoji: "😞", label: "Awful" },
  { score: 2, emoji: "😕", label: "Low" },
  { score: 3, emoji: "😐", label: "Okay" },
  { score: 4, emoji: "🙂", label: "Good" },
  { score: 5, emoji: "😄", label: "Great" },
];
const TAGS = ["work", "family", "health", "sleep", "exercise", "social", "money", "creativity"];

export default function MoodPage() {
  const { user } = useAuth();
  const [moods, setMoods] = useState<MoodType[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    const { data } = await listMoods(60);
    if (data) setMoods(data as MoodType[]);
  };
  useEffect(() => {
    refresh();
  }, []);

  const onSave = async () => {
    if (!user || !score) return toast.error("Pick a mood first");
    setSaving(true);
    const picked = MOODS.find((m) => m.score === score)!;
    const { error } = await addMood({ user_id: user.id, score, emoji: picked.emoji, tags, note });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Mood logged 🌿");
    setScore(null);
    setTags([]);
    setNote("");
    refresh();
  };

  const chartData = (() => {
    const map = new Map<string, { sum: number; n: number }>();
    for (let i = 13; i >= 0; i--) {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd");
      map.set(d, { sum: 0, n: 0 });
    }
    moods.forEach((m) => {
      const d = m.created_at.slice(0, 10);
      const row = map.get(d);
      if (row) {
        row.sum += m.score;
        row.n++;
      }
    });
    return Array.from(map.entries()).map(([date, v]) => ({
      date: format(parseISO(date), "MMM d"),
      mood: v.n ? +(v.sum / v.n).toFixed(2) : null,
    }));
  })();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader icon={Smile} title="Mood check-in" subtitle="A few seconds today, a clearer picture tomorrow." />

      <div className="grid gap-6 lg:grid-cols-5">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3 rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
          <h2 className="text-lg font-semibold">How are you feeling?</h2>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {MOODS.map((m) => (
              <button
                key={m.score}
                onClick={() => setScore(m.score)}
                className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-sm transition ${
                  score === m.score
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-border hover:bg-muted"
                }`}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <div className="text-sm font-medium">What's influencing you?</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {TAGS.map((t) => {
                const on = tags.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => setTags((p) => (on ? p.filter((x) => x !== t) : [...p, t]))}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      on ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-border hover:bg-muted"
                    }`}
                  >
                    #{t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <Textarea
              label="Anything to add?"
              placeholder="Optional reflection…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={onSave} loading={saving}>
              <Plus className="h-4 w-4" /> Log mood
            </Button>
          </div>
        </motion.section>

        <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-semibold">14-day trend</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis domain={[1, 5]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="mood" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-lg font-semibold">Recent check-ins</h2>
        <div className="mt-3 divide-y divide-border">
          {moods.slice(0, 12).map((m) => (
            <div key={m.id} className="flex items-start justify-between gap-3 py-3">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{m.emoji}</div>
                <div>
                  <div className="text-sm font-medium">{MOODS.find((x) => x.score === m.score)?.label}</div>
                  {m.note && <div className="mt-0.5 text-sm text-muted-foreground">{m.note}</div>}
                  {m.tags?.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {m.tags.map((t) => (
                        <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">#{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{format(parseISO(m.created_at), "MMM d, HH:mm")}</div>
            </div>
          ))}
          {!moods.length && <div className="py-6 text-center text-sm text-muted-foreground">No check-ins yet.</div>}
        </div>
      </section>
    </div>
  );
}
