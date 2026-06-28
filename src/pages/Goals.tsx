import { useEffect, useState } from "react";
import { Target, Plus, Trash2, Pause, Play, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { addGoal, deleteGoal, listGoals, updateGoal, type Goal } from "@/lib/api";

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [due, setDue] = useState("");

  const refresh = async () => {
    const { data } = await listGoals();
    if (data) setGoals(data as Goal[]);
  };
  useEffect(() => {
    refresh();
  }, []);

  const onCreate = async () => {
    if (!user || !title.trim()) return;
    const { error } = await addGoal({ user_id: user.id, title, description: desc, due_date: due || undefined });
    if (error) return toast.error(error.message);
    setTitle("");
    setDesc("");
    setDue("");
    refresh();
  };

  const setProgress = async (g: Goal, val: number) => {
    const status = val >= g.target_value ? "completed" : "active";
    await updateGoal(g.id, { current_value: val, status });
    refresh();
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader icon={Target} title="Goals" subtitle="Gentle intentions, measurable progress." />

      <section className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-lg font-semibold">Create a goal</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meditate 10 min daily" />
          <Input label="Due date (optional)" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          <div className="md:col-span-2">
            <Textarea label="Why this matters" value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button onClick={onCreate}><Plus className="h-4 w-4" /> Add goal</Button>
          </div>
        </div>
      </section>

      {goals.length === 0 ? (
        <EmptyState icon={Target} title="No goals yet" description="A clear intention is half the journey." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((Number(g.current_value) / Number(g.target_value || 1)) * 100));
            return (
              <div key={g.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-base font-semibold">{g.title}</div>
                    {g.description && <p className="mt-0.5 text-sm text-muted-foreground">{g.description}</p>}
                  </div>
                  <button onClick={async () => { await deleteGoal(g.id); refresh(); }} className="text-muted-foreground hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={g.target_value}
                    value={g.current_value}
                    onChange={(e) => setProgress(g, Number(e.target.value))}
                    className="mt-3 w-full accent-[var(--primary)]"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{g.due_date ? `Due ${g.due_date}` : "No deadline"}</span>
                  <button
                    onClick={async () => {
                      await updateGoal(g.id, { status: g.status === "paused" ? "active" : "paused" });
                      refresh();
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5"
                  >
                    {g.status === "completed" ? (<><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Done</>)
                      : g.status === "paused" ? (<><Play className="h-3 w-3" /> Paused</>)
                      : (<><Pause className="h-3 w-3" /> Active</>)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
