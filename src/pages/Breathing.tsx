import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wind, Play, Pause } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

const PATTERNS = [
  { name: "Box (4-4-4-4)", phases: [{ l: "Inhale", s: 4 }, { l: "Hold", s: 4 }, { l: "Exhale", s: 4 }, { l: "Hold", s: 4 }] },
  { name: "4-7-8 calm", phases: [{ l: "Inhale", s: 4 }, { l: "Hold", s: 7 }, { l: "Exhale", s: 8 }] },
  { name: "Coherent (5-5)", phases: [{ l: "Inhale", s: 5 }, { l: "Exhale", s: 5 }] },
];

export default function BreathingPage() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState(0);
  const [sec, setSec] = useState(PATTERNS[0].phases[0].s);
  const [running, setRunning] = useState(false);
  const pattern = PATTERNS[idx];
  const cur = pattern.phases[phase];

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSec((s) => {
        if (s <= 1) {
          setPhase((p) => (p + 1) % pattern.phases.length);
          return pattern.phases[(phase + 1) % pattern.phases.length].s;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, phase, pattern]);

  useEffect(() => { setPhase(0); setSec(pattern.phases[0].s); }, [idx]);

  const scale = cur.l === "Inhale" ? 1.5 : cur.l === "Exhale" ? 0.8 : 1.2;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader icon={Wind} title="Breathing" subtitle="Slow the breath, slow the mind." />

      <section className="rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
        <div className="flex justify-center gap-2">
          {PATTERNS.map((p, i) => (
            <button
              key={p.name}
              onClick={() => setIdx(i)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                idx === i ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-border hover:bg-muted"
              }`}
            >{p.name}</button>
          ))}
        </div>

        <div className="mx-auto mt-10 grid h-72 w-72 place-items-center">
          <motion.div
            animate={{ scale: running ? scale : 1 }}
            transition={{ duration: cur.s, ease: "easeInOut" }}
            className="h-56 w-56 rounded-full bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-accent-500)] opacity-80 blur-[2px] shadow-2xl"
          />
        </div>
        <div className="mt-6">
          <div className="font-display text-3xl font-bold">{cur.l}</div>
          <div className="text-muted-foreground">for {sec}s</div>
        </div>
        <div className="mt-6">
          <Button onClick={() => setRunning((r) => !r)}>
            {running ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Begin</>}
          </Button>
        </div>
      </section>
    </div>
  );
}
