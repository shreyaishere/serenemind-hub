import { useEffect, useRef, useState } from "react";
import { Brain, Play, Pause, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { addMeditation, listMeditations, type Meditation } from "@/lib/api";

const PRESETS = [
  { label: "3 min", s: 180 }, { label: "5 min", s: 300 }, { label: "10 min", s: 600 }, { label: "15 min", s: 900 },
];

export default function MeditatePage() {
  const { user } = useAuth();
  const [target, setTarget] = useState(300);
  const [remaining, setRemaining] = useState(300);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState<Meditation[]>([]);
  const tick = useRef<number | null>(null);

  const refresh = async () => {
    const { data } = await listMeditations();
    if (data) setSessions(data as Meditation[]);
  };
  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (!running) return;
    tick.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(tick.current!);
          setRunning(false);
          if (user) addMeditation({ user_id: user.id, kind: "mindfulness", duration_seconds: target }).then(() => {
            toast.success("Session complete 🌸");
            refresh();
          });
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (tick.current) window.clearInterval(tick.current); };
  }, [running, target, user]);

  const reset = (s: number) => { setTarget(s); setRemaining(s); setRunning(false); };
  const pct = ((target - remaining) / target) * 100;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader icon={Brain} title="Meditate" subtitle="Pause. Soften. Begin again." />

      <section className="rounded-2xl border border-border bg-card p-8 shadow-soft">
        <div className="flex flex-wrap justify-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.s}
              onClick={() => reset(p.s)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                target === p.s ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-border hover:bg-muted"
              }`}
            >{p.label}</button>
          ))}
        </div>

        <div className="relative mx-auto mt-8 grid h-72 w-72 place-items-center">
          <motion.div
            animate={{ scale: running ? [1, 1.15, 1] : 1 }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-accent-500)] opacity-30 blur-2xl"
          />
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" stroke="var(--border)" strokeWidth="4" fill="none" />
            <circle
              cx="50" cy="50" r="46" stroke="var(--primary)" strokeWidth="4" fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 46}`}
              strokeDashoffset={`${2 * Math.PI * 46 * (1 - pct / 100)}`}
              style={{ transition: "stroke-dashoffset 0.6s linear" }}
            />
          </svg>
          <div className="text-center">
            <div className="font-display text-5xl font-bold tabular-nums">{mm}:{ss}</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
              {running ? "Breathe…" : remaining === 0 ? "Done" : "Ready"}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => setRunning((r) => !r)}>
            {running ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> {remaining < target ? "Resume" : "Start"}</>}
          </Button>
          <Button variant="outline" onClick={() => reset(target)}><RotateCcw className="h-4 w-4" /> Reset</Button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-lg font-semibold">Recent sessions</h2>
        <div className="mt-3 divide-y divide-border">
          {sessions.slice(0, 6).map((s) => (
            <div key={s.id} className="flex justify-between py-2 text-sm">
              <span className="capitalize text-muted-foreground">{s.kind}</span>
              <span className="font-medium">{Math.round(s.duration_seconds / 60)} min</span>
            </div>
          ))}
          {!sessions.length && <div className="py-4 text-center text-sm text-muted-foreground">No sessions yet.</div>}
        </div>
      </section>
    </div>
  );
}
