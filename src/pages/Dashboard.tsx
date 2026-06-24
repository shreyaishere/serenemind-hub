import { motion } from "framer-motion";
import { Smile, Moon, Activity, BookHeart, Target, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const cards = [
  { label: "Today's mood", value: "—", hint: "Log your first mood", icon: Smile, accent: "from-violet-500/15 to-fuchsia-500/15" },
  { label: "Wellness score", value: "—", hint: "We'll calculate it soon", icon: Sparkles, accent: "from-cyan-500/15 to-emerald-500/15" },
  { label: "Sleep last night", value: "—", hint: "Connect sleep tracking", icon: Moon, accent: "from-indigo-500/15 to-sky-500/15" },
  { label: "Journal streak", value: "0d", hint: "Start a streak today", icon: BookHeart, accent: "from-rose-500/15 to-orange-500/15" },
  { label: "Habits done today", value: "0/0", hint: "Add wellness habits", icon: Activity, accent: "from-emerald-500/15 to-teal-500/15" },
  { label: "Active goals", value: "0", hint: "Set a gentle goal", icon: Target, accent: "from-amber-500/15 to-yellow-500/15" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const name = (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div>
        <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d")}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Hi {name}, <span className="text-muted-foreground">take a breath.</span>
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          This is your calm home base. Start by checking in with how you feel — small daily moments add up.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.04 * i }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5"
          >
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
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center"
      >
        <Sparkles className="mx-auto h-6 w-6 text-[var(--primary)]" />
        <h3 className="mt-3 text-lg font-semibold">More wellness tools coming next</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Mood tracking, journaling, sleep, habits, goals, and your AI companion will land in the next phases.
        </p>
      </motion.div>
    </div>
  );
}
