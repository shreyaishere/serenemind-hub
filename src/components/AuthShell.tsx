import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative grid min-h-screen w-full place-items-center overflow-hidden bg-background px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 aurora-bg opacity-60" />
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <ThemeToggle />
      </div>
      <Link to="/" className="absolute left-4 top-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass w-full max-w-md rounded-3xl p-8 shadow-soft"
      >
        <div className="mb-6 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] shadow-soft">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Mindful</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </motion.div>
    </div>
  );
}
