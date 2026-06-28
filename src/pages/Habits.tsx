import { useEffect, useMemo, useState } from "react";
import { Activity, Plus, Trash2, Check } from "lucide-react";
import toast from "react-hot-toast";
import { format, subDays } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import {
  addHabit, deleteHabit, listHabits, listHabitLogs, toggleHabitLog, today,
  type Habit, type HabitLog,
} from "@/lib/api";

const EMOJIS = ["🌿", "💧", "🏃", "📚", "🧘", "🛌", "☀️", "🥗", "✍️", "🎵"];

export default function HabitsPage() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🌿");
  const [creating, setCreating] = useState(false);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), "yyyy-MM-dd")), []);

  const refresh = async () => {
    const [h, l] = await Promise.all([listHabits(), listHabitLogs(30)]);
    if (h.data) setHabits(h.data as Habit[]);
    if (l.data) setLogs(l.data as HabitLog[]);
  };
  useEffect(() => {
    refresh();
  }, []);

  const onCreate = async () => {
    if (!user || !name.trim()) return;
    setCreating(true);
    const { error } = await addHabit({ user_id: user.id, name: name.trim(), emoji });
    setCreating(false);
    if (error) return toast.error(error.message);
    setName("");
    refresh();
  };

  const onToggle = async (habit_id: string, date: string) => {
    if (!user) return;
    await toggleHabitLog(user.id, habit_id, date);
    refresh();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Archive this habit?")) return;
    await deleteHabit(id);
    refresh();
  };

  const isDone = (hid: string, d: string) => logs.some((l) => l.habit_id === hid && l.date === d);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader icon={Activity} title="Habits" subtitle="Tiny, repeatable wins." />

      <section className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-lg font-semibold">New habit</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <Input placeholder="e.g. Drink 2L of water" value={name} onChange={(e) => setName(e.target.value)} />
          <select
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className="h-11 rounded-xl border border-border bg-card px-3 text-lg"
          >
            {EMOJIS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <Button onClick={onCreate} loading={creating}><Plus className="h-4 w-4" /> Add</Button>
        </div>
      </section>

      {habits.length === 0 ? (
        <EmptyState icon={Activity} title="No habits yet" description="Start with one small thing you'd like to do daily." />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="grid grid-cols-[1fr_repeat(7,minmax(0,40px))_auto] gap-2 border-b border-border bg-muted/40 p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <div>Habit</div>
            {days.map((d) => (
              <div key={d} className="text-center">{format(new Date(d), "EE")[0]}</div>
            ))}
            <div />
          </div>
          {habits.map((h) => (
            <div key={h.id} className="grid grid-cols-[1fr_repeat(7,minmax(0,40px))_auto] items-center gap-2 border-b border-border p-4 last:border-b-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">{h.emoji}</span>
                <span className="text-sm font-medium">{h.name}</span>
              </div>
              {days.map((d) => {
                const done = isDone(h.id, d);
                const isToday = d === today();
                return (
                  <button
                    key={d}
                    onClick={() => onToggle(h.id, d)}
                    className={`grid h-9 w-9 place-items-center rounded-lg border text-xs transition ${
                      done
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-border hover:bg-muted"
                    } ${isToday ? "ring-2 ring-[var(--ring)]/30" : ""}`}
                  >
                    {done && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
              <button onClick={() => onDelete(h.id)} className="text-muted-foreground hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
