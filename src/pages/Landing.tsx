import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Heart, Moon, Activity, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const features = [
  { icon: Heart, title: "Mood tracking", desc: "Daily check-ins and gentle trends, never noisy." },
  { icon: Moon, title: "Sleep clarity", desc: "Spot patterns between rest and how you feel." },
  { icon: Activity, title: "Healthy habits", desc: "Tiny streaks that compound into real change." },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 aurora-bg opacity-60" />
      <div className="pointer-events-none absolute -top-40 -right-40 -z-10 h-[500px] w-[500px] rounded-full bg-[var(--primary)] opacity-20 blur-3xl" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] shadow-soft">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Mindful</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-muted sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] shadow-soft transition hover:opacity-90"
          >
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
            Your calm, AI-powered companion
          </span>
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            A softer way to <span className="bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-accent-500)] bg-clip-text text-transparent">care for your mind</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Track mood, sleep, and habits. Reflect through journaling. Grow with gentle, AI-guided insight — all in one peaceful space.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-soft transition hover:opacity-90"
            >
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="glass inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold text-foreground"
            >
              I have an account
            </Link>
          </div>
        </motion.div>

        <div className="mt-20 grid gap-4 sm:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className="glass rounded-2xl p-6 shadow-soft"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
